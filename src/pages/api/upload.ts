import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const ALLOWED_TYPES: Record<string, string[]> = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
};

const ALL_ALLOWED_TYPES = [
  ...ALLOWED_TYPES.images,
  ...ALLOWED_TYPES.documents,
  ...ALLOWED_TYPES.archives,
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  try {
    const { file, filename, type } = req.body;

    if (!file || !filename) {
      return res.status(400).json({ error: 'Thiếu file hoặc filename' });
    }

    if (type && !ALL_ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({
        error: 'File không được hỗ trợ. Chấp nhận: ảnh, PDF, Word, Excel, PowerPoint, ZIP',
      });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const ext = path.extname(filename) || getExtFromType(type);
    const uniqueName = `${session.user.id}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    const base64Data = file.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File vượt quá 10MB' });
    }

    await writeFile(filePath, buffer);

    const url = `/uploads/${uniqueName}`;

    return res.status(200).json({
      success: true,
      url,
      filename: uniqueName,
      type: type || 'application/octet-stream',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Lỗi khi upload file' });
  }
}

function getExtFromType(type?: string): string {
  if (!type) return '';
  
  const extMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
  };
  
  return extMap[type] || '';
}
