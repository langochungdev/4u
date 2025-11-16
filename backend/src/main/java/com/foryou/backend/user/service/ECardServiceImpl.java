package com.foryou.backend.user.service;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.SetOptions;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.DocumentSnapshot;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.foryou.backend.util.MailRepository;
import com.foryou.backend.util.CloudinaryService;

import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import java.net.URI;

@Service
public class ECardServiceImpl implements ECardService {
    private final String firestoreRootCollection;
    private final String firestoreRootDocument;
    private final CloudinaryService cloudinaryService;

    public ECardServiceImpl(
        @Value("${FIRESTORE_ROOT_PATH:4U/develop}") String firestoreRootPath, 
        MailRepository mailRepository,
        CloudinaryService cloudinaryService
    ) {
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
        this.cloudinaryService = cloudinaryService;
    }

    private String extractIdFromResultUrl(String resultUrl) {
        if (resultUrl == null) return null;
        try {
            URI uri = new URI(resultUrl);
            String path = uri.getPath();
            if (path != null) {
                String[] parts = path.split("/");
                for (int i = 0; i < parts.length; i++) {
                    if ("result".equals(parts[i]) && i + 1 < parts.length) {
                        String id = parts[i + 1];
                        if (id != null && !id.isEmpty()) return id;
                    }
                }
                // fallback: last non-empty segment
                for (int i = parts.length - 1; i >= 0; i--) {
                    if (parts[i] != null && !parts[i].isEmpty()) return parts[i];
                }
            }
        } catch (Exception e) {
            // fallback to manual parse
            int idx = resultUrl.indexOf("/result/");
            if (idx >= 0) {
                String sub = resultUrl.substring(idx + 8);
                int q = sub.indexOf('?');
                if (q >= 0) sub = sub.substring(0, q);
                if (sub.endsWith("/")) sub = sub.substring(0, sub.length() - 1);
                if (!sub.isEmpty()) return sub;
            }
        }
        return null;
    }

    @Override
    public void addEcardToUser(String email, String resultUrl) throws ExecutionException, InterruptedException, IOException {
        if (email == null || email.trim().isEmpty() || resultUrl == null || resultUrl.trim().isEmpty()) {
            return;
        }

        String normalized = email.trim().toLowerCase();
        Firestore db = FirestoreClient.getFirestore();
        // Try to extract an ID from the resultUrl. Falls back to using a last path segment.
        String id = extractIdFromResultUrl(resultUrl);
        if (id == null || id.trim().isEmpty()) return;

        if (firestoreRootDocument != null && !firestoreRootDocument.isEmpty()) {
            var docRef = db.collection(firestoreRootCollection)
                    .document(firestoreRootDocument)
                    .collection("user")
                    .document(normalized);
            Map<String, Object> ecardsMap = new HashMap<>();
            ecardsMap.put(id, resultUrl);
            Map<String, Object> map = new HashMap<>();
            map.put("ecards", ecardsMap);
            docRef.set(map, SetOptions.merge()).get();
        } else {
            var docRef = db.collection(firestoreRootCollection).document(normalized);
            Map<String, Object> ecardsMap = new HashMap<>();
            ecardsMap.put(id, resultUrl);
            Map<String, Object> map = new HashMap<>();
            map.put("ecards", ecardsMap);
            docRef.set(map, SetOptions.merge()).get();
        }
    }

    @Override
    public void deleteEcardFromUser(String email, String ecardId) throws ExecutionException, InterruptedException, IOException {
        if (email == null || email.trim().isEmpty() || ecardId == null || ecardId.trim().isEmpty()) {
            return;
        }
        String normalized = email.trim().toLowerCase();
        Firestore db = FirestoreClient.getFirestore();

        List<String> allAssets = new ArrayList<>();
        
        try {
            DocumentSnapshot contextDoc;
            if (firestoreRootDocument != null && !firestoreRootDocument.isEmpty()) {
                contextDoc = db.collection(firestoreRootCollection)
                        .document(firestoreRootDocument)
                        .collection("context")
                        .document(ecardId)
                        .get()
                        .get();
            } else {
                contextDoc = db.collection(firestoreRootCollection)
                        .document(ecardId)
                        .get()
                        .get();
            }

            if (contextDoc.exists()) {
                List<?> images = (List<?>) contextDoc.get("images");
                List<?> audios = (List<?>) contextDoc.get("audios");
                List<?> videos = (List<?>) contextDoc.get("videos");

                if (images != null) {
                    images.forEach(img -> {
                        if (img instanceof String) allAssets.add((String) img);
                    });
                }
                if (audios != null) {
                    audios.forEach(audio -> {
                        if (audio instanceof String) allAssets.add((String) audio);
                    });
                }
                if (videos != null) {
                    videos.forEach(video -> {
                        if (video instanceof String) allAssets.add((String) video);
                    });
                }
            }
        } catch (Exception e) {
            // Log nếu cần
        }

        if (!allAssets.isEmpty()) {
            cloudinaryService.deleteAssets(allAssets);
        }

        if (firestoreRootDocument != null && !firestoreRootDocument.isEmpty()) {
            db.collection(firestoreRootCollection)
                    .document(firestoreRootDocument)
                    .collection("context")
                    .document(ecardId)
                    .delete()
                    .get();
        } else {
            db.collection(firestoreRootCollection)
                    .document(ecardId)
                    .delete()
                    .get();
        }

        if (firestoreRootDocument != null && !firestoreRootDocument.isEmpty()) {
            var userDocRef = db.collection(firestoreRootCollection)
                    .document(firestoreRootDocument)
                    .collection("user")
                    .document(normalized);
            Map<String, Object> map = new HashMap<>();
            map.put("ecards." + ecardId, FieldValue.delete());
            userDocRef.update(map).get();
        } else {
            var userDocRef = db.collection(firestoreRootCollection)
                    .document(normalized);
            Map<String, Object> map = new HashMap<>();
            map.put("ecards." + ecardId, FieldValue.delete());
            userDocRef.update(map).get();
        }
    }
}
