import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core"

// Enums
export const groupTypeEnum = pgEnum('group_type', ['building', 'family'])
export const memberRoleEnum = pgEnum('member_role', ['admin', 'member'])
export const presenceStatusEnum = pgEnum('presence_status', ['safe', 'in_shelter', 'need_help', 'unknown'])

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  displayName: varchar('display_name', { length: 10 }).notNull(),
  isVerified: boolean('is_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Groups table
export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: groupTypeEnum('type').notNull(),
  inviteCode: varchar('invite_code', { length: 10 }).notNull().unique(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})

// Group members table
export const groupMembers = pgTable('group_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  role: memberRoleEnum('role').default('member'),
  joinedAt: timestamp('joined_at').defaultNow()
})

// Presence status table
export const presenceStatus = pgTable('presence', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').references(() => groups.id, { onDelete: 'cascade' }),
  isPresent: boolean('is_present').default(false),
  status: presenceStatusEnum('status').default('unknown'),
  lastUpdated: timestamp('last_updated').defaultNow()
})

// Nudges table
export const nudges = pgTable('nudges', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromUserId: uuid('from_user_id').references(() => users.id),
  toUserId: uuid('to_user_id').references(() => users.id),
  groupId: uuid('group_id').references(() => groups.id),
  message: text('message'),
  sentAt: timestamp('sent_at').defaultNow()
})