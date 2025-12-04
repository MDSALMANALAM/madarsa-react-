package com.madarsa.repository;

import com.madarsa.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    List<Teacher> findByStatus(String status);

    List<Teacher> findBySubject(String subject);

    long countByStatus(String status);
}

