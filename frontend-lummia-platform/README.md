# Lummia Platform Frontend

> User interface for the LUMMIA gamified educational platform.  
> A Single Page Application (SPA) built with Vanilla JavaScript, Tailwind CSS, and Vite.

---

## Technologies

| Technology | Role |
|---|---|
| **Vanilla JavaScript (ES6+)** | Core application logic and DOM manipulation without heavy frameworks |
| **Vite** | Fast frontend tooling and development server |
| **Tailwind CSS** | Utility-first styling framework |
| **Socket.IO Client** | WebSocket communication for real-time features |
| **Font Awesome 6** | System iconography |
| **Google Fonts (Inter)** | Main typography |

---

## Key Features & Views

### Authentication
Login and registration system with JWT session management.

### Dashboard
Personalized overview featuring user level, XP progress bar, recent courses, and a social activity feed.

### Course Academy
Categorized video courses (Python, HTML/CSS, JS, SQL) with horizontal scroll. Includes an integrated YouTube player with interactive quizzes that grant XP.

### Skill Tree
Node-based progression map showing locked, available, and completed learning modules.

### Focus Hub (Pomodoro)
Productivity timer with Work and Break phases. Includes task management and a global floating widget visible across the platform.

### Clan System
Real-time WebSocket chat room for clan members, roster display, and a global clan XP leaderboard.

### User Profile
Display of user statistics, unlocked achievements grid, rank, and account settings.

### AI Tutor (Capybara)
Always-available AI assistant panel powered by Google Gemini, designed to guide students through coding problems.

### Admin Panel
Complete CRUD interface for managing users, videos, posts, cohorts, and clans. Includes content moderation tools *(restricted to admin/tech lead roles)*.

---

## Dynamic Theming System

The application supports three global visual themes that persist in `localStorage`:

| Theme | Description |
|---|---|
| **Neon** | Dark background with purple/fuchsia accents and glowing effects |
| **Black** | Pure black background with subtle borders and high contrast |
| **White** | Light background with dark text and clean borders |

The theme engine operates on three layers:
1. **CSS Variables** — defined in the global stylesheet
2. **Tailwind Custom Colors** — mapped in the config
3. **Dynamic CSS Overrides** — injected via JavaScript for specific element adjustments

---

## Architecture & Routing

The project uses a custom **Feature-Sliced Design** pattern with a **hash-based router**.

### Routing Table

| Route | View |
|---|---|
| `#/login` | Authentication |
| `#/home` | Dashboard |
| `#/courses` | Course Academy |
| `#/video/<id>` | Video Player & Quiz |
| `#/skills` | Skill Tree |
| `#/pomodoro` | Focus Hub |
| `#/clan` | Clan & Real-time Chat |
| `#/profile` | User Profile |
| `#/admin` | Administration Panel |

### API Client & State

All backend communication passes through a centralized API client. It automatically attaches the **JWT Bearer token** from `sessionStorage` to every request and handles global error states, such as redirecting unauthenticated users when a `401` response is received.

---

## Project Structure

```
├── public/
│   └── assets/          # Static images, animations, and icons
└── src/
    ├── api/             # Centralized API client modules
    ├── components/      # Reusable stateless UI elements (layout, global timer widget)
    ├── features/        # Core logic blocks with state (navigation, AI tutor, pomodoro engine)
    ├── utils/           # System utilities (router, state management, theme manager, level-up animations)
    ├── views/           # View controllers — HTML templates and page-specific logic
    └── styles/          # Global CSS, animations, and Tailwind directives
```

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd frontend-lummia-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Start the development server

```bash
npm run dev
```

---

## License

This project is part of the LUMMIA educational platform. All rights reserved.