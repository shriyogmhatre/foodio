BEGIN;

ALTER TABLE pickup_points
  ADD COLUMN IF NOT EXISTS latitude numeric(9, 6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9, 6);

UPDATE pickup_points
SET latitude = CASE id
      WHEN 'koramangala' THEN 12.935200
      WHEN 'indiranagar' THEN 12.978400
      WHEN 'hsr' THEN 12.911600
      ELSE latitude
    END,
    longitude = CASE id
      WHEN 'koramangala' THEN 77.624500
      WHEN 'indiranagar' THEN 77.640800
      WHEN 'hsr' THEN 77.638900
      ELSE longitude
    END
WHERE id IN ('koramangala', 'indiranagar', 'hsr');

UPDATE pickup_points
SET latitude = 12.935200, longitude = 77.624500
WHERE latitude IS NULL OR longitude IS NULL;

ALTER TABLE pickup_points
  ALTER COLUMN latitude SET NOT NULL,
  ALTER COLUMN longitude SET NOT NULL,
  ALTER COLUMN map_x DROP NOT NULL,
  ALTER COLUMN map_y DROP NOT NULL;

ALTER TABLE pickup_points
  DROP CONSTRAINT IF EXISTS pickup_points_latitude_check,
  DROP CONSTRAINT IF EXISTS pickup_points_longitude_check;

ALTER TABLE pickup_points
  ADD CONSTRAINT pickup_points_latitude_check CHECK (latitude BETWEEN -90 AND 90),
  ADD CONSTRAINT pickup_points_longitude_check CHECK (longitude BETWEEN -180 AND 180);

COMMIT;
