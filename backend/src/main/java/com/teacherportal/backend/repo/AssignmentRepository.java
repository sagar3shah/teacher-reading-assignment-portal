package com.teacherportal.backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teacherportal.backend.domain.Assignment;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
}
