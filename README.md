# Aetherion

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-20232A?style=for-the-badge&logo=nodedotjs&logoColor=339933" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-20232A?style=for-the-badge&logo=express&logoColor=ffffff" alt="Express" />
  <img src="https://img.shields.io/badge/Socket.IO-20232A?style=for-the-badge&logo=socketdotio&logoColor=ffffff" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/MongoDB-20232A?style=for-the-badge&logo=mongodb&logoColor=47A248" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Vercel-20232A?style=for-the-badge&logo=vercel&logoColor=ffffff" alt="Vercel" />
</p>

> **Real-time communication, built as a full-stack product.**

Aetherion is a real-time messaging platform designed and developed by **Prithwish Das**. It combines persistent conversations, live Socket.IO updates, expressive profiles, media sharing, polls, contacts, and production-ready authentication into one cohesive application.

The project was built from the ground up as a serious full-stack engineering project, with an emphasis on reliability, security, realtime behavior, and a polished user experience.

**Live application:** https://aetherion-lime.vercel.app/

---

## What is Aetherion?

Aetherion is built around the idea that messaging should feel immediate while still behaving like a reliable, persistent application.

Users can:

- Create and maintain conversations
- Send messages in real time
- Share images, GIFs, videos, and documents
- Reply to specific messages
- Share locations and contact cards
- Create and vote on polls
- See typing and presence updates
- Manage contacts and connections
- Customize profiles with pictures and avatar details
- View other users' public profile information

Under the hood, the application combines a React frontend, an Express API, MongoDB persistence, Socket.IO realtime communication, JWT authentication, and Cloudinary media storage.

---

## Features

### ◉ Real-time messaging

- Live one-to-one conversations with Socket.IO
- Persistent message history
- Realtime message delivery
- Typing indicators
- Online/offline presence
- Read/unread message state
- Reply-to-message support
- Chat previews and unread counts

### ◇ Rich messages

Aetherion supports more than plain text:

- Images
- GIFs
- Videos
- Documents
- Locations
- Contact cards
- Polls
- Message replies

Media is uploaded and managed through Cloudinary while message metadata and conversation state are persisted in MongoDB.

### ◌ Polls

Polls are treated as a realtime part of the conversation rather than a separate feature.

- Create polls directly inside chats
- Prevent duplicate options
- Vote on options
- Update vote counts in realtime
- Persist poll state in MongoDB
- Handle concurrent voting with atomic database updates

### ◎ Profiles and contacts

- Profile pictures
- Custom avatar presentation
- Profile customization
- Contact management
- Public contact profiles
- Server-authoritative shared contact information

### ⌁ Authentication and session handling

- JWT-based authentication
- Protected application routes
- Authentication bootstrap before rendering protected content
- Proper handling of invalid or expired sessions
- Realtime socket lifecycle tied to authenticated sessions
- Safe logout and session teardown

---

## Engineering Highlights

Aetherion is more than a collection of frontend screens. Several parts of the application were deliberately hardened around real failure cases.

### ◈ Data integrity

Message creation and chat metadata updates are designed to succeed or fail together through MongoDB transactions. This keeps message persistence, chat previews, and unread counts from drifting apart when a database operation fails.

Poll voting uses atomic MongoDB updates so simultaneous votes do not overwrite one another through a stale read-modify-write cycle.

### ◉ Realtime lifecycle

Socket.IO connections are treated as part of the authenticated session rather than as a permanently shared connection. Explicit logout and passive authentication expiry both tear down stale socket sessions.

### ◎ Server-authoritative data

Sensitive shared data is not blindly trusted from the client. For example, contact-card information is constructed from the authoritative user record on the server.

### ⛓ Failure handling

The backend avoids returning raw internal error details to clients. Media operations also account for failures across the Cloudinary and MongoDB boundary so failed database operations do not unnecessarily leave newly uploaded media behind.

### ▲ Production reliability

The project has been developed with real deployment constraints in mind, including:

- Vercel SPA routing
- Render backend deployment
- Production CORS configuration
- Environment-based configuration
- Linux case-sensitive filesystem compatibility
- Secure handling of environment secrets
- Database persistence through MongoDB Atlas

---

## Tech Stack

