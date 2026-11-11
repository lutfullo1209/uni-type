create table if not exists public.typing_race_rooms (
    id uuid primary key default gen_random_uuid(),
    room_code text not null unique,
    host_name text not null,
    guest_name text,
    prompt text not null,
    host_progress integer not null default 0,
    guest_progress integer not null default 0,
    status text not null default 'waiting'
        check (status in ('waiting', 'racing', 'finished')),
    winner text,
    created_at timestamptz not null default now()
);

create table if not exists public.typing_race_room_keys (
    room_id uuid primary key references public.typing_race_rooms(id) on delete cascade,
    host_key uuid not null,
    guest_key uuid
);

alter table public.typing_race_rooms enable row level security;
alter table public.typing_race_room_keys enable row level security;

drop policy if exists "Race rooms can be viewed by players" on public.typing_race_rooms;
create policy "Race rooms can be viewed by players"
    on public.typing_race_rooms
    for select
    to anon, authenticated
    using (true);

revoke all on public.typing_race_rooms from anon, authenticated;
grant select on public.typing_race_rooms to anon, authenticated;
revoke all on public.typing_race_room_keys from anon, authenticated;

create or replace function public.create_typing_race_room(p_host_name text, p_prompt text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_room_id uuid := gen_random_uuid();
    v_room_code text;
    v_host_key uuid := gen_random_uuid();
begin
    if length(trim(coalesce(p_host_name, ''))) not between 1 and 24 then
        raise exception 'Name must be 1 to 24 characters long';
    end if;
    if length(coalesce(p_prompt, '')) not between 1 and 500 then
        raise exception 'Race text must be 1 to 500 characters long';
    end if;

    loop
        v_room_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
        exit when not exists (
            select 1 from public.typing_race_rooms where room_code = v_room_code
        );
    end loop;

    insert into public.typing_race_rooms (id, room_code, host_name, prompt)
    values (v_room_id, v_room_code, trim(p_host_name), p_prompt);
    insert into public.typing_race_room_keys (room_id, host_key)
    values (v_room_id, v_host_key);

    return jsonb_build_object(
        'id', v_room_id,
        'room_code', v_room_code,
        'player_key', v_host_key,
        'player', 'host'
    );
end;
$$;

create or replace function public.join_typing_race_room(p_room_code text, p_guest_name text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_room public.typing_race_rooms%rowtype;
    v_guest_key uuid := gen_random_uuid();
begin
    if length(trim(coalesce(p_guest_name, ''))) not between 1 and 24 then
        raise exception 'Name must be 1 to 24 characters long';
    end if;

    select * into v_room
    from public.typing_race_rooms
    where room_code = upper(trim(coalesce(p_room_code, '')))
      and status = 'waiting'
    for update;

    if not found then
        raise exception 'That room is full or no longer available';
    end if;

    update public.typing_race_rooms
    set guest_name = trim(p_guest_name), status = 'racing'
    where id = v_room.id;
    update public.typing_race_room_keys
    set guest_key = v_guest_key
    where room_id = v_room.id;

    return jsonb_build_object(
        'id', v_room.id,
        'room_code', v_room.room_code,
        'player_key', v_guest_key,
        'player', 'guest'
    );
end;
$$;

create or replace function public.submit_typing_race_progress(
    p_room_id uuid,
    p_player_key uuid,
    p_progress integer
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_room public.typing_race_rooms%rowtype;
    v_player_name text;
    v_prompt_length integer;
begin
    select * into v_room
    from public.typing_race_rooms
    where id = p_room_id
    for update;

    if not found or v_room.status <> 'racing' then
        raise exception 'This race is no longer active';
    end if;

    v_prompt_length := char_length(v_room.prompt);
    if p_progress < 0 or p_progress > v_prompt_length then
        raise exception 'Race progress is out of range';
    end if;

    if exists (
        select 1 from public.typing_race_room_keys
        where room_id = p_room_id and host_key = p_player_key
    ) then
        v_player_name := v_room.host_name;
        update public.typing_race_rooms
        set host_progress = p_progress
        where id = p_room_id;
    elsif exists (
        select 1 from public.typing_race_room_keys
        where room_id = p_room_id and guest_key = p_player_key
    ) then
        v_player_name := v_room.guest_name;
        update public.typing_race_rooms
        set guest_progress = p_progress
        where id = p_room_id;
    else
        raise exception 'You are not a player in this room';
    end if;

    if p_progress = v_prompt_length then
        update public.typing_race_rooms
        set status = 'finished', winner = v_player_name
        where id = p_room_id;
    end if;
end;
$$;

revoke all on function public.create_typing_race_room(text, text) from public;
revoke all on function public.join_typing_race_room(text, text) from public;
revoke all on function public.submit_typing_race_progress(uuid, uuid, integer) from public;
grant execute on function public.create_typing_race_room(text, text) to anon, authenticated;
grant execute on function public.join_typing_race_room(text, text) to anon, authenticated;
grant execute on function public.submit_typing_race_progress(uuid, uuid, integer) to anon, authenticated;

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'typing_race_rooms'
    ) then
        alter publication supabase_realtime add table public.typing_race_rooms;
    end if;
end;
$$;
