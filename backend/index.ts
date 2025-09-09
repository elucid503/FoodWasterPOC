import express from "express";

import config from "./config.json" assert { type: "json" };

// Server Initialization

const app = express();

// Routes

app.get("/", (_req, res) => {

    // Main Page

    res.sendFile("/frontend/app.html", { root: "." });

});

// Starting Server

app.listen(config.server.port, () => {

    console.log(`Running backend on port ${config.server.port}`);

});