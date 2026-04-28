import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { prisma } from '@/prisma';
import { authOptions } from '@/lib/auth';

const systemTemplates = [
  {
    name: 'Thiết kế Logo',
    description: `Thiết kế logo cho thương hiệu/dự án.

**Yêu cầu:**
- Logo phải độc đáo và dễ nhớ
- Cung cấp file vector (AI/SVG) và PNG
- Bao gồm các biến thể màu sắc

**Deliverables:**
- File gốc (AI/EPS/SVG)
- PNG với nền trong suốt (nhiều kích thước)
- Mockup preview`,
    requirements: 'Có portfolio thiết kế logo\nThành thạo Adobe Illustrator hoặc Figma',
    reward: 2000000,
    maxAssignees: 1,
    category: 'Design',
    skills: ['Logo Design', 'Illustrator', 'Branding'],
  },
  {
    name: 'Viết Content Marketing',
    description: `Viết bài content marketing cho website/blog.

**Yêu cầu:**
- Bài viết chuẩn SEO
- Độ dài 1000-2000 từ
- Nghiên cứu keyword và competitor

**Deliverables:**
- Bài viết hoàn chỉnh (Google Docs/Word)
- Meta title và description
- Đề xuất hình ảnh minh họa`,
    requirements: 'Kinh nghiệm viết content marketing\nKiến thức SEO cơ bản',
    reward: 500000,
    maxAssignees: 1,
    category: 'Writing',
    skills: ['Content Writing', 'SEO', 'Marketing'],
  },
  {
    name: 'Dịch thuật văn bản',
    description: `Dịch thuật văn bản chuyên nghiệp.

**Yêu cầu:**
- Dịch chính xác, tự nhiên
- Đảm bảo ngữ nghĩa và ngữ cảnh
- Proofread kỹ lưỡng

**Deliverables:**
- File dịch hoàn chỉnh
- Báo cáo số từ đã dịch`,
    requirements: 'Thành thạo ngôn ngữ nguồn và đích\nKinh nghiệm dịch thuật',
    reward: 300000,
    maxAssignees: 1,
    category: 'Translation',
    skills: ['Translation', 'Proofreading', 'English'],
  },
  {
    name: 'Phát triển Website',
    description: `Phát triển website theo yêu cầu.

**Yêu cầu:**
- Responsive design
- Tối ưu tốc độ
- SEO-friendly

**Deliverables:**
- Source code
- Hướng dẫn deploy
- Documentation`,
    requirements: 'Kinh nghiệm frontend/fullstack\nPortfolio projects',
    reward: 5000000,
    maxAssignees: 1,
    category: 'Development',
    skills: ['React', 'Next.js', 'TypeScript', 'Web Development'],
  },
  {
    name: 'Chỉnh sửa Video',
    description: `Chỉnh sửa video chuyên nghiệp.

**Yêu cầu:**
- Cắt ghép mượt mà
- Thêm effects và transitions
- Color grading

**Deliverables:**
- Video final (MP4/MOV)
- Project file`,
    requirements: 'Thành thạo Premiere Pro/DaVinci Resolve\nPortfolio video editing',
    reward: 1500000,
    maxAssignees: 1,
    category: 'Video',
    skills: ['Video Editing', 'Premiere Pro', 'After Effects'],
  },
  {
    name: 'Social Media Management',
    description: `Quản lý và tạo content cho social media.

**Yêu cầu:**
- Lên kế hoạch content hàng tuần/tháng
- Thiết kế hình ảnh cho posts
- Viết caption hấp dẫn

**Deliverables:**
- Content calendar
- Graphic assets
- Performance report`,
    requirements: 'Kinh nghiệm quản lý social media\nKỹ năng thiết kế cơ bản',
    reward: 3000000,
    maxAssignees: 1,
    category: 'Marketing',
    skills: ['Social Media', 'Content Creation', 'Canva'],
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Chỉ Admin mới có thể seed templates' });
  }

  try {
    // Delete existing system templates
    await prisma.taskTemplate.deleteMany({
      where: { isSystem: true },
    });

    // Create new system templates
    const templates = await prisma.taskTemplate.createMany({
      data: systemTemplates.map((t) => ({
        ...t,
        isSystem: true,
      })),
    });

    return res.json({
      success: true,
      message: `Đã tạo ${templates.count} system templates`,
    });
  } catch (error) {
    console.error('Seed templates error:', error);
    return res.status(500).json({ error: 'Đã có lỗi xảy ra' });
  }
}
