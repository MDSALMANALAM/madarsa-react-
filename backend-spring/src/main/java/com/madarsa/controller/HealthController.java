package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/")
    public Map<String, Object> root() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "running");
        response.put("application", "Madarsa Imdadul Uloom API");
        response.put("version", "2.0.0");
        response.put("message", "Welcome to Madarsa API - Spring Boot Backend");
        return response;
    }

    @GetMapping("/api/health")
    public ApiResponse<Map<String, String>> health() {
        Map<String, String> data = new HashMap<>();
        data.put("status", "healthy");
        data.put("database", "connected");
        data.put("server", "running");
        return ApiResponse.success("API is healthy", data);
    }
}

