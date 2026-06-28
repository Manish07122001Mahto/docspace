# Architecture Note

## Overview

This project is a lightweight collaborative document editor inspired by Google Docs. The goal was to deliver a focused product that demonstrates document creation, editing, file import, sharing, and persistence within the given time constraints.

The application follows a client-server architecture with a React frontend, a NestJS backend, and a PostgreSQL database.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Tiptap Rich Text Editor

### Backend

- NestJS
- Prisma ORM
- REST API

### Database

- PostgreSQL (Neon)

### Deployment

- Frontend - Vercel
- Backend - Render
- Database - Neon PostgreSQL

## High-Level Architecture

```text
React (Vite)
      │
      ▼
REST API
      │
      ▼
NestJS
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
```

## Core Modules

### Authentication

A lightweight authentication approach is used with seeded users. This keeps the implementation simple while allowing document ownership and sharing to be demonstrated without introducing unnecessary authentication complexity.

### Documents

The document module supports:

- Create document
- Rename document
- Edit rich text content
- Save document
- Reopen existing documents

Rich text content is stored in a structured JSON format produced by the editor to preserve formatting.

### File Import

Users can upload supported text-based files and create editable documents from their contents.

Supported file types are clearly indicated in the UI.

### Sharing

Each document has a single owner.

Owners can share documents with other users. Shared documents appear separately from owned documents to clearly distinguish ownership.

### Persistence

All application data is stored in PostgreSQL.

Persisted data includes:

- Users
- Documents
- Document content
- Sharing relationships

This ensures documents remain available after refresh or deployment.

## Design Decisions

The project intentionally focuses on the core document workflow instead of implementing advanced collaborative editing features.

The following features were intentionally prioritized:

- Clean document editing experience
- Simple sharing model
- Persistent storage
- Maintainable backend structure
- Straightforward deployment

The following features were intentionally excluded due to the assignment time constraints:

- Real-time collaboration
- Version history
- Comments
- Role-based permissions
- Conflict resolution
- Offline editing

## Testing

Basic automated tests are included for core backend functionality. Manual testing was also performed to verify document creation, editing, sharing, persistence, and file import workflows.
