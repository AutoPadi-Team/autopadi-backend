

exports.websocketHandler = async (socket) => {
    socket.on("new-message", (data) => {
      console.log(`User received: ${data}`);
    });

    socket.emit("server-broadcast", { message: "Hello there" })

    socket.on("disconnect", () => {
        console.error("User disconnected");
    });
};