const mongoose = require('mongoose');

exports.connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URL);
      console.log(`MongoDB connected: ${conn.connection.host}`);

    //     const h3 = require("h3-js");
    //     const driverH3Index = h3.latLngToCell(5.6667502896655595, -0.1564148363370406, 8);
    //   const nearbyH3Indexes = h3.gridDisk(driverH3Index, 2);
    //   // log(`Near by locations: ${nearbyH3Indexes}`);

    //   // migration of field
    //   const done = await mongoose.connection.collection("users").updateMany(
    //     {},
    //     {
    //       $set: { h3Index: nearbyH3Indexes[0] },
    //     },
    //   );
    //   console.log(`Data: ${JSON.stringify(done, null, 2)}`);
    } catch (error) {
        console.log(`Error connecting to database: ${error.message}`);
        process.exit(1);
    }
}