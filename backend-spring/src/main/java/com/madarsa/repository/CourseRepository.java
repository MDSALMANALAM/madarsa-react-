package com.madarsa.repository;

import com.madarsa.model.Course;
import com.madarsa.model.Course.CourseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByIsActive(boolean isActive);

    List<Course> findByCategory(CourseCategory category);

    List<Course> findByClassLevel(String classLevel);

    long countByIsActive(boolean isActive);
}

