# VEarn - Product Backlog

> Last updated: 2026-03-02

**Trạng thái:** Đây là backlog **dài hạn**, không phải checklist “đã xong”. Để chuẩn bị **testing MVP**, xem [`TESTING-PHASE.md`](./TESTING-PHASE.md).

---

## 🔴 HIGH PRIORITY (Must Have)

### Email Verification
- **Description:** Xác thực email khi đăng ký tài khoản mới
- **Acceptance Criteria:**
  - Gửi email chứa link xác thực sau khi đăng ký
  - Link có thời hạn 24h
  - User không thể đăng nhập nếu chưa verify
  - Có nút "Gửi lại email xác thực"
- **Labels:** `Feature`, `Auth`, `Email`
- **Estimate:** 3 points

---

### Email Notifications
- **Description:** Gửi email thông báo cho các sự kiện quan trọng
- **Acceptance Criteria:**
  - Business nhận email khi có application mới
  - Contributor nhận email khi application được duyệt/từ chối
  - Contributor nhận email khi submission được review
  - Contributor nhận email khi nhận được payment
  - User có thể tắt/bật từng loại notification
- **Labels:** `Feature`, `Notification`, `Email`
- **Estimate:** 5 points

---

### In-app Notifications
- **Description:** Hệ thống thông báo realtime trong ứng dụng
- **Acceptance Criteria:**
  - Bell icon hiển thị số notification chưa đọc
  - Dropdown list notifications
  - Mark as read / Mark all as read
  - Click vào notification để navigate đến nội dung
  - Realtime update (WebSocket hoặc polling)
- **Labels:** `Feature`, `Notification`, `UX`
- **Estimate:** 5 points

---

### Payment Gateway Integration
- **Description:** Tích hợp cổng thanh toán để Business nạp tiền
- **Acceptance Criteria:**
  - Hỗ trợ VNPay, Momo, Bank Transfer
  - Business nạp tiền vào ví
  - Lịch sử giao dịch nạp tiền
  - Webhook xử lý callback từ payment gateway
- **Labels:** `Feature`, `Payment`, `Integration`
- **Estimate:** 8 points

---

### Withdrawal System
- **Description:** Contributor rút tiền về tài khoản ngân hàng
- **Acceptance Criteria:**
  - Contributor thêm thông tin ngân hàng
  - Tạo yêu cầu rút tiền (minimum amount)
  - Admin duyệt yêu cầu rút tiền
  - Trừ tiền từ ví sau khi duyệt
  - Lịch sử rút tiền
- **Labels:** `Feature`, `Payment`
- **Estimate:** 5 points

---

### Task Deadline Reminder
- **Description:** Nhắc nhở trước khi deadline task
- **Acceptance Criteria:**
  - Email nhắc nhở 3 ngày, 1 ngày trước deadline
  - In-app notification
  - Hiển thị warning trên task card khi gần deadline
- **Labels:** `Feature`, `Notification`
- **Estimate:** 3 points

---

## 🟠 MEDIUM PRIORITY (Should Have)

### Rating & Review System
- **Description:** Business đánh giá Contributor sau khi hoàn thành task
- **Acceptance Criteria:**
  - Rating 1-5 sao
  - Comment đánh giá
  - Hiển thị average rating trên profile
  - Contributor có thể reply review
  - Filter contributors by rating
- **Labels:** `Feature`, `Trust`, `Profile`
- **Estimate:** 5 points

---

### Contributor Portfolio
- **Description:** Trang portfolio showcase các task đã hoàn thành
- **Acceptance Criteria:**
  - Hiển thị danh sách tasks đã hoàn thành (approved)
  - Thống kê: tổng task, tổng thu nhập, rating
  - Skills showcase
  - Có thể ẩn/hiện từng task
  - Share link portfolio
- **Labels:** `Feature`, `Profile`
- **Estimate:** 3 points

---

### Messaging System
- **Description:** Chat realtime giữa Business và Contributor
- **Acceptance Criteria:**
  - Chat 1-1 trong context của task
  - Gửi text, links
  - Upload hình ảnh trong chat
  - Notification khi có tin nhắn mới
  - Lịch sử chat
- **Labels:** `Feature`, `Communication`
- **Estimate:** 8 points

---

### Bookmark Tasks
- **Description:** Lưu task yêu thích để xem sau
- **Acceptance Criteria:**
  - Button bookmark trên task card và detail
  - Trang "Saved Tasks" trong dashboard
  - Remove bookmark
- **Labels:** `Feature`, `UX`
- **Estimate:** 2 points

---

### Task Templates
- **Description:** Business tạo template cho các task tương tự
- **Acceptance Criteria:**
  - Save task as template
  - List templates
  - Create task from template
  - Edit/delete template
- **Labels:** `Feature`, `Productivity`
- **Estimate:** 3 points

---

