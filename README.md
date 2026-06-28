# Docspace - Collaborative Document Editor

A lightweight, collaborative, full-stack document editor inspired by Google Docs. Built for the Ajaia LLC AI-Native Full Stack Developer Assignment.

## Features

1.  **Rich-Text Document Editing**: Create, open, rename, format (bold, italic, underline, headers, alignment, bulleted/numbered lists), and edit documents in a browser canvas (powered by Tiptap).
2.  **Stateful Debounced Auto-save**: Documents are autosaved to the database with visual status updates ("Saving changes...", "Saved at hh:mm:ss").
3.  **Collaborator Document Sharing**: Share documents with teammates and manage permissions dynamically. Clearly distinguishes between "Owned Documents" and "Shared With Me" in the workspace.
4.  **File Imports & Attachments**:
    *   **Import**: Upload and parse `.txt` or `.md` files directly from the dashboard to initialize a new document draft.
    *   **Attachment**: Attach files to existing documents, with an option to insert their text content directly into the editor draft at any time.
5.  **Lightweight Authentication**: Login page that allows reviewers to quickly login as seeded users (Manish Mahto, Priya Shah, Alex Morgan) or register new accounts instantly.

## Tech Stack

*   **Frontend**: React (19), TypeScript, Vite, Tailwind CSS, Radix UI primitives, Tiptap.
*   **Backend**: NestJS (11), Prisma ORM, Multer (for multi-part file uploads).
*   **Database**: PostgreSQL (Neon).

---

## Local Setup and Run Instructions

### 1. Prerequisite: Environment Setup
Ensure you have Node.js (v18+) and npm installed.

*   **Backend Environment**: In the `backend/.env` file:
    ```env
    DATABASE_URL='postgresql://neondb_owner:npg_cSH1FXxVPm4j@ep-mute-salad-adzhvo2d.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
    ```
    *(A remote Neon database has already been configured for you in the repo)*.

*   **Frontend Environment**: In the `frontend/.env` file:
    ```env
    VITE_API_URL=http://localhost:3000
    ```

### 2. Run the Backend
1. Open a terminal in the `backend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run start:dev
   ```
   *The backend REST API will run on http://localhost:3000.*

### 3. Run the Frontend
1. Open a new terminal in the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend application will be hosted on http://localhost:5173.*

### 4. Running Backend Tests
Ensure the backend is configured, and run:
```bash
npm run test
```

---

## API Testing with Postman

A Postman configuration folder is provided under `backend/postman/`:
1.  **Environment**: Import [docspace.postman_environment.json](file:///d:/Assessments/docspace/backend/postman/docspace.postman_environment.json) to set your request variables (`host`, `user_id`, `document_id`).
2.  **Collection**: Import [docspace.postman_collection.json](file:///d:/Assessments/docspace/backend/postman/docspace.postman_collection.json) to test all backend routes including:
    *   `GET /users` (Teammates listing)
    *   `POST /users/login` (Auth lookup/auto-register)
    *   `GET /documents?user_id=...` (Workspace fetch)
    *   `POST /documents` (Creation)
    *   `PATCH /documents/:id` (Updating content and title)
    *   `POST /documents/import` (File import)
    *   `POST /documents/:id/shares` (Share document)
    *   `POST /documents/:id/attachments` (Attachment upload)