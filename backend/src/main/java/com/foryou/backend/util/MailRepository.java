package com.foryou.backend.util;

import java.io.IOException;

public interface MailRepository {
    void sendEmail(EmailRequest request) throws IOException;
}