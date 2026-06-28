# Submission Deliverables - Docspace Assignment

**Candidate**: Manish Mahto (manishmahto.dev@gmail.com)

This document lists all the deliverables included in this directory for the AI-Native Full Stack Developer Assignment.

## Deliverables Checklist

- [x] **Source Code**: Fully completed full-stack codebase.
  - `backend/`: NestJS + Prisma server.
  - `frontend/`: React + Vite + Tailwind CSS client.
- [x] **Postman API Folder**: Located under `backend/postman/`.
  - [docspace.postman_environment.json](file:///d:/Assessments/docspace/backend/postman/docspace.postman_environment.json) (API Environment Variables)
  - [docspace.postman_collection.json](file:///d:/Assessments/docspace/backend/postman/docspace.postman_collection.json) (REST API Request Collection)
- [x] **Run/Setup Guide**: Provided in the root [README.md](file:///d:/Assessments/docspace/README.md).
- [x] **Architecture Documentation**: Documented in [ARCHITECTURE.md](file:///d:/Assessments/docspace/ARCHITECTURE.md).
- [x] **AI Workflow Documentation**: Detailed in [AI_WORKFLOW.md](file:///d:/Assessments/docspace/AI_WORKFLOW.md).
- [x] **Walkthrough Video Link File**: Located in [walkthrough-video.txt](file:///d:/Assessments/docspace/walkthrough-video.txt).
- [x] **Automated Tests**: Included in the NestJS backend and passing.

---

## What is Working End-to-End

1.  **Lightweight Auth**: Log in by picking a seeded demo user or typing any custom email to register instantly.
2.  **Workspace Isolation**: Dashboard displays "Owned Documents" separate from "Shared With Me" based on the logged-in user.
3.  **Document Creation**: Clicking "New Document" instantiates a draft in the database and redirects to the editor.
4.  **Auto-Saving Editor**: Type rich-text, apply headings, align alignment, underline, bold, italicize, lists. Content and titles are auto-saved to Neon PostgreSQL with a debounced status saver.
5.  **Access Sharing**: Document owners can search other teammates and share or remove access, immediately updating their shared dashboard workspace.
6.  **File Upload / Importing**:
    *   Import new documents from `.txt` or `.md` files.
    *   Upload `.txt` or `.md` files as attachments and insert their text content directly into your editor drafts.
