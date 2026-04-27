
-- ============ ENUMS ============
create type public.app_role as enum ('admin', 'driver', 'commuter');
create type public.trip_status as enum ('scheduled', 'in_progress', 'completed', 'cancelled');
create type public.booking_status as enum ('confirmed', 'cancelled', 'completed', 'no_show');
create type public.subscription_plan as enum ('weekly', 'monthly');
create type public.subscription_status as enum ('active', 'expired', 'cancelled');
create type public.payment_status as enum ('pending', 'succeeded', 'failed', 'refunded');
create type public.payment_type as enum ('booking', 'subscription');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone signed in"
  on public.profiles for select to authenticated using (true);
create policy "Users can update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.get_user_role(_user_id uuid)
returns app_role language sql stable security definer set search_path = public as $$
  select role from public.user_roles where user_id = _user_id
  order by case role when 'admin' then 1 when 'driver' then 2 else 3 end limit 1
$$;

create policy "Users can view own roles"
  on public.user_roles for select to authenticated using (auth.uid() = user_id);
create policy "Admins can view all roles"
  on public.user_roles for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins can manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + default commuter role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.raw_user_meta_data->>'phone', ''));
  insert into public.user_roles (user_id, role) values (new.id, 'commuter');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ ROUTES ============
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  origin text not null,
  destination text not null,
  stops jsonb not null default '[]'::jsonb,
  base_price numeric(10,2) not null default 0,
  estimated_duration_min int not null default 60,
  distance_km numeric(6,2),
  is_dynamic boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.routes enable row level security;
create policy "Routes are viewable by authenticated users"
  on public.routes for select to authenticated using (is_active or public.has_role(auth.uid(),'admin'));
create policy "Admins manage routes"
  on public.routes for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============ VEHICLES ============
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  plate_number text not null unique,
  model text,
  capacity int not null default 14,
  created_at timestamptz not null default now()
);
alter table public.vehicles enable row level security;
create policy "Vehicles viewable by authenticated"
  on public.vehicles for select to authenticated using (true);
create policy "Admins manage vehicles"
  on public.vehicles for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============ DRIVERS ============
create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  license_no text,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  rating numeric(3,2) default 5.0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.drivers enable row level security;
create policy "Drivers viewable by authenticated"
  on public.drivers for select to authenticated using (true);
create policy "Admins manage drivers"
  on public.drivers for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============ TRIPS ============
create table public.trips (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id) on delete cascade,
  driver_id uuid references public.drivers(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  departure_time timestamptz not null,
  arrival_time timestamptz,
  total_seats int not null default 14,
  available_seats int not null default 14,
  status trip_status not null default 'scheduled',
  current_lat numeric(9,6),
  current_lng numeric(9,6),
  created_at timestamptz not null default now()
);
alter table public.trips enable row level security;
create policy "Trips viewable by authenticated"
  on public.trips for select to authenticated using (true);
create policy "Admins manage trips"
  on public.trips for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "Drivers update own trip status/location"
  on public.trips for update to authenticated
  using (driver_id in (select id from public.drivers where user_id = auth.uid()))
  with check (driver_id in (select id from public.drivers where user_id = auth.uid()));

-- Block driver from cancelling
create or replace function public.prevent_driver_cancellation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    if not public.has_role(auth.uid(), 'admin') then
      raise exception 'Only admins can cancel trips';
    end if;
  end if;
  return new;
end;
$$;
create trigger trips_no_driver_cancel
  before update on public.trips
  for each row execute function public.prevent_driver_cancellation();

-- ============ BOOKINGS ============
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  seat_number int not null,
  status booking_status not null default 'confirmed',
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (trip_id, seat_number)
);
alter table public.bookings enable row level security;
create policy "Users view own bookings"
  on public.bookings for select to authenticated using (auth.uid() = user_id);
create policy "Drivers view bookings on their trips"
  on public.bookings for select to authenticated
  using (trip_id in (select t.id from public.trips t join public.drivers d on d.id = t.driver_id where d.user_id = auth.uid()));
create policy "Admins view all bookings"
  on public.bookings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Users cancel own bookings"
  on public.bookings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Admins manage bookings"
  on public.bookings for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- Atomic seat-reservation function
create or replace function public.book_seat(_trip_id uuid)
returns public.bookings language plpgsql security definer set search_path = public as $$
declare
  _trip public.trips%rowtype;
  _seat int;
  _booking public.bookings;
  _route public.routes%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  select * into _trip from public.trips where id = _trip_id for update;
  if not found then raise exception 'Trip not found'; end if;
  if _trip.status <> 'scheduled' then raise exception 'Trip is not bookable'; end if;
  if _trip.available_seats <= 0 then raise exception 'No seats available'; end if;

  if exists(select 1 from public.bookings where trip_id = _trip_id and user_id = auth.uid() and status = 'confirmed') then
    raise exception 'You already have a seat on this trip';
  end if;

  -- Find lowest free seat
  select s.n into _seat
  from generate_series(1, _trip.total_seats) as s(n)
  where not exists (select 1 from public.bookings b where b.trip_id = _trip_id and b.seat_number = s.n and b.status = 'confirmed')
  order by s.n limit 1;

  select * into _route from public.routes where id = _trip.route_id;

  insert into public.bookings (trip_id, user_id, seat_number, price)
  values (_trip_id, auth.uid(), _seat, _route.base_price)
  returning * into _booking;

  update public.trips set available_seats = available_seats - 1 where id = _trip_id;

  return _booking;
end;
$$;

-- Keep available_seats in sync on cancellation
create or replace function public.handle_booking_cancel()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status = 'confirmed' then
    update public.trips set available_seats = available_seats + 1 where id = new.trip_id;
  end if;
  return new;
end;
$$;
create trigger bookings_after_cancel
  after update on public.bookings
  for each row execute function public.handle_booking_cancel();

-- ============ SUBSCRIPTIONS ============
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  route_id uuid references public.routes(id) on delete set null,
  plan subscription_plan not null,
  start_date date not null default current_date,
  end_date date not null,
  status subscription_status not null default 'active',
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "Users view own subs" on public.subscriptions for select to authenticated using (auth.uid() = user_id);
create policy "Users create own subs" on public.subscriptions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own subs" on public.subscriptions for update to authenticated using (auth.uid() = user_id);
create policy "Admins manage subs" on public.subscriptions for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ============ PAYMENTS (simulated) ============
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10,2) not null,
  type payment_type not null,
  reference_id uuid,
  status payment_status not null default 'succeeded',
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;
create policy "Users view own payments" on public.payments for select to authenticated using (auth.uid() = user_id);
create policy "Users create own payments" on public.payments for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins view all payments" on public.payments for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- ============ REALTIME ============
alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.bookings;
