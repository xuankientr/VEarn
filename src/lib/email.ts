/**
 * Gửi email qua Resend (REST). Production: đặt `RESEND_API_KEY` + `EMAIL_FROM` (domain đã xác minh).
 * @see https://resend.com/docs
 */

interface EmailOptions {
  readonly to: string;
  readonly subject: string;
  readonly html: string;
  readonly text?: string;
}

const sendViaResend = async (options: EmailOptions): Promise<boolean> => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return false;
  }
  const from =
    process.env.EMAIL_FROM?.trim() ||
    'VEarn <onboarding@resend.dev>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        ...(options.text ? { text: options.text } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('[Email] Resend HTTP', res.status, body);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Email] Resend request failed:', e);
    return false;
  }
};

/**
 * Gửi email. Có `RESEND_API_KEY` → gửi thật; dev không key → log và coi như thành công; production không key → false.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(options);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Email] RESEND_API_KEY chưa cấu hình — mô phỏng gửi:');
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(
      `  Preview: ${(options.text ?? options.html).slice(0, 120)}…`,
    );
    return true;
  }

  console.error(
    '[Email] Production thiếu RESEND_API_KEY — không gửi được:',
    options.to,
  );
  return false;
}

/**
 * Email đặt lại mật khẩu (link một lần, hết hạn theo DB).
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
): Promise<boolean> {
  const subject = 'Đặt lại mật khẩu VEarn';
  const html = `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Đặt lại mật khẩu</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Link dưới đây có hiệu lực trong 1 giờ.</p>
        <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 8px;">Đặt lại mật khẩu</a></p>
        <p style="color: #64748b; font-size: 13px;">Nếu không phải bạn, hãy bỏ qua email này.</p>
      </div>
    `;
  const text = `Đặt lại mật khẩu VEarn (hết hạn sau 1 giờ): ${resetUrl}`;
  return sendEmail({ to, subject, html, text });
}

// Email Templates
export const emailTemplates = {
  applicationApproved: (userName: string, taskTitle: string, taskUrl: string) => ({
    subject: `Đơn ứng tuyển được duyệt - ${taskTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Chúc mừng, ${userName}!</h2>
        <p>Đơn ứng tuyển của bạn cho task <strong>${taskTitle}</strong> đã được chấp nhận.</p>
        <p>Bạn có thể bắt đầu làm việc ngay bây giờ.</p>
        <a href="${taskUrl}" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Xem Task
        </a>
        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
          Chúc bạn làm việc hiệu quả!<br/>
          VEarn Team
        </p>
      </div>
    `,
    text: `Chúc mừng ${userName}! Đơn ứng tuyển của bạn cho task "${taskTitle}" đã được chấp nhận. Truy cập ${taskUrl} để bắt đầu làm việc.`,
  }),

  applicationRejected: (userName: string, taskTitle: string, feedback?: string) => ({
    subject: `Cập nhật đơn ứng tuyển - ${taskTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #64748b;">Xin chào ${userName},</h2>
        <p>Đơn ứng tuyển của bạn cho task <strong>${taskTitle}</strong> không được chấp nhận lần này.</p>
        ${feedback ? `<p style="background: #f1f5f9; padding: 12px; border-radius: 8px;"><strong>Phản hồi:</strong> ${feedback}</p>` : ''}
        <p>Đừng nản lòng! Hãy tiếp tục tìm kiếm các task phù hợp khác.</p>
        <a href="${process.env.NEXTAUTH_URL}/tasks" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Khám phá Tasks
        </a>
        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
          VEarn Team
        </p>
      </div>
    `,
    text: `Xin chào ${userName}, đơn ứng tuyển của bạn cho task "${taskTitle}" không được chấp nhận.${feedback ? ` Phản hồi: ${feedback}` : ''} Đừng nản lòng, hãy tiếp tục tìm kiếm các task khác!`,
  }),

  submissionApproved: (userName: string, taskTitle: string, reward: number) => ({
    subject: `Submission được duyệt - Nhận ${new Intl.NumberFormat('vi-VN').format(reward)}đ`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Tuyệt vời, ${userName}!</h2>
        <p>Submission của bạn cho task <strong>${taskTitle}</strong> đã được duyệt!</p>
        <p style="font-size: 24px; color: #14b8a6; font-weight: bold;">
          +${new Intl.NumberFormat('vi-VN').format(reward)} VND
        </p>
        <p>Số tiền sẽ được chuyển vào tài khoản của bạn theo quy trình thanh toán.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/earnings" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Xem Thu nhập
        </a>
        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
          Cảm ơn bạn đã đóng góp!<br/>
          VEarn Team
        </p>
      </div>
    `,
    text: `Tuyệt vời ${userName}! Submission cho task "${taskTitle}" đã được duyệt. Bạn nhận được ${new Intl.NumberFormat('vi-VN').format(reward)} VND.`,
  }),

  submissionRejected: (userName: string, taskTitle: string, taskUrl: string, feedback?: string) => ({
    subject: `Submission cần chỉnh sửa - ${taskTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Xin chào ${userName},</h2>
        <p>Submission của bạn cho task <strong>${taskTitle}</strong> cần được chỉnh sửa.</p>
        ${feedback ? `<p style="background: #fef3c7; padding: 12px; border-radius: 8px;"><strong>Phản hồi:</strong> ${feedback}</p>` : ''}
        <p>Vui lòng xem phản hồi và nộp lại bài.</p>
        <a href="${taskUrl}" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Nộp lại
        </a>
        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
          VEarn Team
        </p>
      </div>
    `,
    text: `Xin chào ${userName}, submission cho task "${taskTitle}" cần chỉnh sửa.${feedback ? ` Phản hồi: ${feedback}` : ''} Vui lòng nộp lại.`,
  }),

  paymentReceived: (userName: string, amount: number, taskTitle: string) => ({
    subject: `Đã nhận thanh toán - ${new Intl.NumberFormat('vi-VN').format(amount)}đ`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Thanh toán thành công!</h2>
        <p>Xin chào ${userName},</p>
        <p>Bạn đã nhận được thanh toán cho task <strong>${taskTitle}</strong>.</p>
        <p style="font-size: 24px; color: #14b8a6; font-weight: bold;">
          ${new Intl.NumberFormat('vi-VN').format(amount)} VND
        </p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard/earnings" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Xem lịch sử
        </a>
        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
          Cảm ơn bạn đã sử dụng VEarn!<br/>
          VEarn Team
        </p>
      </div>
    `,
    text: `Xin chào ${userName}, bạn đã nhận được ${new Intl.NumberFormat('vi-VN').format(amount)} VND cho task "${taskTitle}".`,
  }),

  newApplication: (userName: string, taskTitle: string, applicantName: string, applicationUrl: string) => ({
    subject: `Có đơn ứng tuyển mới - ${taskTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Đơn ứng tuyển mới!</h2>
        <p>Xin chào ${userName},</p>
        <p><strong>${applicantName}</strong> đã ứng tuyển task <strong>${taskTitle}</strong> của bạn.</p>
        <p>Hãy xem xét và duyệt đơn ngay.</p>
        <a href="${applicationUrl}" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Xem đơn ứng tuyển
        </a>
        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
          VEarn Team
        </p>
      </div>
    `,
    text: `Xin chào ${userName}, ${applicantName} đã ứng tuyển task "${taskTitle}". Xem đơn tại ${applicationUrl}`,
  }),

  newSubmission: (userName: string, taskTitle: string, contributorName: string, submissionUrl: string) => ({
    subject: `Có bài nộp mới - ${taskTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #14b8a6;">Bài nộp mới!</h2>
        <p>Xin chào ${userName},</p>
        <p><strong>${contributorName}</strong> đã nộp bài cho task <strong>${taskTitle}</strong>.</p>
        <p>Hãy review và duyệt bài ngay.</p>
        <a href="${submissionUrl}" style="display: inline-block; padding: 12px 24px; background: #14b8a6; color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Xem bài nộp
        </a>
        <p style="margin-top: 24px; color: #64748b; font-size: 14px;">
          VEarn Team
        </p>
      </div>
    `,
    text: `Xin chào ${userName}, ${contributorName} đã nộp bài cho task "${taskTitle}". Xem tại ${submissionUrl}`,
  }),
};

// Helper functions
export async function sendApplicationApprovedEmail(
  userEmail: string,
  userName: string,
  taskTitle: string,
  taskId: string
) {
  const taskUrl = `${process.env.NEXTAUTH_URL}/tasks/${taskId}`;
  const template = emailTemplates.applicationApproved(userName, taskTitle, taskUrl);
  return sendEmail({ to: userEmail, ...template });
}

export async function sendApplicationRejectedEmail(
  userEmail: string,
  userName: string,
  taskTitle: string,
  feedback?: string
) {
  const template = emailTemplates.applicationRejected(userName, taskTitle, feedback);
  return sendEmail({ to: userEmail, ...template });
}

export async function sendSubmissionApprovedEmail(
  userEmail: string,
  userName: string,
  taskTitle: string,
  reward: number
) {
  const template = emailTemplates.submissionApproved(userName, taskTitle, reward);
  return sendEmail({ to: userEmail, ...template });
}

export async function sendSubmissionRejectedEmail(
  userEmail: string,
  userName: string,
  taskTitle: string,
  taskId: string,
  feedback?: string
) {
  const taskUrl = `${process.env.NEXTAUTH_URL}/tasks/${taskId}`;
  const template = emailTemplates.submissionRejected(userName, taskTitle, taskUrl, feedback);
  return sendEmail({ to: userEmail, ...template });
}

export async function sendPaymentReceivedEmail(
  userEmail: string,
  userName: string,
  amount: number,
  taskTitle: string
) {
  const template = emailTemplates.paymentReceived(userName, amount, taskTitle);
  return sendEmail({ to: userEmail, ...template });
}

export async function sendNewApplicationEmail(
  userEmail: string,
  userName: string,
  taskTitle: string,
  taskId: string,
  applicantName: string
) {
  const applicationUrl = `${process.env.NEXTAUTH_URL}/dashboard/tasks/${taskId}/applications`;
  const template = emailTemplates.newApplication(userName, taskTitle, applicantName, applicationUrl);
  return sendEmail({ to: userEmail, ...template });
}

export async function sendNewSubmissionEmail(
  userEmail: string,
  userName: string,
  taskTitle: string,
  taskId: string,
  contributorName: string
) {
  const submissionUrl = `${process.env.NEXTAUTH_URL}/dashboard/tasks/${taskId}/submissions`;
  const template = emailTemplates.newSubmission(userName, taskTitle, contributorName, submissionUrl);
  return sendEmail({ to: userEmail, ...template });
}
