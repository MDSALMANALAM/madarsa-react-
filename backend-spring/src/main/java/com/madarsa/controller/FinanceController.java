package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import com.madarsa.model.Finance;
import com.madarsa.model.User;
import com.madarsa.repository.FinanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class FinanceController {

    private final FinanceRepository financeRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Finance>>> getAllTransactions() {
        List<Finance> transactions = financeRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Transactions fetched", transactions));
    }

    @GetMapping("/income")
    public ResponseEntity<ApiResponse<List<Finance>>> getIncomeTransactions() {
        List<Finance> income = financeRepository.findByType("INCOME");
        return ResponseEntity.ok(ApiResponse.success("Income fetched", income));
    }

    @GetMapping("/expense")
    public ResponseEntity<ApiResponse<List<Finance>>> getExpenseTransactions() {
        List<Finance> expenses = financeRepository.findByType("EXPENSE");
        return ResponseEntity.ok(ApiResponse.success("Expenses fetched", expenses));
    }

    @PostMapping("/income")
    public ResponseEntity<ApiResponse<Finance>> addIncome(
            @RequestBody Finance finance,
            @AuthenticationPrincipal User user) {
        finance.setType("INCOME");
        finance.setCreatedBy(user != null ? String.valueOf(user.getId()) : null);
        finance.setCreatedAt(LocalDateTime.now());
        Finance saved = financeRepository.save(finance);
        return ResponseEntity.ok(ApiResponse.success("Income added", saved));
    }

    @PostMapping("/expense")
    public ResponseEntity<ApiResponse<Finance>> addExpense(
            @RequestBody Finance finance,
            @AuthenticationPrincipal User user) {
        finance.setType("EXPENSE");
        finance.setCreatedBy(user != null ? String.valueOf(user.getId()) : null);
        finance.setCreatedAt(LocalDateTime.now());
        Finance saved = financeRepository.save(finance);
        return ResponseEntity.ok(ApiResponse.success("Expense added", saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Finance>> updateTransaction(
            @PathVariable Long id,
            @RequestBody Finance finance) {
        return financeRepository.findById(id)
            .map(existing -> {
                existing.setCategory(finance.getCategory());
                existing.setAmount(finance.getAmount());
                existing.setDescription(finance.getDescription());
                existing.setDate(finance.getDate());
                Finance updated = financeRepository.save(existing);
                return ResponseEntity.ok(ApiResponse.success("Transaction updated", updated));
            })
            .orElse(ResponseEntity.ok(ApiResponse.error("Transaction not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTransaction(@PathVariable Long id) {
        if (financeRepository.existsById(id)) {
            financeRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Transaction deleted"));
        }
        return ResponseEntity.ok(ApiResponse.error("Transaction not found"));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFinanceSummary() {
        List<Finance> allTransactions = financeRepository.findAll();

        double totalIncome = allTransactions.stream()
            .filter(f -> "INCOME".equalsIgnoreCase(f.getType()))
            .mapToDouble(f -> f.getAmount() != null ? f.getAmount() : 0)
            .sum();

        double totalExpense = allTransactions.stream()
            .filter(f -> "EXPENSE".equalsIgnoreCase(f.getType()))
            .mapToDouble(f -> f.getAmount() != null ? f.getAmount() : 0)
            .sum();

        Map<String, Object> summary = Map.of(
            "totalIncome", totalIncome,
            "totalExpense", totalExpense,
            "balance", totalIncome - totalExpense,
            "transactionCount", allTransactions.size()
        );

        return ResponseEntity.ok(ApiResponse.success("Summary fetched", summary));
    }
}

