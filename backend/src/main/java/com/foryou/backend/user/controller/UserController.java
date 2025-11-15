package com.foryou.backend.user.controller;

import com.foryou.backend.user.dto.OtpRequestDto;
import com.foryou.backend.user.dto.OtpVerifyDto;
import com.foryou.backend.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.concurrent.ExecutionException;
import java.io.IOException;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequestDto req) {
        if (req == null || req.getEmail() == null || req.getEmail().isEmpty()) {
            return ResponseEntity.badRequest().body("email is required");
        }
        try {
            userService.sendOtp(req.getEmail());
            return ResponseEntity.ok("otp.sent");
        } catch (IOException e) {
            String msg = e.getMessage() == null ? "" : e.getMessage();
            if (msg.contains("Sender Identity") || msg.contains("does not match a verified Sender Identity") || msg.contains("from address does not match")) {
                String help = "sendgrid_unverified_from_address - verify 'mail.from' in application config or configure a verified Sender Identity in SendGrid: https://sendgrid.com/docs/for-developers/sending-email/sender-identity/";
                return ResponseEntity.status(502).body(help);
            }
            return ResponseEntity.status(502).body("failed to send email");
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody OtpVerifyDto req) {
        if (req == null || req.getEmail() == null || req.getEmail().isEmpty() || req.getOtp() == null) {
            return ResponseEntity.badRequest().body("email and otp required");
        }
        try {
            boolean ok = userService.verifyOtpAndSave(req.getEmail(), req.getOtp());
            if (ok) return ResponseEntity.ok("verified");
            return ResponseEntity.status(400).body("invalid_or_expired_otp");
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body("failed_to_save_user");
        }
    }
}
