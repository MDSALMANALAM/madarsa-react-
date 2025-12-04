package com.madarsa.controller;

import com.madarsa.dto.ApiResponse;
import com.madarsa.model.Teacher;
import com.madarsa.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {
    
    private final TeacherRepository teacherRepository;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<List<Teacher>>> getAllTeachers() {
        List<Teacher> teachers = teacherRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Teachers fetched", teachers));
    }
    
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Teacher>>> getActiveTeachers() {
        List<Teacher> teachers = teacherRepository.findByStatus("Active");
        return ResponseEntity.ok(ApiResponse.success("Active teachers fetched", teachers));
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Teacher>> getTeacherById(@PathVariable Long id) {
        return teacherRepository.findById(id)
            .map(teacher -> ResponseEntity.ok(ApiResponse.success("Teacher found", teacher)))
            .orElse(ResponseEntity.ok(ApiResponse.error("Teacher not found")));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Teacher>> createTeacher(@RequestBody Teacher teacher) {
        Teacher saved = teacherRepository.save(teacher);
        return ResponseEntity.ok(ApiResponse.success("Teacher created", saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Teacher>> updateTeacher(@PathVariable Long id, @RequestBody Teacher teacher) {
        return teacherRepository.findById(id)
            .map(existing -> {
                existing.setName(teacher.getName());
                existing.setSubject(teacher.getSubject());
                existing.setClasses(teacher.getClasses());
                existing.setContact(teacher.getContact());
                existing.setStatus(teacher.getStatus());
                Teacher updated = teacherRepository.save(existing);
                return ResponseEntity.ok(ApiResponse.success("Teacher updated", updated));
            })
            .orElse(ResponseEntity.ok(ApiResponse.error("Teacher not found")));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTeacher(@PathVariable Long id) {
        if (teacherRepository.existsById(id)) {
            teacherRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Teacher deleted"));
        }
        return ResponseEntity.ok(ApiResponse.error("Teacher not found"));
    }
    
    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getTeacherCount() {
        long count = teacherRepository.countByStatus("Active");
        return ResponseEntity.ok(ApiResponse.success("Count fetched", count));
    }
}

