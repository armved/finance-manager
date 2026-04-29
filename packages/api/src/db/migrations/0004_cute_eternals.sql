ALTER TYPE "public"."transaction_type" ADD VALUE IF NOT EXISTS 'transfer';--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "category_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "adjusted_balance" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'accounts' AND column_name = 'adjusted_at'
  ) THEN
    ALTER TABLE "accounts" ADD COLUMN "adjusted_at" timestamp with time zone;
  ELSE
    ALTER TABLE "accounts" ALTER COLUMN "adjusted_at" TYPE timestamp with time zone
      USING "adjusted_at"::timestamp with time zone;
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "initial_balance";
