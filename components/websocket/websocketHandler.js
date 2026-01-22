const connectedMechanics = new Map(); // store mechanic socket id
const connectedDrivers = new Map(); // store driver socket id


const websocketHandler = async (socket) => {
    // register mechanics
    socket.on("register:mechanics", (mechanicId) => {
        connectedMechanics.set(mechanicId, socket.id);
        console.log(`Mechanics connected to socket - ${mechanicId}`);
    });

    // register drivers
    socket.on("register:drivers", (driverId) => {
        connectedDrivers.set(driverId, socket.id);
        console.log(`Drivers connected to socket - ${driverId}`);
    });

    socket.on("disconnect", () => {
        // disconnect mechanics
        connectedMechanics.forEach((sid, mid) => {
            if(sid === socket.id){
                connectedMechanics.delete(mid);
            }
        })

        // disconnect drivers
        connectedDrivers.forEach((sid, mid) => {
            if(sid === socket.id){
                connectedDrivers.delete(mid);
            }
        })
        
        console.error(`User disconnected: ${socket.id}`);
    });
};

module.exports = { websocketHandler, connectedMechanics, connectedDrivers };