package com.teacherportal.backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.teacherportal.backend.domain.Book;

public interface BookRepository extends JpaRepository<Book, Long> {
}
