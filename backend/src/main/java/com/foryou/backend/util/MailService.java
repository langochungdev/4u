package com.foryou.backend.util;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;

@Service
public class MailService implements MailRepository {
    private static final Logger logger = LoggerFactory.getLogger(MailService.class);
    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String replyToEmail;

    public MailService(JavaMailSender mailSender,
                       @Value("${mail.from:langochungdev@gmail.com}") String fromEmail,
                       @Value("${mail.reply-to:}") String replyToEmail) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.replyToEmail = replyToEmail;
    }

    @Override
    public void sendEmail(EmailRequest request) throws IOException {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());
            helper.setText(request.getContent(), request.isHtml());

            if (!replyToEmail.isEmpty()) {
                helper.setReplyTo(replyToEmail);
            }

            if (!request.getCc().isEmpty()) {
                helper.setCc(request.getCc().toArray(new String[0]));
            }

            if (!request.getBcc().isEmpty()) {
                helper.setBcc(request.getBcc().toArray(new String[0]));
            }

            mailSender.send(message);
            logger.info("Email sent successfully to: {}", request.getTo());

        } catch (MessagingException e) {
            logger.error("Failed to send email to {}: {}", request.getTo(), e.getMessage());
            throw new IOException("Failed to send email: " + e.getMessage(), e);
        }
    }
}
