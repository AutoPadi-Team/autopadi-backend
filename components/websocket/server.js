const socketIo = require("socket.io");
const { websocketHandler } = require("../websocket/websocketHandler");

let io;
// Handle web socket starter
exports.socketStarter = (server) => {
    io = socketIo(server, { 
      cors: {
        origin: "*"
      } 
    });

    io.on("connection", (socket)=> {
        console.error(`User connected: ${socket.id}`);
        websocketHandler(socket); // Send response to handler
    });
    return io;
};

// Send responses to client
exports.getIO = () => {
    if(!io){
        throw new Error("Socket not connected");
    }
    return io;
}