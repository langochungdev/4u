package com.foryou.backend.user.service;

import java.io.IOException;
import java.util.concurrent.ExecutionException;

public interface UserService {
    void sendOtp(String email) throws IOException;
    boolean verifyOtpAndSave(String email, String otp) throws ExecutionException, InterruptedException;
}
// interface only in this file
