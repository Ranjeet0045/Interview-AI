<div align="center">

# ⚡ Interview AI

### AI-Powered Interview Preparation Platform

*Turn any job posting into a tailored interview plan — questions, answers, skill gaps, and a day-by-day roadmap built for you.*

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

---

</div>

## 📸 Screenshots

<!-- Add your screenshots below. Replace the placeholder paths with your actual screenshot paths. -->

<div align="center">

### 🔐 Login Page
<!-- ![Login Page](./screenshots/login.png) -->
> *Screenshot coming soon*

### 📝 Register Page
<!-- ![Register Page](./screenshots/register.png) -->
> *Screenshot coming soon*

### 🏠 Dashboard / Home Page
<!-- ![Dashboard](./screenshots/dashboard.png) -->
> *Screenshot coming soon*

### 📊 Interview Report Page
<!-- ![Interview Report](./screenshots/interview-report.png) -->
> *Screenshot coming soon*

### 👤 Profile Page
<!-- ![Profile](./screenshots/profile.png) -->
> *Screenshot coming soon*

### 📱 Mobile Responsive View
<!-- ![Mobile View](./screenshots/mobile.png) -->
> *Screenshot coming soon*

</div>

---

## 🌟 Features

### Core Features
- **🤖 AI-Powered Report Generation** — Paste a job description and upload your resume (or write a brief self-description), and Gemini AI generates a comprehensive interview preparation report in ~30 seconds
- **🎯 Match Score** — Get an instant 0–100 match score showing how well your profile fits the target role
- **📋 Technical Questions** — Receive tailored technical interview questions with interviewer intentions and detailed expected answers
- **💬 Behavioral Questions** — Practice with behavioral/situational questions customized to the role and your background
- **🔍 Skill Gap Analysis** — Identify missing skills with severity levels (low / medium / high) so you know exactly where to focus
- **🗺️ Day-by-Day Roadmap** — Get a structured preparation plan with daily focus areas and actionable tasks
- **📄 AI Resume Generator** — Download a professionally formatted, ATS-friendly resume PDF generated from your data and the job description

### User Experience
- **🔐 Secure Authentication** — Register, login, and logout with JWT-based cookie authentication and token blacklisting
- **👤 Profile Management** — View and edit your profile information with real-time updates
- **📂 Report History** — Access all your previously generated interview plans from the dashboard
- **🗑️ Report Deletion** — Delete outdated reports with a confirmation modal to prevent accidental deletions
- **📱 Fully Responsive** — Works seamlessly on desktop, tablet, and mobile devices
- **🎨 Premium Dark UI** — Modern dark navy theme with glassmorphism, coral-purple gradient accents, and smooth micro-animations
- **⚡ Fast & Lightweight** — Built on Vite 8 for near-instant hot module replacement during development

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library with hooks and context API |
| **React Router 7** | Client-side routing with protected routes |
| **Vite 8** | Build tool and development server |
| **SASS/SCSS** | Styling with variables, mixins, and nesting |
| **Axios** | HTTP client for API communication |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express 5** | Web framework for REST API |
| **MongoDB + Mongoose 9** | Database and ODM |
| **Google Gemini AI** | AI model for report & resume generation |
| **JWT + bcryptjs** | Authentication and password hashing |
| **Multer** | File upload handling (resume PDF/DOCX) |
| **pdf-parse** | PDF text extraction from uploaded resumes |
| **Puppeteer** | HTML-to-PDF conversion for resume generation |
| **Zod** | Schema validation |

---

## 📁 Folder Structure

