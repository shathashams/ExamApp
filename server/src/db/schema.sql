-- Drop tables if they exist
DROP TABLE IF EXISTS "studentScores";
DROP TABLE IF EXISTS "exams";
DROP TABLE IF EXISTS "users";

-- 1. Create Users Table
CREATE TABLE "users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "fullName" VARCHAR(100) NOT NULL,
    "role" VARCHAR(20) CHECK ("role" IN ('teacher', 'student')) NOT NULL
);

-- 2. Create Exams Table
CREATE TABLE "exams" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(150) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'draft' CHECK ("status" IN ('draft', 'published')),
    "duration" INTEGER NOT NULL,
    "extraTime" INTEGER DEFAULT 0,
    "allowedMaterials" VARCHAR(255),
    "teacherAvailable" VARCHAR(255),
    "questions" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "teacherId" INTEGER REFERENCES "users"("id") ON DELETE SET NULL
);

-- 3. Create Student Scores Table
CREATE TABLE "studentScores" (
    "id" SERIAL PRIMARY KEY,
    "studentName" VARCHAR(100) NOT NULL,
    "studentId" INTEGER REFERENCES "users"("id") ON DELETE CASCADE NOT NULL,
    "examId" INTEGER REFERENCES "exams"("id") ON DELETE CASCADE NOT NULL,
    "examTitle" VARCHAR(150) NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "grade" INTEGER NOT NULL,
    "date" VARCHAR(50) NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "feedback" TEXT,
    "manualGrade" INTEGER
);

-- Seed Initial Data
INSERT INTO "users" ("id", "username", "password", "fullName", "role") VALUES
(1, 'teacher1', '$2b$10$mZxLs7WZBlVQ6dMLs1yBHevWT9dEgdiqp5U2oChlan.Xt71DH4MGK', 'Maya Cohen', 'teacher'),
(2, 'teacher2', '$2b$10$5qFQxP8HAPXfjeg0wOGssuUfYbIkLtPJl9E2FKYKs3NdCHqcyIcd6', 'Rami Levi', 'teacher'),
(3, 'student1', '$2b$10$zat.312RMajDeHd1GTMYxejJUwoN/CBTgZ.SL4DaG7bGAztt70LHy', 'Noor Ahmed', 'student'),
(4, 'student2', '$2b$10$OY3t2WwKey/yObLCqB75buzlb/KjO8Gyvj.P8caG8OoDvoZ.SHBTa', 'Lina Mansour', 'student'),
(5, 'student3', '$2b$10$7p/FP0EyV6OfX7ZW/zUReedBXcKKmZjfNQRzjAbDp9X2wrJr3SsRG', 'Adam Saleh', 'student'),
(6, 'student80', '$2b$10$aASWzgpbPkNX7zqMboWlBep8bT26mdEmhkwylUbY/cC3OxVGWpNT6', 'Adel kocari', 'student'),
(7, 'student66', '$2b$10$759l8AUj0/wS4mMbv.CbbuLy5PwBbAPx4wHLTHFj0NUH7Py3hmFri', 'Mila fihs', 'teacher');

SELECT setval('"users_id_seq"', (SELECT MAX("id") FROM "users"));

INSERT INTO "exams" ("id", "title", "status", "duration", "extraTime", "allowedMaterials", "teacherAvailable", "questions", "teacherId") VALUES
(1, 'Math Exam', 'published', 60, 15, 'Calculator', 'First 20 minutes of the exam', '[{"id": "q1", "text": "What is 2 + 2?", "answer": "4", "options": ["3", "4", "5", "6"]}, {"id": "q2", "text": "What is 5 * 3?", "answer": "15", "options": ["10", "15", "20", "25"]}, {"id": "q3", "text": "What is 10 - 4?", "answer": "6", "options": ["4", "5", "6", "7"]}]'::jsonb, 1),
(2, 'English Exam', 'published', 45, 10, 'Dictionary', 'First 15 minutes of the exam', '[{"id": "q1", "text": "Choose the correct word: I ___ happy.", "answer": "am", "options": ["am", "is", "are", "be"]}, {"id": "q2", "text": "What is the opposite of hot?", "answer": "cold", "options": ["warm", "cold", "big", "fast"]}, {"id": "q3", "text": "Choose the correct plural: child", "answer": "children", "options": ["childs", "children", "childes", "childrens"]}, {"id": "q4", "text": "Which sentence is correct?", "answer": "She goes to school every day.", "options": ["She go to school every day.", "She goes to school every day.", "She going to school every day.", "She gone to school every day."]}]'::jsonb, 2),
(3, 'Computer Science Exam', 'draft', 90, 20, 'Course notes', 'First 30 minutes of the exam', '[{"id": "q1", "text": "Which data structure uses FIFO?", "answer": "Queue", "options": ["Stack", "Queue", "Tree", "Graph"]}, {"id": "q2", "text": "What does HTML stand for?", "answer": "Hyper Text Markup Language", "options": ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tool Multi Language", "Home Text Markup Language"]}, {"id": "q3", "text": "Which symbol is used for a single-line comment in JavaScript?", "answer": "//", "options": ["//", "/* */", "#", "--"]}]'::jsonb, 1),
(4, 'MATH 3', 'draft', 120, 15, 'No materials', 'First 20 minutes of the exam', '[{"id": 1, "text": "2+2+4", "answer": "8", "options": ["6", "8", "7", "1"]}]'::jsonb, 1),
(5, 'math 9', 'draft', 60, 15, '', 'First 20 minutes of the exam', '[{"id": 1, "text": "7+7+7", "answer": "21", "options": ["21", "12", "0", "4"]}]'::jsonb, 2);

SELECT setval('"exams_id_seq"', (SELECT MAX("id") FROM "exams"));

INSERT INTO "studentScores" ("id", "studentName", "studentId", "examId", "examTitle", "score", "totalQuestions", "grade", "date", "answers") VALUES
(1, 'Noor Ahmed', 3, 1, 'Math Exam', 3, 3, 100, '2026-06-02', '{"q1": "4", "q2": "15", "q3": "6"}'::jsonb),
(2, 'Lina Mansour', 4, 1, 'Math Exam', 2, 3, 67, '2026-06-02', '{"q1": "4", "q2": "10", "q3": "6"}'::jsonb),
(3, 'Adam Saleh', 5, 2, 'English Exam', 2, 4, 50, '2026-06-02', '{"q1": "am", "q2": "warm", "q3": "childs", "q4": "She goes to school every day."}'::jsonb),
(4, 'Noor Ahmed', 3, 2, 'English Exam', 4, 4, 100, '2026-06-03', '{"q1": "am", "q2": "cold", "q3": "children", "q4": "She goes to school every day."}'::jsonb),
(5, 'Lina Mansour', 4, 2, 'English Exam', 3, 4, 75, '2026-06-03', '{"q1": "is", "q2": "cold", "q3": "children", "q4": "She goes to school every day."}'::jsonb),
(6, 'Adam Saleh', 5, 1, 'Math Exam', 3, 3, 100, '2026-06-04', '{"q1": "4", "q2": "15", "q3": "6"}'::jsonb),
(7, 'Noor Ahmed', 3, 3, 'Computer Science Exam', 2, 3, 67, '2026-06-04', '{"q1": "Queue", "q2": "Hyper Text Markup Language", "q3": "#"}'::jsonb);

SELECT setval('"studentScores_id_seq"', (SELECT MAX("id") FROM "studentScores"));