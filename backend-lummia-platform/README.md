# LUMMIA Platform — Backend API

RESTful API and WebSocket server powering the LUMMIA gamified educational platform. Built with Python and Flask, it manages business logic, authentication, dual-database storage, and real-time communication.

---

## Technologies

| Technology | Role |
|---|---|
| **Python 3.12** | Core programming language |
| **Flask** | Web framework for the REST API |
| **Flask-SocketIO** | WebSocket integration for real-time features |
| **PostgreSQL (Neon)** | Relational database for structured data |
| **MongoDB Atlas** | NoSQL database for flexible document storage |
| **Google Gemini AI** | Engine for the interactive AI programming tutor |
| **PyJWT** | Token-based authentication |
| **bcrypt** | Secure password hashing |

---

## Architecture & Database Strategy

The system uses a modular **3-layer architecture** relying on Flask Blueprints to isolate domain logic.

It implements a **dual-database strategy** to optimize storage based on data requirements:

**PostgreSQL** — handles relational data requiring strict schemas and integrity: users, clans, cohorts, ranks, achievements, skill nodes, and video progress. Uses transient connections via `psycopg2`.

**MongoDB** — manages unstructured or high-volume document data: AI chat history, real-time clan messages, and daily pomodoro sessions. Uses a singleton connection pool via `pymongo`.

---

## Core Modules

**Authentication & Authorization** — JWT-based session management. Passwords are encrypted using bcrypt. Endpoints are protected via `@auth_required` and `@role_required` decorators (roles: `user`, `tech_lead`, `super_admin`).

**Gamification Engine** — centralized service that awards Expbara (XP) for completing videos, quizzes, and pomodoro sessions. Automatically recalculates user levels based on XP thresholds and grants system achievements.

**Content Management** — manages the Skill Tree progression, YouTube video integrations, and interactive quizzes. Validates completion to prevent duplicate XP rewards.

**Focus Hub (Pomodoro)** — API for managing daily study tasks and timer sessions, storing daily activity documents in MongoDB.

**Social Feed** — endpoints for creating posts, liking, commenting, and content moderation (approving/rejecting posts).

**AI Tutor Integration** — connects to the Google Gemini API using a strict system prompt that forces the AI to act as a Socratic programming tutor, guiding students without providing direct code solutions.

**Real-time Clan Chat** — uses Socket.IO rooms to broadcast messages instantly to clan members, with REST endpoints for retrieving historical messages from MongoDB.

**Admin Panel** — full CRUD endpoints for system administrators to manage users, assign cohorts and clans, and moderate platform content.

---

## Project Structure

```
backend/
├── app.py                          # Entry point — Flask + SocketIO init
├── requirements.txt                # Python dependencies
├── .env                            # Environment configuration
└── src/
    ├── config/
    │   ├── env.py                  # Environment variables parser
    │   └── database.py             # PostgreSQL and MongoDB connection handlers
    ├── middleware/
    │   └── auth_middleware.py      # JWT validation, bcrypt hashing, role decorators
    ├── routes/
    │   ├── auth_routes.py          # Login, registration, profile management
    │   ├── admin_routes.py         # User, cohort, and clan CRUD operations
    │   ├── content_routes.py       # Skill tree, video progress, quizzes
    │   ├── feed_routes.py          # Social posts, likes, comments
    │   ├── gamification_routes.py  # Leaderboards, rank definitions
    │   ├── achievement_routes.py   # Global and user-specific achievements
    │   ├── pomodoro_routes.py      # Task management for Focus Hub
    │   ├── chat_routes.py          # AI Tutor Gemini integration
    │   └── clan_chat_routes.py     # WebSocket events and REST chat history
    ├── services/
    │   └── gamification_service.py # Core logic for XP, leveling, and achievements
    └── utils/
        └── i18n.py                 # Localization dictionary
```

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd backend-lummia-platform
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv

# Windows:
venv\Scripts\activate

# Linux/Mac:
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:pass@host/dbname
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
JWT_SECRET=your_super_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
YOUTUBE_API_KEY=your_youtube_data_api_key
PORT=5000
```

### 5. Run the server

```bash
python app.py
```

The API will be available at `http://localhost:5000`.

---

## License

This project is part of the LUMMIA educational platform. All rights reserved.
