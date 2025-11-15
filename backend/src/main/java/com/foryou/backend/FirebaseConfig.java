package com.foryou.backend;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    private final String json;

    public FirebaseConfig(@Value("${FIREBASE_CREDENTIALS}") String json) {
        this.json = json;
    }

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        // Đọc ENV variable
        if (json == null || json.isEmpty()) {
            throw new IllegalStateException("Environment variable FIREBASE_CREDENTIALS not set!");
        }

        GoogleCredentials credentials = GoogleCredentials.fromStream(
                new ByteArrayInputStream(json.getBytes())
        );

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();

        // Chỉ khởi tạo nếu chưa có app nào
        if (FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.initializeApp(options);
        } else {
            return FirebaseApp.getInstance();
        }
    }
}
