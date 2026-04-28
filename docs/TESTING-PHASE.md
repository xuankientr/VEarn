# Giai đoạn Testing — VEarn

> Cập nhật: 2026-03-28

## Roadmap vs backlog

- **`docs/BACKLOG.md`** mô tả **sản phẩm đầy đủ** (email verify, email marketing, rút tiền, chat, v.v.). Đó **không** phải danh sách “đã code xong”.
- **Phiên bản hiện tại** là **MVP Web2**: auth, task (có ảnh minh họa), apply / assign / submit / review, ví & nạp tiền (VNPay / MoMo / chuyển khoản — cần cấu hình sandbox), thông báo **trong app** (polling), admin cơ bản, profile / saved tasks / template / analytics tùy màn đã có trong repo.

**Kết luận:** roadmap backlog **chưa hoàn thành** toàn bộ; **sẵn sàng bước testing** theo nghĩa: kiểm thử **luồng MVP** và hạ tầng build/typecheck, không chờ hết backlog.

## Chuẩn bị môi trường (bắt buộc trước khi test)

1. Copy `.env` từ `.env.example`, điền `DATABASE_URL`, `NEXTAUTH_SECRET`, `JWT_SECRET`.
2. `pnpm install`
3. `pnpm db:push` (hoặc migration nếu team dùng migrate)
4. `pnpm db:seed` — tài khoản demo trong `README.md`
5. `pnpm dev` — mở http://localhost:3000
6. Kiểm tra: `GET http://localhost:3000/api/health` → 200

## Kiểm tra tự động (local / CI)

- `pnpm run ci:check` — `prisma generate` + `check-types` + `lint`
- `pnpm run build` — build production (cần `.env` hoặc biến như trong [`DEPLOY.md`](./DEPLOY.md))
- CI GitHub Actions: xem [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) (gồm cả `next build`)

ESLint dùng `.eslintrc.cjs` (Next core-web-vitals). File flat cũ được lưu tại `eslint.flat.config.mjs.bak` nếu cần tham khảo.

## Checklist QA thủ công (MVP)

### Chung

- [ ] Đăng ký / đăng nhập / đăng xuất
- [ ] Quên mật khẩu (API trả thành công; email thật có thể **chưa** gửi — xem log server nếu dev)

### Contributor

- [ ] `/tasks` — lọc, tìm, mở chi tiết, lưu task (nếu có nút)
- [ ] Ứng tuyển task (apply) → trạng thái chờ duyệt
- [ ] Sau khi được duyệt: nộp bài / upload (nếu luồng có)
- [ ] Xem dashboard: submissions, payments (theo dữ liệu seed)

### Business

- [ ] Tạo task (có/không ảnh minh họa), publish
- [ ] Sửa task, xóa task (nếu cho phép)
- [ ] Duyệt application, xem submissions, duyệt/từ chối submission
- [ ] Thanh toán / ví (theo tính năng đã implement)

### Admin

- [ ] Danh sách user, bật/tắt user (nếu có)
- [ ] Thống kê / admin dashboard

## Ngoài phạm vi test MVP (ghi nhận là “chưa có / mock”)

- Xác thực email bắt buộc khi đăng ký
- Gửi email thật (thông báo application, submission, payment)
- WebSocket realtime (hiện dùng polling cho notification)
- Rút tiền contributor end-to-end với ngân hàng thật
- E2E tự động (Playwright) — nằm trong backlog kỹ thuật

## Bước tiếp theo sau testing MVP

1. Sửa ESLint + thêm `lint` vào CI
2. Thêm Postgres service trong CI + test API tích hợp (tuỳ chọn)
3. Playwright cho 3–5 luồng: login, tạo task, apply, submit
