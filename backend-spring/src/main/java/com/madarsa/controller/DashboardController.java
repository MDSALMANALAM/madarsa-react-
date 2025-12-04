package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import com.madarsa.model.User;
import com.madarsa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final AdmissionRepository admissionRepository;
    private final DonationRepository donationRepository;
    private final FinanceRepository financeRepository;
    private final MaterialRepository materialRepository;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminDashboard() {
        Map<String, Object> stats = new HashMap<>();

        // User counts
        stats.put("totalStudents", userRepository.countByUserType("STUDENT"));
        stats.put("totalTeachers", teacherRepository.countByStatus("Active"));
        stats.put("totalParents", userRepository.countByUserType("PARENT"));

        // Pending approvals
        stats.put("pendingApprovals", userRepository.countByApprovalStatus("PENDING"));
        stats.put("pendingAdmissions", admissionRepository.countByStatus("pending"));

        // Courses
        stats.put("totalCourses", courseRepository.countByIsActive(true));

        // Finance
        var allFinance = financeRepository.findAll();
        double totalIncome = allFinance.stream()
            .filter(f -> "INCOME".equalsIgnoreCase(f.getType()))
            .mapToDouble(f -> f.getAmount() != null ? f.getAmount() : 0)
            .sum();
        double totalExpense = allFinance.stream()
            .filter(f -> "EXPENSE".equalsIgnoreCase(f.getType()))
            .mapToDouble(f -> f.getAmount() != null ? f.getAmount() : 0)
            .sum();
        stats.put("totalIncome", totalIncome);
        stats.put("totalExpense", totalExpense);
        stats.put("balance", totalIncome - totalExpense);

        // Donations
        var completedDonations = donationRepository.findByStatus("COMPLETED");
        double totalDonations = completedDonations.stream()
            .mapToDouble(d -> d.getAmount() != null ? d.getAmount() : 0)
            .sum();
        stats.put("totalDonations", totalDonations);

        // Library
        stats.put("totalMaterials", materialRepository.count());

        return ResponseEntity.ok(ApiResponse.success("Admin dashboard stats", stats));
    }

    @GetMapping("/student")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentDashboard(
            @AuthenticationPrincipal User user) {
        Map<String, Object> data = new HashMap<>();

        data.put("user", user);
        data.put("courses", courseRepository.findByIsActive(true));
        data.put("materials", materialRepository.findAll());

        return ResponseEntity.ok(ApiResponse.success("Student dashboard", data));
    }

    @GetMapping("/teacher")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTeacherDashboard(
            @AuthenticationPrincipal User user) {
        Map<String, Object> data = new HashMap<>();

        data.put("user", user);
        data.put("totalStudents", userRepository.countByUserType("STUDENT"));
        data.put("courses", courseRepository.findByIsActive(true));

        return ResponseEntity.ok(ApiResponse.success("Teacher dashboard", data));
    }

    @GetMapping("/parent")
    @PreAuthorize("hasAnyRole('ADMIN', 'PARENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getParentDashboard(
            @AuthenticationPrincipal User user) {
        Map<String, Object> data = new HashMap<>();

        data.put("user", user);
        // Parent can see their children's data - would need student-parent linking

        return ResponseEntity.ok(ApiResponse.success("Parent dashboard", data));
    }
}

