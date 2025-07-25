import { io } from "socket.io-client";
// export const socket = io("http://localhost:3001"); // Update later for production
export const socket = io(import.meta.env.VITE_BACKEND_URL); // if using Vite
