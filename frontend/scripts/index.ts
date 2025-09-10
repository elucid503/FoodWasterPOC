import $ from "jquery";

// Quick Check if Already Subscribed

const pushMan = ("pushManager" in window ? window.pushManager : null) as PushManager | null;

if (!pushMan) {

    console.warn("Push Manager not supported");
    $("#subscribe").attr("disabled", "").find("span").text("Push Not Supported");

}

// Notification Subscribe Button

const updateSubscribeButton = async () => {

    const existingSub = await pushMan?.getSubscription().catch(() => { });

    $("#subscribe").attr("mode", existingSub ? "unsubscribe" : "subscribe").find("span").text(`${existingSub ? "Subscribe to" : "Unsubscribe from"} Notifications`);

}

$("#subscribe").on("click", async () => {

    if (!pushMan) return;

    const mode = $("#subscribe").attr("mode") as "subscribe" | "unsubscribe";

    if (mode == "subscribe") {

        const permission = await Notification.requestPermission().catch(() => "denied");

        if (permission != "granted") return alert("You need to allow notifications to subscribe.");

        const newSub = await pushMan.subscribe({

            userVisibleOnly: true,
            applicationServerKey: "",
            
        }).catch(() => null);

        if (!newSub) return alert("Subscription failed.");

        updateSubscribeButton();

    } else {

        const currentSub = await pushMan.getSubscription()

        currentSub?.unsubscribe().catch(() => { });

        updateSubscribeButton();
        
    }

})