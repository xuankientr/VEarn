import { prisma } from '@/prisma';
import { NotificationType } from '@prisma/client';
import {
  sendApplicationApprovedEmail,
  sendApplicationRejectedEmail,
  sendSubmissionApprovedEmail,
  sendSubmissionRejectedEmail,
  sendPaymentReceivedEmail,
  sendNewApplicationEmail,
  sendNewSubmissionEmail,
} from './email';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    return await prisma.notification.create({
      data: params,
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

export async function notifyApplicationApproved(
  userId: string,
  taskTitle: string,
  taskId: string
) {
  // In-app notification
  await createNotification({
    userId,
    type: 'APPLICATION_APPROVED',
    title: 'Đơn ứng tuyển được duyệt',
    message: `Bạn đã được chọn làm task "${taskTitle}"`,
    link: `/tasks/${taskId}`,
  });

  // Email notification
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (user) {
    await sendApplicationApprovedEmail(user.email, user.name, taskTitle, taskId);
  }
}

export async function notifyApplicationRejected(
  userId: string,
  taskTitle: string,
  feedback?: string
) {
  await createNotification({
    userId,
    type: 'APPLICATION_REJECTED',
    title: 'Đơn ứng tuyển bị từ chối',
    message: feedback
      ? `Đơn ứng tuyển task "${taskTitle}" không được chấp nhận: ${feedback}`
      : `Đơn ứng tuyển task "${taskTitle}" không được chấp nhận`,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (user) {
    await sendApplicationRejectedEmail(user.email, user.name, taskTitle, feedback);
  }
}

export async function notifySubmissionApproved(
  userId: string,
  taskTitle: string,
  reward: number
) {
  await createNotification({
    userId,
    type: 'SUBMISSION_APPROVED',
    title: 'Submission được duyệt',
    message: `Task "${taskTitle}" đã hoàn thành. Bạn nhận được ${new Intl.NumberFormat('vi-VN').format(reward)}đ`,
    link: '/dashboard/earnings',
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (user) {
    await sendSubmissionApprovedEmail(user.email, user.name, taskTitle, reward);
  }
}

export async function notifySubmissionRejected(
  userId: string,
  taskTitle: string,
  taskId: string,
  feedback?: string
) {
  await createNotification({
    userId,
    type: 'SUBMISSION_REJECTED',
    title: 'Submission bị từ chối',
    message: feedback
      ? `Submission cho task "${taskTitle}" cần chỉnh sửa: ${feedback}`
      : `Submission cho task "${taskTitle}" cần chỉnh sửa. Vui lòng nộp lại.`,
    link: `/tasks/${taskId}`,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (user) {
    await sendSubmissionRejectedEmail(user.email, user.name, taskTitle, taskId, feedback);
  }
}

export async function notifyPaymentReceived(
  userId: string,
  amount: number,
  taskTitle: string
) {
  await createNotification({
    userId,
    type: 'PAYMENT_RECEIVED',
    title: 'Đã nhận thanh toán',
    message: `Bạn đã nhận ${new Intl.NumberFormat('vi-VN').format(amount)}đ cho task "${taskTitle}"`,
    link: '/dashboard/earnings',
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (user) {
    await sendPaymentReceivedEmail(user.email, user.name, amount, taskTitle);
  }
}

export async function notifyNewApplication(
  userId: string,
  taskTitle: string,
  taskId: string,
  applicantName: string
) {
  await createNotification({
    userId,
    type: 'NEW_APPLICATION',
    title: 'Có đơn ứng tuyển mới',
    message: `${applicantName} đã ứng tuyển task "${taskTitle}"`,
    link: `/dashboard/tasks/${taskId}/applications`,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (user) {
    await sendNewApplicationEmail(user.email, user.name, taskTitle, taskId, applicantName);
  }
}

export async function notifyNewSubmission(
  userId: string,
  taskTitle: string,
  taskId: string,
  contributorName: string
) {
  await createNotification({
    userId,
    type: 'NEW_SUBMISSION',
    title: 'Có bài nộp mới',
    message: `${contributorName} đã nộp bài cho task "${taskTitle}"`,
    link: `/dashboard/tasks/${taskId}/submissions`,
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (user) {
    await sendNewSubmissionEmail(user.email, user.name, taskTitle, taskId, contributorName);
  }
}

/**
 * Thông báo in-app khi có bình luận / trả lời: chủ task (nếu không phải chính họ)
 * và tác giả bình luận gốc khi có người trả lời.
 */
export async function notifyTaskCommentParticipants(
  params: Readonly<{
    taskSlug: string;
    taskTitle: string;
    taskCreatorId: string;
    authorId: string;
    authorName: string;
    parentId: string | null;
  }>
): Promise<void> {
  const recipients = new Set<string>();

  if (params.authorId !== params.taskCreatorId) {
    recipients.add(params.taskCreatorId);
  }

  if (params.parentId) {
    const parent = await prisma.taskComment.findUnique({
      where: { id: params.parentId },
      select: { userId: true },
    });
    if (parent && parent.userId !== params.authorId) {
      recipients.add(parent.userId);
    }
  }

  if (recipients.size === 0) {
    return;
  }

  const link = `/tasks/${params.taskSlug}`;
  const isReply = params.parentId != null;
  const title = isReply ? 'Có trả lời trong thảo luận task' : 'Có bình luận mới trên task';
  const message = isReply
    ? `${params.authorName} đã trả lời trong task "${params.taskTitle}"`
    : `${params.authorName} đã bình luận trên task "${params.taskTitle}"`;

  await Promise.all(
    Array.from(recipients).map((userId) =>
      createNotification({
        userId,
        type: 'NEW_TASK_COMMENT' as NotificationType,
        title,
        message,
        link,
      })
    )
  );
}
