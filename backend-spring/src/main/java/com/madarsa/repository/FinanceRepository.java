package com.madarsa.repository;

import com.madarsa.model.Finance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinanceRepository extends JpaRepository<Finance, Long> {

    List<Finance> findByType(String type);

    List<Finance> findByCategory(String category);

    List<Finance> findByDateBetween(LocalDate start, LocalDate end);

    List<Finance> findByTypeAndDateBetween(String type, LocalDate start, LocalDate end);
}

