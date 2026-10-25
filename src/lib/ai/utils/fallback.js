/**
 * AI Chat Fallback Utility
 * Provides natural, controlled responses when AI fails or produces invalid output.
 */

const fallbackResponses = {
  casual: [
    "Got your message. I’ll pass this to the business now.",
    "I’ll let the business handle this one.",
    "I'm making sure the team sees this right away.",
    "I'll hand this over to a human to give you the best answer.",
    "One moment, I'm fetching someone from the team for you.",
    "I've received your message and notified the owner.",
    "That's a good question. I'll let the experts here handle it.",
    "I'm passing your request to the team so they can assist you better."
  ],
  formal: [
    "Thank you for your message. I am forwarding this to our team for a more detailed response.",
    "I've logged your request and notified the business owner.",
    "Our team has been notified and will get back to you shortly.",
    "I will escalate this to a representative to assist you further.",
    "Your inquiry has been received. A member of our staff will respond soon.",
    "I have shared your message with the management team for their attention.",
    "An expert from our team will review your message and reach out.",
    "We have received your query and will provide an update as soon as possible."
  ]
};

/**
 * Returns a random fallback response based on the business tone.
 * @param {string} tone - 'formal' or 'casual' (default)
 * @returns {string}
 */
export function getFallbackResponse(tone = 'casual') {
  const category = (tone && tone.toLowerCase() === 'formal') ? 'formal' : 'casual';
  const responses = fallbackResponses[category];
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
}

/**
 * Validates an AI response to ensure it's high quality and not an error.
 * @param {string} text - The AI generated text
 * @returns {boolean} - True if valid, false if fallback should be triggered
 */
export function validateAIResponse(text) {
  if (!text || typeof text !== 'string') return false;
  
  const trimmed = text.trim();
  
  // 1. Minimum length check
  if (trimmed.length < 5) return false;
  
  // 2. Error-like text detection (case insensitive)
  const errorWords = [
    'error', 'failed', 'cannot respond', 'unable to', 'try again', 
    'trouble responding', 'something went wrong', 'api error', 
    'rate limit', 'model error', 'invalid response'
  ];
  
  const lowerText = trimmed.toLowerCase();
  for (const word of errorWords) {
    if (lowerText.includes(word)) return false;
  }
  
  // 3. Gibberish or incomplete sentence check (simplistic)
  if (trimmed.split(' ').length < 2) return false;
  
  return true;
}