```
Interview_ai/
├── Backend/
│   ├── server.js                          # Entry point — starts Express server on port 3000
│   ├── package.json                       # Backend dependencies and scripts
│   ├── .env                               # Environment variables (MongoDB URI, JWT secret, Gemini API key)
│   ├── public/                            # Static assets
│   └── src/
│       ├── app.js                         # Express app setup — middleware, CORS, route mounting
│       ├── config/
│       │   └── database.js                # MongoDB connection via Mongoose
│       ├── controllers/
│       │   ├── auth.controller.js         # Register, login, logout, getMe, updateProfile handlers
│       │   └── interview.controller.js    # Generate report, get reports, delete, resume PDF handlers
│       ├── middlewares/
│       │   ├── auth.middleware.js          # JWT verification middleware (cookie-based)
│       │   └── file.middleware.js          # Multer config for resume file uploads
│       ├── models/
│       │   ├── user.model.js              # User schema (username, email, password)
│       │   ├── interviewReport.model.js   # Interview report schema (questions, gaps, roadmap, etc.)
│       │   └── blacklist.model.js         # Token blacklist for secure logout
│       ├── routes/
│       │   ├── auth.routes.js             # Auth endpoints: /register, /login, /logout, /get-me, /update-profile
│       │   └── interview.routes.js        # Interview endpoints: generate, get, delete, resume PDF
│       └── services/
│           └── ai.service.js              # Google Gemini AI integration — report & resume generation
│
├── Frontend/
│   ├── index.html                         # HTML entry point with Google Fonts and meta tags
│   ├── package.json                       # Frontend dependencies and scripts
│   ├── vite.config.js                     # Vite configuration with React plugin
│   ├── public/                            # Static public assets (favicon, etc.)
│   ├── dist/                              # Production build output
│   └── src/
│       ├── main.jsx                       # React entry — renders <App /> into DOM
│       ├── App.jsx                        # Root component — wraps providers around RouterProvider
│       ├── App.css                        # Legacy CSS (minimal, mostly unused)
│       ├── index.css                      # CSS custom properties and base styles
│       ├── style.scss                     # Global SCSS — resets, keyframes, animation utilities, loading spinner
│       ├── style/
│       │   └── button.scss                # Shared button component styles (primary, ghost)
│       ├── styles/
│       │   └── _theme.scss                # 🎨 Design tokens — colors, shadows, radii, typography, mixins
│       ├── app.routes.jsx                 # Route definitions with protected route wrappers
│       ├── components/
│       │   └── layout/
│       │       ├── AppShell.jsx           # App layout — navbar, profile dropdown, footer, <Outlet />
│       │       └── appShell.scss          # AppShell styles — glassmorphism navbar, dark footer
│       └── features/
│           ├── auth/
│           │   ├── auth.context.js        # Auth context creation (createContext)
│           │   ├── auth.context.jsx       # AuthProvider — user state management
│           │   ├── auth.form.scss         # Login/Register page styles — split panel layout
│           │   ├── auth.profile.scss      # Profile page styles — glass card, avatar, toast
│           │   ├── components/
│           │   │   └── Protected.jsx      # Route guard — redirects to /login if not authenticated
│           │   ├── hooks/
│           │   │   └── useAuth.js         # Auth hook — login, register, logout, updateProfile, getMe
│           │   ├── pages/
│           │   │   ├── Login.jsx          # Login page with email/password form
│           │   │   ├── Register.jsx       # Registration page with username/email/password form
│           │   │   └── Profile.jsx        # Profile page with view/edit mode and toast notifications
│           │   └── services/
│           │       └── auth.api.js        # Auth API calls via Axios (register, login, logout, getMe, updateProfile)
│           └── interview/
│               ├── interview.context.js   # Interview context creation (createContext)
│               ├── interview.context.jsx  # InterviewProvider — report/reports state management
│               ├── components/
│               │   └── UI/
│               │       ├── JobDescriptionSection.jsx   # Job description textarea with char counter
│               │       └── UserProfileSection.jsx      # Resume upload + self-description + generate button
│               ├── hooks/
│               │   └── useInterview.js    # Interview hook — generate, getById, getAll, delete, downloadResume
│               ├── pages/
│               │   ├── Home.jsx           # Dashboard — hero section, create plan form, recent reports list
│               │   └── interview.jsx      # Report viewer — sidebar nav, Q&A accordion, roadmap, skill gaps
│               ├── services/
│               │   └── interview.api.js   # Interview API calls via Axios (CRUD + resume PDF)
│               └── style/
│                   ├── style.scss         # Home/Dashboard page styles — hero, cards, reports, modal, toast
│                   └── interview.scss     # Interview report page styles — 3-column layout, question cards
│
└── README.md                              # ← You are here
```

---

## ⚙️ Prerequisites

Before you begin, make sure you have the following installed on your machine:

