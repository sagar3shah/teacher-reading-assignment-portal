package com.teacherportal.backend.api;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeController {

	@GetMapping("/me")
	public Map<String, Object> me(Principal principal, Authentication authentication) {
		List<String> roles = authentication.getAuthorities().stream()
			.map(GrantedAuthority::getAuthority)
			.sorted()
			.toList();

		return Map.of(
			"username", principal.getName(),
			"roles", roles
		);
	}
}
