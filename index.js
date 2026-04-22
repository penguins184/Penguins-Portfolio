import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { Redis } from "@upstash/redis";
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";
import "dotenv/config";

const app = express(); 
app.use(express.json());
app.use(cors());
app.use(express.static("src"));

app.use((e, req, res, next) => {
    if (e instanceof SyntaxError && err.status === 400 && "body" in e) {
        return res.status(400).json({ error: "Invalid JSON Format!" });
    }
    next();
});

app.use((req, res) => {
    res.status(404).sendFile(process.cwd() + "/src/404.html");
});

//Initialise
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const limiter = rateLimit({ //Standard Stuff
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Rate Limited!" }
}); 

app.post("/guestbook", limiter, async (req, res) => { //Add Entry
    try {
        const { author, message } = req.body;

        //Checks
        if(!typeof author === "string" || !typeof message === "string") return res.status(400).json({ error: "Invalid Datatype!" });
        if (!author || !message) return res.status(400).json({ error: "Missing Fields!" });
        if (!author.trim() || !message.trim()) return res.status(400).json({ error: "Empty Content!" });
        if (author.length > 12 || message.length > 48) return res.status(400).json({ error: "Author/Message Too Long!" });
        if (matcher.hasMatch(author) || matcher.hasMatch(message)) return res.status(400).json({ error: "Inappropriate Content!" });

        const entry = {
            id: crypto.randomUUID(),
            author,
            message,
            time: Date.now()
        };

        await redis.lpush("guestbook", JSON.stringify(entry));
        await redis.ltrim("guestbook", 0, 99); //100 Entries

        res.json({ success: true });
    } catch(e) {
        console.error(e);
        res.status(500).json({ error: "Internal Error! :(" });
    };
});

app.get("/guestbook", async (req, res) => { //Retrieve Entries
    try {
        const limit = parseInt(req.query.limit) || 10;

        const data = await redis.lrange("guestbook", 0, limit - 1);
        const entries = data.map(e => typeof e === "string" ? JSON.parse(e) : e); //Why? Not Sure

        res.json(entries);
    } catch(e) {
        console.error(e);
        res.status(500).json({ error: "Internal Error! :(" });
    };
});

app.get("/", async (req, res) => {
    res.sendFile(process.cwd() + "/src/index.html");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on Port ${port}!`);
});
