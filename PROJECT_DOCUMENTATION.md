# Scan Scribe Project Documentation

## 1. Project Overview

Scan Scribe is a medical content simplification web application built to help users understand complex medical information more easily.

The application accepts medical input in multiple forms:
- pasted medical text
- medical website URLs
- uploaded files such as PDF, DOC, DOCX, and images
- photos of prescriptions or reports

It then:
- extracts the medically relevant content
- simplifies the language based on the user's literacy level
- stores user-specific health and scan data
- provides a personalized dashboard for medical records and reminders

The project combines a React frontend, an Express backend, Firebase Authentication, Firebase Firestore, OCR/document extraction tools, and Gemini-based AI summarization with local fallbacks.

## 2. Main Objectives

The main goals of the project are:
- make difficult medical information easier to understand
- personalize the output according to the user's literacy level
- support multiple kinds of medical input
- keep a user dashboard with reports, prescriptions, appointments, reminders, and scan history
- provide a safer and cleaner summary for prescriptions and reports

## 3. Core Features

### 3.1 Medical Content Simplification

The scanner can process:
- plain medical text
- medical website links
- uploaded reports and documents
- uploaded photos and prescription images

The system produces two outputs:
- Extracted Medical Content: a cleaner medical extraction of the source
- Simplified Content or Simplified Summary: a patient-friendly explanation

### 3.2 Literacy-Level Personalization

The user’s literacy level is captured through the literacy quiz and saved to Firestore.

Supported levels:
- `basic`
- `intermediate`
- `advanced`

This level influences:
- wording complexity
- explanation depth
- amount of medical terminology preserved

### 3.3 URL Processing

For website URLs, the backend:
- fetches the webpage
- extracts the main medical article
- removes navigation, footer, and boilerplate content
- builds cleaner medical notes
- simplifies the result for the user’s literacy level

### 3.4 File and Image Processing

For uploaded documents and images, the backend supports:
- PDF extraction
- DOCX extraction
- OCR for image text
- direct Gemini-assisted medical file reading when available

Prescription-specific behavior:
- detect medicine names
- identify schedule patterns such as `1-0-1`, `0-0-1`, `1-1-1`
- explain likely tablet use when readable enough
- preserve unclear instructions safely instead of inventing details

Report-specific behavior:
- explain what the report is about
- extract findings
- summarize what can reasonably be concluded

### 3.5 Personalized Dashboard

The dashboard stores and displays:
- medical history
- allergies
- known conditions
- emergency contact
- reports
- prescriptions
- appointments
- reminders
- scan history

### 3.6 Authentication

The current authentication flow uses Firebase Authentication.

Users can:
- register
- log in
- log out
- keep their literacy level and personal profile across sessions

### 3.7 Download and Share

The results screen supports:
- downloading simplified content as a text file
- sharing via the browser share sheet
- clipboard fallback if native sharing is unavailable

## 4. Tech Stack

### Frontend

- React 18
- Vite
- React Router
- Tailwind CSS
- shadcn/ui
- Radix UI
- Firebase SDK

### Backend

- Node.js
- Express
- Multer
- Mongoose
- Tesseract.js
- Mammoth
- pdfjs-dist
- Mozilla Readability
- Cheerio
- JSDOM

### AI and Data Services

- Gemini API
- Firebase Authentication
- Firebase Firestore
- MongoDB support remains present in the backend for some legacy server-side persistence paths

## 5. Project Structure

### Frontend

Main frontend routes:
- [App.jsx](/C:/Final-Demo-main/src/App.jsx)
- [Index.jsx](/C:/Final-Demo-main/src/pages/Index.jsx)
- [Login.jsx](/C:/Final-Demo-main/src/pages/Login.jsx)
- [Register.jsx](/C:/Final-Demo-main/src/pages/Register.jsx)
- [Dashboard.jsx](/C:/Final-Demo-main/src/pages/Dashboard.jsx)
- [LiteracyQuiz.jsx](/C:/Final-Demo-main/src/pages/LiteracyQuiz.jsx)

