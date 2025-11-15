package com.foryou.backend.user.template;

public final class OtpTemplate {
    private static final String TEMPLATE = "<!doctype html>\n"
            + "<html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"></head>"
            + "<body style=\"font-family: Arial, Helvetica, sans-serif; background-color:#f8f9fa;padding:20px;\">"
            + "<div style=\"max-width:600px;margin:0 auto;background:#ffffff;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,.1);\">"
            + "<h2 style=\"color:#333;\">Verify your email</h2>"
            + "<p style=\"color:#666;\">Your verification code is:</p>"
            + "<div style=\"font-size:32px;letter-spacing:4px;font-weight:bold;color:#111;margin:20px 0;text-align:center;\">%OTP%</div>"
            + "<p style=\"color:#666;\">This code will expire in 5 minutes.</p>"
            + "</div></body></html>";

    public static String of(String otp) {
        return TEMPLATE.replace("%OTP%", otp);
    }
}
