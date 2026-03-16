package com.teacherportal.backend;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

	@GetMapping("/")
	public Map<String, Object> root() {
		return Map.of(
			"service", "teacher-reading-assignment-portal-backend",
			"status", "UP",
			"timestamp", Instant.now().toString(),
			"health", "/api/health"
		);
	}
}
