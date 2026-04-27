
-- Lock down the only function exposed to clients
revoke execute on function public.book_seat(uuid) from anon;
grant execute on function public.book_seat(uuid) to authenticated;

-- Seed routes
insert into public.routes (name, origin, destination, stops, base_price, estimated_duration_min, distance_km, is_dynamic) values
  ('Maadi → Smart Village', 'Maadi Grand Mall', 'Smart Village Gate 1', '["Wadi Degla","Mohandessin","26th of July"]'::jsonb, 45, 75, 32, false),
  ('Nasr City → AUC', 'Nasr City Stadium', 'AUC New Cairo', '["Abbas El Akkad","Heliopolis","5th Settlement"]'::jsonb, 35, 60, 25, false),
  ('Heliopolis → Downtown', 'Korba Heliopolis', 'Tahrir Square', '["Roxy","Abbasia","Ramses"]'::jsonb, 25, 50, 18, false),
  ('Zayed → New Cairo (Dynamic)', '6th October / Zayed', 'New Cairo Hub', '[]'::jsonb, 60, 90, 55, true);

-- Seed vehicles
insert into public.vehicles (plate_number, model, capacity) values
  ('BSY-1001', 'Toyota Hiace', 14),
  ('BSY-1002', 'Mercedes Sprinter', 16);

-- Seed trips for the next 3 days
insert into public.trips (route_id, vehicle_id, departure_time, total_seats, available_seats)
select r.id, v.id, now() + (i || ' hours')::interval, v.capacity, v.capacity
from public.routes r
cross join lateral (select id, capacity from public.vehicles order by random() limit 1) v
cross join generate_series(2, 48, 8) as i
where r.is_active
limit 12;
