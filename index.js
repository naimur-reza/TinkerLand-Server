const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

// middle wares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Pump, Server is Running");
});

app.listen(port, () => {
  console.log("Server is running at port", port);
});
