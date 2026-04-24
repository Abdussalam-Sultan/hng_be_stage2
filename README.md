# Profiles API

A simple REST API for managing and querying user profiles, built with Node.js, Express, Sequelize, and PostgreSQL. Supports filtering, sorting, pagination, and natural language search query parsing.

---

## Tech Stack

- **Node.js** — Runtime environment
- **Express.js** — Web framework
- **Sequelize ORM** — Database abstraction layer
- **PostgreSQL** (Supabase compatible) — Database
- **UUIDv7** — Primary key generation
- **JSON file seeding** via `profiles.json`

---

## Project Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://username:password@host:5432/database
```

**Example:**

```env
DATABASE_URL=postgresql://postgres.qarrkufovyhxmtuhnjuh:example@aws-1-eu-west-2.pooler.supabase.com:5432/postgres
```

---

## Running the Project

```bash
npm start
```

The server runs on **http://localhost:3000**

---

## Database Connection

Connection is handled via Sequelize using `sequelize.authenticate()`. The database is seeded automatically on startup from `profiles.json` using `Profile.upsert()` to prevent duplicates (conflict key: `name`).

> ⚠️ **Important:** Your database table must exist before seeding. To have Sequelize auto-create it, enable this line inside `connectDB()`:
>
> ```js
> await sequelize.sync({ force: true });
> ```
>
> `force: true` drops and recreates the table — **do not use in production**.

---

## API Base URL

```
https://hng-be-stage2-six.vercel.app
```

**Full example:** `http://localhost:3000/api/profiles`

---

## Endpoints

### `GET /api/profiles` — List Profiles

Returns profiles with support for filtering, sorting, and pagination.

#### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `gender` | string | Filter by gender (`male` or `female`) |
| `age_group` | string | Filter by age group (`child`, `teenager`, `adult`, `senior`) |
| `country_id` | string | Filter by country code (e.g. `NG`, `KE`) |
| `min_age` | number | Minimum age filter |
| `max_age` | number | Maximum age filter |
| `min_gender_probability` | float | Minimum gender probability |
| `min_country_probability` | float | Minimum country probability |
| `sort_by` | string | Sort field (`age`, `created_at`, `gender_probability`) |
| `order` | string | Sort direction (`asc` or `desc`) |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Items per page (default: `10`, max: `50`) |

#### Example Requests

```
GET /api/profiles
GET /api/profiles?gender=female
GET /api/profiles?min_age=20&max_age=40
GET /api/profiles?country_id=NG
GET /api/profiles?sort_by=age&order=desc
GET /api/profiles?page=2&limit=5
```

#### Success Response

```json
{
  "status": "success",
  "page": 2,
  "limit": 5,
  "total": 100,
  "data": [
    {
      "id": "019dbc7f-2c1f-728d-a3f1-49420ca0726b",
      "name": "awino hassan",
      "gender": "female",
      "gender_probability": 0.66,
      "age": 68,
      "age_group": "senior",
      "country_id": "TZ",
      "country_name": "Tanzania",
      "country_probability": 0.6,
      "created_at": "2026-04-23T22:39:04.223Z"
    }
  ]
}
```

#### Error Responses

```json
{ "status": "error", "message": "Invalid query parameters" }
{ "status": "error", "message": "Server failure" }
```

---

### `GET /api/profiles/search` — Natural Language Search

Search profiles using plain English phrases. The query parser extracts filters automatically.

#### Query Parameters

| Parameter | Type | Description |
|---|---|---|
| `q` | string | Search query (required) |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Results per page (default: `10`, max: `50`) |

#### Example Requests

```
GET /api/profiles/search?q=young%20female
GET /api/profiles/search?q=senior%20in%20nigeria
GET /api/profiles/search?q=male%20above%2030
GET /api/profiles/search?q=female%20between%2020%20and%2030
```

The `young female` query automatically applies `min_age=16`, `max_age=24`, and `gender=female`.

#### Supported Keywords

**Gender**
- `male`, `males`, `man`, `men`
- `female`, `females`, `woman`, `women`

**Age groups**
- `child`, `children`
- `teen`, `teenager`, `teenagers`
- `adult`, `adults`
- `senior`, `seniors`, `old`

**Age filters**
- `above 30` / `over 30`
- `below 20` / `under 20`
- `between 20 and 40`
- `young` → resolves to age 16–24

**Countries**
- `nigeria` → `NG`
- `kenya` → `KE`
- `angola` → `AO`
- `benin` → `BJ`
- `ghana` → `GH`
- `south africa` → `ZA`

#### Success Response

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 22,
  "data": [
    {
      "id": "019dbc7f-2c1f-728d-a3f1-49420ca0726b",
      "name": "awino hassan",
      "gender": "female",
      "age": 22,
      "age_group": "adult",
      "country_id": "NG",
      "country_name": "Nigeria"
    }
  ]
}
```

#### Error Responses

```json
{ "status": "error", "message": "Missing or empty parameter" }
{ "status": "error", "message": "Unable to interpret query" }
```

---

## Pagination

Pagination uses limit/offset. The offset is calculated as:

```
offset = (page - 1) * limit
```

**Example:** `page=3`, `limit=10` → offset `20` → skips first 20 records, returns next 10.

---

## Routes Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profiles` | List profiles with filter, sort, and pagination |
| `GET` | `/api/profiles/search` | Search profiles using a plain English query |

---

## Notes & Limitations

- Sorting is only supported on: `age`, `created_at`, `gender_probability`
- Ordering supports only `asc` or `desc`
- Maximum `limit` per page is capped at `50`

---

## Author

Built for backend filtering, sorting, pagination, and natural language query parsing using Sequelize and PostgreSQL.
