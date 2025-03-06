-- Create tables table
create table public.tables (
    id uuid default uuid_generate_v4() primary key,
    number integer not null unique,
    capacity integer not null,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint tables_capacity_check check (capacity > 0),
    constraint tables_number_check check (number > 0)
);

-- Create reservations table
create table public.reservations (
    id uuid default uuid_generate_v4() primary key,
    table_id uuid references public.tables(id),
    customer_name text not null,
    email text not null,
    phone text not null,
    date date not null,
    time time not null,
    party_size integer not null,
    status text not null check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint reservations_party_size_check check (party_size > 0)
);

-- Create configurations table
create table public.configurations (
    key text primary key,
    value jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tables enable row level security;
alter table public.reservations enable row level security;
alter table public.configurations enable row level security;

-- Create indexes
create index idx_reservations_date on public.reservations(date);
create index idx_reservations_status on public.reservations(status);
create index idx_reservations_table_id on public.reservations(table_id);
create index idx_tables_is_active on public.tables(is_active);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

-- Create triggers for updated_at
create trigger handle_tables_updated_at
    before update on public.tables
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_reservations_updated_at
    before update on public.reservations
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_configurations_updated_at
    before update on public.configurations
    for each row
    execute procedure public.handle_updated_at();

-- RLS Policies for tables
create policy "Enable read access for all users" on public.tables
    for select using (true);

create policy "Enable insert for authenticated users only" on public.tables
    for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.tables
    for update using (auth.role() = 'authenticated');

-- RLS Policies for reservations
create policy "Enable read access for all users" on public.reservations
    for select using (true);

create policy "Enable insert for all users" on public.reservations
    for insert with check (true);

create policy "Enable update for authenticated users only" on public.reservations
    for update using (auth.role() = 'authenticated');

-- RLS Policies for configurations
create policy "Enable read access for all users" on public.configurations
    for select using (true);

create policy "Enable insert/update for authenticated users only" on public.configurations
    for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.configurations
    for update using (auth.role() = 'authenticated');

-- Sample data for tables
insert into public.tables (number, capacity) values
    (1, 2),
    (2, 2),
    (3, 4),
    (4, 4),
    (5, 6),
    (6, 6),
    (7, 8),
    (8, 8),
    (9, 10),
    (10, 12);

-- Create function to check table availability
create or replace function check_table_availability(
    check_date date,
    check_time time,
    required_capacity integer
)
returns table (
    available boolean,
    table_id uuid,
    message text
) language plpgsql as $$
begin
    return query
    with available_tables as (
        select t.id, t.capacity
        from tables t
        where t.is_active = true
        and t.capacity >= required_capacity
        and not exists (
            select 1
            from reservations r
            where r.table_id = t.id
            and r.date = check_date
            and r.time = check_time
            and r.status in ('pending', 'confirmed')
        )
        order by t.capacity
        limit 1
    )
    select
        case when exists (select 1 from available_tables) then true else false end,
        (select id from available_tables),
        case
            when not exists (select 1 from tables where capacity >= required_capacity)
            then 'No tables available for this party size'
            when exists (select 1 from available_tables)
            then 'Table available'
            else 'No tables available for this time slot'
        end;
end;
$$;

-- Create function to get available time slots
create or replace function get_available_time_slots(
    check_date date,
    party_size integer
)
returns table (
    time_slot time,
    available boolean
) language plpgsql as $$
declare
    time_slot time;
begin
    for time_slot in
        select '17:00'::time union
        select '17:30'::time union
        select '18:00'::time union
        select '18:30'::time union
        select '19:00'::time union
        select '19:30'::time union
        select '20:00'::time union
        select '20:30'::time union
        select '21:00'::time
    loop
        return query
        select
            time_slot,
            (select available from check_table_availability(check_date, time_slot, party_size));
    end loop;
end;
$$;
