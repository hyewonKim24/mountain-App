-- 100대 명산 테이블
create table mountains (
  id uuid default gen_random_uuid() primary key,
  number integer unique not null,
  name text not null,
  region text not null,
  province text,
  altitude numeric(6,1),
  difficulty text check (difficulty in ('하', '중', '상')),
  recommended_course text,
  estimated_time text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  has_parking boolean default false,
  has_cable_car boolean default false,
  has_restroom boolean default false,
  is_sunrise_spot boolean default false,
  is_autumn_spot boolean default false,
  description text,
  trailhead_address text,
  created_at timestamptz default now()
);

-- 방문 기록 테이블
create table visits (
  id uuid default gen_random_uuid() primary key,
  mountain_id uuid references mountains(id) on delete cascade,
  visit_date date not null,
  weather text check (weather in ('맑음', '흐림', '비', '눈', '안개')),
  duration_minutes integer,
  short_review text,
  difficulty_rating integer check (difficulty_rating between 1 and 5),
  want_revisit boolean default true,
  tags text[] default '{}',
  is_favorite boolean default false,
  created_at timestamptz default now()
);

-- 사진 테이블
create table photos (
  id uuid default gen_random_uuid() primary key,
  mountain_id uuid references mountains(id) on delete cascade,
  visit_id uuid references visits(id) on delete cascade,
  url text not null,
  caption text default '',
  is_representative boolean default false,
  created_at timestamptz default now()
);

-- 집 위치 테이블 (거리 계산용)
create table home_location (
  id uuid default gen_random_uuid() primary key,
  name text default '우리집',
  latitude numeric(9,6),
  longitude numeric(9,6),
  updated_at timestamptz default now()
);

-- 기본 집 위치 삽입 (서울 중심부)
insert into home_location (latitude, longitude) values (37.5665, 126.9780);

-- RLS 정책 (공개 읽기, 쓰기는 별도 처리)
alter table mountains enable row level security;
alter table visits enable row level security;
alter table photos enable row level security;
alter table home_location enable row level security;

create policy "mountains_select" on mountains for select using (true);
create policy "mountains_insert" on mountains for insert with check (true);
create policy "mountains_update" on mountains for update using (true);

create policy "visits_select" on visits for select using (true);
create policy "visits_insert" on visits for insert with check (true);
create policy "visits_update" on visits for update using (true);
create policy "visits_delete" on visits for delete using (true);

create policy "photos_select" on photos for select using (true);
create policy "photos_insert" on photos for insert with check (true);
create policy "photos_delete" on photos for delete using (true);

create policy "home_select" on home_location for select using (true);
create policy "home_update" on home_location for update using (true);
