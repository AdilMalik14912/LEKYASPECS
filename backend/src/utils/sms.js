/**
 * sms.js — SMS Gateway Integration (Fast2SMS bulk API)
 *
 * Uses Fast2SMS API Key from .env:
 *   FAST2SMS_API_KEY=your_fast2sms_api_key
 *
 * Route: otp
 * Numbers: target mobile number
 * variables_values: 6-digit OTP code
 */

async function sendOtpSms({ to, otp }) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    console.warn(`[SMS Mailer] FAST2SMS_API_KEY not configured — logged SMS OTP code for ${to}: ${otp}`);
    return null;
  }

  // Remove any non-digits from the phone number
  const cleanPhone = to.replace(/\D/g, '');

  // Fast2SMS supports 10-digit mobile numbers in India
  if (cleanPhone.length < 10) {
    console.warn(`[SMS Mailer] Invalid phone number length for Fast2SMS: ${cleanPhone}`);
    return null;
  }

  // Use only last 10 digits
  const formattedPhone = cleanPhone.slice(-10);

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q',
        message: `Your Lekya Specs verification code is: ${otp}`,
        numbers: formattedPhone
      })
    });

    const data = await response.json();
    if (data.return) {
      console.log(`[SMS Mailer] SMS OTP successfully sent via Fast2SMS to ${formattedPhone}. Message: ${data.message}`);
      return data;
    } else {
      console.error(`[SMS Mailer] Fast2SMS error response:`, data);
      return null;
    }
  } catch (err) {
    console.error(`[SMS Mailer] Failed to execute SMS API request to ${formattedPhone}:`, err);
    return null;
  }
}

module.exports = { sendOtpSms };
