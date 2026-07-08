# Code Reviewer - AI-Powered Code Analysis Tool

An intelligent code analysis platform. This tool provides real-time code conversion, debugging, and quality analysis with a modern React frontend and Express backend.

## Features

✨ **Code Conversion** - Convert code between programming languages  
🐛 **Code Debugger** - Identify bugs, syntax errors, and runtime issues  
✅ **Code Quality Analysis** - Get comprehensive code quality reports  
⚡ **Real-time Processing** - Instant AI-powered analysis  
🎨 **Modern UI** - Built with React + Chakra UI + Ace Editor  

## Tech Stack

**Frontend:**
- React 18 + Vite
- Chakra UI (Component library)
- React Ace (Code editor)
- Framer Motion (Animations)
- Axios (API client)

**Backend:**
- Node.js + Express
- Google Generative AI (@google/generative-ai)
- CORS enabled
- Environment variable support

## Project Structure

```
code-reviewer/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Main application component
│   │   ├── main.jsx            # React entry point
│   │   ├── theme.js            # Chakra UI theme config
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── api/
│   │   │   └── index.js        # API client
│   │   ├── components/
│   │   │   └── CodeEditor.jsx  # Ace editor component
│   │   └── constants/
│   │       └── index.js        # Language modes & constants
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                     # Express backend API
│   ├── index.js                # Main server & endpoints
│   ├── .env                    # Environment variables
│   └── package.json
│
└── package.json                # Root monorepo config
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Google Generative AI API key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd code-reviewer
```

2. Install all dependencies:
```bash
npm run install-all
```

3. Set up your Gemini API key in `backend/.env`:
```env
GEMINI_API_KEY=your_api_key_here
PORT=8000
```

### Running the Project

Start both frontend and backend concurrently:
```bash
npm start
```

Or run them separately:
```bash
# Terminal 1 - Backend (runs on port 8000)
npm run start:backend

# Terminal 2 - Frontend (runs on port 5173)
npm run start:frontend
```

**Frontend:** http://localhost:5173/  
**Backend:** http://localhost:8000/

## API Endpoints

### `/convert` - Code Conversion
Converts code from one programming language to another.

**Method:** `POST`

**Request Body:**
```json
{
  "code": "function add(a, b) {\n  return a + b;\n}",
  "fromLanguage": "JavaScript",
  "toLanguage": "Python"
}
```

**Response:**
```json
{
  "convertedCode": "def add(a, b):\n    return a + b"
}
```

### `/debug` - Code Debugging
Analyzes code for bugs, syntax errors, and runtime issues.

**Method:** `POST`

**Request Body:**
```json
{
  "code": "let x = 10\nlet y = x + 'string';"
}
```

**Response:**
```json
{
  "hasErrors": true,
  "bugs": [
    {
      "line": 2,
      "severity": "High",
      "description": "Type coercion issue: number + string will result in string concatenation, not addition"
    }
  ],
  "explanation": "The code has a type coercion issue...",
  "fixedCode": "let x = 10\nlet y = x + 5;"
}
```

### `/codeQuality` - Code Quality Analysis
Provides comprehensive quality assessment of the code.

**Method:** `POST`

**Request Body:**
```json
{
  "code": "function add(a, b) {\n  return a + b;\n}"
}
```

**Response:**
```json
{
  "qualityReport": "Code Quality Report:\n\n1. Readability: Excellent...\n2. Naming: Clear and descriptive...",
  "score": 85
}
```

## Custom API Key (Frontend)

Users can provide their own Gemini API key via the frontend settings modal. The key is passed through the `x-api-key` header in requests.

## Environment Variables

**Backend (.env):**
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=8000
```

## Available Scripts

```bash
npm run install-all        # Install dependencies for all packages
npm start                  # Start backend and frontend concurrently
npm run start:backend      # Start backend only
npm run start:frontend     # Start frontend only (dev mode with HMR)
```

## Notes

- The free tier of Google Generative AI has a rate limit of **20 requests per day**
- For unlimited usage, upgrade to a paid plan or provide your own API key
- The frontend supports multiple code languages: JavaScript, TypeScript, Python, Java, C++, Go, Rust, and more
- Code blocks are parsed and cleaned automatically from AI responses
