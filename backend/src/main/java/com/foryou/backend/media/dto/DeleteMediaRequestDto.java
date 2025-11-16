package com.foryou.backend.media.dto;

import java.util.List;

public class DeleteMediaRequestDto {
    private List<String> urls;

    public List<String> getUrls() {
        return urls;
    }

    public void setUrls(List<String> urls) {
        this.urls = urls;
    }
}
