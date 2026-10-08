CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY, email text NOT NULL UNIQUE, name text NOT NULL,
  phone text NOT NULL, email_verified_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS email_challenges (
  id uuid PRIMARY KEY, email text NOT NULL, code_hash text NOT NULL, ip_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0, sent boolean NOT NULL DEFAULT false,
  consumed_at timestamptz, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS email_challenges_email_date ON email_challenges(email, created_at);
CREATE INDEX IF NOT EXISTS email_challenges_created ON email_challenges(created_at);
CREATE INDEX IF NOT EXISTS email_challenges_ip_date ON email_challenges(ip_hash, created_at);
CREATE TABLE IF NOT EXISTS customer_sessions (
  token_hash text PRIMARY KEY, customer_id uuid NOT NULL REFERENCES customers(id),
  expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY, customer_id uuid NOT NULL REFERENCES customers(id),
  request_id uuid NOT NULL, pickup_id text NOT NULL REFERENCES pickup_points(id),
  pickup_name text NOT NULL, pickup_address text NOT NULL,
  customer_name text NOT NULL, contact_phone text NOT NULL,
  items jsonb NOT NULL, total_paise integer NOT NULL CHECK(total_paise > 0),
  status text NOT NULL DEFAULT 'received' CHECK(status IN ('received','preparing','ready','collected','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(customer_id, request_id)
);
CREATE INDEX IF NOT EXISTS orders_customer_date ON orders(customer_id, created_at);
