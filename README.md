# VEarn - Nền tảng kiếm tiền theo nhiệm vụ

VEarn là nền tảng Web2 kết nối doanh nghiệp với cộng tác viên thông qua các task thực tế. Người dùng kiếm tiền bằng cách hoàn thành các công việc cho doanh nghiệp.

## Tính năng chính

### Cho Cộng tác viên
- Xem danh sách tasks đang mở
- Nhận task và nộp bài
- Theo dõi lịch sử và thu nhập

### Cho Doanh nghiệp
- Tạo và quản lý tasks
- Duyệt submissions từ cộng tác viên
- Theo dõi thanh toán

### Cho Admin
- Quản lý users và tasks
- Xem thống kê hệ thống

## Công nghệ sử dụng

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js (Credentials)
- **UI Components**: Radix UI, Lucide Icons

## Cài đặt

### Yêu cầu
- Node.js 18+
- PostgreSQL
- pnpm (khuyến nghị) hoặc npm

### Bước 1: Clone và cài đặt dependencies

```bash
git clone <repo-url>
cd VEarn
pnpm install
```

### Bước 2: Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong `.env`:

```env
# Database - thay đổi theo PostgreSQL của bạn
DATABASE_URL="postgresql://postgres:password@localhost:5432/vearn?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# JWT
JWT_SECRET="your-jwt-secret-here"

# Đồ án / demo: rút ví mô phỏng (không cần cổng thật)
PAYMENT_SANDBOX="true"
```

### Bước 3: Setup Database

```bash
# Generate Prisma client
pnpm prisma generate

# Áp schema (dev nhanh)
pnpm prisma db push

# Hoặc migration (khuyến nghị staging/production)
# pnpm db:migrate

# Seed data mẫu
pnpm db:seed
```

### Bước 4: Chạy ứng dụng

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

Ứng dụng chạy tại: http://localhost:3000

## Đồ án / MVP — ví & thanh toán mô phỏng

Nếu bạn chỉ cần **demo hoặc đồ án**, không bắt buộc tích hợp cổng thanh toán / rút tiền thật.

1. Trong `.env`, bật sandbox (đã có sẵn trong `.env.example`):
   - `PAYMENT_SANDBOX=true` — bật nút **rút tiền mô phỏng** trên trang ví (trừ số dư trong database, không có giao dịch ngân hàng).
2. **Luồng nghiệp vụ minh họa**: Business/Admin thanh toán submission → tiền được **ghi có vào ví nền tảng** (`walletBalance`) của contributor → contributor vào **Dashboard → Ví thu nhập** xem số dư và (khi sandbox bật) thử rút mô phỏng.
3. **Nạp ví Business** (trả contributor bằng ví): tuỳ chọn cấu hình Stripe test / VNPay sandbox / MoMo test trong `.env`; có thể bỏ trống nếu demo chỉ dùng **Thanh toán thủ công (MANUAL)** sau khi “chuyển khoản ngoài hệ thống”.
4. Trong **báo cáo / slide**, nên nêu rõ **phạm vi MVP**: ví nội bộ, rút sandbox; **hướng phát triển**: cổng nạp/rút thật, đối soát, KYC (nếu có).

## Giai đoạn testing & deploy

- **Roadmap đầy đủ:** [`docs/BACKLOG.md`](docs/BACKLOG.md)
- **Testing MVP (checklist QA):** [`docs/TESTING-PHASE.md`](docs/TESTING-PHASE.md)
- **Deploy:** [`docs/DEPLOY.md`](docs/DEPLOY.md)
- **Go-live thương mại (email Resend, migrate, bảo mật):** [`docs/COMMERCIAL-LAUNCH.md`](docs/COMMERCIAL-LAUNCH.md)
- **CI:** `pnpm run ci:check` — GitHub: types + lint + build ([`.github/workflows/ci.yml`](.github/workflows/ci.yml))

## Tài khoản Demo

Sau khi chạy seed, bạn có thể đăng nhập với:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vearn.vn | admin123 |
| Business | techcorp@vearn.vn | business123 |
| Contributor | nguyen.van.a@gmail.com | user123 |

## Cấu trúc thư mục

```
VEarn/
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── src/
│   ├── components/      # React components
│   │   ├── layout/      # Layout components
│   │   └── ui/          # UI components
│   ├── lib/             # Utilities
│   │   ├── api.ts       # API client
│   │   └── auth.ts      # Auth config
│   ├── pages/           # Next.js pages
│   │   ├── api/         # API routes
│   │   ├── auth/        # Auth pages
│   │   ├── dashboard/   # Dashboard pages
│   │   └── tasks/       # Task pages
│   ├── styles/          # CSS styles
│   └── types/           # TypeScript types
├── public/              # Static assets
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Tasks
- `GET /api/tasks` - Danh sách tasks
- `POST /api/tasks` - Tạo task (Business)
- `GET /api/tasks/[id]` - Chi tiết task
- `PUT /api/tasks/[id]` - Cập nhật task
- `POST /api/tasks/[id]/claim` - Nhận task
- `POST /api/tasks/[id]/submit` - Nộp bài

### Submissions
- `GET /api/submissions` - Danh sách submissions
- `POST /api/submissions/[id]/review` - Duyệt submission

### Payments
- `GET /api/payments` - Lịch sử thanh toán
- `POST /api/payments/[id]/pay` - Đánh dấu đã thanh toán

### Admin
- `GET /api/admin/stats` - Thống kê
- `GET /api/admin/users` - Quản lý users

## Scripts

```bash
pnpm dev          # Chạy development server
pnpm build        # Build production
pnpm start        # Chạy production server
pnpm db:push      # Push Prisma schema
pnpm db:seed      # Seed database
pnpm db:studio    # Mở Prisma Studio
```

## License

MIT
