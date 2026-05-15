# 🏔️ 혜원이와 욱태의 100대 명산 도전기 - 셋업 가이드

## 1. Supabase 설정

### 1-1. 프로젝트 생성
1. [supabase.com](https://supabase.com) 접속 → 무료 계정 가입
2. **New Project** → 프로젝트 이름 입력 (예: `mountain-challenge`)
3. 데이터베이스 비밀번호 설정 후 **Create Project**

### 1-2. 데이터베이스 스키마 생성
1. 좌측 메뉴 **SQL Editor** → **New Query**
2. `supabase/schema.sql` 파일 전체 내용 복사 → 붙여넣기 → **Run**

### 1-3. Storage 버킷 생성 (사진 업로드용)
1. 좌측 메뉴 **Storage** → **New bucket**
2. 이름: `mountain-photos`, **Public bucket** 체크 → **Create bucket**

### 1-4. API 키 확인
1. 좌측 메뉴 **Settings** → **API**
2. `Project URL`과 `anon public` 키 복사

### 1-5. 환경변수 설정
`.env.local` 파일을 열어 아래 값 입력:
```
NEXT_PUBLIC_SUPABASE_URL=https://여기에.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ여기에anonkey...
```

## 2. 카카오맵 API 설정

`.env.local` 확인:
```
NEXT_PUBLIC_KAKAO_MAP_API_KEY=2ab96d3cc7e765728654f7a313923aee
```
> 이미 설정되어 있습니다! ✅

카카오 개발자 콘솔에서 **JavaScript 키** 등록된 도메인에 `localhost:3000` 추가 필요.

## 3. 100대 명산 초기 데이터 삽입

Supabase 설정 후 아래 명령어 실행:
```bash
# 방법 1: SQL Editor에서 직접 실행
# supabase/schema.sql 실행 후, 
# src/data/mountains.ts 데이터를 Supabase Table Editor에서 확인

# 방법 2: 앱 실행 후 자동 삽입 API 호출
# (별도 admin API 구현 예정)
```

또는 **Supabase Table Editor**에서 mountains 테이블에 CSV/JSON으로 직접 입력 가능.

## 4. 개발 서버 실행

```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 접속

## 5. 배포 (Vercel 권장)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경변수는 Vercel 대시보드에서 설정
```

## 기능 요약

| 페이지 | 경로 | 기능 |
|--------|------|------|
| 대시보드 | `/` | 진행률, 통계, 최근 방문 |
| 지도 탐색 | `/map` | 카카오맵 + 마커 + 지역 필터 |
| 명산 도감 | `/mountains` | 100개 목록, 검색, 필터 |
| 산 상세 | `/mountains/[id]` | 정보, 거리계산, 방문기록 |
| 등산 일기 | `/diary` | 방문 기록 목록 |
| 기록 추가 | `/diary/new` | 사진+태그+커플 스탬프 |
| 사진 갤러리 | `/gallery` | 그리드+라이트박스+지역필터 |
| 배지함 | `/badges` | 18개 도전 배지 |
