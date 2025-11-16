package com.foryou.backend.media.controller;

import com.foryou.backend.media.dto.DeleteMediaRequestDto;
import com.foryou.backend.util.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/media")
public class MediaController {
    private final CloudinaryService cloudinaryService;

    @Autowired
    public MediaController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteMedia(@RequestBody DeleteMediaRequestDto req) {
        if (req == null || req.getUrls() == null || req.getUrls().isEmpty()) {
            return ResponseEntity.badRequest().body("urls required");
        }
        
        List<String> failedUrls = cloudinaryService.deleteAssets(req.getUrls());
        
        if (failedUrls.isEmpty()) {
            return ResponseEntity.ok("all_deleted");
        } else {
            return ResponseEntity.ok()
                .body(String.format("partial_delete: %d failed", failedUrls.size()));
        }
    }
}
