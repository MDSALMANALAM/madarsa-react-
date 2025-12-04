package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import com.madarsa.model.Course;
import com.madarsa.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    
    private final CourseRepository courseRepository;
    
    // Public endpoint
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<Course>>> getActiveCourses() {
        List<Course> courses = courseRepository.findByIsActive(true);
        return ResponseEntity.ok(ApiResponse.success("Courses fetched", courses));
    }
    
    // Admin endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Course>>> getAllCourses() {
        List<Course> courses = courseRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("All courses fetched", courses));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Course>> getCourseById(@PathVariable Long id) {
        return courseRepository.findById(id)
            .map(course -> ResponseEntity.ok(ApiResponse.success("Course found", course)))
            .orElse(ResponseEntity.ok(ApiResponse.error("Course not found")));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Course>> createCourse(@RequestBody Course course) {
        Course saved = courseRepository.save(course);
        return ResponseEntity.ok(ApiResponse.success("Course created", saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Course>> updateCourse(@PathVariable Long id, @RequestBody Course course) {
        return courseRepository.findById(id)
            .map(existing -> {
                existing.setName(course.getName());
                existing.setDescription(course.getDescription());
                existing.setClassLevel(course.getClassLevel());
                existing.setCategory(course.getCategory());
                existing.setDuration(course.getDuration());
                existing.setFees(course.getFees());
                existing.setActive(course.isActive());
                existing.setUpdatedAt(LocalDateTime.now());
                Course updated = courseRepository.save(existing);
                return ResponseEntity.ok(ApiResponse.success("Course updated", updated));
            })
            .orElse(ResponseEntity.ok(ApiResponse.error("Course not found")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        if (courseRepository.existsById(id)) {
            courseRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Course deleted"));
        }
        return ResponseEntity.ok(ApiResponse.error("Course not found"));
    }
}

