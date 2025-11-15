package com.foryou.backend.user.dto;

public class ECardAddRequestDto {
    private String email;
    private String ecardId;
    private String resultUrl;

    public ECardAddRequestDto() {}

    public ECardAddRequestDto(String email, String ecardId) {
        this.email = email;
        this.ecardId = ecardId;
    }

    public ECardAddRequestDto(String email, String ecardId, String resultUrl) {
        this.email = email;
        this.ecardId = ecardId;
        this.resultUrl = resultUrl;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getEcardId() { return ecardId; }
    public void setEcardId(String ecardId) { this.ecardId = ecardId; }
    public String getResultUrl() { return resultUrl; }
    public void setResultUrl(String resultUrl) { this.resultUrl = resultUrl; }
}
