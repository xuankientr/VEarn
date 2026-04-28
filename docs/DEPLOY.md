# Triển khai (Deploy) — VEarn

> Cập nhật: 2026-03-28

## Trước khi deploy

1. **PostgreSQL** — database đã tạo, có thể truy cập từ app (connection string chuẩn Prisma).
2. **Biến môi trường** — xem `.env.example`. Trên **production**:
   - `NEXTAUTH_URL` phải là **HTTPS** (domain thật), trừ khi chỉ test local.
   - `NEXTAUTH_SECRET` và `JWT_SECRET` **≥ 32 ký tự** (ví dụ: `openssl rand -base64 32`).
3. **Schema DB**
   - **Production / staging:** `pnpm db:migrate` (alias `prisma migrate deploy`). Migration nằm trong `prisma/migrations/`.
   - **Dev nhanh:** `pnpm db:push` (không ghi lịch sử migration).
   - DB cũ chỉ từng dùng `db push`: xem [Prisma baselining](https://www.prisma.io/docs/guides/migrate/developing-and-prototyping#baselining-a-database) hoặc [`COMMERCIAL-LAUNCH.md`](./COMMERCIAL-LAUNCH.md).
4. **Email (go-live):** `RESEND_API_KEY` + `EMAIL_FROM` — xem [`COMMERCIAL-LAUNCH.md`](./COMMERCIAL-LAUNCH.md).

## Kiểm tra local giống production

```bash
pnpm run ci:check    # prisma generate + types + lint
pnpm run lint
pnpm run build       # cần .env hợp lệ hoặc SKIP_ENV_VALIDATION=true + placeholder DATABASE_URL
pnpm start
```

Health: `GET /api/health`

## Docker (khuyến nghị VPS / máy chủ riêng)

```bash
docker build -t vearn .
docker run -p 3000:3000 --env-file .env.production vearn \
  sh -c "pnpm exec prisma migrate deploy && pnpm start"
```

- Image **multi-stage**: bước build trong Dockerfile đã có biến giả lập để `next build` không cần DB thật; **chạy container** phải truyền `DATABASE_URL` và secret thật (không commit file `.env`).
- Nếu chỉ `pnpm start` (không migrate), chạy `prisma migrate deploy` một lần trước hoặc dùng `docker compose` (đã gắn migrate trong `command`).

**Compose (app + Postgres)** — phù hợp staging / demo:

```bash
docker compose up --build -d
```

- Lần đầu có thể seed: `docker compose exec app pnpm exec tsx prisma/seed.ts` (nếu image có `tsx`; hoặc chạy seed từ máy dev trỏ vào `DATABASE_URL` của compose).
- `docker-compose` mặc định dùng **`prisma db push`** trước `start` để tránh container tắt khi DB đã tồn tại từ `db push` nhưng chưa có bảng `_prisma_migrations`. Môi trường production chuẩn migration: ghi đè `command` thành `prisma migrate deploy && pnpm start`.

## Vercel / serverless

- Thêm biến môi trường trên dashboard (cùng tên như `.env.example`).
- **PostgreSQL:** dùng Neon, Supabase, RDS… — dán `DATABASE_URL` (thường có `?sslmode=require`).
- `vercel.json` mặc định là `{}` (không rewrite ngoài). Nếu cần rewrite tùy chỉnh, chỉnh trực tiếp file này.

## CI (GitHub Actions)

Workflow `.github/workflows/ci.yml` chạy: cài đặt → `prisma generate` → `check-types` → `lint` → `next build` (với biến giả lập trong workflow).

## Sau deploy

- Xác minh đăng nhập, tạo task, API `/api/health`.
- Bật HTTPS và kiểm tra callback VNPay/MoMo (URL return/IPN khớp domain).
