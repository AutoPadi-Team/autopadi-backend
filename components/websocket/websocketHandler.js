const h3 = require("h3-js");
const User = require("../models/usersModel");
const UrgentRequest = require("../models/urgentRequestModel");
const connectedMechanics = new Map(); // store mechanic socket id
const connectedDrivers = new Map(); // store driver socket id

const websocketHandler = async (socket) => {
  // register mechanics
  socket.on("register:mechanics", async ({ mechanicId, lat, lon }) => {
    // store mechanic socket id
    connectedMechanics.set(mechanicId, socket.id);
    // update mechanic h3 index
    const user = await User.findByIdAndUpdate(
      mechanicId,
      {
        h3Index: h3.latLngToCell(parseFloat(lat), parseFloat(lon), 8),
        // location: {
        //   lat: parseFloat(lat),
        //   lon: parseFloat(lon),
        // },
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
    // update driver h3 index
    const user = await User.findByIdAndUpdate(
      driverId,
      {
        h3Index: h3.latLngToCell(parseFloat(lat), parseFloat(lon), 8),
        // location: {
        //   lat: parseFloat(lat),
        //   lon: parseFloat(lon),
        // },
      },
      { new: true },
    );
    console.log(
      `Drivers connected to socket - ${JSON.stringify(driverId, null, 2)}, updated h3Index: ${user.h3Index}`,
    );
  });

  // update mechanic location every seconds
  socket.on("update:mechanic-location", async ({ mechanicId, lat, lon, activeRequestId }) => {
    try {
      connectedMechanics.set(mechanicId, socket.id);
      // update mechanic location
      const user = await User.findByIdAndUpdate(
        mechanicId,
        {
          location: {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
          },
        },
        { new: true },
      );

      let etaMinutes = null;
      // check if mechanic has an active accepted urgent request
      const urgentRequest = await UrgentRequest.findById(activeRequestId);
      if (urgentRequest && urgentRequest.status === "accepted") {
        // estimated time of arrival calculation 
        const driver = await User.findById(urgentRequest.driverId);
        const stepDistanceHex = h3.gridDistance(user.h3Index, driver.h3Index);
        const metersDistance = stepDistanceHex * 650; // approx. meters distance per hex at res 8
        const speedMinutes = 16.67 * 30; // avg speed of 16.67 m/min (1 km in 60 mins)
        etaMinutes = Math.floor(parseFloat(metersDistance) / parseFloat(speedMinutes));
        console.log(`DH3: ${driver.h3Index} MH3: ${user.h3Index} - hex: ${stepDistanceHex}`);
        

        // emit mechanic location to driver
        const driverSocketId = connectedDrivers.get(urgentRequest.driverId.toString());
        if (driverSocketId) {
          socket.to(driverSocketId).emit("mechanic:request-current-location", {
            mechanicId,
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            etaMinutes: etaMinutes,
          });
        } 
      };

      console.log(`Mechanics location updated: ${user.location} : ${etaMinutes} minutes`);
    } catch (error) {
      console.log(`Error updating mechanic location: ${error.message}`);
    }
  });

  // update driver location every seconds
  socket.on("update:driver-location", async ({ driverId, lat, lon, activeRequestId }) => {
    try {
      // store driver socket id
      connectedDrivers.set(driverId, socket.id);
      // update driver location
      const user = await User.findByIdAndUpdate(
        driverId,
        {
          location: {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
          },
        },
        { new: true },
      );
  
      let etaMinutes = null;
      // check if mechanic has an active accepted urgent request
      const urgentRequest = await UrgentRequest.findById(activeRequestId);
      if (urgentRequest && urgentRequest.status === "accepted") {
        const updateUrgentRequest = await UrgentRequest.findByIdAndUpdate(
          activeRequestId,
          {
            location: {
              lat: parseFloat(lat),
              lon: parseFloat(lon),
            },
          },
          { new: true },
        );
        // estimated time of arrival calculation 
        const mechanic = await User.findById(updateUrgentRequest.mechanicId);
        const stepDistanceHex = h3.gridDistance(user.h3Index, mechanic.h3Index);
        const metersDistance = stepDistanceHex * 650; // approx. meters distance per hex at res 8
        const speedMinutes = 16.67 * 30; // avg speed of 16.67 m/min (1 km in 60 mins)
        etaMinutes = Math.floor(parseFloat(metersDistance) / parseFloat(speedMinutes));

        // emit driver location to mechanic
        const driverSocketId = connectedMechanics.get(urgentRequest.mechanicId.toString());
        if (driverSocketId) {
          socket.to(driverSocketId).emit("driver:request-current-location", {
            driverId,
            lat: updateUrgentRequest.location.lat,
            lon: updateUrgentRequest.location.lon,
            etaMinutes: etaMinutes,
          });
        }
      }
      console.log(`Drivers location updated: ${user.location} : ${etaMinutes} minutes`);
    } catch (error) {
      console.log(`Error updating driver location: ${error.message}`);
    }
  });

  // handle disconnect
  socket.on("disconnect", () => {
    try {
      // disconnect mechanics
      connectedMechanics.forEach(async (sid, mid) => {
        //delete mechanic from connectedMechanics map
        if (sid === socket.id) {
          connectedMechanics.delete(mid);
        }
        // reset mechanic h3 index and location on disconnect
        const user = await User.findByIdAndUpdate(
          mid,
          {
            h3Index: null,
            location: {
              lat: 0,
              lon: 0,
            },
          },
          { new: true },
        );
        console.log(
          `Mechanic disconnected and updated ${user.h3Index} and location: ${user.location}`,
        );
      });

      // disconnect drivers
      connectedDrivers.forEach(async (sid, did) => {
        //delete driver from connectedDrivers map
        if (sid === socket.id) {
          connectedDrivers.delete(did);
        }
        // reset driver h3 index and location on disconnect
        const user = await User.findByIdAndUpdate(
          did,
          {
            h3Index: null,
            location: {
              lat: 0,
              lon: 0,
            },
          },
          { new: true },
        );
        console.log(
          `Driver disconnected and updated h3 index ${user.h3Index} and location: ${user.location}`,
        );
      });
      console.error(`User disconnected: ${socket.id}`);
    } catch (error) {
      throw new Error(`Error on disconnect: ${error.message}`);
    }
  });
};

module.exports = { websocketHandler, connectedMechanics, connectedDrivers };
