package com.foryou.backend.admin.controller;

import com.foryou.backend.admin.dto.TelegramUpdateDto;
import com.foryou.backend.admin.service.AdminBotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/telegram")
public class TelegramController {
    
    private static final Logger log = LoggerFactory.getLogger(TelegramController.class);
    private final AdminBotService adminBotService;
    
    public TelegramController(AdminBotService adminBotService) {
        this.adminBotService = adminBotService;
    }
    
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody TelegramUpdateDto update) {
        try {
            log.info("Received webhook update: {}", update.getUpdateId());
            adminBotService.processWebhook(update);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Error handling webhook", e);
            return ResponseEntity.ok("OK");
        }
    }
}
