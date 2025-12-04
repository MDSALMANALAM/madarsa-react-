package com.madarsa.repository;

import com.madarsa.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    List<Material> findByIsActive(boolean isActive);

    List<Material> findByCategory(String category);

    List<Material> findByClassLevel(String classLevel);

    List<Material> findByUploadedBy(String uploadedBy);

    long countByIsActive(boolean isActive);
}

