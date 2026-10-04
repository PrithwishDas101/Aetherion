# Aetherion

Aetherion is a real-time messaging platform built with the MERN stack and Socket.IO.

It focuses on fast communication, persistent conversations, authentication, and real-time updates while exploring practical full-stack architecture.

## Features

- Real-time one-to-one messaging with Socket.IO
- Persistent chats and message history
- JWT-based authentication
- Contact and connection management
- Profile pictures and profile customization
- Poll creation and real-time poll updates
- Media and document sharing through Cloudinary
- Reply-to-message support
- Typing and presence updates
- Production deployment with Vercel and Render

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express
- Socket.IO
- MongoDB / Mongoose
- JWT
- Cloudinary

## Project Structure

```text
Aetherion/
├── client/   # React + Vite frontend
└── server/   # Express + Socket.IO backend
```

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/PrithwishDas101/Aetherion.git
cd Aetherion
```

### 2. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 3. Configure environment variables

Create the required environment files from the provided examples and supply your own development credentials.

Do not commit real secrets, tokens, database credentials, or third-party API keys.

### 4. Start the backend

```bash
cd server
npm run dev
```

### 5. Start the frontend

In another terminal:

```bash
cd client
npm run dev
```

The frontend and backend URLs are configured through the project's environment variables.

## Production

The current deployment uses:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB
- **Media:** Cloudinary

## Development Notes

Aetherion is an actively evolving project. Security hardening, realtime lifecycle handling, deployment reliability, and data-integrity improvements are treated as first-class parts of development.

## License

No license has currently been declared for this repository.
