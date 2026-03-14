package com.teacherportal.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
	name = "assignment_progress",
	uniqueConstraints = @UniqueConstraint(
		name = "uk_assignment_progress_assignment_student",
		columnNames = { "assignment_id", "student_username" }
	)
)
public class AssignmentProgress {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "assignment_id", nullable = false)
	private Assignment assignment;

	@Column(name = "student_username", nullable = false)
	private String studentUsername;

	@Column(name = "minutes_read", nullable = false)
	private int minutesRead;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private AssignmentStatus status;

	protected AssignmentProgress() {
	}

	public AssignmentProgress(Assignment assignment, String studentUsername) {
		this.assignment = assignment;
		this.studentUsername = studentUsername;
		this.minutesRead = 0;
		this.status = AssignmentStatus.NOT_STARTED;
	}

	public Long getId() {
		return id;
	}

	public Assignment getAssignment() {
		return assignment;
	}

	public String getStudentUsername() {
		return studentUsername;
	}

	public int getMinutesRead() {
		return minutesRead;
	}

	public void setMinutesRead(int minutesRead) {
		this.minutesRead = Math.max(0, minutesRead);
	}

	public AssignmentStatus getStatus() {
		return status;
	}

	public void setStatus(AssignmentStatus status) {
		this.status = status == null ? AssignmentStatus.NOT_STARTED : status;
	}
}
