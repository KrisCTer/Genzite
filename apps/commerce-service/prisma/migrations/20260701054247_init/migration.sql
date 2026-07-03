-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_id" TEXT,
    "customer_email" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "shipping_address" JSONB NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "shipping_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT NOT NULL DEFAULT 'COD',
    "payment_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "gateway" TEXT NOT NULL DEFAULT 'payos',
    "gateway_tx_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "carts_site_id_session_id_idx" ON "carts"("site_id", "session_id");

-- CreateIndex
CREATE INDEX "carts_site_id_user_id_idx" ON "carts"("site_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_site_id_status_idx" ON "orders"("site_id", "status");

-- CreateIndex
CREATE INDEX "orders_site_id_customer_email_idx" ON "orders"("site_id", "customer_email");

-- CreateIndex
CREATE INDEX "payment_transactions_order_id_idx" ON "payment_transactions"("order_id");

-- CreateIndex
CREATE INDEX "payment_transactions_site_id_status_idx" ON "payment_transactions"("site_id", "status");
