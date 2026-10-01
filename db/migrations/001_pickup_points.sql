BEGIN;

CREATE TABLE IF NOT EXISTS pickup_points (
  id text PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL,
  prep_time text NOT NULL,
  distance text NOT NULL,
  map_x numeric(5, 2) NOT NULL CHECK (map_x BETWEEN 5 AND 95),
  map_y numeric(5, 2) NOT NULL CHECK (map_y BETWEEN 5 AND 95),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO pickup_points (id, name, address, prep_time, distance, map_x, map_y, sort_order)
VALUES
  ('koramangala', 'Studio Koramangala', '80 Feet Road, 4th Block', '12 min', '1.2 km', 38, 31, 1),
  ('indiranagar', 'Indiranagar Window', '12th Main, near Metro', '18 min', '2.8 km', 70, 44, 2),
  ('hsr', 'HSR Pickup Bar', '27th Main, Sector 2', '22 min', '4.1 km', 52, 72, 3)
ON CONFLICT (id) DO NOTHING;

COMMIT;
