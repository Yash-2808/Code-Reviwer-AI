import axios from "axios";

const API = axios.create({
	baseURL: import.meta.env.VITE_APP_BACKEND_API || "http://localhost:8000",
});

// Automatically inject custom API key from localStorage if set by the user
API.interceptors.request.use((config) => {
	const userKey = localStorage.getItem("gemini_user_key");
	if (userKey) {
		config.headers["x-api-key"] = userKey;
	}
	return config;
});

export const getConvertedCode = async (code, fromLanguage, toLanguage) => {
	const response = await API.post("/convert", {
		code,
		fromLanguage,
		toLanguage,
	});
	return response;
};

export const getDebugResponse = async (code) => {
	const response = await API.post("/debug", { code });
	return response;
};

export const getQualityCheck = async (code) => {
	const response = await API.post("/codeQuality", { code });
	return response;
};
