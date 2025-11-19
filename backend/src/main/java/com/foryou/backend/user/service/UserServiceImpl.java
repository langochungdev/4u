package com.foryou.backend.user.service;

import com.foryou.backend.util.MailRepository;
import com.foryou.backend.util.EmailRequest;
import com.foryou.backend.user.template.OtpTemplate;
import com.foryou.backend.user.template.ShareQrTemplate;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.Firestore;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.time.Instant;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.HashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class UserServiceImpl implements UserService {
    private final MailRepository mailRepository;
    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    private final Duration otpTtl;

    private final String firestoreRootCollection;
    private final String firestoreRootDocument;

    public UserServiceImpl(MailRepository mailRepository,
                       @Value("${FIRESTORE_ROOT_PATH:4U/develop}") String firestoreRootPath,
                       @Value("${otp.ttl.minutes:5}") long otpTtlMinutes) {
        this.mailRepository = mailRepository;
        this.otpTtl = Duration.ofMinutes(otpTtlMinutes);
        String[] parts = firestoreRootPath == null ? new String[0] : firestoreRootPath.split("/");
        if (parts.length >= 2) {
            this.firestoreRootCollection = parts[0];
            this.firestoreRootDocument = parts[1];
        } else if (parts.length == 1) {
            this.firestoreRootCollection = parts[0];
            this.firestoreRootDocument = null;
        } else {
            this.firestoreRootCollection = "4U";
            this.firestoreRootDocument = "develop";
        }
    }

    @Override
    public void sendOtp(String email) throws IOException {
        String normalized = normalizeEmail(email);
        String otp = generateOtp();
        store.put(normalized, new OtpEntry(otp, Instant.now()));

        String html = OtpTemplate.of(otp);
        EmailRequest req = EmailRequest.builder()
                .to(email)
                .subject("Your 4-digit verification code")
                .content(html)
                .isHtml(true)
                .build();

        mailRepository.sendEmail(req);
    }

    @Override
    public boolean verifyOtpAndSave(String email, String otp) throws ExecutionException, InterruptedException {
        String normalized = normalizeEmail(email);
        OtpEntry entry = store.get(normalized);
        if (entry == null) return false;
        if (!entry.getOtp().equals(otp)) return false;
        if (isExpired(entry)) {
            store.remove(normalized);
            return false;
        }

        // Persist to Firestore using root path from config
        Firestore db = FirestoreClient.getFirestore();
        Map<String, Object> data = new HashMap<>();
        data.put("createAt", Instant.now().toString());

        if (firestoreRootDocument != null && !firestoreRootDocument.isEmpty()) {
            var docRef = db.collection(firestoreRootCollection)
                    .document(firestoreRootDocument)
                    .collection("user")
                    .document(normalized);
            var snap = docRef.get().get();
            if (!snap.exists()) {
                docRef.set(data).get();
            }
        } else {
            var docRef = db.collection(firestoreRootCollection)
                    .document(normalized);
            var snap = docRef.get().get();
            if (!snap.exists()) {
                docRef.set(data).get();
            }
        }

        store.remove(normalized);
        return true;
    }

    private boolean isExpired(OtpEntry entry) {
        return Instant.now().isAfter(entry.getCreatedAt().plus(otpTtl));
    }

    private String generateOtp() {
        int val = ThreadLocalRandom.current().nextInt(0, 10000);
        return String.format("%04d", val);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    @Override
    public void shareQr(String email, String qrLink, String senderName) throws IOException {
        String html = ShareQrTemplate.of(qrLink, senderName);
        String subj = senderName != null && !senderName.isEmpty() ?
            String.format("%s shared a story link from Story4u.online", senderName) :
            "Your friend shared a story link from Story4u.online";

        EmailRequest req = EmailRequest.builder()
            .to(email)
            .subject(subj)
                .content(html)
                .isHtml(true)
                .build();

        mailRepository.sendEmail(req);
    }

    private static class OtpEntry {
        private final String otp;
        private final Instant createdAt;

        public OtpEntry(String otp, Instant createdAt) {
            this.otp = otp;
            this.createdAt = createdAt;
        }

        public String getOtp() { return otp; }
        public Instant getCreatedAt() { return createdAt; }
    }
}
