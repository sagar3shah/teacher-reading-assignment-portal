package com.teacherportal.backend.domain;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "assignments")
public class Assignment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "book_id", nullable = false)
	private Book book;

	@Column(name = "due_date", nullable = false)
	private LocalDate dueDate;

	@Column(name = "assigned_by")
	private String assignedBy;

	@ElementCollection
	@CollectionTable(name = "assignment_students", joinColumns = @JoinColumn(name = "assignment_id"))
	@Column(name = "student_username", nullable = false)
	private List<String> studentUsernames = new ArrayList<>();

	@OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<AssignmentProgress> progress = new ArrayList<>();

	protected Assignment() {
	}

	public Assignment(Book book, LocalDate dueDate, List<String> studentUsernames) {
		this.book = book;
		this.dueDate = dueDate;
		if (studentUsernames != null) {
			this.studentUsernames = new ArrayList<>(studentUsernames);
		}
	}

	public Long getId() {
		return id;
	}

	public Book getBook() {
		return book;
	}

	public void setBook(Book book) {
		this.book = book;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}

	public void setDueDate(LocalDate dueDate) {
		this.dueDate = dueDate;
	}

	public String getAssignedBy() {
		return assignedBy;
	}

	public void setAssignedBy(String assignedBy) {
		this.assignedBy = assignedBy;
	}

	public List<String> getStudentUsernames() {
		return studentUsernames;
	}

	public void setStudentUsernames(List<String> studentUsernames) {
		this.studentUsernames = studentUsernames == null ? new ArrayList<>() : new ArrayList<>(studentUsernames);
	}

	public List<AssignmentProgress> getProgress() {
		return progress;
	}

	public void setProgress(List<AssignmentProgress> progress) {
		this.progress = progress == null ? new ArrayList<>() : progress;
	}
}
