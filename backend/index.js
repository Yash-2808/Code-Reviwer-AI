const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Helper function to initialize Gemini client per request (to support header-based API keys)
function getGeminiClient(req) {
	const apiKey = req.headers["x-api-key"] || process.env.GEMINI_API_KEY;
	if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY") {
		throw new Error("API_KEY_MISSING");
	}
	return new GoogleGenerativeAI(apiKey);
}

// Helper to call Gemini and get text response
async function generateContent(genAI, systemPrompt, userPrompt) {
	const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
	const result = await model.generateContent({
		contents: [
			{
				role: "user",
				parts: [{ text: `${systemPrompt}\n\n---\n\nUser Input:\n${userPrompt}` }],
			},
		],
		generationConfig: {
			temperature: 0.3,
		},
	});
	return result.response.text();
}

app.get("/", (req, res) => {
	res.send("Welcome to the Code Reviewer backend API server 🎉 (Powered by Google Gemini)");
});

app.post("/convert", async (req, res) => {
	try {
		const { code, fromLanguage, toLanguage } = req.body;
		if (!code) {
			return res.status(400).json({ error: "Code is required" });
		}

		const genAI = getGeminiClient(req);
		const systemPrompt = `You are an expert developer. Convert the provided code from ${fromLanguage || "auto-detect"} to ${toLanguage}.
Your response must contain ONLY the converted code inside a markdown code block. Do not provide explanations, notes, or introductions outside the code block.`;

		const responseText = await generateContent(genAI, systemPrompt, code);

		let convertedCode = responseText.trim();
		// Strip markdown code block wrappers if they exist
		if (convertedCode.startsWith("```")) {
			const lines = convertedCode.split("\n");
			if (lines[0].startsWith("```")) {
				lines.shift();
			}
			if (lines[lines.length - 1] === "```") {
				lines.pop();
			}
			convertedCode = lines.join("\n");
		}

		res.json({ convertedCode });
	} catch (error) {
		console.error("Convert Error:", error.message);
		if (error.message === "API_KEY_MISSING") {
			return res.status(401).json({ error: "Gemini API key is missing. Please set it in the backend .env or provide it in the frontend settings." });
		}
		res.status(500).json({ error: error.message || "Something went wrong during conversion" });
	}
});

app.post("/debug", async (req, res) => {
	try {
		const { code } = req.body;
		if (!code) {
			return res.status(400).json({ error: "Code is required" });
		}

		const genAI = getGeminiClient(req);
		const systemPrompt = `You are an expert debugger. Analyze the provided code for actual syntax errors, logical bugs, runtime failures, and compiler issues.
You must respond with ONLY a valid JSON object (no markdown, no code fences, no extra text) containing the following keys:
- "hasErrors": boolean (set to true ONLY if there are functional bugs, syntax errors, or runtime issues. If the code is correct or just has stylistic variances, set this to false)
- "bugs": an array of objects, where each object has:
  - "line": number or null (approximate line number of the issue)
  - "severity": string ("High", "Medium", "Low")
  - "description": string (short description of the issue)
- "explanation": string (markdown-formatted detailed explanation of why the code failed and how the fixes resolve the issues. If no errors are found, state that the code is clean)
- "fixedCode": string (the fixed code. CRITICAL: Do NOT make unnecessary changes to variable names, indentation, spacing, comments, or overall structure unless it is strictly required to resolve a bug. If no bugs are found, this must be EXACTLY identical to the original input code)`;

		const responseText = await generateContent(genAI, systemPrompt, code);

		// Strip any markdown code fences from the response
		let cleanedResponse = responseText.trim();
		if (cleanedResponse.startsWith("```")) {
			const lines = cleanedResponse.split("\n");
			if (lines[0].startsWith("```")) {
				lines.shift();
			}
			if (lines[lines.length - 1] === "```") {
				lines.pop();
			}
			cleanedResponse = lines.join("\n");
		}

		const debugInfo = JSON.parse(cleanedResponse);
		res.json({ debugInfo });
	} catch (error) {
		console.error("Debug Error:", error.message);
		if (error.message === "API_KEY_MISSING") {
			return res.status(401).json({ error: "Gemini API key is missing. Please set it in the backend .env or provide it in the frontend settings." });
		}
		res.status(500).json({ error: error.message || "Something went wrong during debugging" });
	}
});

app.post("/codeQuality", async (req, res) => {
	try {
		const { code } = req.body;
		if (!code) {
			return res.status(400).json({ error: "Code is required" });
		}

		const genAI = getGeminiClient(req);
		const systemPrompt = `You are an expert code quality reviewer. Analyze the provided code for readability, performance (efficiency), security, and compliance with best practices.
You must respond with ONLY a valid JSON object (no markdown, no code fences, no extra text) containing the following keys:
- "score": number (an overall score between 0 and 100)
- "categories": an object with keys: "readability", "efficiency", "security", "bestPractices". Each category must have:
  - "score": number (0 to 10)
  - "feedback": string (brief explanation of the score and suggestions)
- "improvements": array of strings (actionable items to improve the code)
- "summary": string (a short markdown-formatted summary of the review)`;

		const responseText = await generateContent(genAI, systemPrompt, code);

		// Strip any markdown code fences from the response
		let cleanedResponse = responseText.trim();
		if (cleanedResponse.startsWith("```")) {
			const lines = cleanedResponse.split("\n");
			if (lines[0].startsWith("```")) {
				lines.shift();
			}
			if (lines[lines.length - 1] === "```") {
				lines.pop();
			}
			cleanedResponse = lines.join("\n");
		}

		const qualityReport = JSON.parse(cleanedResponse);
		res.json({ qualityReport });
	} catch (error) {
		console.error("Quality Check Error:", error.message);
		if (error.message === "API_KEY_MISSING") {
			return res.status(401).json({ error: "Gemini API key is missing. Please set it in the backend .env or provide it in the frontend settings." });
		}
		res.status(500).json({ error: error.message || "Something went wrong during quality check" });
	}
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
