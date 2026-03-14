package com.teacherportal.backend.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.teacherportal.backend.domain.Assignment;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
	@Query("select distinct a from Assignment a left join fetch a.book left join fetch a.progress")
	List<Assignment> findAllWithBookAndProgress();

	@Query("select distinct a from Assignment a join a.studentUsernames s left join fetch a.book left join fetch a.progress where s = :username")
	List<Assignment> findForStudentWithBookAndProgress(@Param("username") String username);

	@Query("select distinct a from Assignment a join a.studentUsernames s left join fetch a.book left join fetch a.progress where a.id = :assignmentId and s = :username")
	Optional<Assignment> findOneForStudentWithBookAndProgress(
		@Param("assignmentId") Long assignmentId,
		@Param("username") String username
	);
}
