package com.madarsa.repository;

import com.madarsa.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    List<Donation> findByStatus(String status);

    List<Donation> findByDonorEmail(String donorEmail);

    long countByStatus(String status);

    Optional<Donation> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Donation> findByRazorpayPaymentId(String razorpayPaymentId);
}

