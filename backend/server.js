/* Archivo Node.js para manejar el signaling de WebRTC */
/* servidor Socket.io independiente que escuchará en el puerto 4000 */

import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// 3. Agregar endpoint de health check:
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "WebRTC Signaling Server" });
});

const io = new Server(server, {

  // 2. Restringir CORS a dominios específicos:
  cors: {
    origin: [
      'http://localhost:3000',
      'https://getskillswap.com',
      'https://skill-swap-repo.vercel.app'
    ],
    methods: ['GET', 'POST'],
  }
});

io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado:", socket.id);

  socket.on("offer", (data) => {
    console.log("📨 Offer recibido, haciendo broadcast...");
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log("📨 Answer recibido, haciendo broadcast...");
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    socket.broadcast.emit("ice-candidate", data);
  });

  socket.on("end-call", (data) => {
    console.log("🔴 End-call recibido, haciendo broadcast...", data);
    socket.broadcast.emit("end-call", data); // Broadcast a todos los demás clientes
  })

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// 1. Usar process.env.PORT en lugar de puerto fijo, para compatibilidad con Railway:
const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log("✅ Servidor de signaling WebRTC corriendo en:");
  console.log("   - http://localhost:4000");
  console.log("   - http://[TU-IP-LOCAL]:4000");
  console.log("   - Accesible desde la red local");
});