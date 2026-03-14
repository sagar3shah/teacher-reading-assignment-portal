-- Seed data for demo/interview runs.
-- Uses H2 MERGE for idempotent inserts.

MERGE INTO books (id, title, author, isbn) KEY (id)
VALUES (1, 'The Giver', 'Lois Lowry', '978-0544336261');

MERGE INTO books (id, title, author, isbn) KEY (id)
VALUES (2, 'Holes', 'Louis Sachar', '978-0440414803');

MERGE INTO books (id, title, author, isbn) KEY (id)
VALUES (3, 'Number the Stars', 'Lois Lowry', '978-0547577098');

MERGE INTO assignments (id, book_id, due_date) KEY (id)
VALUES (1, 1, DATE '2026-03-20');

MERGE INTO assignments (id, book_id, due_date) KEY (id)
VALUES (2, 2, DATE '2026-03-27');

MERGE INTO assignment_students (assignment_id, student_username) KEY (assignment_id, student_username)
VALUES (1, 'student1');

MERGE INTO assignment_students (assignment_id, student_username) KEY (assignment_id, student_username)
VALUES (1, 'student2');

MERGE INTO assignment_students (assignment_id, student_username) KEY (assignment_id, student_username)
VALUES (2, 'student1');
