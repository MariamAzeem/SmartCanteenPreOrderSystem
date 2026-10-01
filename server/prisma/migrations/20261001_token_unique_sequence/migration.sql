-- Database migration for Canteen Token Sequence and Unique Constraint
-- File: server/prisma/migrations/20261001_token_unique_sequence/migration.sql

-- 1. Create a dedicated sequence for monotonically increasing order tokens (C-001, C-002, ...)
CREATE SEQUENCE IF NOT EXISTS canteen_order_token_seq
    START WITH 26
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 2. Add orderDate column to Order table if not present (format: YYYY-MM-DD)
ALTER TABLE "Order" 
    ADD COLUMN IF NOT EXISTS "orderDate" VARCHAR(10) NOT NULL DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD');

-- 3. Add UNIQUE constraint on (orderDate, tokenNumber) ensuring no token collisions on any day
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'order_date_token_number_unique'
    ) THEN
        ALTER TABLE "Order" 
            ADD CONSTRAINT order_date_token_number_unique 
            UNIQUE ("orderDate", "tokenNumber");
    END IF;
END $$;

-- 4. Create burned/void tokens table to ensure cancelled and rejected tokens are permanently retired
CREATE TABLE IF NOT EXISTS "VoidToken" (
    "id" VARCHAR(64) PRIMARY KEY,
    "tokenNumber" VARCHAR(32) NOT NULL,
    "orderDate" VARCHAR(10) NOT NULL,
    "reason" TEXT NOT NULL,
    "voidedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "void_token_unique" UNIQUE ("orderDate", "tokenNumber")
);

-- 5. Index for fast lookup on orderDate and tokenNumber
CREATE INDEX IF NOT EXISTS "idx_order_date_token" ON "Order" ("orderDate", "tokenNumber");
CREATE INDEX IF NOT EXISTS "idx_void_token" ON "VoidToken" ("orderDate", "tokenNumber");
