import { Server } from "socket.io";
let io;
export const initSocket = (server) => {
    io = new Server(server, { cors: { origin: "*" } });
    io.on("connection", (socket) => {
        socket.on("join-assignment", (id) => socket.join(id));
    });
    return io;
};
export const emitAssignmentUpdate = (assignmentId, payload) => {
    io?.to(assignmentId).emit("assignment:update", payload);
};
