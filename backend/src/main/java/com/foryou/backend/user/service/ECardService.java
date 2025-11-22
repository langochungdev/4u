package com.foryou.backend.user.service;

import java.util.List;
import java.util.concurrent.ExecutionException;

public interface ECardService {
    void addEcardToUser(String email, String resultUrl) throws ExecutionException, InterruptedException, java.io.IOException;
    void deleteMediaAssets(String email, List<String> mediaIds, List<String> resourceTypes) throws ExecutionException, InterruptedException, java.io.IOException;
}
