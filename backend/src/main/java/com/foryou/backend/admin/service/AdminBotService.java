package com.foryou.backend.admin.service;

import com.foryou.backend.admin.dto.TelegramUpdateDto;

public interface AdminBotService {
    void processWebhook(TelegramUpdateDto update);
}
