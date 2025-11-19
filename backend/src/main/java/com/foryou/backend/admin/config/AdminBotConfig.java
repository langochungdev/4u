package com.foryou.backend.admin.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import java.util.Map;
import java.util.HashMap;

@Configuration
public class AdminBotConfig {
    
    @Value("${BOT_TOKEN}")
    private String botToken;
    
    @Value("${FIRESTORE_ROOT_PATH}")
    private String firestoreRootPath;
    
    private static final Map<String, String> COMMAND_DESCRIPTIONS = new HashMap<>();
    
    static {
        COMMAND_DESCRIPTIONS.put("/thongke", "Thống kê số lượng users và contexts trong hệ thống");
        COMMAND_DESCRIPTIONS.put("/cleanexpired", "Xóa tất cả contexts và media đã hết hạn");
        COMMAND_DESCRIPTIONS.put("/created", "Hiển thị thống kê số lần tạo của các templates");
    }
    
    public String getBotToken() {
        return botToken;
    }
    
    public String getTelegramApiUrl() {
        return "https://api.telegram.org/bot" + botToken;
    }
    
    public String getUserCollectionPath() {
        return firestoreRootPath + "/user";
    }
    
    public String getContextCollectionPath() {
        return firestoreRootPath + "/context";
    }
    
    public String getCommandDescription(String command) {
        return COMMAND_DESCRIPTIONS.getOrDefault(command, "Unknown command");
    }
    
    public boolean isSupportedCommand(String command) {
        return COMMAND_DESCRIPTIONS.containsKey(command);
    }
}