### Advanced Analytics Dashboard
- **Description:** Dashboard thống kê chi tiết cho Business
- **Acceptance Criteria:**
  - Chart: Tasks theo thời gian
  - Chart: Spending theo category
  - Chart: Top contributors
  - Filter by date range
  - Export report
- **Labels:** `Feature`, `Analytics`
- **Estimate:** 5 points

---

### Export Data
- **Description:** Xuất báo cáo dạng CSV/Excel
- **Acceptance Criteria:**
  - Export danh sách tasks
  - Export danh sách submissions
  - Export payment history
  - Admin: export users, all tasks
- **Labels:** `Feature`, `Admin`
- **Estimate:** 3 points

---

### Bulk Actions
- **Description:** Admin thao tác hàng loạt
- **Acceptance Criteria:**
  - Select multiple items
  - Bulk approve/reject applications
  - Bulk delete tasks
  - Bulk activate/deactivate users
- **Labels:** `Feature`, `Admin`
- **Estimate:** 3 points

---

### Search Improvements
- **Description:** Full-text search với relevance ranking
- **Acceptance Criteria:**
  - Search by title, description, skills
  - Relevance-based ranking
  - Search suggestions/autocomplete
  - Recent searches
- **Labels:** `Enhancement`, `Search`
- **Estimate:** 5 points

---

### Filter by Location
- **Description:** Lọc task theo vùng/miền địa lý
- **Acceptance Criteria:**
  - Task có field location (optional)
  - Filter: Miền Bắc/Trung/Nam, Remote
  - User set preferred location in profile
- **Labels:** `Feature`, `Filter`
- **Estimate:** 2 points

---

## 🟡 LOW PRIORITY (Nice to Have)

### Dark Mode
- **Description:** Giao diện tối cho ứng dụng
- **Acceptance Criteria:**
  - Toggle dark/light mode
  - Persist preference
  - Auto detect system preference
- **Labels:** `Enhancement`, `UI`
- **Estimate:** 3 points

---

### Multi-language (i18n)
- **Description:** Hỗ trợ đa ngôn ngữ
- **Acceptance Criteria:**
  - Vietnamese (default)
  - English
  - Language switcher
  - Persist preference
- **Labels:** `Enhancement`, `i18n`
- **Estimate:** 5 points

---

### PWA Support
- **Description:** Progressive Web App - cài đặt trên mobile
- **Acceptance Criteria:**
  - Installable on mobile
  - Offline support (basic)
  - Push notifications
  - App icon, splash screen
- **Labels:** `Enhancement`, `Mobile`
- **Estimate:** 3 points

---

### Social Login
- **Description:** Đăng nhập bằng Google/Facebook
- **Acceptance Criteria:**
  - Login with Google
  - Login with Facebook
  - Link existing account
- **Labels:** `Feature`, `Auth`
- **Estimate:** 3 points

---

### Two-Factor Authentication (2FA)
- **Description:** Bảo mật 2 lớp
- **Acceptance Criteria:**
  - Enable/disable 2FA in settings
  - TOTP (Google Authenticator)
  - Backup codes
- **Labels:** `Feature`, `Security`
- **Estimate:** 5 points

---

### Referral System
- **Description:** Giới thiệu bạn bè nhận thưởng
- **Acceptance Criteria:**
  - Unique referral code/link per user
  - Track referrals
  - Reward when referred user completes first task
  - Referral dashboard
- **Labels:** `Feature`, `Growth`
- **Estimate:** 5 points

---

### Gamification
- **Description:** Badges, levels, achievements
- **Acceptance Criteria:**
  - Badges for milestones (first task, 10 tasks, etc.)
  - Level system based on XP
  - Leaderboard
  - Display on profile
- **Labels:** `Feature`, `Engagement`
- **Estimate:** 5 points

---

### Task Milestones
- **Description:** Chia task lớn thành nhiều milestones
- **Acceptance Criteria:**
  - Create task with multiple milestones
  - Each milestone has deadline, reward %
  - Submit per milestone
  - Partial payment per milestone
- **Labels:** `Feature`, `Task`
- **Estimate:** 8 points

---

### Dispute Resolution
- **Description:** Hệ thống giải quyết tranh chấp
- **Acceptance Criteria:**
  - Open dispute on submission
  - Both parties provide evidence
  - Admin review and decide
  - Dispute history
- **Labels:** `Feature`, `Trust`
- **Estimate:** 5 points

---

### Report/Flag System
- **Description:** Báo cáo vi phạm
- **Acceptance Criteria:**
  - Report user, task, submission
  - Select reason
  - Admin review reports
  - Take action (warn, ban)
- **Labels:** `Feature`, `Moderation`
- **Estimate:** 3 points

---

## 🔵 TECHNICAL DEBT / INFRASTRUCTURE

### Unit Tests
- **Description:** Viết unit tests cho API và components
- **Acceptance Criteria:**
  - Jest setup
  - Test coverage > 70%
  - Tests for all API endpoints
  - Tests for critical components
