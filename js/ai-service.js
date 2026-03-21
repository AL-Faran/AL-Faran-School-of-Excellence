// ai-service.js - Master configuration and routing for AI Personas
// This acts as the backend logic wrapper for LIVE AI interactions via Gemini API

const AIService = {
    // Replace with environment variables in a real backend, but hardcoding for the frontend demo
    API_KEY: "AIzaSyAVQQMk9QV6MTgpOcSBVpPmXSrsuwhf_s8",
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",

    // Hardcoded System Instructions (Master Prompts)
    prompts: {
        scienceLab: "You are the Al-Faran AI Lab Assistant. Guide students through PhET simulations. Never give direct answers; instead, ask leading questions to encourage critical thinking. Relate all science concepts to real-life examples in Pakistan.",
        digitalSkills: "You are the Al-Faran Digital Skills Mentor. Focus on MS Office, Graphic Design, and Video Editing with AI integration. Teach automation and always push for project-based learning (e.g., creating flyers for a local mela or documentaries about Pakistani culture).",
        dailyChallenge: "You are an educational AI. Generate a simple, interactive 1-question 'AI Science Challenge' for a student based on their grade level. Keep the language very simple, fun, and easy to understand. Ensure the challenge asks something they can observe or do today (e.g. 'Can you find one example of gravity in your kitchen today? Explain it and earn a badge!'). Return exactly and only JSON in this format: {\"title\": \"Daily Science Challenge 🚀\", \"text\": \"<The Challenge Question>\", \"points\": 10}"
    },

    /**
     * Executes the API call to the Gemini 1.5 Flash Model
     */
    async _callGemini(systemInstruction, userMessage) {
        try {
            const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
                    },
                    contents: [{
                        role: "user",
                        parts: [{ text: userMessage }]
                    }],
                    generationConfig: {
                        temperature: 0.7
                    }
                })
            });
            const data = await response.json();

            if (data.candidates && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
            console.error("Unexpected Gemini API Response:", data);
            return "Sorry, I am having trouble connecting to my brain right now.";
        } catch (error) {
            console.error("Gemini API Network Error:", error);
            return "Connection error. Please check your internet and try again.";
        }
    },

    async askScienceLab(userMessage, contextData) {
        const fullPrompt = `Contextual Data about current experiment: ${JSON.stringify(contextData)}\n\nStudent asks: ${userMessage}`;
        return this._callGemini(this.prompts.scienceLab, fullPrompt);
    },

    async askDigitalSkills(userMessage) {
        return this._callGemini(this.prompts.digitalSkills, userMessage);
    },

    // Generates a daily challenge asynchronously
    async getDailyChallenge(gradeLevel) {
        console.log(`[AI Backend Logic] Requesting Live Gemini Challenge for ${gradeLevel}...`);
        const userPrompt = `Generate a daily challenge for a student in ${gradeLevel}. Remember to reply ONLY with valid JSON.`;

        const rawResponse = await this._callGemini(this.prompts.dailyChallenge, userPrompt);

        try {
            // Strip any accidental markdown formatting the LLM might append to the JSON
            const cleanStr = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            const challenge = JSON.parse(cleanStr);
            return challenge;
        } catch (e) {
            console.error("Failed to parse formulated Daily Challenge JSON:", e, rawResponse);
            // Safe fallback if the LLM hallucinated the JSON block
            return {
                title: "Daily Science Challenge 🚀",
                text: "Look around your kitchen. Why does water boil faster when you put a lid on the pot when making chai?",
                points: 10
            };
        }
    }
};
