# Aetherion

Aetherion is a full-stack, real-time messaging application focused on fast conversations, reliable message persistence, and a polished chat experience.

## Features

- Real-time messaging powered by Socket.IO
- User accounts and authenticated sessions
- Conversation and chat-list workflows
- Share images, GIFs, videos, and documents
- Reply to individual messages
- Emoji picker and expressive messaging UI
- Responsive React interface with client-side routing
- Conversation and application state managed through Redux Toolkit / React state stores
- MongoDB-backed persistence through Mongoose
- Cloudinary integration for media handling
- Server-side security controls, including Helmet, request rate limiting, file-type checks, and password hashing

Feature availability can depend on the current environment configuration and external services.

## Tech stack

**Client**
- React 19 + Vite
- React Router
- Tailwind CSS 3
- Redux Toolkit and React Redux
- Socket.IO Client
- Axios
- Lucide React and React Icons
- Recharts for supported visualizations

**Server**
- Node.js and Express 5
- Socket.IO
- MongoDB and Mongoose
- JWT authentication and bcryptjs
- Cloudinary and Multer
- Helmet, CORS, cookie-parser, and express-rate-limit

## Repository layout

```text
Aetherion/
├── client/    # React + Vite frontend
└── server/    # Express API and Socket.IO server
```

## Getting started

Requirements: Node.js, npm, a MongoDB database, and the credentials for any external services enabled in your setup.

Install dependencies in both applications:

```bash
git clone https://github.com/PrithwishDas101/Aetherion.git
cd Aetherion

cd server
npm install

cd ../client
npm install
```

Configure the server environment using the variable names expected by the server's configuration. Set the database connection, authentication secret, client/CORS origin, and any Cloudinary credentials required for media features. Keep secrets in a local environment file and never commit them.

Start the server in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd client
npm run dev
```

The client and server must be configured to point at one another's local URLs. Check the project's environment/configuration files for the exact ports and variable names before running the application.

## Available scripts

| Directory | Command | Purpose |
| --- | --- | --- |
| `server/` | `npm run dev` | Start the API with nodemon |
| `server/` | `npm start` | Start the API |
| `client/` | `npm run dev` | Start Vite |
| `client/` | `npm run build` | Build the frontend |
| `client/` | `npm run lint` | Run ESLint |
| `client/` | `npm run preview` | Preview the production build |

## Security and deployment notes

- Use strong, private secrets for JWT signing and database access.
- Restrict CORS to the intended frontend origins in production.
- Configure the media provider before expecting upload features to work.
- Keep the frontend API/socket URL and server origin settings aligned.
- Do not commit `.env` files, service credentials, or uploaded user content.

Aetherion is an actively evolving application; verify current environment keys and deployment settings in the source before deploying.

---

Built by [Prithwish Das](https://github.com/PrithwishDas101).