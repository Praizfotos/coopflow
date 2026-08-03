import { v4 as uuidv4 } from "uuid";
import { pool } from "../database/connection";
import logger from "../utils/logger";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.example.com",
  port: parseInt(process.env.EMAIL_PORT || "587", 10),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

export const sendEmail = async (to: string, subject: string, body: string) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@coopflow.io",
      to,
      subject,
      html: body,
    });
    logger.info("Email sent", { to, subject });
  } catch (error) {
    logger.error("Failed to send email", { to, error: (error as Error).message });
  }
};

export const sendSms = async (to: string, message: string) => {
  logger.info("SMS sent", { to, message });
};

export const sendDiscordNotification = async (webhookUrl: string, message: string) => {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  } catch (error) {
    logger.error("Failed to send Discord notification", { error: (error as Error).message });
  }
};

export const sendSlackNotification = async (webhookUrl: string, message: string) => {
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
  } catch (error) {
    logger.error("Failed to send Slack notification", { error: (error as Error).message });
  }
};

export const sendTelegramNotification = async (botToken: string, chatId: string, message: string) => {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
  } catch (error) {
    logger.error("Failed to send Telegram notification", { error: (error as Error).message });
  }
};

export const createNotification = async (data: {
  memberId: string;
  cooperativeId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) => {
  const id = uuidv4();
  await pool.query(
    "INSERT INTO notifications (id, member_id, cooperative_id, type, title, message, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [id, data.memberId, data.cooperativeId, data.type, data.title, data.message, JSON.stringify(data.metadata || {})]
  );
  return { id, ...data };
};

export const sendContributionReminder = async (memberId: string, cooperativeId: string, cycleId: string, amount: number, asset: string) => {
  const member = await pool.query("SELECT email, name FROM members WHERE id = $1", [memberId]);
  if (member.rows.length === 0) return;

  const email = member.rows[0].email;
  const name = member.rows[0].name;

  await sendEmail(
    email,
    "Contribution Reminder",
    `<p>Hello ${name},</p><p>This is a reminder to contribute ${amount} ${asset} for your cooperative savings cycle.</p><p>Thank you, CoopFlow Team</p>`
  );

  await createNotification({
    memberId,
    cooperativeId,
    type: "contribution_reminder",
    title: "Contribution Reminder",
    message: `Reminder to contribute ${amount} ${asset} for cycle ${cycleId}`,
  });
};

export const sendVotingReminder = async (memberId: string, cooperativeId: string, proposalId: string, title: string) => {
  const member = await pool.query("SELECT email, name FROM members WHERE id = $1", [memberId]);
  if (member.rows.length === 0) return;

  const email = member.rows[0].email;
  const name = member.rows[0].name;

  await sendEmail(
    email,
    "Voting Reminder",
    `<p>Hello ${name},</p><p>There is an active proposal: "${title}". Please cast your vote.</p><p>Thank you, CoopFlow Team</p>`
  );

  await createNotification({
    memberId,
    cooperativeId,
    type: "voting_reminder",
    title: "Voting Reminder",
    message: `Vote on proposal: ${title}`,
  });
};

export const sendLoanReminder = async (memberId: string, cooperativeId: string, loanId: string, amount: number, dueDate: string) => {
  const member = await pool.query("SELECT email, name FROM members WHERE id = $1", [memberId]);
  if (member.rows.length === 0) return;

  const email = member.rows[0].email;
  const name = member.rows[0].name;

  await sendEmail(
    email,
    "Loan Repayment Reminder",
    `<p>Hello ${name},</p><p>This is a reminder for your loan repayment of ${amount} due on ${dueDate}.</p><p>Thank you, CoopFlow Team</p>`
  );

  await createNotification({
    memberId,
    cooperativeId,
    type: "loan_reminder",
    title: "Loan Repayment Reminder",
    message: `Reminder for loan repayment of ${amount}`,
  });
};

export const sendMeetingReminder = async (memberId: string, cooperativeId: string, meetingTitle: string, meetingDate: string) => {
  const member = await pool.query("SELECT email, name FROM members WHERE id = $1", [memberId]);
  if (member.rows.length === 0) return;

  const email = member.rows[0].email;
  const name = member.rows[0].name;

  await sendEmail(
    email,
    "Meeting Reminder",
    `<p>Hello ${name},</p><p>This is a reminder for the meeting: "${meetingTitle}" scheduled for ${meetingDate}.</p><p>Thank you, CoopFlow Team</p>`
  );

  await createNotification({
    memberId,
    cooperativeId,
    type: "meeting_reminder",
    title: "Meeting Reminder",
    message: `Reminder for meeting: ${meetingTitle}`,
  });
};