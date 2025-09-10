import express from "express";

import config from "./config.json" assert { type: "json" };

// Server Initialization

const app = express();

app.use(express.static("../frontend")); // required for frontend resolving assets/out

// Logging Middleware

app.use((req, _res, next) => {

    console.log(`${req.method} ${req.url}`);

    next();

});

// Routes

app.get("/", (_req, res) => {

    // Main Page

    res.sendFile("/frontend/app.html", { root: ".." }); // important: if ran from top level dir using ./start.sh, root must be set to ..

});

// Starting Server

app.listen(config.server.port, () => {

    console.log(`Running backend on port ${config.server.port}`);

});