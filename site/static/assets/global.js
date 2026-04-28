(() => {
    const update = () => {
        const time = document.querySelector("#Time");
        if (!time) return;
        const now = new Date();
        time.textContent = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    };

    if (!window.interval) {
        setInterval(update, 1000);
        window.interval = true;
    }

    document.addEventListener("turbo:load", update);
})();
