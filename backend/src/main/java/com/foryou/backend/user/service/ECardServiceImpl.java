package com.foryou.backend.user.service;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import com.google.cloud.firestore.SetOptions;
import com.google.cloud.firestore.FieldValue;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.foryou.backend.util.MailRepository;

import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.HashMap;
import java.util.Map;
import java.net.URI;

@Service
public class ECardServiceImpl implements ECardService {
    private final String firestoreRootCollection;
    private final String firestoreRootDocument;

    public ECardServiceImpl(@Value("${FIRESTORE_ROOT_PATH:4U/develop}") String firestoreRootPath, MailRepository mailRepository) {
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

        // Delete the context doc: {root}/context/{ecardId}
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

        // Remove id from user's ecards map
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
