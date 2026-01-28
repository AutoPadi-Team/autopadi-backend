const h3 = require("h3-js");
const User = require("../models/usersModel");
const connectedMechanics = new Map(); // store mechanic socket id
const connectedDrivers = new Map(); // store driver socket id

const websocketHandler = async (socket) => {
  // register mechanics
  socket.on("register:mechanics", async ({ mechanicId, lat, lon }) => {
    connectedMechanics.set(mechanicId, socket.id);
    const user = await User.findByIdAndUpdate(
      mechanicId,
      {
        h3Index: h3.latLngToCell(parseFloat(lat), parseFloat(lon), 8),
      },
      { new: true },
    );
    console.log(
      `Mechanics connected to socket - ${JSON.stringify(mechanicId, null, 2)} and updated h3Index: ${user.h3Index}`,
    );
  });

  // register drivers
  socket.on("register:drivers", async ({ driverId, lat, lon }) => {
    connectedDrivers.set(driverId, socket.id);
    console.log(`Drivers connected to socket - ${driverId}`);
  });

  socket.on("disconnect", async () => {
    // disconnect mechanics
    connectedMechanics.forEach(async (sid, mid) => {
      if (sid === socket.id) {
        connectedMechanics.delete(mid);
      }
      const user = await User.findByIdAndUpdate(
        mid,
        {
          h3Index: "",
        },
        { new: true },
      );
      console.log(`Mechanic disconnected and updated ${user.h3Index}`);
    });

    // disconnect drivers
    connectedDrivers.forEach((sid, mid) => {
      if (sid === socket.id) {
        connectedDrivers.delete(mid);
      }
    });
    console.error(`User disconnected: ${socket.id}`);
  });
};

module.exports = { websocketHandler, connectedMechanics, connectedDrivers };
