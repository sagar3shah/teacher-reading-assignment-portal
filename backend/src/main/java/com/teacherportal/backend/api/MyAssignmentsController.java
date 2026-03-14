package com.teacherportal.backend.api;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.teacherportal.backend.domain.Assignment;
import com.teacherportal.backend.domain.AssignmentProgress;
import com.teacherportal.backend.domain.AssignmentStatus;
import com.teacherportal.backend.domain.Book;
import com.teacherportal.backend.repo.AssignmentRepository;

@RestController
@RequestMapping("/api/my/assignments")
public class MyAssignmentsController {

	private final AssignmentRepository assignmentRepository;

	public MyAssignmentsController(AssignmentRepository assignmentRepository) {
		this.assignmentRepository = assignmentRepository;
	}

	@GetMapping
	@Transactional(readOnly = true)
	public List<MyAssignmentDto> listMyAssignments(Authentication authentication) {
		String username = requireUsername(authentication);

		return assignmentRepository.findForStudentWithBookAndProgress(username).stream()
			.map(assignment -> {
				ensureProgress(assignment, username);
				return assignment;
			})
			.map(assignment -> MyAssignmentDto.from(assignment, username))
			.sorted(Comparator
				.comparing(MyAssignmentDto::dueDate)
				.thenComparing(dto -> dto.book().title(), String.CASE_INSENSITIVE_ORDER)
			)
			.toList();
	}

	@PatchMapping("/{assignmentId}")
	@ResponseStatus(HttpStatus.OK)
	@Transactional
	public MyAssignmentDto updateMyProgress(
		@PathVariable Long assignmentId,
		@RequestBody UpdateProgressRequest request,
		Authentication authentication
	) {
		String username = requireUsername(authentication);
		if (assignmentId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing assignment id");
		}
		if (request == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing request body");
		}

		Assignment assignment = assignmentRepository.findOneForStudentWithBookAndProgress(assignmentId, username)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));

		AssignmentProgress progress = ensureProgress(assignment, username);

		if (request.minutesRead() != null) {
			if (request.minutesRead() < 0) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minutesRead must be >= 0");
			}
			progress.setMinutesRead(request.minutesRead());
		}

		if (request.status() != null) {
			AssignmentStatus status;
			try {
				status = AssignmentStatus.valueOf(request.status());
			} catch (IllegalArgumentException ex) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
			}
			progress.setStatus(status);
		}

		Assignment saved = assignmentRepository.save(assignment);
		return MyAssignmentDto.from(saved, username);
	}

	private static String requireUsername(Authentication authentication) {
		if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
		}
		return authentication.getName();
	}

	private AssignmentProgress ensureProgress(Assignment assignment, String username) {
		if (assignment.getProgress() != null) {
			for (AssignmentProgress existing : assignment.getProgress()) {
				if (username.equals(existing.getStudentUsername())) {
					return existing;
				}
			}
		}

		AssignmentProgress created = new AssignmentProgress(assignment, username);
		assignment.getProgress().add(created);
		return created;
	}

	public record UpdateProgressRequest(String status, Integer minutesRead) {
	}

	public record BookSummaryDto(Long id, String title, String author, String isbn) {
		static BookSummaryDto from(Book book) {
			return new BookSummaryDto(book.getId(), book.getTitle(), book.getAuthor(), book.getIsbn());
		}
	}

	public record MyAssignmentDto(
		Long id,
		String assignedBy,
		BookSummaryDto book,
		LocalDate dueDate,
		String status,
		int minutesRead
	) {
		static MyAssignmentDto from(Assignment assignment, String username) {
			AssignmentProgress match = null;
			if (assignment.getProgress() != null) {
				for (AssignmentProgress progress : assignment.getProgress()) {
					if (username.equals(progress.getStudentUsername())) {
						match = progress;
						break;
					}
				}
			}
			if (match == null) {
				match = new AssignmentProgress(assignment, username);
				assignment.getProgress().add(match);
			}

			String assignedBy = assignment.getAssignedBy() == null || assignment.getAssignedBy().isBlank()
				? "teacher"
				: assignment.getAssignedBy();
			return new MyAssignmentDto(
				assignment.getId(),
				assignedBy,
				BookSummaryDto.from(assignment.getBook()),
				assignment.getDueDate(),
				match.getStatus().name(),
				match.getMinutesRead()
			);
		}
	}
}
