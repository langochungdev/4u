package com.foryou.backend.util;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

@Service
public class MailService implements MailRepository {
    private static final Logger logger = LoggerFactory.getLogger(MailService.class);
    private final SendGrid sendGrid;
    private final String fromEmail;
    private final String replyToEmail;

    public MailService(@Value("${SENDGRID_API_KEY}") String apiKey,
                       @Value("${mail.from:langochungdev@gmail.com}") String fromEmail,
                       @Value("${mail.reply-to:}") String replyToEmail) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalStateException("SENDGRID_API_KEY not set!");
        }
        this.sendGrid = new SendGrid(apiKey);
        this.fromEmail = fromEmail;
        this.replyToEmail = replyToEmail;
    }

    @Override
    public void sendEmail(EmailRequest request) throws IOException {
        Email from = new Email(fromEmail);
        Email to = new Email(request.getTo());
        Content content = new Content(request.isHtml() ? "text/html" : "text/plain", request.getContent());
        Mail mail = new Mail(from, request.getSubject(), to, content);

        Personalization personalization = new Personalization();
        personalization.addTo(to);
        request.getCc().forEach(cc -> personalization.addCc(new Email(cc)));
        request.getBcc().forEach(bcc -> personalization.addBcc(new Email(bcc)));
        mail.addPersonalization(personalization);

        if (!replyToEmail.isEmpty()) {
            mail.setReplyTo(new Email(replyToEmail));
        }

        request.getAttachments().forEach(att -> {
            Attachments attachment = new Attachments();
            attachment.setFilename(att.getFilename());
            attachment.setContent(att.getContent());
            attachment.setType(att.getType());
            attachment.setDisposition(att.getDisposition());
            mail.addAttachments(attachment);
        });

        Request sendGridRequest = new Request();
        sendGridRequest.setMethod(Method.POST);
        sendGridRequest.setEndpoint("mail/send");
        sendGridRequest.setBody(mail.build());

        Response response = sendGrid.api(sendGridRequest);
        logger.info("SendGrid response status: {}, body: {}", response.getStatusCode(), response.getBody());

        if (response.getStatusCode() >= 400) {
            throw new IOException("Failed to send email: " + response.getBody());
        }
    }
}
