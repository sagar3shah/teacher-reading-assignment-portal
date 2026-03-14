package com.teacherportal.backend.api;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.teacherportal.backend.domain.Book;
import com.teacherportal.backend.repo.BookRepository;

@RestController
@RequestMapping("/api/books")
public class BookController {

	private final BookRepository bookRepository;

	public BookController(BookRepository bookRepository) {
		this.bookRepository = bookRepository;
	}

	@GetMapping
	public List<BookDto> listBooks() {
		List<Book> books = bookRepository.findAll(Sort.by(Sort.Direction.ASC, "title"));
		return books.stream()
			.map(book -> new BookDto(book.getId(), book.getTitle(), book.getAuthor(), book.getIsbn()))
			.toList();
	}

	public record BookDto(Long id, String title, String author, String isbn) {
	}
}
