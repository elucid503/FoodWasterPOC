import express from "express";

import {

    buildPushPayload,
    type PushSubscription,
    type PushMessage,
  
} from '@block65/webcrypto-web-push';

import config from "./config.json" assert { type: "json" };

// Server Initialization

const app = express();

app.use(express.static("../frontend")); // required for frontend resolving assets/out

// Logging Middleware

app.use((req, _res, next) => {

    console.log(`${req.method} ${req.url}`);

    next();

});

const getSubs = async (): Promise<PushSubscription[]> => {

    return await Bun.file("./subs.json").json().catch(() => []) as PushSubscription[];

}

const addSub = async (sub: PushSubscription) => {

    const existingSubs = await getSubs();
    existingSubs.push(sub);

    await Bun.write("./subs.json", JSON.stringify(existingSubs, null, 4));

}

const removeSub = async (sub: PushSubscription) => {

    const existingSubs = await getSubs();
    const filteredSubs = existingSubs.filter(s => s.endpoint != sub.endpoint);

    await Bun.write("./subs.json", JSON.stringify(filteredSubs, null, 4));

};

app.post("/subscribe", express.json(), async (req, res) => {

    const sub = req.body.sub as PushSubscription;

    if (!sub || !sub.endpoint) return res.status(400).end();

    await addSub(sub);

    res.status(201).end();

});

app.post("/notify", express.json(), async (req, res) => {

    // for now, just sends a delayed push notif to all subs after n ms (specified in config)
    
    setTimeout(async () => {

        const allSubs = await getSubs();

        const notifPayload: PushMessage = {

            data: {

                "web_push": 8030,

                "notification": {

                    "title":   "Test Notification",
                    "body":    "This is a test notification from the Food Waster proof-of-concept app. These notifications can be sent at any time, even when the app is closed!",
                    "silent":  false,
                    "navigate": "https://foodwasterpoc.sprout.software",

                },

            }

        };
        
        allSubs.forEach(async (sub) => {

            const payload = await buildPushPayload(notifPayload, sub, {

                subject: "mailto:sprout@sprout.software",
                publicKey: config.vapid.public,
                privateKey: config.vapid.private,

            });

            const res = await fetch(sub.endpoint, payload);

            if (res.status == 410 || res.status == 404) {

                console.warn("Removing subscription");

                // subscription is no longer valid

                await removeSub(sub);

            }

            console.log(`Notification sent. Status: ${res.status}`);

        });

    }, config.testing.notificationTimeout);

    res.status(200).end();

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