Main scanner and display components:
- [MedicalScanner.jsx](/C:/Final-Demo-main/src/components/MedicalScanner.jsx)
- [UploadCard.jsx](/C:/Final-Demo-main/src/components/UploadCard.jsx)
- [ProcessingState.jsx](/C:/Final-Demo-main/src/components/ProcessingState.jsx)
- [ResultsDisplay.jsx](/C:/Final-Demo-main/src/components/ResultsDisplay.jsx)
- [Navbar.jsx](/C:/Final-Demo-main/src/components/Navbar.jsx)

Authentication and Firestore helpers:
- [useAuth.jsx](/C:/Final-Demo-main/src/hooks/useAuth.jsx)
- [firebase.js](/C:/Final-Demo-main/src/lib/firebase.js)
- [firestoreData.js](/C:/Final-Demo-main/src/lib/firestoreData.js)

### Backend

Backend entry:
- [index.js](/C:/Final-Demo-main/backend/index.js)

Main backend routes:
- [content.js](/C:/Final-Demo-main/backend/routes/content.js)
- [auth.js](/C:/Final-Demo-main/backend/routes/auth.js)
- [history.js](/C:/Final-Demo-main/backend/routes/history.js)
- [profile.js](/C:/Final-Demo-main/backend/routes/profile.js)

Models:
- [User.js](/C:/Final-Demo-main/backend/models/User.js)
- [File.js](/C:/Final-Demo-main/backend/models/File.js)
- [ScanHistory.js](/C:/Final-Demo-main/backend/models/ScanHistory.js)
- [HealthProfile.js](/C:/Final-Demo-main/backend/models/HealthProfile.js)

Main processing service:
- [processor.js](/C:/Final-Demo-main/backend/services/processor.js)

## 6. Frontend Workflow

### 6.1 Authentication Flow

1. The user registers or logs in.
2. Firebase Authentication validates credentials.
3. A user document is created or loaded from Firestore.
4. The user profile is kept in React context via `AuthProvider`.

### 6.2 Literacy Flow

1. The user completes the literacy quiz.
2. The literacy level is saved to Firestore.
3. The scanner uses this literacy level when simplifying medical content.

### 6.3 Scanner Flow

1. The user selects one of the input methods.
2. The frontend sends the content to the backend.
3. The backend extracts medical content.
4. The backend produces a simplified summary.
5. The frontend shows:
   - extracted medical content
   - simplified content
6. The result is saved to scan history for logged-in users.

### 6.4 Dashboard Flow

1. The user opens the dashboard.
2. Firestore data is loaded for:
   - user profile
   - health profile
   - scan history
3. The user can add or update:
   - reports
   - prescriptions
   - appointments
   - reminders
   - medical history fields

## 7. Backend Processing Flow

### 7.1 Text Input

For pasted text:
- the frontend sends plain text to `/api/rewrite`
- the backend simplifies the text using Gemini when available
- if Gemini fails, the backend falls back to rule-based local simplification

### 7.2 URL Input

For URLs:
- `/api/url` fetches webpage content
- article extraction removes boilerplate
- medical notes are generated
- simplified output is generated from the cleaned content

### 7.3 File Upload Input

For files:
- `/api/upload` accepts the file through Multer
- the file is processed based on MIME type
- medical notes are extracted
- a simplified output is generated from the extracted notes

Supported file types include:
- PDF
- DOCX
- JPG
- JPEG
- PNG
- WEBP

### 7.4 Image and Prescription Handling

Prescription images are treated specially.

The backend tries to extract:
- patient details
- medicines
- timing and duration
- dose schedule
- review date
- special instructions

Schedule patterns are interpreted using rules such as:
- `1-1-1` = morning, afternoon, night
- `1-0-1` = morning and night
- `0-0-1` = night only
- `1-0-0` = morning only

The system avoids overconfident guesses when handwriting is unclear.

## 8. API Endpoints

### Content Routes

Base path: `/api`

- `POST /api/upload`
  - accepts uploaded medical files
  - returns extracted content and simplified content

- `POST /api/url`
  - accepts a medical URL
  - returns extracted medical content and simplified content

