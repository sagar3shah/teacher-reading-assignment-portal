package com.teacherportal.backend.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teacherportal.backend.domain.AssignmentProgress;

public interface AssignmentProgressRepository extends JpaRepository<AssignmentProgress, Long> {
	Optional<AssignmentProgress> findByAssignment_IdAndStudentUsername(Long assignmentId, String studentUsername);
}
