CREATE TYPE "public"."resident_type" AS ENUM('resident', 'owner');--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"invite_code" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "buildings_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "presence_status" (
	"id" serial PRIMARY KEY NOT NULL,
	"resident_id" uuid NOT NULL,
	"is_present" boolean DEFAULT false NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "presence_status_resident_unique" UNIQUE("resident_id")
);
--> statement-breakpoint
CREATE TABLE "residents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" integer NOT NULL,
	"type" "resident_type" DEFAULT 'resident' NOT NULL,
	"display_name" text NOT NULL,
	"phone_number" varchar(20),
	"phone_verified" boolean DEFAULT false NOT NULL,
	"details" text,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "one_owner_per_building" UNIQUE("building_id","type")
);
--> statement-breakpoint
CREATE TABLE "sms_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"verification_code" varchar(6) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "presence_status" ADD CONSTRAINT "presence_status_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residents" ADD CONSTRAINT "residents_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "presence_status_resident_id_idx" ON "presence_status" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "presence_status_last_updated_idx" ON "presence_status" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX "residents_building_id_idx" ON "residents" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "residents_phone_number_idx" ON "residents" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "residents_type_idx" ON "residents" USING btree ("type");--> statement-breakpoint
CREATE INDEX "sms_verifications_phone_number_idx" ON "sms_verifications" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "sms_verifications_expires_at_idx" ON "sms_verifications" USING btree ("expires_at");