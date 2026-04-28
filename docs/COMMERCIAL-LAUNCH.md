# Go-live thương mại — VEarn

Checklist trước khi mở cho user / khách hàng thật.

## 1. Bảo mật & cấu hình

- [ ] `NEXTAUTH_URL` và `NEXT_PUBLIC_APP_URL` trỏ **HTTPS** (domain production).
- [ ] `NEXTAUTH_SECRET`, `JWT_SECRET` ≥ **32 ký tự** ngẫu nhiên (không dùng mẫu trong `.env.example`).
- [ ] `COMMERCIAL_MODE=true` trên production để log cảnh báo nếu thiếu email.
- [ ] Cookie session: app dùng `useSecureCookies` khi `NEXTAUTH_URL` bắt đầu bằng `https://`.

## 2. Email (Resend)

- [ ] Đăng ký [Resend](https://resend.com), tạo **API key** → `RESEND_API_KEY`.
- [ ] Xác minh **domain** gửi mail → đặt `EMAIL_FROM` dạng `Tên <noreply@yourdomain.com>`.
- [ ] Kiểm tra luồng **Quên mật khẩu** nhận mail và link mở đúng domain.
- [ ] Các email thông báo (ứng tuyển, submission, thanh toán) dùng chung `sendEmail` — cần key để gửi thật trên production.

## 3. Database

- [ ] Production dùng **`pnpm db:migrate`** (`prisma migrate deploy`) thay cho `db push`.
- [ ] Migration baseline: `prisma/migrations/20260328120000_baseline/`.
- [ ] Nếu DB **đã tồn tại** từ lệnh `db push` cũ (chưa có bảng `_prisma_migrations`): hoặc tạo DB mới + deploy migration, hoặc [baseline theo tài liệu Prisma](https://www.prisma.io/docs/guides/migrate/developing-and-prototyping#baselining-a-database) (`migrate resolve`).

## 4. Thanh toán

- [ ] VNPay / MoMo: khóa **production**, URL return/IPN khớp domain.
- [ ] Tắt `MOMO_IPN_SKIP_VERIFY` trên production.

## 5. Triển khai

- [ ] `docker compose` / Dockerfile: đã dùng `prisma migrate deploy` trước `pnpm start`.
- [ ] `GET /api/health` cho load balancer (kèm kiểm tra DB).
- [ ] `vercel.json` không còn rewrite sang domain khác (file mặc định `{}`).

## 6. Pháp lý & vận hành

- [ ] Điều khoản / bảo mật / cookie (`/legal/*`) khớp thực tế kinh doanh (nội dung do pháp lý của bạn duyệt).
- [ ] Sao lưu DB định kỳ, kế hoạch khôi phục.

## 7. Kiểm thử nhanh sau go-live

- [ ] Đăng ký tài khoản mới (mật khẩu đủ mạnh).
- [ ] Đăng nhập, tạo task (Business), apply + duyệt + nộp bài (Contributor).
- [ ] Một giao dịch nạp ví thử (sandbox hoặc số tiền nhỏ production tùy chính sách).

Chi tiết deploy: [`DEPLOY.md`](./DEPLOY.md). Testing MVP: [`TESTING-PHASE.md`](./TESTING-PHASE.md).
