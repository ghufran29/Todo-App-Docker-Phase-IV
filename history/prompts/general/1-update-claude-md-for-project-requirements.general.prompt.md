---
id: 1
title: Update CLAUDE md for project requirements
stage: general
date: 2026-02-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: "Update the claude.md file based on my project requirements"
labels: ["claude-md", "project-requirements", "tech-stack"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - /mnt/d/GIAIC Course/ai-driven-hackathon/Hackathon-II/todo-app-phase-2/CLAUDE.md
tests:
 - none
---

## Prompt

```
please Update the claude.md file based on my project requirements. In this file:

Use Auth Agent for authentication
Use Frontend Agent for frontend development (e.g., Next.js)
Use DB Agent for database design and operations
Use Backend Agent for FastAPI development
Below are my project requirements:

Basic Level Functionality
Objective: Using Claude Code and Spec-Kit Plus transform the console app into a modern multi-user web application with persistent storage.
💡Development Approach: Use the Agentic Dev Stack workflow: Write spec → Generate plan → Break into tasks → Implement via Claude Code. No manual coding allowed. We will review the process, prompts, and iterations to judge each phase and project.
Requirements
Implement all 5 Basic Level features as a web application
Create RESTful API endpoints
Build responsive frontend interface
Store data in Neon Serverless PostgreSQL database
Authentication – Implement user signup/signin using Better Auth
Technology Stack
Layer
Technology
Frontend
Next.js 16+ (App Router)
Backend
Python FastAPI
ORM
SQLModel
Database
Neon Serverless PostgreSQL
Spec-Driven
Claude Code + Spec-Kit Plus
Authentication
Better Auth

Better Auth can be configured to issue JWT (JSON Web Token) tokens when users log in. These tokens are self-contained credentials that include user information and can be verified by any service that knows the secret key.
How It Works
User logs in on Frontend → Better Auth creates a session and issues a JWT token
Frontend makes API call → Includes the JWT token in the Authorization: Bearer <token> header
Backend receives request → Extracts token from header, verifies signature using shared secret
Backend identifies user → Decodes token to get user ID, email, etc. and matches it with the user ID in the URL
Backend filters data → Returns only tasks belonging to that user
```

## Response snapshot

Updated the CLAUDE.md file to reflect the project requirements, including:
1. Changed the primary goal to focus on transforming console applications to web applications
2. Added specific agents to use (Auth, Frontend, DB, Backend)
3. Included technology stack details
4. Added authentication flow information
5. Included Basic Level Functionality requirements
6. Updated default policies to include agent usage
7. Enhanced Architect Guidelines with technology stack and authentication flow
8. Updated project structure to include tech-specific directories

## Outcome

- ✅ Impact: Successfully updated CLAUDE.md to align with project requirements and technology stack
- 🧪 Tests: none
- 📁 Files: Modified CLAUDE.md to include all required specifications
- 🔁 Next prompts: Ready to proceed with spec creation using the updated guidelines
- 🧠 Reflection: The update properly incorporates all specified technology stack requirements and agent usage instructions

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Begin creating the initial spec based on updated requirements