| Requirement | Version | Download |
|---|---|---|
| **Node.js** | v18.x or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | v9.x or higher | Comes with Node.js |
| **MongoDB** | Atlas (cloud) or local | [mongodb.com](https://www.mongodb.com/atlas) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **Google Gemini API Key** | — | [ai.google.dev](https://ai.google.dev/) |

> **Note:** Puppeteer (used for PDF generation) will automatically download a compatible Chromium binary during `npm install`.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Interview_ai.git
cd Interview_ai
```

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd Backend

# Install dependencies
npm install

# Create environment file
# Create a .env file in the Backend/ directory with the following variables:
```

Create a `.env` file inside the `Backend/` folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GOOGLE_GENAI_API_KEY=your_google_gemini_api_key
```

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string (Atlas recommended). Example: `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | A random secret string for signing JWT tokens. Generate one using `openssl rand -hex 32` |
| `GOOGLE_GENAI_API_KEY` | Your Google Gemini API key from [Google AI Studio](https://ai.google.dev/) |

```bash
# Start the backend development server
npm run dev
```

The backend server will start on **http://localhost:3000**

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to the frontend directory
cd Frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on **http://localhost:5173** (or the next available port)

### 4. Open the App

Visit **http://localhost:5173** in your browser. You should see the Interview AI login page.

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | ❌ Public |
| `POST` | `/api/auth/login` | Login with email & password | ❌ Public |
| `GET` | `/api/auth/logout` | Logout and blacklist token | ❌ Public |
| `GET` | `/api/auth/get-me` | Get current user details | ✅ Protected |
| `PUT` | `/api/auth/update-profile` | Update username and email | ✅ Protected |

### Interview Reports (`/api/interview`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/interview/` | Generate a new interview report (accepts `resume` file + `jobDescription` + `selfDescription`) | ✅ Protected |
| `GET` | `/api/interview/` | Get all reports for the logged-in user | ✅ Protected |
| `GET` | `/api/interview/report/:interviewId` | Get a specific report by ID | ✅ Protected |
| `DELETE` | `/api/interview/:interviewId` | Delete a specific report | ✅ Protected |
| `GET` | `/api/interview/resume/pdf/:interviewId` | Generate and download an AI-crafted resume as PDF | ✅ Protected |

---

## 📊 Data Models

### User
```javascript
{
  username: String,      // Unique
  email: String,         // Unique
  password: String       // Hashed with bcryptjs
}
```

### Interview Report
```javascript
{
  title: String,                    // Auto-generated report title
  jobDescription: String,           // Original job posting text
  resume: String,                   // Extracted resume text (if uploaded)
  selfDescription: String,          // User's self-description
  matchScore: Number,               // 0–100 match score
  technicalQuestions: [{             // AI-generated technical Q&A
    question: String,
    intention: String,
    answer: String
  }],
  behavioralQuestions: [{            // AI-generated behavioral Q&A
    question: String,
    intention: String,
    answer: String
  }],
  skillGaps: [{                      // Identified skill gaps
    skill: String,
    severity: "low" | "medium" | "high"
  }],
  preparationPlan: [{                // Day-by-day roadmap
    day: Number,
    focus: String,
    tasks: [String]
  }],
  user: ObjectId,                    // Reference to User
  createdAt: Date,                   // Auto-generated timestamp
  updatedAt: Date                    // Auto-generated timestamp
}
```

---

## 🎨 Design System

The UI follows a **premium dark theme** design language:

| Token | Value | Usage |
|---|---|---|
| Background | `#0a0e1a` | Page backgrounds |
| Elevated | `#111827` | Navbar, footer |
| Card | `#1a1f2e` | Cards, panels |
| Primary Text | `#f1f5f9` | Headings, body text |
| Secondary Text | `#94a3b8` | Descriptions, labels |
| Accent Coral | `#ff6b35` | Primary CTAs, highlights |
| Accent Purple | `#8b5cf6` | Gradients, secondary accents |
| Font | Plus Jakarta Sans | All typography (400–800) |

### Animations
- **Fade In Up** — Page sections, cards
- **Gradient Shift** — Auth brand panel background
- **Pulse Glow** — CTA hover effects
- **Staggered Reveals** — Hero cards with delays
- **Glassmorphism** — `backdrop-filter: blur(20px)` on cards and navbar

---

## 🧪 Available Scripts

### Frontend (`/Frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Create optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check for code issues |

### Backend (`/Backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (auto-restart on changes) |

---

## 🔄 How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│    Frontend     │────▶│    Backend API   │────▶│   Google Gemini │
│  (React + Vite) │◀────│  (Express + JWT) │◀────│       AI        │
│                 │     │                  │     │                 │
└─────────────────┘     └────────┬─────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │                  │
                        │     MongoDB      │
                        │   (Atlas/Local)  │
                        │                  │
                        └──────────────────┘
```

1. **User** pastes a job description and uploads a resume (or writes a self-description)
2. **Frontend** sends the data to the Express API via Axios with cookie-based auth
3. **Backend** extracts text from the resume PDF using `pdf-parse`
4. **Backend** sends the combined data to **Google Gemini AI** with a structured prompt
5. **Gemini** returns a structured JSON response with match score, questions, gaps, and roadmap
6. **Backend** validates and saves the report to **MongoDB**, then returns it to the frontend
7. **Frontend** renders the report with an interactive 3-column layout

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow the existing code style and folder structure
- Write meaningful commit messages
- Test your changes before submitting a PR
- Update documentation if you add new features

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) — For powering the intelligent interview report generation
- [React](https://react.dev/) — For the component-based UI architecture
- [Vite](https://vitejs.dev/) — For the blazing-fast development experience
- [MongoDB Atlas](https://www.mongodb.com/atlas) — For reliable cloud database hosting
- [Puppeteer](https://pptr.dev/) — For server-side PDF generation

---

<div align="center">

**Built with ❤️ and AI**

⭐ Star this repository if you find it useful!

</div>
