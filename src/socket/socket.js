import {io} from "socket.io-client";

// io() creates a WebSocket connection to the backend.
const socket = io(import.meta.env.VITE_SOCKET_URL);

export default socket;

