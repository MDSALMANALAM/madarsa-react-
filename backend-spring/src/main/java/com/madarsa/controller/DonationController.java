package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import com.madarsa.model.Donation;
import com.madarsa.repository.DonationRepository;
import com.madarsa.service.RazorpayService;
import com.razorpay.RazorpayException;
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
@RequestMapping("/api/donation")
@RequiredArgsConstructor
public class DonationController {

    private final DonationRepository donationRepository;
    private final RazorpayService razorpayService;

    // Public - Create Razorpay Order
    @PostMapping("/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> request) {
        try {
            Double amount = Double.parseDouble(request.get("amount").toString());
            String donorName = (String) request.getOrDefault("donorName", "Anonymous");
            String donorEmail = (String) request.getOrDefault("donorEmail", "");
            String donorPhone = (String) request.getOrDefault("donorPhone", "");

            // Generate receipt number
            String receipt = "DON" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

            // Create Razorpay order
            Map<String, Object> orderData = razorpayService.createOrder(amount, "INR", receipt);

            // Save donation record with PENDING status
            Donation donation = new Donation();
            donation.setDonorName(donorName);
            donation.setDonorEmail(donorEmail);
            donation.setDonorPhone(donorPhone);
            donation.setAmount(amount);
            donation.setRazorpayOrderId((String) orderData.get("orderId"));
            donation.setStatus("PENDING");
            donation.setCreatedAt(LocalDateTime.now());
            donationRepository.save(donation);

            log.info("Razorpay order created for donation: {} - Amount: {}", receipt, amount);
            return ResponseEntity.ok(orderData);

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Failed to create payment order: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Order creation error: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error processing request");
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Public - Verify Payment
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Donation>> verifyPayment(@RequestBody Map<String, String> request) {
        String orderId = request.get("razorpay_order_id");
        String paymentId = request.get("razorpay_payment_id");
        String signature = request.get("razorpay_signature");

        log.info("Verifying payment - Order: {}, Payment: {}", orderId, paymentId);

        // Verify signature
        boolean isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);

        if (!isValid) {
            log.warn("Payment signature verification failed for order: {}", orderId);
            return ResponseEntity.ok(ApiResponse.error("Payment verification failed"));
        }

        // Update donation status
        return donationRepository.findByRazorpayOrderId(orderId)
            .map(donation -> {
                donation.setStatus("COMPLETED");
                donation.setRazorpayPaymentId(paymentId);
                donation.setRazorpaySignature(signature);
                donation.setTransactionId(paymentId);
                donation.setUpdatedAt(LocalDateTime.now());
                Donation updated = donationRepository.save(donation);
                log.info("Donation completed - Order: {}, Amount: {}", orderId, donation.getAmount());
                return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", updated));
            })
            .orElse(ResponseEntity.ok(ApiResponse.error("Donation not found")));
    }

    // Public - Submit donation (for non-Razorpay donations like bank transfer)
    @PostMapping("/public/submit")
    public ResponseEntity<ApiResponse<Donation>> submitDonation(@RequestBody Donation donation) {
        donation.setStatus("PENDING");
        donation.setCreatedAt(LocalDateTime.now());
        Donation saved = donationRepository.save(donation);
        return ResponseEntity.ok(ApiResponse.success("Donation submitted successfully", saved));
    }

    // Admin - Get all donations
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Donation>>> getAllDonations() {
        List<Donation> donations = donationRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Donations fetched", donations));
    }

    // Admin - Update donation status
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Donation>> updateDonationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return donationRepository.findById(id)
            .map(donation -> {
                String status = body.get("status");
                donation.setStatus(status.toUpperCase());
                if (body.containsKey("transactionId")) {
                    donation.setTransactionId(body.get("transactionId"));
                }
                Donation updated = donationRepository.save(donation);
                return ResponseEntity.ok(ApiResponse.success("Donation status updated", updated));
            })
            .orElse(ResponseEntity.ok(ApiResponse.error("Donation not found")));
    }

    // Get donation stats
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDonationStats() {
        long total = donationRepository.count();
        long completed = donationRepository.countByStatus("COMPLETED");
        long pending = donationRepository.countByStatus("PENDING");

        // Calculate total amount from completed donations
        List<Donation> completedDonations = donationRepository.findByStatus("COMPLETED");
        double totalAmount = completedDonations.stream()
            .mapToDouble(d -> d.getAmount() != null ? d.getAmount() : 0)
            .sum();

        Map<String, Object> stats = Map.of(
            "total", total,
            "completed", completed,
            "pending", pending,
            "totalAmount", totalAmount
        );

        return ResponseEntity.ok(ApiResponse.success("Stats fetched", stats));
    }
}

