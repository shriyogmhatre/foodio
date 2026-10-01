BEGIN;

ALTER TABLE pickup_points
  ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

UPDATE pickup_points
SET active = false, updated_at = now()
WHERE id IN ('koramangala', 'indiranagar', 'hsr');

INSERT INTO pickup_points (
  id, name, address, prep_time, distance, latitude, longitude, sort_order, active
)
VALUES (
  'vadale-lake',
  'Vadale Lake Pickup',
  'Ballaleshwar (Vadale) Lake, Old Panvel',
  '12 min',
  '0.0 km',
  18.994000,
  73.111800,
  1,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  prep_time = EXCLUDED.prep_time,
  distance = EXCLUDED.distance,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  sort_order = EXCLUDED.sort_order,
  active = true,
  updated_at = now();

COMMIT;
