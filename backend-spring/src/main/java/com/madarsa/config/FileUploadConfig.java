package com.madarsa.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
public class FileUploadConfig implements WebMvcConfigurer {
    
    @Value("${upload.path:./uploads}")
    private String uploadPath;
    
    @Value("${upload.admission-docs:./uploads/admission_docs}")
    private String admissionDocsPath;
    
    @Value("${upload.library:./uploads/library}")
    private String libraryPath;
    
    @Value("${upload.reports:./uploads/reports}")
    private String reportsPath;
    
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadPath));
            Files.createDirectories(Paths.get(admissionDocsPath));
            Files.createDirectories(Paths.get(libraryPath));
            Files.createDirectories(Paths.get(reportsPath));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directories", e);
        }
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:" + uploadPath + "/");
    }
}

