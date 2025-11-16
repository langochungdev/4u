package com.foryou.backend.admin.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TelegramUpdateDto {
    
    @JsonProperty("update_id")
    private Long updateId;
    
    @JsonProperty("message")
    private Message message;
    
    public Long getUpdateId() {
        return updateId;
    }
    
    public void setUpdateId(Long updateId) {
        this.updateId = updateId;
    }
    
    public Message getMessage() {
        return message;
    }
    
    public void setMessage(Message message) {
        this.message = message;
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Message {
        
        @JsonProperty("message_id")
        private Long messageId;
        
        @JsonProperty("from")
        private User from;
        
        @JsonProperty("chat")
        private Chat chat;
        
        @JsonProperty("text")
        private String text;
        
        public Long getMessageId() {
            return messageId;
        }
        
        public void setMessageId(Long messageId) {
            this.messageId = messageId;
        }
        
        public User getFrom() {
            return from;
        }
        
        public void setFrom(User from) {
            this.from = from;
        }
        
        public Chat getChat() {
            return chat;
        }
        
        public void setChat(Chat chat) {
            this.chat = chat;
        }
        
        public String getText() {
            return text;
        }
        
        public void setText(String text) {
            this.text = text;
        }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class User {
        
        @JsonProperty("id")
        private Long id;
        
        @JsonProperty("first_name")
        private String firstName;
        
        @JsonProperty("username")
        private String username;
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getFirstName() {
            return firstName;
        }
        
        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }
        
        public String getUsername() {
            return username;
        }
        
        public void setUsername(String username) {
            this.username = username;
        }
    }
    
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Chat {
        
        @JsonProperty("id")
        private Long id;
        
        @JsonProperty("type")
        private String type;
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
    }
}
