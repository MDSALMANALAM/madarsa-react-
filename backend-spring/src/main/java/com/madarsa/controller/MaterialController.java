package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import com.madarsa.model.Material;
import com.madarsa.model.User;
import com.madarsa.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/library")
@RequiredArgsConstructor
public class MaterialController {
    
    private final MaterialRepository materialRepository;
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Material>>> getAllMaterials() {
        List<Material> materials = materialRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Materials fetched", materials));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<Material>>> getMaterialsByCategory(@PathVariable String category) {
        List<Material> materials = materialRepository.findByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Materials fetched", materials));
    }
    
    @GetMapping("/class/{classLevel}")
    public ResponseEntity<ApiResponse<List<Material>>> getMaterialsByClass(@PathVariable String classLevel) {
        List<Material> materials = materialRepository.findByClassLevel(classLevel);
        return ResponseEntity.ok(ApiResponse.success("Materials fetched", materials));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Material>> uploadMaterial(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam(value = "classLevel", required = false) String classLevel,
            @RequestParam(value = "description", required = false) String description,
            @AuthenticationPrincipal User user) {
        
        try {
            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir, "library");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String filename = UUID.randomUUID().toString() + extension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);
            
            // Create material record
            Material material = new Material();
            material.setTitle(title);
            material.setCategory(category);
            material.setClassLevel(classLevel);
            material.setDescription(description);
            material.setFileName(originalFilename);
            material.setFilePath("/uploads/library/" + filename);
            material.setFileSize(file.getSize());
            material.setFileType(file.getContentType());
            material.setUploadedBy(user != null ? String.valueOf(user.getId()) : null);
            material.setCreatedAt(LocalDateTime.now());
            
            Material saved = materialRepository.save(material);
            return ResponseEntity.ok(ApiResponse.success("Material uploaded", saved));
            
        } catch (IOException e) {
            return ResponseEntity.ok(ApiResponse.error("Failed to upload file: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMaterial(@PathVariable Long id) {
        return materialRepository.findById(id)
            .map(material -> {
                // Delete file
                try {
                    Path filePath = Paths.get(uploadDir, material.getFilePath().replace("/uploads/", ""));
                    Files.deleteIfExists(filePath);
                } catch (IOException e) {
                    // Log error but continue
                }

                materialRepository.deleteById(id);
                return ResponseEntity.ok(ApiResponse.<Void>success("Material deleted"));
            })
            .orElse(ResponseEntity.ok(ApiResponse.error("Material not found")));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<ApiResponse<String>> getDownloadUrl(@PathVariable Long id) {
        return materialRepository.findById(id)
            .map(material -> {
                Integer currentDownloads = material.getDownloads() != null ? material.getDownloads() : 0;
                material.setDownloads(currentDownloads + 1);
                materialRepository.save(material);
                return ResponseEntity.ok(ApiResponse.success("Download URL", material.getFilePath()));
            })
            .orElse(ResponseEntity.ok(ApiResponse.error("Material not found")));
    }
}

