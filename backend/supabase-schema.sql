create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key,
  name text not null,
  email text not null unique,
  phone text not null,
  password text not null default '',
  role text not null default 'customer',
  email_verified boolean not null default false,
  email_verification_code_hash text,
  email_verification_expires_at bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  price numeric not null default 0,
  category text not null default 'General',
  images jsonb not null default '[]'::jsonb,
  video text,
  rating numeric not null default 4.5,
  reviews jsonb not null default '[]'::jsonb,
  variants jsonb not null default '[{"name":"Default"}]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_created_at_idx on public.products (created_at desc);

create table if not exists public.orders (
  id uuid primary key,
  user_id uuid not null,
  items jsonb not null default '[]'::jsonb,
  shipping_address jsonb not null default '{}'::jsonb,
  payment_method text not null default 'cod',
  total numeric not null default 0,
  status text not null default 'pending',
  payment_status text not null default 'created',
  payment_gateway text,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  currency text not null default 'INR',
  amount_paise bigint not null default 0,
  contact_email text,
  contact_registered_email text,
  contact_phone text,
  contact_registered_phone text,
  created_at timestamptz not null default now()
);

alter table public.orders
  add column if not exists user_id uuid,
  add column if not exists items jsonb not null default '[]'::jsonb,
  add column if not exists shipping_address jsonb not null default '{}'::jsonb,
  add column if not exists payment_method text not null default 'cod',
  add column if not exists total numeric not null default 0,
  add column if not exists status text not null default 'pending',
  add column if not exists payment_status text not null default 'created',
  add column if not exists payment_gateway text,
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text,
  add column if not exists razorpay_signature text,
  add column if not exists currency text not null default 'INR',
  add column if not exists amount_paise bigint not null default 0,
  add column if not exists contact_email text,
  add column if not exists contact_registered_email text,
  add column if not exists contact_phone text,
  add column if not exists contact_registered_phone text,
  add column if not exists created_at timestamptz not null default now();

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
