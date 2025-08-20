const express = require("express");
const cors = require("cors");
const { connectDB } = require("./components/dbconfig/dbConfig");
const userRoutes = require("./components/routes/userRoute");
const vehicleRoutes = require("./components/routes/vehicleRoute");
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

app.get("/", (req, res) => {
  res.json({ message: "AutoPadi server running successfully."});
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
