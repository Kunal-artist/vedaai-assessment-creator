import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, { cors: { origin: "*" } });
  io.on("connection", (socket) => {
    socket.on("join-assignment", (id: string) => socket.join(id));
  });
  return io;
};

export const emitAssignmentUpdate = (assignmentId: string, payload: Record<string, unknown>) => {
  io?.to(assignmentId).emit("assignment:update", payload);
};
