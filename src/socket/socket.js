import {io} from "socket.io-client";

// io() creates a WebSocket connection to the backend.
const socket = io("http://localhost:3000");

export default socket;

