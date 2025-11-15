package com.foryou.backend.user.service;

import java.util.concurrent.ExecutionException;

public interface ECardService {
    void addEcardToUser(String email, String resultUrl) throws ExecutionException, InterruptedException, java.io.IOException;
    void deleteEcardFromUser(String email, String ecardId) throws ExecutionException, InterruptedException, java.io.IOException;
}
