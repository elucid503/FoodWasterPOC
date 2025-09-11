import $ from "jquery";

// Quick Check if Already Subscribed

const pushMan = ("pushManager" in window ? window.pushManager : null) as PushManager | null;

if (!pushMan) {

    console.warn("Push Manager not supported");
    $("#subscribe").attr("disabled", "").find("span").text("Push Not Supported");

}

// Utils for encoding keys

const urlBase64ToUint8Array = (base64: string) => {

    const padding = "=".repeat((4 - base64.length % 4) % 4);
  
    const res = (base64 + padding).replace(/\-/g, "+").replace(/_/g, "/");

    return Uint8Array.from([...atob(res)].map(char => char.charCodeAt(0)));
    
}

// Notification Subscribe Button

const updateSubscribeButton = async () => {

    const existingSub = await pushMan?.getSubscription().catch(() => { });

    $("#subscribe").attr("mode", existingSub ? "unsubscribe" : "subscribe").find("span").text(`${existingSub ? "Unsubscribe from" : "Subscribe to"} Notifications`);

}

updateSubscribeButton(); // initial state

$("#subscribe").on("click", async () => {

    if (!pushMan) return;

    const mode = $("#subscribe").attr("mode") as "subscribe" | "unsubscribe";

    if (mode == "subscribe") {

        const permission = await Notification.requestPermission().catch(() => "denied");

        if (permission != "granted") return alert("You need to allow notifications to subscribe.");

        const newSub = await pushMan.subscribe({

            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array("BL253OvYzN_eeh7aI3zPIL8_PdvYoxc9Dxj0KcpksRm8o_gXjflIcfj0I6wFFJ5iSPEn00LeE3at1nbSZOAqm6E"), // hard coded here; in config.json on backend
            
        }).catch(() => null);
        
        if (!newSub) return alert("Subscription failed. Error: No subscription object.");

        await fetch("/subscribe", {

            method: "POST",
            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({sub: newSub.toJSON()}), // backend just gets body as sub. no validation for now ;)

        }).then(res => {

            if (!res.ok) throw new Error("Subscription failed. Error: request non-200.");

        }).catch(() => alert("Subscription failed. Error: request failed."));

        updateSubscribeButton();

    } else {

        const currentSub = await pushMan.getSubscription()

        await currentSub?.unsubscribe().catch(() => { });

        updateSubscribeButton();
        
    }

})

$("#notify").on("click", async () => {

    const resp = await fetch("/notify", {
        
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})

    }).catch(() => {

        alert("Notification scheduling failed. Error: request failed.");

    });

    if (!resp || !resp.ok) return alert("Notification scheduling failed. Error: request non-200.");

    $("#notify").attr("disabled", "").find("span").text("Notification Scheduled");

    setTimeout(() => {

        $("#notify").removeAttr("disabled").find("span").text("Schedule a Notification");

    }, 5_000); // 5s cooldown

});