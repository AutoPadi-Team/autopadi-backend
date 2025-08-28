const express = require("express");
const cors = require("cors");
const { connectDB } = require("./components/dbconfig/dbConfig");
const userRoutes = require("./components/routes/userRoute");
const vehicleRoutes = require("./components/routes/vehicleRoute");
const profileRoute = require("./components/routes/profileRoute");
const businessProfileRoute = require("./components/routes/businessProfileRoute");
const connectRoute = require("./components/routes/connectRoute");
const adminServicePlanRoute = require('./components/routes/adminServicePlanRoute');
const mechanicServicePlanRoute = require('./components/routes/mechanicServicePlanRoute');
const dotenv = require("dotenv");
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

// Use user routes
app.use("/api", userRoutes);
app.use("/api", vehicleRoutes);
app.use("/api", profileRoute);
app.use("/api", businessProfileRoute);
app.use("/api", connectRoute);
app.use("/api", adminServicePlanRoute);
app.use("/api", mechanicServicePlanRoute);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "AutoPadi server running successfully."});
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
