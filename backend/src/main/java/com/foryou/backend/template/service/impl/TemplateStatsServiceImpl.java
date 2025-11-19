package com.foryou.backend.template.service.impl;

import com.foryou.backend.template.service.TemplateStatsService;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class TemplateStatsServiceImpl implements TemplateStatsService {
    
    @Value("${FIRESTORE_ROOT_PATH}")
    private String firestoreRootPath;
    
    @Override
    public Map<String, Long> getAllTemplateStats() throws ExecutionException, InterruptedException {
        Map<String, Long> stats = new HashMap<>();
        Firestore db = FirestoreClient.getFirestore();
        
        // Structure: 4U/develop/template/{topic} where each field is templateName: count
        String templatePath = "4U/develop/template";
        
        try {
            QuerySnapshot snapshot = db.collection(templatePath).get().get();
            
            for (QueryDocumentSnapshot topicDoc : snapshot.getDocuments()) {
                String topic = topicDoc.getId();
                Map<String, Object> data = topicDoc.getData();
                
                // Each field in the document is a template name with its count
                for (Map.Entry<String, Object> entry : data.entrySet()) {
                    String templateName = entry.getKey();
                    Object value = entry.getValue();
                    
                    if (value instanceof Long) {
                        Long count = (Long) value;
                        if (count > 0) {
                            String fullPath = topic + "/" + templateName;
                            stats.put(fullPath, count);
                        }
                    } else if (value instanceof Integer) {
                        Integer count = (Integer) value;
                        if (count > 0) {
                            String fullPath = topic + "/" + templateName;
                            stats.put(fullPath, count.longValue());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching template stats: " + e.getMessage());
            e.printStackTrace();
        }
        
        return stats;
    }
    
    @Override
    public String getFormattedStats() throws ExecutionException, InterruptedException {
        Map<String, Long> stats = getAllTemplateStats();
        
        if (stats.isEmpty()) {
            return "📊 *Thống kê Template*\n\nChưa có template nào được tạo.";
        }
        
        // Sort by creation count descending
        List<Map.Entry<String, Long>> sortedStats = stats.entrySet()
            .stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .collect(Collectors.toList());
        
        StringBuilder message = new StringBuilder("📊 *Thống kê Template*\n\n");
        message.append(String.format("Tổng số template: %d\n\n", sortedStats.size()));
        
        int rank = 1;
        long totalCreations = 0;
        
        for (Map.Entry<String, Long> entry : sortedStats) {
            String emoji = getRankEmoji(rank);
            message.append(String.format("%s *%d.* `%s`\n   └ Số lần tạo: *%d*\n\n", 
                emoji, rank, entry.getKey(), entry.getValue()));
            totalCreations += entry.getValue();
            rank++;
        }
        
        message.append(String.format("📈 Tổng số lượt tạo: *%d*", totalCreations));
        
        return message.toString();
    }
    
    private String getRankEmoji(int rank) {
        switch (rank) {
            case 1: return "🥇";
            case 2: return "🥈";
            case 3: return "🥉";
            default: return "▫️";
        }
    }
}
