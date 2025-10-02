# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An AI-powered image processing web application with four core features:
1. **Image Compression** - Client-side compression using `browser-image-compression`
2. **Background Removal** - Using Remove.bg API
3. **Image Recognition** - Using Volcano Engine (火山引擎) multimodal API
4. **AI Image Generation** - Using Volcano Engine image generation API

## Commands

### Frontend (Vite + React)
- **Development**: `npm run dev` - Starts Vite dev server on http://localhost:5179
- **Build**: `npm run build` - TypeScript compilation + production build
- **Lint**: `npm run lint` - ESLint checks
- **Preview**: `npm run preview` - Preview production build

### Backend (Express)
- **Production**: `cd server && npm start` - Runs server on http://localhost:3001
- **Development**: `cd server && npm run dev` - Auto-reloads on file changes

### Running Full Stack
Start both servers separately:
1. Terminal 1: `npm run dev` (frontend)
2. Terminal 2: `cd server && npm run dev` (backend)

## Architecture

### Frontend Structure
- **Router**: React Router v6 with page-based routing in `src/App.tsx`
- **Pages**: Each feature is a separate page component in `src/pages/`
  - `Home.tsx` - Landing page with navigation cards
  - `Compress.tsx` - Image compression (client-side only)
  - `RemoveBg.tsx` - Background removal (calls `/api/remove-bg`)
  - `Recognize.tsx` - Image recognition (calls `/api/recognize`)
  - `AIGenerate.tsx` - AI image generation (calls `/api/generate-image`)

### Backend Proxy Server
Located in `server/` directory - Acts as a proxy to protect API keys.

**Endpoints**:
- `POST /api/remove-bg` - Remove.bg API proxy
  - Accepts: `{ imageBase64: string }` (with data URI prefix)
  - Returns: `{ success: boolean, image: string }` (base64 with prefix)

- `POST /api/recognize` - Volcano Engine vision API proxy
  - Accepts: `{ imageBase64: string }` (with data URI prefix)
  - Returns: `{ success: boolean, result: string }`

- `POST /api/generate-image` - Volcano Engine image generation proxy
  - Accepts: `{ prompt: string }`
  - Returns: `{ success: boolean, imageUrl: string }`

### Environment Variables
API keys stored in `.env.local` (root directory, not committed to git):
- `REMOVE_BG_API_KEY` - Remove.bg API key
- `ARK_API_KEY` - Volcano Engine API key

The backend server loads these from `../.env.local` relative to `server/` directory.

## Image Format Handling

**Critical**: Different APIs expect different base64 formats:
- **Remove.bg**: Expects base64 **without** data URI prefix (strips `data:image/png;base64,`)
- **Volcano Engine (Recognition)**: Expects base64 **with** data URI prefix (`data:image/png;base64,xxx`)
- **Volcano Engine (Generation)**: Returns image URL, not base64

All frontend-to-backend communication uses complete data URIs (with prefix).

## Development Workflow

### Current Development Stage
See `DEVELOPMENT_PLAN.md` for detailed roadmap. Project follows staged development:
- Stage 0: ✅ Backend proxy setup complete
- Stage 1: 🔄 Image compression (implemented, needs verification)
- Stage 2-4: 📝 Background removal, recognition, AI generation (planned)

### Git Commit Strategy
Each feature stage gets its own commit with descriptive message:
- Use `feat:` prefix for new features
- Commit after each stage completion
- See DEVELOPMENT_PLAN.md for suggested commit messages

## Tech Stack Details

**Frontend**:
- React 18 + TypeScript
- Vite for build tooling
- React Router DOM v6
- Tailwind CSS for styling
- Key libraries: `browser-image-compression`, `@imgly/background-removal`, `tesseract.js`

**Backend**:
- Express.js 5
- Axios for HTTP requests
- CORS enabled for frontend communication
- FormData for multipart requests (Remove.bg)
- Request body size limit: 50MB (for large images)

## Notes

- Frontend and backend run on different ports - CORS is configured
- All API calls require try-catch error handling
- Image compression is entirely client-side (no backend needed)
- Background removal, recognition, and generation require backend proxy for API key security
