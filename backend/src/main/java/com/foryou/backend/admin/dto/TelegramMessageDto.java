package com.foryou.backend.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TelegramMessageDto {
    
    @JsonProperty("chat_id")
    private Long chatId;
    
    @JsonProperty("text")
    private String text;
    
    @JsonProperty("parse_mode")
    private String parseMode = "Markdown";
    
    public TelegramMessageDto() {}
    
    public TelegramMessageDto(Long chatId, String text) {
        this.chatId = chatId;
        this.text = text;
    }
    
    public Long getChatId() {
        return chatId;
    }
    
    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
    
    public String getParseMode() {
        return parseMode;
    }
    
    public void setParseMode(String parseMode) {
        this.parseMode = parseMode;
    }
}
