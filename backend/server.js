const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");
require("dotenv").config();

const app = express();
app.use(
  cors({
    origin: ["https://navratridandiya.netlify.app", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use("/api", bookingRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
