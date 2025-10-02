import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello Ghostts");
});

app.get("/hello", (req, res) => {
  res.send("Hello from ghosts");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
