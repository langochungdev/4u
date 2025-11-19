package com.foryou.backend.user.dto;

public class ShareQrRequestDto {
    private String email;
    private String qrLink;
    private String senderName;

    public ShareQrRequestDto() {}

    public ShareQrRequestDto(String email, String qrLink) {
        this.email = email;
        this.qrLink = qrLink;
    }

    public ShareQrRequestDto(String email, String qrLink, String senderName) {
        this.email = email;
        this.qrLink = qrLink;
        this.senderName = senderName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getQrLink() {
        return qrLink;
    }

    public void setQrLink(String qrLink) {
        this.qrLink = qrLink;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }
}