| Layer | Technologies |
| --- | --- |
| 🎨 Frontend | <img src="https://cdn.simpleicons.org/react/61DAFB" width="18" alt="React" /> React · <img src="https://cdn.simpleicons.org/vite/646CFF" width="18" alt="Vite" /> Vite · <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" width="18" alt="Tailwind CSS" /> Tailwind CSS |
| ⚡ API | <img src="https://cdn.simpleicons.org/nodedotjs/339933" width="18" alt="Node.js" /> Node.js · <img src="https://cdn.simpleicons.org/express/ffffff" width="18" alt="Express" /> Express |
| ⇄ Realtime | <img src="https://cdn.simpleicons.org/socketdotio/ffffff" width="18" alt="Socket.IO" /> Socket.IO |
| ◫ Database | <img src="https://cdn.simpleicons.org/mongodb/47A248" width="18" alt="MongoDB" /> MongoDB · Mongoose |
| ◈ Authentication | JWT |
| ↔ HTTP Client | <img src="https://cdn.simpleicons.org/axios/5A29E4" width="18" alt="Axios" /> Axios |
| ◇ Media Storage | <img src="https://cdn.simpleicons.org/cloudinary/3448C5" width="18" alt="Cloudinary" /> Cloudinary |
| ▲ Frontend Hosting | <img src="https://cdn.simpleicons.org/vercel/ffffff" width="18" alt="Vercel" /> Vercel |
| ▣ Backend Hosting | Render |

---

## Architecture

At a high level, Aetherion follows a client/API/realtime architecture:

```text
                    ┌──────────────────────┐
                    │      Aetherion       │
                    │    React + Vite      │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
             REST API                    Socket.IO
                 │                           │
                 ▼                           ▼
        ┌────────────────┐          ┌────────────────┐
        │ Express Server │          │ Realtime Layer │
        └───────┬────────┘          └───────┬────────┘
                │                           │
                └─────────────┬─────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ MongoDB / Mongoose│
                    └────────────────────┘

                    Media uploads
                         │
                         ▼
                    ┌───────────┐
                    │ Cloudinary│
                    └───────────┘
```

The frontend uses the HTTP API for persistent operations and Socket.IO for realtime events. MongoDB remains the source of truth for users, chats, messages, and polls, while Cloudinary handles uploaded media.

---

## Project Structure

```text
Aetherion/
├── client/
│   └── src/
│       ├── apiCalls/       # API communication
│       ├── components/     # Reusable UI and chat components
│       ├── pages/          # Application pages
│       ├── sockets/        # Socket.IO client setup
│       └── ...
│
├── server/
│   ├── config/             # Database and service configuration
│   ├── controllers/        # Request and business logic
│   ├── middleware/         # Authentication and request middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── services/           # External service integrations
│   └── ...
│
└── README.md
```

---

## Running Locally

### Prerequisites

- Node.js
- npm
- MongoDB / MongoDB Atlas database
- Cloudinary account for media functionality
- Any other third-party credentials required by the configured environment

### 1. Clone the repository

```bash
git clone https://github.com/PrithwishDas101/Aetherion.git
cd Aetherion
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

### 4. Configure environment variables

Create the environment files from the provided examples and add your own development credentials.

Never commit:

- Database credentials
- JWT secrets
- API keys
- Cloudinary credentials
- Other private tokens

### 5. Start the backend

```bash
cd server
npm run dev
```

### 6. Start the frontend

In another terminal:

```bash
cd client
npm run dev
```

The frontend and backend URLs are configured through environment variables.

---

## Production

Aetherion is deployed using:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Media:** Cloudinary

The production architecture separates the frontend, API/realtime backend, persistent database, and media storage so each service can handle the responsibility it is best suited for.

---

## Project Status

Aetherion is an actively evolving project.

Development focuses on:

- Realtime reliability
- Authentication and session security
- Data integrity
- Media handling
- Production stability
- UI/UX refinement
- New communication features

The goal is not simply to make the application work, but to keep improving how it behaves when real users, real networks, and real failures interact with it.

---

## Roadmap

Potential future improvements include:

- Group conversations
- More granular notification controls
- Expanded profile customization
- Additional realtime interaction features
- More comprehensive automated testing
- Further performance and observability improvements

---

## Author

**Prithwish Das**

Aetherion is a personal full-stack project designed, developed, and maintained by Prithwish Das.

The project represents an extended hands-on exploration of modern web application development across frontend engineering, backend APIs, databases, realtime systems, authentication, media infrastructure, deployment, and application security.

---

## License

No license has currently been declared for this repository.
