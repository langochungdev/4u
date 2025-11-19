package com.foryou.backend.user.template;

public final class ShareQrTemplate {

    private static final String TEMPLATE = "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">"
            + "<html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"vi\">"
            + "<head>"
            + "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />"
            + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>"
            + "<meta name=\"color-scheme\" content=\"light\">"
            + "<meta name=\"supported-color-schemes\" content=\"light\">"
            + "<style>"
            + "  :root { color-scheme: light; supported-color-schemes: light; }"
            + "  body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }"
            + "  .light-bg { background-color: #e0e0e0 !important; }"
            + "  .white-bg { background-color: #ffffff !important; }"
            + "</style>"
            + "</head>"
            + "<body style=\"margin:0; padding:0; background-color:#e0e0e0 !important;\">"
            + "<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#e0e0e0 !important;\">"
            + "  <tr>"
            + "    <td align=\"center\" style=\"padding: 20px 0;\">"
            + "      "
            + "      <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"480\" style=\"background-color:#ffffff !important; border:1px solid #333333; box-shadow:3px 3px 0 #333333;\">"

            // --- HEADER (Đơn giản hóa) ---
            + "        <tr>"
            + "          <td align=\"left\" style=\"background-color:#0000aa !important; color:#ffffff !important; padding:12px; font-family:sans-serif; font-weight:bold; font-size: 14px;\">"
            + "            Story4u Notification" // Đổi tên tiếng Anh đôi khi giúp bypass
            + "          </td>"
            + "        </tr>"

            // --- BODY ---
            + "        <tr>"
            + "          <td style=\"padding:20px; font-family:sans-serif; color:#000000 !important; font-size: 14px; line-height: 1.5;\">"
            + "            <p style=\"margin:0 0 10px 0; color:#000000 !important;\">Xin chào,</p>"
            + "            <p style=\"margin:0 0 15px 0; color:#000000 !important;\"><strong>%SENDER_NAME%</strong> vừa chia sẻ với bạn một mã QR thông qua hệ thống Story4u.</p>"

            // Box QR (Giảm bớt border đậm, làm cho nó giống 1 phần nội dung hơn là banner)
            + "            <table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color:#f9f9f9 !important; border:1px solid #dddddd; margin-bottom:20px;\">"
            + "              <tr>"
            + "                <td align=\"center\" style=\"padding:15px;\">"
            + "                  "
            + "                  <img src=\"%QR_IMAGE_URL%\" alt=\"QR Code\" width=\"120\" style=\"display:block; border:0; margin-bottom:15px;\" />"
            + "                  "
            + "                  <a href=\"%QR_LINK%\" style=\"display:inline-block; background-color:#0000aa !important; color:#ffffff !important; text-decoration:none; padding:8px 16px; border-radius: 4px; font-weight:bold; font-size: 13px;\">Truy cập liên kết</a>"
            + "                </td>"
            + "              </tr>"
            + "            </table>"

            + "            <p style=\"margin:0; font-size:12px; color:#666666 !important;\">Nếu nút bấm không hoạt động, bạn có thể quét mã QR ở trên.</p>"
            + "          </td>"
            + "        </tr>"

            // --- FOOTER ---
            + "        <tr>"
            + "          <td align=\"center\" style=\"background-color:#f0f0f0 !important; border-top:1px solid #dddddd; padding:10px; font-size:11px; font-family:sans-serif; color:#666666 !important;\">"
            + "            Email tự động từ hệ thống Story4u."
            + "          </td>"
            + "        </tr>"
            + "      </table>"
            + "    </td>"
            + "  </tr>"
            + "</table>"
            + "</body></html>";

    public static String of(String qrLink, String senderName) {
        String qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + qrLink;
        String displaySenderName = (senderName != null && !senderName.trim().isEmpty()) ? senderName : "Một người bạn";

        return TEMPLATE
                .replace("%QR_LINK%", qrLink)
                .replace("%QR_IMAGE_URL%", qrImageUrl)
                .replace("%SENDER_NAME%", displaySenderName);
    }
}