- `POST /api/analyze`
  - analyzes text readability

- `POST /api/rewrite`
  - rewrites text according to target literacy level

### Legacy Backend Auth/Profile Routes

These routes still exist in the backend:
- `/api/auth`
- `/api/history`
- `/api/profile`

However, the current frontend uses Firebase for auth, dashboard persistence, and scan history.

## 9. Data Storage

### Current Primary Storage

The active frontend persistence model uses Firebase Firestore:

- `users`
  - username
  - email
  - literacyLevel

- `healthProfiles`
  - medicalHistory
  - allergies
  - conditions
  - emergencyContact
  - reports
  - prescriptions
  - appointments
  - reminders

- `users/{userId}/scanHistory`
  - originalText
  - simplifiedText
  - literacyLevel
  - timestamps

### Backend Storage

The backend still contains MongoDB/Mongoose models and routes for:
- user data
- files
- history
- health profiles

This is useful as:
- legacy backend support
- fallback paths
- future extensibility

## 10. Environment Configuration

### Frontend `.env.local`

Required Firebase environment variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend `.env`

Typical backend configuration:

```env
PORT=8082
MONGO_URI=mongodb://localhost:27017/scan-scribe
JWT_SECRET=your_secret_if_backend_auth_is_used
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

## 11. How to Run the Project

### Start the Frontend

```powershell
cd C:\Final-Demo-main
npm install
npm run dev
```

### Start the Backend

```powershell
cd C:\Final-Demo-main
npm run backend:start
```

### Frontend and Backend Ports

- frontend: usually `http://localhost:8081/` or another Vite port
- backend: `http://localhost:8082/`

## 12. User Journey

### New User

1. Open the app
2. Register
3. Complete literacy quiz
4. Enter scanner
5. Upload or paste content
6. View simplified result
7. Manage records through dashboard

### Returning User

1. Log in
2. Open dashboard or scanner
3. Review scan history
4. Upload new reports or prescriptions
5. Track appointments and reminders

## 13. Key Improvements Implemented During Development

The project was improved significantly during development.

Major changes include:
- fixed URL input flow so website content is actually fetched and processed
- replaced placeholder extraction with real processing for uploaded files
- improved contrast and readability in dashboard, login, register, and scanner screens
- built a personalized dashboard for medical records and reminders
- switched frontend auth and profile persistence to Firebase
- added Gemini-based AI summarization
- improved prescription-specific prompts
- improved upload UX and progress state
- added download and share support
- added better fallback behavior when Gemini quota is exhausted
- added safer handling of uncertain handwritten prescriptions

## 14. Known Limitations

Although the project works, some practical limitations remain:

### OCR and Handwriting

- handwritten prescriptions are still hard to parse perfectly
- tilted, blurry, or low-contrast images reduce accuracy
- clinic headers may still interfere with weak images

### AI Rate Limits

- Gemini free-tier quotas can be exhausted
- when quota is exceeded, the backend now falls back to local extraction/simplification
- fallback output is less polished than Gemini-enhanced output

### Prescription Ambiguity

- handwritten medicine names may still be approximate
- unclear durations, abbreviations, and follow-up notes may remain uncertain

### Backend Duality

- the frontend currently uses Firebase for user persistence
- the backend still contains legacy auth/history/profile routes using MongoDB
- this creates some duplication in architecture

## 15. Suggested Future Enhancements

Recommended future work:
- crop and enhance prescription images before OCR
- add medicine database lookup for stronger prescription explanations
- add confidence scores for each extracted field
- support AVIF or automatic image conversion
- add push or email reminder notifications
- add appointment calendar sync
- improve report-specific structured summaries
- add multilingual support
- unify persistence strategy fully around either Firebase or backend storage

## 16. Conclusion

Scan Scribe is a full-stack medical content simplification platform that combines:
- content extraction
- readability adaptation
- AI-based medical summarization
- personalized health data management

The system is designed to make medical information easier to understand while still preserving key facts and supporting a user-specific literacy profile.

It is suitable as:
- an academic project
- a prototype healthcare communication tool
- a foundation for a more advanced patient education platform
