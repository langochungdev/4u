package com.foryou.backend.util;

import com.google.cloud.firestore.*;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class FirestoreService<T> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String create(String collectionName, T data) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        CollectionReference collection = db.collection(collectionName);
        Map<String, Object> map = objectMapper.convertValue(data, new TypeReference<Map<String, Object>>() {});
        var docRef = collection.add(map).get();
        return docRef.getId();
    }

    public T get(String collectionName, String docId, Class<T> clazz) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentSnapshot docSnap = db.collection(collectionName).document(docId).get().get();
        if (docSnap.exists()) {
            Map<String, Object> data = docSnap.getData();
            return objectMapper.convertValue(data, clazz);
        }
        return null;
    }

    public void update(String collectionName, String docId, T data) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        Map<String, Object> map = objectMapper.convertValue(data, new TypeReference<Map<String, Object>>() {});
        db.collection(collectionName).document(docId).set(map, SetOptions.merge()).get();
    }

    public void delete(String collectionName, String docId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        db.collection(collectionName).document(docId).delete().get();
    }

    public List<T> query(String collectionName, String field, Object value, Class<T> clazz) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        QuerySnapshot querySnap = db.collection(collectionName).whereEqualTo(field, value).get().get();
        return querySnap.getDocuments().stream()
                .map(doc -> objectMapper.convertValue(doc.getData(), clazz))
                .collect(Collectors.toList());
    }

    public T getSubDocument(String collection, String docId, String subCollection, String subDocId, Class<T> clazz)
            throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        DocumentSnapshot docSnap = db.collection(collection)
                .document(docId)
                .collection(subCollection)
                .document(subDocId)
                .get()
                .get();
        if (docSnap.exists()) {
            Map<String, Object> data = docSnap.getData();
            return objectMapper.convertValue(data, clazz);
        }
        return null;
    }
}
