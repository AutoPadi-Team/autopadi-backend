const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./components/dbconfig/dbConfig");
const userRoutes = require("./components/routes/userRoute");
const vehicleRoutes = require("./components/routes/vehicleRoute");
const profileRoute = require("./components/routes/profileRoute");
const businessProfileRoute = require("./components/routes/businessProfileRoute");
const connectRoute = require("./components/routes/connectRoute");
const adminServicePlanRoute = require('./components/routes/adminServicePlanRoute');
const mechanicServicePlanRoute = require('./components/routes/mechanicServicePlanRoute');
const adminPremiumPlanRoute = require('./components/routes/adminPremiumPlanRoute');
const brandServiceListRoute = require('./components/routes/brandServiceListRoute');
const locationRoute = require('./components/routes/locationRoute');
const dotenv = require("dotenv");
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Use user routes
app.use("/api", userRoutes);
app.use("/api", vehicleRoutes);
app.use("/api", profileRoute);
app.use("/api", businessProfileRoute);
app.use("/api", connectRoute);
app.use("/api", adminServicePlanRoute);
app.use("/api", adminPremiumPlanRoute);
app.use("/api", mechanicServicePlanRoute);
app.use("/api", brandServiceListRoute);
app.use("/api", locationRoute);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "AutoPadi server running successfully."});
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
