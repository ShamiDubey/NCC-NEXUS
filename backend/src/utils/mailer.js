const { Resend } = require("resend");

// Constructing Resend with no key throws, which previously crashed the whole
// server at import time on any machine/environment without RESEND_API_KEY
// set. Mail is optional infra (credential emails degrade gracefully
// elsewhere) — it must never take the backend down just because it's
// unconfigured locally.
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("[mailer] RESEND_API_KEY not set — email sending is disabled.");
}

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 */
const sendMail = async ({ to, subject, html }) => {
  if (!resend) {
    console.warn("[mailer] sendMail skipped — RESEND_API_KEY not configured.");
    return null;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: "NCC Nexus <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend email error:", error);
      return null;
    }

    console.log("Message sent:", data?.id);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};

module.exports = { sendMail };