# 🟪 Med Simplifier

*Med Simplifier* is an AI-powered medical content simplification platform designed to help users understand complex medical information easily. It supports multiple input formats and delivers personalized, literacy-based summaries with a clean and intuitive user experience.

---

## ✨ Key Features

### 🔐 Authentication & User Profile

- Secure login and signup using Firebase Authentication
- User-specific data stored in Firestore
- Literacy-level personalization: Basic / Intermediate / Advanced

### 🧠 Medical Content Simplification

- Simplifies complex medical text into easier language
- Preserves key medical facts while improving readability
- Outputs:
  - Extracted Medical Content
  - Simplified Content

### 🌐 URL Processing

- Extracts main medical content from websites
- Removes navigation, ads, and clutter
- Generates clean medical notes and simplified explanation

### 📂 File & Image Processing

Supports:
- PDF and DOCX documents
- Images: JPG, PNG, WEBP
- Prescription photos

Capabilities:
- OCR-based text extraction using Tesseract.js
- Prescription understanding with dose-pattern interpretation
- Report summarization

### 📊 Personalized Dashboard

Track and manage:
- Medical history
- Allergies and conditions
- Reports and prescriptions
- Appointments and reminders
- Scan history

### 📥 Download & Share

- Export simplified results
- Share using browser share API
- Clipboard fallback support

## ⚙️ Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS
- shadcn/ui
- Firebase SDK

### Backend

- Node.js
- Express
- MongoDB (Mongoose)
- Multer
- Tesseract.js
- pdfjs-dist
- Mammoth

### AI & Services

- Gemini API
- Firebase Authentication
- Firebase Firestore

## 🚀 Core Functionalities

### 📝 Scanner

- Paste text, upload a file, or provide a URL
- Extracts medical content
- Generates simplified explanation

### 🧾 Prescription Understanding

- Detects medicines
- Interprets dosage patterns:
  - `1-1-1` → morning, afternoon, night
  - `1-0-1` → morning and night
  - `0-0-1` → night only
  - `1-0-0` → morning only
- Avoids unsafe assumptions when handwriting is unclear

### 📈 Literacy-Based Output

- Adjusts explanation complexity
- Balances simplicity and accuracy

## 🏗️ Project Structure

```text
Med-Simplifier/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── lib/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── services/
│
└── .env files
```

## ⚡ Quick Start

### 1. Install dependencies

```bash
npm install
cd backend && npm install
```

### 2. Setup environment variables

Frontend (`.env.local`)

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Backend (`backend/.env`)

```env
PORT=8082
MONGO_URI=mongodb://127.0.0.1:27017/scan-scribe
JWT_SECRET=your_secret
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Run the project

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run backend:start
```

## 🔄 How It Works

- User uploads text, file, image, or URL
- Backend extracts medical content
- Gemini simplifies the content
- Output is displayed in structured format
- Data can be saved to the user dashboard

## ⚠️ Known Limitations

- OCR struggles with messy handwriting
- Gemini API has rate limits
- Prescription parsing may still be approximate
- Mixed MongoDB and Firebase architecture

## 🚀 Future Improvements

- Better OCR preprocessing
- Medicine database integration
- Multilingual support
- Push notifications for reminders
- Full migration to Firebase or backend for cleaner architecture

## 🎯 Why This Project Stands Out

- Solves a real-world medical understanding problem
- Combines AI with full-stack development
- Supports multiple medical input types
- Provides a personalized user experience

## 📌 Conclusion

Med Simplifier combines AI, full-stack development, and healthcare usability to create a practical tool that simplifies medical information while preserving accuracy.
