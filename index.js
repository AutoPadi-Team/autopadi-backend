const express = require("express");
const cors = require("cors");
const { connectDB } = require("./components/dbconfig/dbConfig");
const userRoutes = require("./components/routes/userRoute");
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

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
