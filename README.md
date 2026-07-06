WILD SKETCH

DEPLOYED : https://wild-sketch.vercel.app

### NOTE
- Don't refresh the page or perform any action that reloads the page mid game, your socket.id will be changed.
- There must atleast be 2 players to start the game
- Trying to Enter mid-game after the host has Started the game might lock you in Lobby

This project is a multiplayer drawing and guessing game inspired by Scribble.io, where players take turns drawing a selected word while others try to guess it in real time. The game is designed to create an interactive and fun experience by combining creativity, communication, and competitive gameplay.
Players can join a game room, participate with multiple users simultaneously, and earn points based on how quickly and accurately they guess the drawing. The application provides a smooth real-time experience using a MERN stack architecture, enabling instant updates for drawings, messages, scores, and game events.

### Features
- Create room with configurable settings
- Join room via code
- Lobby with player list; host starts game
- Turn-based rounds: one drawer, others guess
- Real-time drawing sync (strokes visible to all)
- Word selection for drawer (3 choices)
- Guessing: type word, get points for correct guess
- Scoring and leaderboard
- Game end with winner
- Basic drawing tools: brush, colors, undo, clear
- Chat (guesses + general chat)
- Draw time countdown
- Eraser tool

### Tech Stack
- Frontend: React + JavaScript + Vite + Tailwind.css
- Canvas: HTML5 Canvas + react-icons + svgs
- Backend: Node.js + Express + dotenv
- WebSockets: Socket.IO
- Deployment : Render(Backend) and Vercel(Frontend)

### Clone the repository:
- git clone <repository-url>
- Move into the project directory:
  - cd project-name
- Install dependencies: npm install
- Environment Variables
- Create a .env file in the root directory and add:
  - PORT=3000
  - FRONTEND_URL : The_frontend_URL

### Running the Project
- Start backend:
  - cd server
  - node server.js
    
- Start frontend:
  - npm run dev

### Contributing
- Fork the repository
- Create a feature branch
- Commit your changes
- Push changes
- Create a Pull Request
