package com.teacherportal.backend.api;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.teacherportal.backend.domain.Assignment;
import com.teacherportal.backend.domain.AssignmentProgress;
import com.teacherportal.backend.domain.Book;
import com.teacherportal.backend.repo.AssignmentRepository;
import com.teacherportal.backend.repo.BookRepository;

@RestController
@RequestMapping("/api/assignments")
public class AssignmentController {

	private final AssignmentRepository assignmentRepository;
	private final BookRepository bookRepository;

	public AssignmentController(AssignmentRepository assignmentRepository, BookRepository bookRepository) {
		this.assignmentRepository = assignmentRepository;
		this.bookRepository = bookRepository;
	}

	@GetMapping
	@Transactional(readOnly = true)
	public List<AssignmentDto> listAssignments() {
		return assignmentRepository.findAllWithBookAndProgress().stream()
			.map(this::ensureProgress)
			.map(AssignmentDto::from)
			.sorted(Comparator
				.comparing(AssignmentDto::dueDate)
				.thenComparing(dto -> dto.book().title(), String.CASE_INSENSITIVE_ORDER)
			)
			.toList();
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	@Transactional
	public AssignmentDto createAssignment(@RequestBody CreateAssignmentRequest request, Authentication authentication) {
		if (request == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing request body");
		}
		if (request.bookId() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "bookId is required");
		}
		if (request.dueDate() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dueDate is required");
		}

		List<String> students = request.studentUsernames() == null ? List.of() : request.studentUsernames();
		List<String> cleaned = new ArrayList<>();
		for (String student : students) {
			if (student == null) continue;
			String trimmed = student.trim();
			if (!trimmed.isEmpty()) cleaned.add(trimmed);
		}
		cleaned = cleaned.stream().distinct().toList();
		if (cleaned.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one student is required");
		}

		Book book = bookRepository.findById(request.bookId())
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Book not found"));

		Assignment assignment = new Assignment(book, request.dueDate(), cleaned);
		if (authentication != null && authentication.getName() != null && !authentication.getName().isBlank()) {
			assignment.setAssignedBy(authentication.getName());
		}
		for (String studentUsername : cleaned) {
			assignment.getProgress().add(new AssignmentProgress(assignment, studentUsername));
		}
		Assignment saved = assignmentRepository.save(assignment);
		return AssignmentDto.from(saved);
	}

	private Assignment ensureProgress(Assignment assignment) {
		if (assignment.getStudentUsernames() == null || assignment.getStudentUsernames().isEmpty()) return assignment;
		Map<String, AssignmentProgress> byStudent = assignment.getProgress() == null
			? Map.of()
			: assignment.getProgress().stream()
				.filter(p -> p.getStudentUsername() != null)
				.collect(Collectors.toMap(AssignmentProgress::getStudentUsername, Function.identity(), (a, b) -> a));

		boolean missing = false;
		for (String student : assignment.getStudentUsernames()) {
			if (student == null || student.isBlank()) continue;
			if (!byStudent.containsKey(student)) {
				assignment.getProgress().add(new AssignmentProgress(assignment, student));
				missing = true;
			}
		}
		if (missing) {
			return assignmentRepository.save(assignment);
		}
		return assignment;
	}

	public record CreateAssignmentRequest(Long bookId, LocalDate dueDate, List<String> studentUsernames) {
	}

	public record BookSummaryDto(Long id, String title, String author, String isbn) {
		static BookSummaryDto from(Book book) {
			return new BookSummaryDto(book.getId(), book.getTitle(), book.getAuthor(), book.getIsbn());
		}
	}

	public record StudentProgressDto(String studentUsername, String status, int minutesRead) {
		static StudentProgressDto from(AssignmentProgress progress) {
			return new StudentProgressDto(
				progress.getStudentUsername(),
				progress.getStatus().name(),
				progress.getMinutesRead()
			);
		}
	}

	public record AssignmentDto(
		Long id,
		String assignedBy,
		BookSummaryDto book,
		LocalDate dueDate,
		List<String> studentUsernames,
		List<StudentProgressDto> studentProgress
	) {
		static AssignmentDto from(Assignment assignment) {
			String assignedBy = assignment.getAssignedBy() == null || assignment.getAssignedBy().isBlank()
				? "teacher"
				: assignment.getAssignedBy();
			return new AssignmentDto(
				assignment.getId(),
				assignedBy,
				BookSummaryDto.from(assignment.getBook()),
				assignment.getDueDate(),
				assignment.getStudentUsernames(),
				(assignment.getProgress() == null ? List.<AssignmentProgress>of() : assignment.getProgress()).stream()
					.map(StudentProgressDto::from)
					.sorted(Comparator.comparing(StudentProgressDto::studentUsername, String.CASE_INSENSITIVE_ORDER))
					.toList()
			);
		}
	}
}
