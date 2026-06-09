require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.get("/test", async (req, res) => {

    try {

        const response =
            await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: "Give one hint for Two Sum."
            });

        res.send(response.text);

    } catch (error) {

        console.error(error);

        res.status(500).send(
            "Gemini request failed"
        );
    }
});
app.post("/hint", async (req, res) => {

    try {

        const {
            title,
            topics,
            description
        } = req.body;

        console.log("TITLE:");
        console.log(title);

        console.log("TOPICS:");
        console.log(topics);

        console.log("DESCRIPTION:");
        console.log(description.substring(0, 200));

        const prompt = `
You are a DSA mentor.

Rules:
- Do NOT provide code.
- Do NOT reveal the solution.
- Do NOT mention any algorithm by name.
- Do NOT mention any data structure by name.
- Give exactly ONE hint.
- Keep it under 60 words.

Problem Title:
${title}

Topics:
${topics?.join(", ")}

Problem Statement:
${description}
`;

        const response =
            await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt
            });

        res.json({
            hint: response.text
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            hint: "Failed to generate hint."
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});