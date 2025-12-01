/* Archivo Node.js para manejar el signaling de WebRTC */
/* servidor Socket.io independiente que escuchará en el puerto 4000 */

import { Server } from "socket.io";
import http from "http";

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // podés restringirlo a tu dominio Next.js después
    methods: ["GET", "POST"]
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

// CAMBIAR ESTA LÍNEA - Escuchar en todas las interfaces de red
server.listen(4000, '0.0.0.0', () => {
  console.log("✅ Servidor de signaling WebRTC corriendo en:");
  console.log("   - http://localhost:4000");
  console.log("   - http://[TU-IP-LOCAL]:4000");
  console.log("   - Accesible desde la red local");
});