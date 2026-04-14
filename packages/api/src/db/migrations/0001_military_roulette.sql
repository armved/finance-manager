ALTER TABLE "categories" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."category_type";--> statement-breakpoint
CREATE TYPE "public"."category_type" AS ENUM('income', 'expense');--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "type" SET DATA TYPE "public"."category_type" USING "type"::"public"."category_type";--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "type" DROP DEFAULT;