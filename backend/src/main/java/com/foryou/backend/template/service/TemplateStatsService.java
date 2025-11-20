package com.foryou.backend.template.service;

import java.util.Map;
import java.util.concurrent.ExecutionException;

public interface TemplateStatsService {
    /**
     * Get all template creation statistics
     * @return Map with template path as key and creation count as value
     */
    Map<String, Long> getAllTemplateStats() throws ExecutionException, InterruptedException;
    
    /**
     * Get formatted statistics message for Telegram bot
     * @return Formatted string with template statistics
     */
    String getFormattedStats() throws ExecutionException, InterruptedException;
}
