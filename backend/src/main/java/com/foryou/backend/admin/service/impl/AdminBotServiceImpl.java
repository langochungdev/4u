package com.foryou.backend.admin.service.impl;

import com.foryou.backend.admin.config.AdminBotConfig;
import com.foryou.backend.admin.dto.TelegramMessageDto;
import com.foryou.backend.admin.dto.TelegramUpdateDto;
import com.foryou.backend.admin.service.AdminBotService;
import com.foryou.backend.util.CloudinaryService;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.FieldValue;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.firebase.cloud.FirestoreClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class AdminBotServiceImpl implements AdminBotService {
    
    private static final Logger log = LoggerFactory.getLogger(AdminBotServiceImpl.class);
    private final AdminBotConfig config;
    private final RestTemplate restTemplate;
    private final CloudinaryService cloudinaryService;
    
    public AdminBotServiceImpl(AdminBotConfig config, CloudinaryService cloudinaryService) {
        this.config = config;
        this.cloudinaryService = cloudinaryService;
        this.restTemplate = new RestTemplate();
    }
    
    @Override
    public void processWebhook(TelegramUpdateDto update) {
        if (update.getMessage() == null || update.getMessage().getText() == null) {
            return;
        }
        
        String command = update.getMessage().getText().trim();
        Long chatId = update.getMessage().getChat().getId();
        
        if (!config.isSupportedCommand(command)) {
            sendMessage(chatId, "❌ Command không hợp lệ. Các command hỗ trợ: /thongke, /cleanexpired");
            return;
        }
        
        try {
            switch (command) {
                case "/thongke":
                    handleStatisticsCommand(chatId);
                    break;
                case "/cleanexpired":
                    handleCleanExpiredCommand(chatId);
                    break;
                default:
                    sendMessage(chatId, "❌ Command chưa được implement.");
            }
        } catch (Exception e) {
            log.error("Error processing command: {}", command, e);
            sendMessage(chatId, "❌ Đã xảy ra lỗi khi xử lý command.");
        }
    }
    
    private void handleStatisticsCommand(Long chatId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        
        int userCount = db.collection(config.getUserCollectionPath()).get().get().size();
        int contextCount = db.collection(config.getContextCollectionPath()).get().get().size();
        
        String message = String.format(
            "📊 *Thống kê hệ thống*\n\n" +
            "👥 Số lượng users: *%d*\n" +
            "📝 Số lượng contexts: *%d*\n\n" +
            "🔍 Collection paths:\n" +
            "• Users: `%s`\n" +
            "• Contexts: `%s`",
            userCount,
            contextCount,
            config.getUserCollectionPath(),
            config.getContextCollectionPath()
        );
        
        sendMessage(chatId, message);
    }
    
    private void handleCleanExpiredCommand(Long chatId) {
        sendMessage(chatId, "🧹 *Bắt đầu dọn dẹp contexts hết hạn...*");
        
        new Thread(() -> {
            try {
                Firestore db = FirestoreClient.getFirestore();
                Timestamp now = Timestamp.now();
                
                var querySnapshot = db.collection(config.getContextCollectionPath())
                    .whereLessThan("expiresAt", now)
                    .get()
                    .get();
                
                List<QueryDocumentSnapshot> expiredDocs = querySnapshot.getDocuments();
                
                if (expiredDocs.isEmpty()) {
                    sendMessage(chatId, "✅ Không có context nào hết hạn!");
                    return;
                }
                
                int totalDocs = expiredDocs.size();
                int deletedDocs = 0;
                int deletedMedia = 0;
                int failedMedia = 0;
                int deletedEcards = 0;
                int batchSize = 10;
                
                List<String> deletedContextIds = new ArrayList<>();
                
                sendMessage(chatId, String.format("📋 Tìm thấy *%d* contexts hết hạn. Đang xử lý...", totalDocs));
                
                for (int i = 0; i < expiredDocs.size(); i += batchSize) {
                    int end = Math.min(i + batchSize, expiredDocs.size());
                    List<QueryDocumentSnapshot> batch = expiredDocs.subList(i, end);
                    
                    for (QueryDocumentSnapshot doc : batch) {
                        try {
                            String contextId = doc.getId();
                            Map<String, Object> data = doc.getData();
                            List<String> allMediaUrls = new ArrayList<>();
                            
                            Object imagesObj = data.get("images");
                            if (imagesObj instanceof List) {
                                for (Object item : (List<?>) imagesObj) {
                                    if (item instanceof String) {
                                        allMediaUrls.add((String) item);
                                    }
                                }
                            }
                            
                            Object videosObj = data.get("videos");
                            if (videosObj instanceof List) {
                                for (Object item : (List<?>) videosObj) {
                                    if (item instanceof String) {
                                        allMediaUrls.add((String) item);
                                    }
                                }
                            }
                            
                            Object audiosObj = data.get("audios");
                            if (audiosObj instanceof List) {
                                for (Object item : (List<?>) audiosObj) {
                                    if (item instanceof String) {
                                        allMediaUrls.add((String) item);
                                    }
                                }
                            }
                            
                            if (!allMediaUrls.isEmpty()) {
                                List<String> failed = cloudinaryService.deleteAssets(allMediaUrls);
                                deletedMedia += (allMediaUrls.size() - failed.size());
                                failedMedia += failed.size();
                            }
                            
                            doc.getReference().delete().get();
                            deletedDocs++;
                            deletedContextIds.add(contextId);
                            
                        } catch (Exception e) {
                            log.error("Error deleting expired context: {}", doc.getId(), e);
                        }
                    }
                    
                    if (i + batchSize < expiredDocs.size()) {
                        sendMessage(chatId, String.format("⏳ Đã xử lý: %d/%d contexts...", end, totalDocs));
                        Thread.sleep(2000);
                    }
                }
                
                sendMessage(chatId, "🔄 Đang dọn dẹp ecards trong user profiles...");
                deletedEcards = cleanEcardsFromUsers(db, deletedContextIds);
                
                String summary = String.format(
                    "✅ *Hoàn thành dọn dẹp!*\n\n" +
                    "📊 Kết quả:\n" +
                    "• Đã xóa: *%d* contexts\n" +
                    "• Media đã xóa: *%d*\n" +
                    "• Media thất bại: *%d*\n" +
                    "• Ecards đã dọn: *%d*",
                    deletedDocs,
                    deletedMedia,
                    failedMedia,
                    deletedEcards
                );
                
                sendMessage(chatId, summary);
                
            } catch (Exception e) {
                log.error("Error in cleanExpiredCommand", e);
                sendMessage(chatId, "❌ Lỗi khi dọn dẹp: " + e.getMessage());
            }
        }).start();
    }
    
    private int cleanEcardsFromUsers(Firestore db, List<String> contextIds) {
        if (contextIds.isEmpty()) {
            log.warn("No contextIds to clean from users");
            return 0;
        }
        
        log.info("Starting to clean {} context IDs from user ecards", contextIds.size());
        log.debug("Context IDs to clean: {}", contextIds);
        
        int cleanedCount = 0;
        try {
            String userPath = config.getUserCollectionPath();
            log.info("Querying users from path: {}", userPath);
            
            var usersSnapshot = db.collection(userPath).get().get();
            int totalUsers = usersSnapshot.getDocuments().size();
            log.info("Found {} users to check", totalUsers);
            
            for (QueryDocumentSnapshot userDoc : usersSnapshot.getDocuments()) {
                try {
                    String userId = userDoc.getId();
                    Map<String, Object> userData = userDoc.getData();
                    Object ecardsObj = userData.get("ecards");
                    
                    log.debug("Checking user: {} - has ecards: {}", userId, (ecardsObj != null));
                    
                    if (ecardsObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> ecards = (Map<String, Object>) ecardsObj;
                        
                        log.debug("User {} has {} ecards: {}", userId, ecards.size(), ecards.keySet());
                        
                        Map<String, Object> fieldsToDelete = new HashMap<>();
                        for (String contextId : contextIds) {
                            if (ecards.containsKey(contextId)) {
                                fieldsToDelete.put("ecards." + contextId, FieldValue.delete());
                                cleanedCount++;
                                log.info("Marking ecard {} for deletion from user {}", contextId, userId);
                            }
                        }
                        
                        if (!fieldsToDelete.isEmpty()) {
                            log.info("Deleting {} ecards from user: {}", fieldsToDelete.size(), userId);
                            userDoc.getReference().update(fieldsToDelete).get();
                            log.info("Successfully cleaned {} ecards from user: {}", fieldsToDelete.size(), userId);
                        } else {
                            log.debug("No matching ecards found for user: {}", userId);
                        }
                    } else {
                        log.debug("User {} has no ecards map", userId);
                    }
                } catch (Exception e) {
                    log.error("Error cleaning ecards from user: {}", userDoc.getId(), e);
                }
            }
            
            log.info("Finished cleaning ecards. Total cleaned: {}", cleanedCount);
        } catch (Exception e) {
            log.error("Error cleaning ecards from users", e);
        }
        
        return cleanedCount;
    }
    
    private void sendMessage(Long chatId, String text) {
        try {
            String url = config.getTelegramApiUrl() + "/sendMessage";
            TelegramMessageDto message = new TelegramMessageDto(chatId, text);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<TelegramMessageDto> request = new HttpEntity<>(message, headers);
            restTemplate.postForEntity(url, request, String.class);
            
            log.info("Message sent to chatId: {}", chatId);
        } catch (Exception e) {
            log.error("Failed to send message to chatId: {}", chatId, e);
        }
    }
}
