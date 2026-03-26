# Scan Scribe Backend

This backend powers the Scan Scribe mobile app, providing content scanning, rewriting, and health literacy assessment services.

## Features
- File upload and processing (photos, PDFs, Word documents)
- URL content processing
- Readability assessment (Flesch-Kincaid)
- Modular, scalable architecture
- RESTful API for frontend integration
- Real-time request handling
- Error handling and data security

## API Endpoints
- `POST /api/upload` — Upload and process a file or image (PDF, Word, image with OCR)
- `POST /api/url` — Process and extract text from a URL
- `POST /api/analyze` — Analyze text readability and suggest literacy level
- `POST /api/rewrite` — Rewrite text at a chosen literacy level (AI-ready)
- `GET /api/health` — Health check

## Setup
1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up your `.env` file (see `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/scan-scribe
   ```
3. Start the server:
   ```sh
   npm start
   ```

## Folder Structure
- `models/` — Mongoose models
- `routes/` — Express route handlers
- `services/` — File/URL processing logic
- `utils/` — Readability and helper utilities
- `uploads/` — Uploaded files

## Security
- Input validation and error handling on all endpoints
- Environment variables for sensitive config

## Readability Levels
- Doctor-Level: Most complex, for medical professionals
- Patient-Friendly: Simplified for general patients
- Low Literacy: Most accessible, for low health literacy

## Notes
- OCR for images is powered by Tesseract.js.
- For advanced rewriting, connect to a language model API (OpenAI, Hugging Face, etc.).
