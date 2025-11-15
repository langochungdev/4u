package com.foryou.backend.user.controller;

import com.foryou.backend.user.dto.ECardAddRequestDto;
import com.foryou.backend.user.service.ECardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/user/ecard")
public class ECardController {
    private final ECardService eCardService;

    @Autowired
    public ECardController(ECardService eCardService) {
        this.eCardService = eCardService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> addEcard(@RequestBody ECardAddRequestDto req) {
        if (req == null || req.getEmail() == null || req.getEmail().isEmpty() || req.getResultUrl() == null || req.getResultUrl().isEmpty()) {
            return ResponseEntity.badRequest().body("email and resultUrl required");
        }
        try {
            eCardService.addEcardToUser(req.getEmail(), req.getResultUrl());
            return ResponseEntity.ok("ok");
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.status(500).body("failed_to_save_ecard");
        } catch (java.io.IOException e) {
            return ResponseEntity.status(502).body("failed_to_send_confirmation_email");
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteEcard(@RequestBody ECardAddRequestDto req) {
        if (req == null || req.getEmail() == null || req.getEmail().isEmpty() || req.getEcardId() == null || req.getEcardId().isEmpty()) {
            return ResponseEntity.badRequest().body("email and ecardId required");
        }
        try {
            eCardService.deleteEcardFromUser(req.getEmail(), req.getEcardId());
            return ResponseEntity.ok("ok");
        } catch (ExecutionException e) {
            return ResponseEntity.status(500).body("failed_to_delete_ecard");
        } catch (java.io.IOException e) {
            return ResponseEntity.status(502).body("failed_to_send_notification_email");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.status(500).body("failed_to_delete_ecard");
        }
    }
}
