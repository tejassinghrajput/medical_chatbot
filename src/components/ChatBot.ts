import axios from 'axios';

const API_KEY = 'YOUR-API-KEY-HERE';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const PREDEFINED_PROMPT = `You are a medical chatbot. Given a patient's description of their medical problem, suggest appropriate over-the-counter medicine or advise them to consult a doctor if the issue seems serious. Provide a concise response focusing only on the medical advice. Do not include any disclaimers or additional information. The medicine names should be only those which are available in India`;

const ChatBot = {
  async getMedicalAdvice(problem: string): Promise<string> {
    try {
      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [
                { text: `${PREDEFINED_PROMPT}\n\nPatient's problem: ${problem}` }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      return generatedText.trim();
    } catch (error) {
      console.error('Error fetching medical advice:', error);
      return 'Sorry, I couldn\'t process your request. Please try again later.';
    }
  },
};

export default ChatBot;
