-- Jalankan sekali di Neon (SQL Editor).

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  image text,
  role text not null default 'free',
  role_expires_at timestamptz,
  api_key text unique not null default ('kr_' || encode(gen_random_bytes(18), 'hex')),
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  user_id uuid not null references users(id) on delete cascade,
  plan text not null,
  amount integer not null,
  days integer not null,
  status text not null default 'pending', -- pending | paid
  payment_method text,
  reference text,
  payment_data jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists orders_user_idx on orders (user_id, created_at desc);

create table if not exists usage (
  user_id uuid not null references users(id) on delete cascade,
  day date not null,
  count integer not null default 0,
  primary key (user_id, day)
);
