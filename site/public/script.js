const home = () => {
    const time = document.querySelector("#Time");
    const update = () => {
        const now = new Date();
        const str = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        time.textContent = str;
    };

    update(); //Instant
    setInterval(update, 1000);

    const mood = document.querySelector("#Mood");
    const moods = ["Bored", "Excited", "Drippy", "Pissed Off", "Dead", "Crazy", "Distracted"];

    mood.textContent = moods[Math.floor(Math.random() * moods.length)];

    const words = ["Penguins184.", "a Developer.", "a Tinkerer.", "a Minecrafter.", "a Self-hoster.", "a Pianist."];
    let index = 0;
    let char = 0;
    let deleting = false;
    const target = document.querySelector("#typewriter");

    const type = () => {
        const word = words[index];
  
        if (deleting) {
            target.textContent = word.substring(0, char - 1);
            char--;
        } else {
            target.textContent = word.substring(0, char + 1);
            char++;
        }
        let speed = deleting ? 50 : 150;

        if (!deleting && char === word.length) {
            speed = 2000; 
            deleting = true;
        } else if (deleting && char === 0) {
            deleting = false;
            index = (index + 1) % words.length; //Restart
            speed = 500;
        }

        setTimeout(type, speed);
    };

    type();

    const quotes = [
        "It needs a little more spice. Maybe a little paprika? <br><br>- Tokita, Paprika (2006)",
        "See this is why I hate you <br><br>- Hackerdude (2025)",
        "No! No way! Come on! I'm going to die right here and now! I want to die with you guys! <br><br>- Kamome, Paranoia Agent (2004)",
        "Kira is childish and hates losing... I'm also childish and hate losing <br><br>- L, Death Note (2006)",
        "Why are you such a nerdy nerd? <br><br>- ShamanNS (2025)",
        "Hey, Vsauce! Michael here. <br><br>- Michael Stevens (Daily)",
        "Philosophy is basically thinking about thinking, which sounds like a waste of time, because it is... <br><br>- Philomena Cunk (2022)",
        "Talk is cheap, send patches. <br><br>- FFMPEG (2024)",
        "How the hell has your package manager increased my binary size by 10Mb? <br><br>- Huckle (2026)"
    ];

    document.querySelector("#Quote").innerHTML = quotes[Math.floor(Math.random() * quotes.length)];
};

home();
document.addEventListener("turbo:render", () => {
    if (window.location.pathname === "/") {
        home();
    }
});

const show = (id) => {
    const windows = document.querySelectorAll(".window");
    windows.forEach(win => win.classList.add("hidden"));

    const target = document.getElementById(id);
    if (target) {
        document.title = `Penguins184 | ${id === "Main" ? "Home" : id}`;
        target.classList.remove("hidden");
    }
};

//I Was Sleepy... IGNORE
let loaded = 10;
const format = (ms) => {
    const date = new Date(ms);
    return date.toLocaleTimeString("en-GB", { hour12: false });
};

const status = (text, color = "red") => {
    const el = document.querySelector("#Status");
    el.textContent = text;
    el.style = `color: ${color};`;

    setTimeout(() => { el.textContent = "Waiting..."; el.style = ""; }, 2000);
}

const guestbook = async (limit = loaded) => {
    const response = await fetch(`/guestbook?limit=${limit}`);
    const data = await response.json();

    const container = document.querySelector("#Messages");
    container.innerHTML = "";

    data.forEach((message) => {
        const el = document.createElement("p");
        el.textContent = `[${format(message.time)}] ${message.author}: ${message.message}`;
        container.append(el);
    });
};

guestbook();

const message = async () => {
    const response = await fetch("/guestbook", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            author: document.querySelector("#name").value,
            message: document.querySelector("#message").value
        })
    });

    const data = await response.json();

    if(data.success) {
        guestbook(loaded);
        document.querySelector("#message").value = ""; //Reset

        //Feedback
        status("Message Sent!", "green");
    } else {
        status(data.error);
    };
};

const load = () => {
    loaded += 5;
    guestbook(loaded);
};