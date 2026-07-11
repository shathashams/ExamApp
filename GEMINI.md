# ExamApp (E-Test System)

This project is a React-based online exam system designed for teachers to manage exams and for students to take them. It features a mock database and simulated API calls to demonstrate full functionality without a backend.

## Architecture & Technology Stack

- **Frontend:** [React 19](https://react.dev/) with [Vite](https://vitejs.dev/) as the build tool.
- **Styling:** [Bootstrap 5](https://getbootstrap.com/) for responsive UI components.
- **State Management:** Local React state used for session management and component-level state.
- **Data Layer:**
  - `src/api/mockDb.js`: Simulated database holding exam data.
  - `src/api/examService.js`: Simulated API service that interacts with the mock database using Promises and timeouts.
- **Services:**
  - `LoggerService`: Centralized logging.
  - `StorageService`: Wrapper for `localStorage` operations.
  - `ConfigService`: Application configuration management.
  - `NotifyService`: User notification helper.

## Project Structure

- `client/src/auth/`: Login and Registration components.
- `client/src/teacherPages/`: Dashboard and exam management for teachers.
- `client/src/studentPages/`: Exam portal and results for students.
- `client/src/components/`: Reusable UI components like `NavigationMenu`.
- `client/src/services/`: Generic application services.
- `client/src/api/`: Data fetching and mock backend logic.
- `client/src/docs/`: Diagrams and feature documentation.

## User Roles

1.  **Teacher:** Can view all exams, create new ones, manage exam details, and add/edit questions.
2.  **Student:** Can enter an exam ID, take the test, view their score, and see previous results.

## Building and Running

Commands are executed within the `client` directory.

- **Start Development Server:** `npm run dev`
- **Build for Production:** `npm run build`
- **Lint Code:** `npm run lint`
- **Preview Production Build:** `npm run preview`

## Development Conventions

- **Component Organization:** Group pages by user role (teacher/student) and common components in `components/`.
- **Services:** Use the provided services in `src/services` for logging, storage, and notifications to maintain consistency.
- **Mock API:** All data operations should go through `examService.js` to facilitate easy integration with a real backend in the future.
- **Styling:** Prefer Bootstrap classes for layout and styling. Custom styles should be placed in `App.css` or `index.css`.
- **Language:** The codebase contains comments in both Hebrew and English. Maintain this bilingual documentation where appropriate for local context.
