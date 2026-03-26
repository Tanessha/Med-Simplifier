# Scan Scribe PPT Content

## Slide 1: Title Slide

Title:
Scan Scribe: Medical Content Simplifier

Subtitle:
A personalized medical information simplification platform

Presented by:
- Your name
- Project / department / institution

## Slide 2: Problem Statement

- Medical reports, prescriptions, and health websites are often difficult for patients to understand.
- Many users struggle with medical terms, abbreviations, and complex explanations.
- Different users have different literacy levels, but most medical content is not personalized.
- Patients also need one place to manage prescriptions, reports, appointments, and reminders.

## Slide 3: Project Objective

- To simplify medical content into easy-to-understand language
- To personalize simplified output based on the user’s literacy level
- To support multiple input types such as text, URLs, files, and images
- To provide a dashboard for medical history, reports, prescriptions, appointments, and reminders

## Slide 4: Proposed Solution

Scan Scribe is a web application that:
- accepts medical content in multiple forms
- extracts the medically useful information
- simplifies it according to the user’s literacy level
- stores user data and scan history
- helps users manage their health-related records in one place

## Slide 5: Main Features

- User login and registration
- Literacy-level quiz
- Medical text simplification
- Website medical content extraction
- PDF and document upload
- Prescription and report image upload
- Personalized dashboard
- Download and share options

## Slide 6: Input Methods

The system accepts:
- pasted medical text
- medical website URLs
- PDF files
- Word documents
- images of prescriptions
- photos of reports

## Slide 7: Personalized Literacy Support

- The application stores the user’s literacy level.
- Three supported levels:
  - Basic
  - Intermediate
  - Advanced
- The AI changes wording, explanation depth, and technical complexity based on the user profile.

## Slide 8: System Workflow

1. User logs in
2. User completes literacy quiz
3. User uploads or pastes medical content
4. Backend extracts useful medical information
5. AI simplifies the content
6. Results are shown as:
   - Extracted Medical Content
   - Simplified Content
7. Scan history and dashboard data are saved

## Slide 9: Architecture Overview

Frontend:
- React + Vite
- Tailwind CSS
- Firebase Authentication
- Firebase Firestore

Backend:
- Node.js + Express
- OCR and document extraction
- Gemini AI integration

## Slide 10: Technology Stack

Frontend:
- React
- Vite
- Tailwind CSS
- shadcn/ui

Backend:
- Express
- Multer
- Tesseract OCR
- Mammoth
- pdfjs-dist
- Mozilla Readability

Services:
- Firebase Auth
- Firestore
- Gemini API

## Slide 11: Frontend Modules

- Authentication pages
- Literacy quiz
- Medical scanner
- Upload interface
- Processing state
- Results display
- Personalized dashboard

## Slide 12: Backend Modules

- `/api/upload` for files and images
- `/api/url` for medical website links
- `/api/rewrite` for text simplification
- extraction and simplification service in `processor.js`

## Slide 13: Dashboard Features

The dashboard stores:
- medical history
- allergies
- conditions
- emergency contact
- prescriptions
- reports
- appointments
- reminders
- scan history

## Slide 14: AI Role in the Project

Gemini AI is used to:
- summarize medical text
- simplify content based on literacy level
- identify medicine usage from prescriptions
- explain medical findings from reports
- clean extracted content

Fallback support:
- if AI quota is exhausted, local extraction and simplification are used

## Slide 15: Prescription Processing

For prescriptions, the app tries to identify:
- patient details
- medicine names
- dosage patterns
- timing and frequency
- duration
- special instructions
- follow-up date

Example schedule interpretation:
- `1-1-1` = morning, afternoon, night
- `1-0-1` = morning and night
- `0-0-1` = night only
- `1-0-0` = morning only

## Slide 16: Report Processing

For reports and scans, the app explains:
- what the report is about
- key findings
- what the findings may mean
- important medical notes or warnings

## Slide 17: Data Storage

Current main storage:
- Firebase Authentication for login
- Firestore for user profile, literacy level, dashboard data, and scan history

Backend support:
- MongoDB-related backend structure is still present for legacy or fallback use

## Slide 18: Advantages of the System

- Makes medical information easier to understand
- Supports multiple medical input types
- Personalized output for different users
- Useful for patients with low health literacy
- Provides centralized medical record tracking
- Improves accessibility of healthcare communication

## Slide 19: Challenges Faced

- OCR errors in handwritten prescriptions
- noisy website extraction
- AI quota/rate limit issues
- unclear handwritten medicine names
- preserving medical accuracy while simplifying language

## Slide 20: Improvements Made

- better URL extraction
- cleaner medical notes generation
- Gemini-based simplification
- prescription-specific prompts
- improved dashboard UI and contrast
- Firebase-based user persistence
- download and share support
- better fallback handling for AI quota errors

## Slide 21: Limitations

- handwritten prescription accuracy is still not perfect
- poor image quality affects extraction quality
- AI free-tier rate limits can slow or reduce summary quality
- some unclear doctor abbreviations remain difficult to interpret safely

## Slide 22: Future Enhancements

- better image preprocessing and cropping
- medicine database integration
- reminder notifications
- multilingual support
- stronger report interpretation
- confidence score for extracted medical details
- mobile optimization and deployment

## Slide 23: Conclusion

- Scan Scribe is a personalized medical content simplification platform.
- It helps users understand prescriptions, reports, and medical text more easily.
- It combines AI, OCR, and user literacy profiling in one system.
- It also provides a dashboard for better health record management.

## Slide 24: Demo Flow

Suggested live demo sequence:
- Login
- Show literacy profile
- Upload prescription or report
- Show extracted medical content
- Show simplified content
- Open dashboard
- Show saved scan history and reminders

## Slide 25: Thank You

Title:
Thank You

Optional closing line:
Questions and Suggestions
