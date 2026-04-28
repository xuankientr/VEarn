import { PrismaClient, Role, TaskStatus, SubmissionStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@vearn.vn',
      password: await bcrypt.hash('admin123', 12),
      name: 'Admin VEarn',
      username: 'admin',
      role: Role.ADMIN,
      isVerified: true,
      bio: 'Quản trị viên hệ thống VEarn',
    },
  });
  console.log('✅ Created admin:', admin.email);

  // Create Business Users
  const business1 = await prisma.user.create({
    data: {
      email: 'techcorp@vearn.vn',
      password: await bcrypt.hash('business123', 12),
      name: 'TechCorp Vietnam',
      username: 'techcorp',
      role: Role.BUSINESS,
      isVerified: true,
      bio: 'Công ty công nghệ hàng đầu Việt Nam',
    },
  });

  const business2 = await prisma.user.create({
    data: {
      email: 'startup@vearn.vn',
      password: await bcrypt.hash('business123', 12),
      name: 'Startup ABC',
      username: 'startupab',
      role: Role.BUSINESS,
      isVerified: true,
      bio: 'Startup đổi mới sáng tạo',
    },
  });
  console.log('✅ Created businesses:', business1.email, business2.email);

  // Create Contributors
  const contributor1 = await prisma.user.create({
    data: {
      email: 'nguyen.van.a@gmail.com',
      password: await bcrypt.hash('user123', 12),
      name: 'Nguyễn Văn A',
      username: 'nguyenvana',
      role: Role.CONTRIBUTOR,
      isVerified: true,
      bio: 'Freelancer chuyên về content writing và SEO',
    },
  });

  const contributor2 = await prisma.user.create({
    data: {
      email: 'tran.thi.b@gmail.com',
      password: await bcrypt.hash('user123', 12),
      name: 'Trần Thị B',
      username: 'tranthib',
      role: Role.CONTRIBUTOR,
      isVerified: true,
      bio: 'Designer với 5 năm kinh nghiệm',
    },
  });

  const contributor3 = await prisma.user.create({
    data: {
      email: 'le.van.c@gmail.com',
      password: await bcrypt.hash('user123', 12),
      name: 'Lê Văn C',
      username: 'levanc',
      role: Role.CONTRIBUTOR,
      bio: 'Developer fullstack',
    },
  });
  console.log('✅ Created contributors');

  /** Ảnh minh họa demo (Unsplash — đã bật remotePatterns ảnh HTTPS) */
  const cover = {
    ux: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1400&q=82',
    analytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=82',
    dev: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=82',
    video: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1400&q=82',
    office: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=82',
  } as const;

  // Create Tasks — mô tả dạng Markdown chuẩn demo; có ảnh trong nội dung + cover
  const task1 = await prisma.task.create({
    data: {
      title: 'Long-form SEO: AI trong chuyển đổi số doanh nghiệp (B2B)',
      slug: 'viet-bai-seo-cong-nghe-ai',
      description: `
## Bối cảnh dự án

TechCorp Vietnam đang xây **content pillar** cho giải pháp tư vấn AI & automation. Bài viết nhằm thu hút **ra quyết định** (COO, Head of Digital) qua tìm kiếm tự nhiên, không viết kiểu quảng cáo.

![Làm việc & phân tích nội dung](${cover.analytics})

## Phạm vi giao hàng

1. **Một (1) bài** tiếng Việt, độ dài **1.600–2.000 từ** (không tính chú thích).
2. **Keyword chính:** \`AI trong doanh nghiệp\` — mật độ tự nhiên, tránh nhồi nhét.
3. Cấu trúc gợi ý:
   - Mở bài: pain point + promise rõ ràng
   - **Tối thiểu 4 tiêu đề cấp 2 (H2)** và có thể dùng H3 khi cần
   - Một bảng hoặc danh sách so sánh **trước / sau** khi áp dụng AI (có thể dạng bullet)
4. **E-E-A-T:** có ví dụ tình huống (anonymized), trích dẫn nguồn uy tín (link footnote hoặc cuối bài).

## Tiêu chí chất lượng

- Ngữ điệu chuyên nghiệp, **chuẩn chính tả** tiếng Việt.
- **100% nội dung gốc** — kèm báo cáo kiểm tra trùng lặp (Copyscape / tương đương).
- Meta title + meta description đề xuất (tối đa 60 / 155 ký tự).

> **Lưu ý:** Bản nháp đầu gửi Google Docs (quyền comment). Bản chốt: file **.docx** + export **PDF**.

## Thời hạn

**7 ngày** kể từ ngày task được gán / ứng tuyển được duyệt.
      `.trim(),
      requirements: `
## Ứng viên phù hợp

- **Tối thiểu 2 năm** viết content B2B hoặc SEO editorial.
- Portfolio: **≥ 2 bài** dài tương tự (gửi link).

## Nộp hồ sơ

- Vài dòng **outline H2** đề xuất (5–7 bullet).
- Thời gian bạn cần để hoàn thành bản nháp 1.
      `.trim(),
      reward: 850_000,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: TaskStatus.OPEN,
      isPublished: true,
      isFeatured: true,
      category: 'Content & SEO',
      skills: ['SEO', 'Content Strategy', 'Research', 'B2B Writing'],
      creatorId: business1.id,
      coverImageUrl: '/images/task-covers/task-cover-content.png',
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Nhận diện thương hiệu: Logo + khối màu cho app fintech (bộ nộp Figma)',
      slug: 'thiet-ke-logo-ung-dung-mobile',
      description: `
## Tổng quan

Startup ABC ra mắt ví điện tử **“FlowPay”** (tên mã). Cần **logo chính + biến thể app icon**, hướng **hiện đại, tối giản, tin cậy**.

![Không gian làm việc sáng tạo](${cover.office})

## Deliverable

| Hạng mục | Chi tiết |
|----------|----------|
| Concept | **3 hướng** logo độc lập (mỗi hướng: full color + monochrome) |
| App icon | 1024×1024 master, xuất PNG slice theo chuẩn iOS/Android |
| Handoff | File **Figma** có component, style màu (hex), font đề xuất (commercial-friendly) |

## Hướng thẩm mỹ

- Palette gợi ý: **xanh dương đậm + trắng + một accent** (vàng hoặc teal — lý giải trong note).
- Tránh họa tiết quá chi tiết; đảm bảo **đọc được ở kích thước nhỏ**.

## Quyền & bảo mật

Toàn bộ file là **work for hire** cho đợt này; không đăng portfolio trước khi sản phẩm public (trừ khi được đồng ý bằng văn bản).
      `.trim(),
      requirements: `
## Kỹ năng

- Thành thạo **Figma** (hoặc Illustrator + Figma để handoff).
- Hiểu **chuẩn export** cho dev (SVG, PDF vector khi cần).

## Nộp đơn

- Link portfolio **logo / fintech / app** (Behance, Dribbble hoặc PDF).
- **Một đoạn** (80–120 từ) giải thích hướng concept bạn sẽ thử trước.
      `.trim(),
      reward: 1_800_000,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: TaskStatus.OPEN,
      isPublished: true,
      isFeatured: true,
      category: 'Branding & UI',
      skills: ['Figma', 'Logo Design', 'Brand Guidelines', 'App Icon'],
      creatorId: business1.id,
      coverImageUrl: '/images/task-covers/task-cover-design.png',
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Chiến dịch UGC: Review video sản phẩm skincare (TikTok / Reels)',
      slug: 'review-san-pham-social-media',
      description: `
## Mục tiêu

Thu thập **03 video ngắn** (15–45 giây) review sản phẩm **serum dưỡng** mới, tông **chân thực, không kịch bản quá dài**.

## Deliverable từ creator

1. Video đăng tải công khai (TikTok hoặc Instagram Reels) kèm hashtag bộ mẫu (gửi sau khi duyệt).
2. Gửi thêm **file gốc** (hoặc link drive) độ phân giải tối thiểu **1080p**.
3. Ảnh thumbnail / cover frame (nếu có).

## Brief nội dung

- **Hook 3 giây đầu** rõ ràng (vấn đề da / kỳ vọng).
- Nêu **cảm nhận sau 7 ngày** dùng thử (kết cấu, mùi, độ thấm) — trung thực; có thể nêu điểm chưa hợp.
- CTA mềm theo kịch bản nhãn hàng (sẽ gửi khi onboard).

## Pháp lý

- Tuân thủ quy định quảng cáo / gắn nhãn **#quangcao** hoặc **#ad** theo hướng dẫn pháp lý VN & nền tảng.
      `.trim(),
      requirements: `
## Điều kiện

- Tài khoản **≥ 5.000 followers** (hoặc **≥ 1.000** nếu engagement rate trung bình **> 5%** — ghi rõ số liệu screenshot Insights 28 ngày).
- Có **≥ 2 video review** mỹ phẩm trong 6 tháng gần nhất.

## Ứng tuyển gửi

- Link profile + **2 video mẫu**.
- Báo giá **mỗi video** nếu muốn nhận thêm slot (tuỳ chọn).
      `.trim(),
      reward: 650_000,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: TaskStatus.OPEN,
      isPublished: true,
      isFeatured: true,
      category: 'Social & UGC',
      skills: ['UGC', 'TikTok', 'Video ngắn', 'Beauty'],
      creatorId: business2.id,
      coverImageUrl: '/images/task-covers/task-cover-social.png',
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Localization: User manual phần mềm (EN → VI, ~5.500 từ)',
      slug: 'dich-tai-lieu-ky-thuat-anh-viet',
      description: `
## Phạm vi

Dịch **user manual** (web app quản lý dự án) từ tiếng Anh sang tiếng Việt, **~5.500 từ** source (đếm theo file Word).

## Chuẩn dịch

- Giữ **định dạng heading, số bước, bullet** tương ứng bản gốc.
- Thuật ngữ: ưu tiên **glossary** đính kèm (30+ thuật ngữ); nếu chưa có, đề xuất thuật ngữ và đánh dấu *đang chờ duyệt*.
- Giữ **placeholder** biến (\`{{userName}}\`, \`{0}\`) nguyên vẹn.

![Môi trường làm việc kỹ thuật](${cover.dev})

## Định dạng nộp

- **.docx** có Track Changes **tắt** ở bản chốt.
- Bảng thuật ngữ cập nhật cuối file (CSV hoặc sheet phụ).
      `.trim(),
      requirements: `
## Yêu cầu ứng viên

- **CAT tool** (MemoQ / Trados / Smartcat) — ghi rõ tool đang dùng.
- **Portfolio dịch kỹ thuật / SaaS** (≥ 2 mẫu).

## Thời gian

**5 ngày làm việc** sau khi nhận file nguồn đầy đủ.
      `.trim(),
      reward: 1_200_000,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: TaskStatus.IN_PROGRESS,
      isPublished: true,
      category: 'Localization',
      skills: ['English', 'Technical Translation', 'SaaS', 'CAT Tools'],
      creatorId: business2.id,
      assignees: {
        connect: [{ id: contributor1.id }],
      },
      coverImageUrl: '/images/task-covers/task-cover-content.png',
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Nhập liệu 120 SKU lên Shopify (Metafields + collection)',
      slug: 'nhap-lieu-san-pham-website',
      description: `
## Công việc

Nhập **120 SKU** từ file master Excel vào **Shopify Admin** (đã có tài khoản staff).

## Trường bắt buộc mỗi SKU

- Title, handle (slug), mô tả HTML ngắn (**80–120 từ**), giá, compare-at (nếu có), ảnh (đã host), tags, collection, **metafield** \`custom.material\` & \`custom.care\`.

## QA

- Checklist **zero lỗi** đường dẫn ảnh, giá, tồn kho dummy.
- Báo cáo cuối: file CSV export + log chỉnh sửa (Google Sheet).
      `.trim(),
      requirements: `
- Kinh nghiệm **Shopify** hoặc CMS tương đương.
- Cẩn thận, có checklist tự kiểm.
      `.trim(),
      reward: 520_000,
      status: TaskStatus.DRAFT,
      isPublished: false,
      category: 'Data & E-commerce',
      skills: ['Shopify', 'Data Entry', 'Excel', 'QA'],
      creatorId: business1.id,
      coverImageUrl: '/images/task-covers/task-cover-design.png',
    },
  });

  const task6 = await prisma.task.create({
    data: {
      title: 'UX Audit: Luồng đăng ký & KYC (báo cáo + wireframe low-fi)',
      slug: 'ux-audit-dang-ky-kyc-fintech',
      description: `
## Bối cảnh

FlowPay cần **rà soát UX** luồng onboarding (đăng ký → eKYC → nạp ví) trước khi mở rộng marketing.

![UX & wireframe](${cover.ux})

## Bạn sẽ giao

1. **Báo cáo 8–12 trang** (PDF): heuristic (Nielsen hoặc tương đương), friction map, đề xuất ưu tiên (Impact / Effort).
2. **Wireframe low-fi** (Figma): 6–10 màn chính, có annotation số thứ tự bước.
3. **Workshop 45 phút** (online) trình bày 3 insight quan trọng nhất.

## Giả định

- Chỉ làm việc trên **bản build staging** (tài khoản test được cấp).
- Không cần UI pixel-perfect; ưu tiên **rõ luồng & copy suggestion**.
      `.trim(),
      requirements: `
- **≥ 3 dự án** UX / Product trong fintech hoặc app có KYC.
- Portfolio Figma (link) + **một mẫu audit** (redacted được).
      `.trim(),
      reward: 2_400_000,
      deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      status: TaskStatus.OPEN,
      isPublished: true,
      isFeatured: true,
      category: 'UX Research',
      skills: ['UX Audit', 'Figma', 'User Flows', 'Fintech'],
      creatorId: business1.id,
      coverImageUrl: cover.ux,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      title: 'Backend: REST API đặt chỗ (NestJS + Prisma) + OpenAPI + test',
      slug: 'backend-api-dat-cho-nestjs-prisma',
      description: `
## Mục tiêu kỹ thuật

Xây **module đặt chỗ** (booking) cho MVP nội bộ: CRUD slot, giữ chỗ tạm (**TTL 10 phút**), xác nhận thanh toán mock.

## Stack (bắt buộc)

- **NestJS** + **Prisma** + PostgreSQL
- Swagger / **OpenAPI 3** sinh tự động
- **Jest**: unit + ít nhất **1** integration test (supertest)

![Dev workspace](${cover.dev})

## Endpoint tối thiểu

- \`POST /bookings/hold\`, \`POST /bookings/confirm\`, \`GET /bookings/me\`
- Middleware **idempotency-key** cho \`confirm\`

## Giao hàng

- Repo Git (branch \`feature/booking\`) + **README** chạy local.
- File \`.env.example\` đầy đủ.
      `.trim(),
      requirements: `
- Public GitHub/GitLab hoặc zip có **lịch sử commit** rõ ràng.
- CI optional nhưng cộng điểm nếu có GitHub Actions chạy test.
      `.trim(),
      reward: 3_200_000,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: TaskStatus.OPEN,
      isPublished: true,
      isFeatured: true,
      category: 'Engineering',
      skills: ['NestJS', 'Prisma', 'PostgreSQL', 'REST', 'Jest'],
      creatorId: business1.id,
      coverImageUrl: cover.dev,
    },
  });

  const task8 = await prisma.task.create({
    data: {
      title: 'Sản xuất video giới thiệu sản phẩm (60–90s, VO tiếng Việt)',
      slug: 'video-gioi-thieu-san-pham-60s',
      description: `
## Output

**01 video** 60–90 giây (16:9 & crop 9:16), giới thiệu **FlowPay** cho nhà bán hàng SME.

![Sản xuất video](${cover.video})

## Nội dung

- Script VO (tiếng Việt) **~140–180 từ**, tông chuyên nghiệp, dễ hiểu.
- Motion graphics nhẹ + footage stock (license rõ ràng) — tránh nhạc bản quyền chưa license.

## Bàn giao

- Master **ProRes / H.264** ≥ 1080p + file project (Premiere / AE / DaVinci).
- VO tách track WAV.
      `.trim(),
      requirements: `
- Showreel **≥ 3 TVC / explainer** B2B hoặc fintech.
- Báo timeline sản xuất & số vòng chỉnh sửa bao gồm trong thù lao.
      `.trim(),
      reward: 4_500_000,
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      status: TaskStatus.OPEN,
      isPublished: true,
      isFeatured: false,
      category: 'Video Production',
      skills: ['Premiere Pro', 'Motion', 'Scriptwriting', 'VO'],
      creatorId: business2.id,
      coverImageUrl: cover.video,
    },
  });

  console.log('✅ Created tasks (8 demo, có mô tả Markdown + ảnh)');

  // Create Submissions
  const submission1 = await prisma.submission.create({
    data: {
      content: `
Đã hoàn thành bài viết SEO về AI.

**Bài viết:** "Cách AI đang thay đổi doanh nghiệp Việt Nam năm 2024"

Bài viết đã được tối ưu với:
- Keyword chính xuất hiện 5 lần tự nhiên
- 4 heading H2
- 2 hình ảnh minh họa
- Độ dài: 1800 từ
- Đã kiểm tra plagiarism: 0%
      `.trim(),
      links: ['https://docs.google.com/document/d/example1'],
      taskId: task1.id,
      contributorId: contributor1.id,
      status: SubmissionStatus.APPROVED,
      reviewedAt: new Date(),
      feedback: 'Bài viết chất lượng tốt, đúng yêu cầu. Đã duyệt!',
    },
  });

  const submission2 = await prisma.submission.create({
    data: {
      content: `
Em gửi 3 concept logo như yêu cầu:

1. **Concept 1:** Hình tròn với chữ F cách điệu
2. **Concept 2:** Icon ví tiền + sóng số
3. **Concept 3:** Chữ F kết hợp biểu đồ tăng trưởng

Mỗi concept có 2 phiên bản: light mode và dark mode.
      `.trim(),
      links: [
        'https://www.figma.com/file/example-concept1',
        'https://www.figma.com/file/example-concept2',
      ],
      fileUrls: ['https://storage.vearn.vn/logos/concept1.zip'],
      taskId: task2.id,
      contributorId: contributor2.id,
      status: SubmissionStatus.PENDING,
    },
  });

  const submission3 = await prisma.submission.create({
    data: {
      content: `
Đã hoàn thành dịch 50% tài liệu (2500 từ đầu tiên).
File đính kèm bên dưới.
Sẽ gửi phần còn lại trong 2 ngày tới.
      `.trim(),
      links: ['https://docs.google.com/document/d/example-translation'],
      taskId: task4.id,
      contributorId: contributor1.id,
      status: SubmissionStatus.PENDING,
    },
  });
  console.log('✅ Created submissions');

  // Create Payment for approved submission
  const payment1 = await prisma.payment.create({
    data: {
      amount: 850_000,
      status: PaymentStatus.PAID,
      paidAt: new Date(),
      contributorId: contributor1.id,
      submissionId: submission1.id,
      note: 'Thanh toán qua chuyển khoản ngân hàng',
    },
  });
  console.log('✅ Created payments');

  console.log('');
  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📝 Test accounts:');
  console.log('   Admin:       admin@vearn.vn / admin123');
  console.log('   Business 1:  techcorp@vearn.vn / business123');
  console.log('   Business 2:  startup@vearn.vn / business123');
  console.log('   User 1:      nguyen.van.a@gmail.com / user123');
  console.log('   User 2:      tran.thi.b@gmail.com / user123');
  console.log('   User 3:      le.van.c@gmail.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