- **Labels:** `Tech`, `Testing`
- **Estimate:** 8 points

---

### E2E Tests
- **Description:** End-to-end tests với Playwright
- **Acceptance Criteria:**
  - Playwright setup
  - Tests for critical user flows
  - CI integration
- **Labels:** `Tech`, `Testing`
- **Estimate:** 5 points

---

### CI/CD Pipeline
- **Description:** GitHub Actions cho auto deploy
- **Acceptance Criteria:**
  - Run tests on PR
  - Auto deploy to staging on merge to develop
  - Auto deploy to production on merge to main
  - Slack notifications
- **Labels:** `Tech`, `DevOps`
- **Estimate:** 3 points

---

### API Documentation
- **Description:** Swagger/OpenAPI documentation
- **Acceptance Criteria:**
  - Document all endpoints
  - Request/response examples
  - Authentication info
  - Hosted docs page
- **Labels:** `Tech`, `Docs`
- **Estimate:** 3 points

---

### Performance Optimization
- **Description:** Tối ưu tốc độ load
- **Acceptance Criteria:**
  - Image optimization (WebP, lazy loading)
  - Code splitting
  - API response caching
  - Lighthouse score > 90
- **Labels:** `Tech`, `Performance`
- **Estimate:** 5 points

---

### Security Audit
- **Description:** Kiểm tra và fix các lỗ hổng bảo mật
- **Acceptance Criteria:**
  - OWASP Top 10 check
  - SQL injection prevention
  - XSS prevention
  - CSRF protection
  - Security headers
- **Labels:** `Tech`, `Security`
- **Estimate:** 5 points

---

### Database Indexing
- **Description:** Tối ưu query database
- **Acceptance Criteria:**
  - Analyze slow queries
  - Add appropriate indexes
  - Query optimization
  - Connection pooling
- **Labels:** `Tech`, `Performance`
- **Estimate:** 3 points

---

### Error Monitoring
- **Description:** Tích hợp Sentry để track errors
- **Acceptance Criteria:**
  - Sentry setup
  - Error tracking frontend + backend
  - Slack alerts for critical errors
  - Source maps upload
- **Labels:** `Tech`, `Monitoring`
- **Estimate:** 2 points

---

### Logging System
- **Description:** Structured logging
- **Acceptance Criteria:**
  - Winston/Pino setup
  - Log levels (debug, info, warn, error)
  - Log rotation
  - Centralized log storage (optional)
- **Labels:** `Tech`, `Monitoring`
- **Estimate:** 2 points

---

### Rate Limiting
- **Description:** Chống spam API
- **Acceptance Criteria:**
  - Rate limit per IP
  - Rate limit per user
  - Different limits for different endpoints
  - Return proper 429 response
- **Labels:** `Tech`, `Security`
- **Estimate:** 2 points

---

## ✅ DONE (Completed)

- [x] User Authentication (Login/Register)
- [x] Forgot/Reset Password
- [x] User Profile Management
- [x] Public User Profile
- [x] Task CRUD (Create/Read/Update/Delete)
- [x] Task Application System (Apply → Review → Approve/Reject)
- [x] Submission System
- [x] Submission Review (Approve/Reject with feedback)
- [x] File Upload (images, documents)
- [x] Payment Tracking
- [x] Admin User Management
- [x] Admin Statistics Dashboard
- [x] Role-based Dashboard (Admin, Business, Contributor)
- [x] Landing Page with Hero, Features, Testimonials
- [x] Mobile Responsive Design
- [x] Error Pages (404, 500)
- [x] Settings Page (Change Password)
- [x] Advanced Task Filtering (category, skills, reward range)
- [x] Featured Tasks on Homepage

---

## 📊 Estimation Guide

| Points | Effort |
|--------|--------|
| 1 | Few hours |
| 2 | Half day |
| 3 | 1 day |
| 5 | 2-3 days |
| 8 | 1 week |
| 13 | 2 weeks |

---

## 🏷️ Labels Reference

| Label | Color | Description |
|-------|-------|-------------|
| `Feature` | 🟢 Green | New functionality |
| `Enhancement` | 🔵 Blue | Improvement to existing |
| `Bug` | 🔴 Red | Something broken |
| `Tech` | 🟣 Purple | Technical/infrastructure |
| `Auth` | 🟡 Yellow | Authentication related |
| `Payment` | 💰 Gold | Payment/money related |
| `UI` | 🎨 Pink | User interface |
| `UX` | 🎯 Orange | User experience |
| `Admin` | ⚫ Black | Admin features |
| `Security` | 🔒 Gray | Security related |

---

## 📋 Trello Import

Để import vào Trello:
1. Tạo board mới "VEarn Product"
2. Tạo các lists: `Backlog`, `To Do`, `In Progress`, `Review`, `Done`
3. Tạo labels theo bảng trên
4. Copy từng card vào list tương ứng

---

*Generated for VEarn Project - Task-based Earning Platform*
