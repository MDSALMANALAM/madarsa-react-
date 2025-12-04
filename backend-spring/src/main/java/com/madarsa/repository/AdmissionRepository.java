package com.madarsa.repository;

import com.madarsa.model.Admission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdmissionRepository extends JpaRepository<Admission, Long> {

    Optional<Admission> findByAdmissionNo(String admissionNo);

    List<Admission> findByStatus(String status);

    List<Admission> findByClassName(String className);

    long countByStatus(String status);

    boolean existsByAdmissionNo(String admissionNo);
}

