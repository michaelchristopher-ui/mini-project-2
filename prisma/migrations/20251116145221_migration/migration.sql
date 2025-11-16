-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "event";

-- CreateTable
CREATE TABLE "event"."events" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6),
    "available_seats" INTEGER NOT NULL,
    "description" TEXT,
    "ticket_type_id" VARCHAR(255),
    "category_id" INTEGER,
    "event_type" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "status" VARCHAR(3) NOT NULL DEFAULT 'atv',

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event"."tickets" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "event_id" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(3) NOT NULL DEFAULT 'atv',

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event"."categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(3) NOT NULL DEFAULT 'atv',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event"."vouchers" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "event_id" INTEGER NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6) NOT NULL,
    "status" VARCHAR(3) NOT NULL DEFAULT 'atv',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "code" VARCHAR(50) NOT NULL,
    "discount_type" VARCHAR(20) NOT NULL,
    "discount_amount" DECIMAL(10,2) NOT NULL,
    "max_uses" INTEGER,
    "used_count" INTEGER DEFAULT 0,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event"."transactions" (
    "id" SERIAL NOT NULL,
    "uuid" CHAR(36) NOT NULL,
    "event_id" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "confirmed_at" TIMESTAMP(6),
    "confirmed_by" INTEGER,
    "remaining_price" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "image_url" VARCHAR(255),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event"."ticket_transactions" (
    "transaction_id" INTEGER NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ticket_transactions_pkey" PRIMARY KEY ("transaction_id","ticket_id")
);

-- CreateTable
CREATE TABLE "event"."points" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "points_count" INTEGER NOT NULL,
    "expiry" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event"."users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "profile_picture" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referral_code" VARCHAR(36) NOT NULL DEFAULT (gen_random_uuid())::text,
    "role" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event"."coupons" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "discount_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event"."reviews" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(1000),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_uuid_key" ON "event"."events"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_uuid_key" ON "event"."tickets"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "event"."categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_uuid_key" ON "event"."vouchers"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_uuid_key" ON "event"."transactions"("uuid");

-- CreateIndex
CREATE INDEX "idx_points_expiry" ON "event"."points"("expiry");

-- CreateIndex
CREATE INDEX "idx_points_user_expiry" ON "event"."points"("user_id", "expiry");

-- CreateIndex
CREATE INDEX "idx_points_user_id" ON "event"."points"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_users_username" ON "event"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_referral_code_unique" ON "event"."users"("referral_code");

-- CreateIndex
CREATE INDEX "idx_coupons_user_id" ON "event"."coupons"("user_id");

-- CreateIndex
CREATE INDEX "idx_coupons_created_at" ON "event"."coupons"("created_at");

-- CreateIndex
CREATE INDEX "idx_reviews_event_id" ON "event"."reviews"("event_id");

-- CreateIndex
CREATE INDEX "idx_reviews_user_id" ON "event"."reviews"("created_by");

-- AddForeignKey
ALTER TABLE "event"."events" ADD CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "event"."categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."events" ADD CONSTRAINT "fk_events_created_by" FOREIGN KEY ("created_by") REFERENCES "event"."users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."tickets" ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"."events"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."vouchers" ADD CONSTRAINT "vouchers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"."events"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."transactions" ADD CONSTRAINT "fk_transactions_confirmed_by" FOREIGN KEY ("confirmed_by") REFERENCES "event"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."transactions" ADD CONSTRAINT "fk_transactions_created_by" FOREIGN KEY ("created_by") REFERENCES "event"."users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."transactions" ADD CONSTRAINT "transactions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"."events"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."ticket_transactions" ADD CONSTRAINT "ticket_transactions_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "event"."tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."ticket_transactions" ADD CONSTRAINT "ticket_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "event"."transactions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."points" ADD CONSTRAINT "fk_points_user_id" FOREIGN KEY ("user_id") REFERENCES "event"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."coupons" ADD CONSTRAINT "fk_coupons_user_id" FOREIGN KEY ("user_id") REFERENCES "event"."users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."reviews" ADD CONSTRAINT "reviews_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"."events"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "event"."reviews" ADD CONSTRAINT "fk_reviews_user_id" FOREIGN KEY ("created_by") REFERENCES "event"."users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
