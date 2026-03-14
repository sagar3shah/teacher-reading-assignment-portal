package com.teacherportal.backend;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	UserDetailsService userDetailsService(PasswordEncoder passwordEncoder) {
		UserDetails teacher = User.withUsername("teacher")
			.password(passwordEncoder.encode("teacher123"))
			.roles("TEACHER")
			.build();

		UserDetails student1 = User.withUsername("student1")
			.password(passwordEncoder.encode("student123"))
			.roles("STUDENT")
			.build();

		UserDetails student2 = User.withUsername("student2")
			.password(passwordEncoder.encode("student123"))
			.roles("STUDENT")
			.build();

		return new InMemoryUserDetailsManager(teacher, student1, student2);
	}

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
		SavedRequestAwareAuthenticationSuccessHandler nonXhrSuccessHandler = new SavedRequestAwareAuthenticationSuccessHandler();
		SimpleUrlAuthenticationFailureHandler nonXhrFailureHandler = new SimpleUrlAuthenticationFailureHandler("/login?error");
		RequestMatcher apiRequestMatcher = request -> request.getRequestURI() != null
			&& request.getRequestURI().startsWith("/api/");

		return http
			.csrf(AbstractHttpConfigurer::disable)
			.cors(Customizer.withDefaults())
			.headers(headers -> headers
				.frameOptions(frameOptions -> frameOptions.sameOrigin())
			)
			.exceptionHandling(exceptions -> exceptions
				.defaultAuthenticationEntryPointFor(
					new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
					apiRequestMatcher
				)
				.accessDeniedHandler((request, response, accessDeniedException) -> {
					if (request.getRequestURI() != null && request.getRequestURI().startsWith("/api/")) {
						response.sendError(HttpStatus.FORBIDDEN.value());
						return;
					}
					response.sendError(HttpStatus.FORBIDDEN.value());
				})
			)
			.authorizeHttpRequests(authorize -> authorize
				.requestMatchers("/api/health").permitAll()
				.requestMatchers("/api/books/**").hasRole("TEACHER")
				.requestMatchers("/api/assignments/**").hasRole("TEACHER")
				.requestMatchers("/api/my/**").authenticated()
				.requestMatchers("/api/**").authenticated()
				.requestMatchers("/login", "/error").permitAll()
				.anyRequest().authenticated()
			)
			.httpBasic(AbstractHttpConfigurer::disable)
			.formLogin(form -> form
				.successHandler((request, response, authentication) -> {
					String requestedWith = request.getHeader("X-Requested-With");
					if ("XMLHttpRequest".equalsIgnoreCase(requestedWith)) {
						response.setStatus(204);
						return;
					}
					nonXhrSuccessHandler.onAuthenticationSuccess(request, response, authentication);
				})
				.failureHandler((request, response, exception) -> {
					String requestedWith = request.getHeader("X-Requested-With");
					if ("XMLHttpRequest".equalsIgnoreCase(requestedWith)) {
						response.sendError(401);
						return;
					}
					nonXhrFailureHandler.onAuthenticationFailure(request, response, exception);
				})
			)
			.build();
	}
}