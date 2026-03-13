package com.teacherportal.backend;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

	@Bean
	CorsConfigurationSource corsConfigurationSource(
		@Value("${app.cors.allowed-origins}") String allowedOrigins
	) {
		List<String> origins = Arrays.stream(allowedOrigins.split(","))
			.map(String::trim)
			.filter(value -> !value.isEmpty())
			.collect(Collectors.toList());

		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(origins);
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	WebSecurityCustomizer webSecurityCustomizer() {
		return (web) -> web
			.ignoring()
			.requestMatchers("/h2-console", "/h2-console/**");
	}

	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		return http
			.csrf(AbstractHttpConfigurer::disable)
			.cors(Customizer.withDefaults())
			.headers(headers -> headers
				.frameOptions(frameOptions -> frameOptions.sameOrigin())
			)
			.authorizeHttpRequests(authorize -> authorize
				.requestMatchers("/api/health").permitAll()
				.anyRequest().authenticated()
			)
			.httpBasic(AbstractHttpConfigurer::disable)
			.formLogin(Customizer.withDefaults())
			.build();
	}
}