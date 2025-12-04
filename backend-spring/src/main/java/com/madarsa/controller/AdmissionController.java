package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import com.madarsa.model.Admission;
import com.madarsa.repository.AdmissionRepository;
import com.madarsa.service.WhatsAppService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admission")
@RequiredArgsConstructor
public class AdmissionController {

    private final AdmissionRepository admissionRepository;
    private final WhatsAppService whatsAppService;

    // Public - Submit admission form
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitAdmission(@RequestBody Admission admission) {
        // Generate admission number
        String admissionNo = "ADM" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        admission.setAdmissionNo(admissionNo);
        admission.setStatus("pending");
        admission.setCreatedAt(LocalDateTime.now());
        admission.setUpdatedAt(LocalDateTime.now());

        Admission saved = admissionRepository.save(admission);
        log.info("Admission submitted: {} - {}", admissionNo, saved.getFullName());

        // Send WhatsApp notification
        if (saved.getParentPhone() != null) {
            whatsAppService.sendAdmissionNotification(
                saved.getParentPhone(),
                saved.getFullName(),
                "PENDING - Application Received"
            );
        }

        // Build response with receipt URL
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Admission submitted successfully");
        response.put("admissionNo", admissionNo);
        response.put("receiptUrl", "/api/admission/receipt/" + saved.getId());
        response.put("data", saved);

        return ResponseEntity.ok(response);
    }

    // Public - Get admission receipt
    @GetMapping("/receipt/{id}")
    public ResponseEntity<Map<String, Object>> getAdmissionReceipt(@PathVariable Long id) {
        return admissionRepository.findById(id)
            .map(admission -> {
                Map<String, Object> receipt = new HashMap<>();
                receipt.put("success", true);
                receipt.put("admissionNo", admission.getAdmissionNo());
                receipt.put("studentName", admission.getFullName());
                receipt.put("fatherName", admission.getFatherName());
                receipt.put("motherName", admission.getMotherName());
                receipt.put("className", admission.getClassName());
                receipt.put("dateOfBirth", admission.getDateOfBirth());
                receipt.put("gender", admission.getGender());
                receipt.put("address", admission.getAddress());
                receipt.put("city", admission.getCity());
                receipt.put("state", admission.getState());
                receipt.put("pincode", admission.getPincode());
                receipt.put("parentPhone", admission.getParentPhone());
                receipt.put("parentEmail", admission.getParentEmail());
                receipt.put("status", admission.getStatus() != null ? admission.getStatus().toUpperCase() : "PENDING");
                receipt.put("submittedAt", admission.getCreatedAt());
                receipt.put("schoolName", "Madarsa Imdadul Uloom");
                receipt.put("schoolAddress", "123, Education Street, City");
                receipt.put("schoolPhone", "+91 9876543210");
                receipt.put("schoolEmail", "info@madarsaimdadululoom.com");
                return ResponseEntity.ok(receipt);
            })
            .orElse(ResponseEntity.ok(Map.of("success", false, "message", "Admission not found")));
    }

    // Public - Check admission status by admission number
    @GetMapping("/status/{admissionNo}")
    public ResponseEntity<Map<String, Object>> checkAdmissionStatus(@PathVariable String admissionNo) {
        return admissionRepository.findByAdmissionNo(admissionNo)
            .map(admission -> {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("admissionNo", admission.getAdmissionNo());
                response.put("studentName", admission.getFullName());
                response.put("className", admission.getClassName());
                response.put("status", admission.getStatus() != null ? admission.getStatus().toUpperCase() : "PENDING");
                response.put("submittedAt", admission.getCreatedAt());
                response.put("updatedAt", admission.getUpdatedAt());
                return ResponseEntity.ok(response);
            })
            .orElse(ResponseEntity.ok(Map.of("success", false, "message", "Admission not found")));
    }

    // Admin - Get all admissions
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Admission>>> getAllAdmissions() {
        List<Admission> admissions = admissionRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Admissions fetched", admissions));
    }

    // Admin - Get pending admissions
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Admission>>> getPendingAdmissions() {
        List<Admission> admissions = admissionRepository.findByStatus("pending");
        return ResponseEntity.ok(ApiResponse.success("Pending admissions fetched", admissions));
    }

    // Admin - Approve admission
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Admission>> approveAdmission(@PathVariable Long id) {
        return admissionRepository.findById(id)
            .map(admission -> {
                admission.setStatus("approved");
                admission.setUpdatedAt(LocalDateTime.now());
                Admission updated = admissionRepository.save(admission);

                // Send WhatsApp notification
                if (updated.getParentPhone() != null) {
                    whatsAppService.sendAdmissionNotification(
                        updated.getParentPhone(),
                        updated.getFullName(),
                        "APPROVED - Congratulations!"
                    );
                }

                return ResponseEntity.ok(ApiResponse.success("Admission approved", updated));
            })
            .orElse(ResponseEntity.ok(ApiResponse.error("Admission not found")));
    }

    // Admin - Reject admission
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Admission>> rejectAdmission(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return admissionRepository.findById(id)
            .map(admission -> {
                admission.setStatus("rejected");
                admission.setUpdatedAt(LocalDateTime.now());
                Admission updated = admissionRepository.save(admission);

                // Send WhatsApp notification
                if (updated.getParentPhone() != null) {
                    whatsAppService.sendAdmissionNotification(
                        updated.getParentPhone(),
                        updated.getFullName(),
                        "REJECTED - " + (reason != null ? reason : "Contact admin for details")
                    );
                }

                return ResponseEntity.ok(ApiResponse.success("Admission rejected", updated));
            })
            .orElse(ResponseEntity.ok(ApiResponse.error("Admission not found")));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Admission>> getAdmissionById(@PathVariable Long id) {
        return admissionRepository.findById(id)
            .map(admission -> ResponseEntity.ok(ApiResponse.success("Admission found", admission)))
            .orElse(ResponseEntity.ok(ApiResponse.error("Admission not found")));
    }
}

