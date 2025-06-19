import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  index, 
  boolean, 
  integer,
  varchar,
  unique,
  uuid,
  pgEnum
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const residentTypeEnum = pgEnum('resident_type', ['resident', 'owner'])

// Buildings table - stores building information
export const buildings = pgTable(
  "buildings",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    inviteCode: varchar("invite_code", { length: 10 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("buildings_invite_code_unique").on(table.inviteCode),
  ]
)

// Residents table - stores resident information
export const residents = pgTable(
  "residents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    buildingId: integer("building_id").notNull().references(() => buildings.id, { onDelete: "cascade" }),
    type: residentTypeEnum("type").default("resident").notNull(),
    displayName: text("display_name").notNull(),
    phoneNumber: varchar("phone_number", { length: 20 }),
    phoneVerified: boolean("phone_verified").default(false).notNull(),
    details: text("details"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("residents_building_id_idx").on(table.buildingId),
    index("residents_phone_number_idx").on(table.phoneNumber),
    index("residents_type_idx").on(table.type),
    unique("one_owner_per_building").on(table.buildingId, table.type),
  ]
)

// SMS Verifications table - stores SMS verification codes
export const smsVerifications = pgTable(
  "sms_verifications",
  {
    id: serial("id").primaryKey(),
    phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
    verificationCode: varchar("verification_code", { length: 6 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("sms_verifications_phone_number_idx").on(table.phoneNumber),
    index("sms_verifications_expires_at_idx").on(table.expiresAt),
  ]
)

// Presence Status table - stores current presence status
export const presenceStatus = pgTable(
  "presence_status",
  {
    id: serial("id").primaryKey(),
    residentId: uuid("resident_id").notNull().references(() => residents.id, { onDelete: "cascade" }),
    isPresent: boolean("is_present").default(false).notNull(),
    lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  },
  (table) => [
    index("presence_status_resident_id_idx").on(table.residentId),
    index("presence_status_last_updated_idx").on(table.lastUpdated),
    unique("presence_status_resident_unique").on(table.residentId),
  ]
)

// Relations
export const buildingsRelations = relations(buildings, ({ many, one }) => ({
  residents: many(residents),
  owner: one(residents, {
    fields: [buildings.id],
    references: [residents.buildingId],
    relationName: "buildingOwner"
  }),
}))

export const residentsRelations = relations(residents, ({ one }) => ({
  building: one(buildings, {
    fields: [residents.buildingId],
    references: [buildings.id],
  }),
  presenceStatus: one(presenceStatus, {
    fields: [residents.id],
    references: [presenceStatus.residentId],
  }),
}))

export const presenceStatusRelations = relations(presenceStatus, ({ one }) => ({
  resident: one(residents, {
    fields: [presenceStatus.residentId],
    references: [residents.id],
  }),
}))
