package com.foryou.backend.util;

import com.cloudinary.Cloudinary;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String extractPublicId(String url) {
        if (url == null || url.trim().isEmpty()) return null;
        try {
            URI uri = new URI(url);
            String path = uri.getPath();
            if (path == null) return null;
            
            int uploadIdx = path.indexOf("/upload/");
            if (uploadIdx < 0) return null;
            
            String afterUpload = path.substring(uploadIdx + 8);
            int versionIdx = afterUpload.indexOf('/');
            if (versionIdx >= 0) {
                afterUpload = afterUpload.substring(versionIdx + 1);
            }
            
            int dotIdx = afterUpload.lastIndexOf('.');
            if (dotIdx >= 0) {
                afterUpload = afterUpload.substring(0, dotIdx);
            }
            
            return afterUpload;
        } catch (Exception e) {
            return null;
        }
    }

    public String detectResourceType(String url) {
        if (url == null) return "image";
        String lower = url.toLowerCase();
        if (lower.endsWith(".mp3") || lower.endsWith(".wav") || lower.endsWith(".m4a") || 
            lower.endsWith(".ogg") || lower.endsWith(".aac") || lower.endsWith(".flac")) {
            return "video";
        }
        if (lower.contains("/video/") || lower.endsWith(".mp4") || lower.endsWith(".mov") || 
            lower.endsWith(".avi") || lower.endsWith(".webm")) {
            return "video";
        }
        if (lower.contains("/raw/")) {
            return "raw";
        }
        return "image";
    }

    public boolean deleteAsset(String url) {
        String publicId = extractPublicId(url);
        if (publicId == null || publicId.isEmpty()) return false;
        
        String resourceType = detectResourceType(url);
        try {
            cloudinary.uploader().destroy(publicId, Map.of("resource_type", resourceType));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public List<String> deleteAssets(List<String> urls) {
        if (urls == null || urls.isEmpty()) return List.of();
        
        List<String> failed = new ArrayList<>();
        for (String url : urls) {
            if (!deleteAsset(url)) {
                failed.add(url);
            }
        }
        return failed;
    }

    public List<String> deleteAssetsByPublicIdsAndTypes(List<String> publicIds, List<String> resourceTypes) {
        if (publicIds == null || publicIds.isEmpty() || resourceTypes == null || resourceTypes.size() != publicIds.size()) return List.of();
        
        List<String> failed = new ArrayList<>();
        for (int i = 0; i < publicIds.size(); i++) {
            String publicId = publicIds.get(i);
            String resourceType = resourceTypes.get(i);
            if (!deleteAssetByPublicIdAndType(publicId, resourceType)) {
                failed.add(publicId);
            }
        }
        return failed;
    }

    public boolean deleteAssetByPublicIdAndType(String publicId, String resourceType) {
        if (publicId == null || publicId.trim().isEmpty() || resourceType == null || resourceType.trim().isEmpty()) return false;
        
        try {
            cloudinary.uploader().destroy(publicId, Map.of("resource_type", resourceType));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean deleteAssetByPublicId(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) return false;
        
        // Try image, then video, then raw
        try {
            cloudinary.uploader().destroy(publicId, Map.of("resource_type", "image"));
            return true;
        } catch (Exception e) {
            try {
                cloudinary.uploader().destroy(publicId, Map.of("resource_type", "video"));
                return true;
            } catch (Exception e2) {
                try {
                    cloudinary.uploader().destroy(publicId, Map.of("resource_type", "raw"));
                    return true;
                } catch (Exception e3) {
                    return false;
                }
            }
        }
    }
}
