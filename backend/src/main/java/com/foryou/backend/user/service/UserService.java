package com.foryou.backend.user.service;

import java.io.IOException;
import java.util.concurrent.ExecutionException;

public interface UserService {
    void sendOtp(String email) throws IOException;
    boolean verifyOtpAndSave(String email, String otp) throws ExecutionException, InterruptedException;
    void shareQr(String email, String qrLink, String senderName) throws IOException;
}
// interface only in this file
