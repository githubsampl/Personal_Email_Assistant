import { GoogleGenAI } from '@google/genai';
import type { Email, Status } from '../store/useAppStore';

const SYSTEM_PROMPT = `You are an email classification assistant. Given an email, determine its stage in the event registration lifecycle and return ONLY a valid JSON object with no extra text:
{ "event_name": "name of the event or program", "event_date": "date of the event if mentioned, else null", "status": "TO_REGISTER or APPROVED or WAITLISTED or REJECTED", "reason": "one sentence explaining why you classified it this way", "action_required": true or false, "registration_link": "URL to register if found in the email, else null" }

Classification rules:
- TO_REGISTER: The email is an INVITATION or announcement asking the reader to register, apply, or sign up for an event, hackathon, workshop, conference, or program. The user has NOT yet registered. Look for phrases like "register now", "apply here", "sign up", "submit your application", "join us", "invitation to", "call for applications", "last date to apply", "don't miss", "open for registration".
- APPROVED: The email confirms the user's registration was accepted, their spot is confirmed, or they have been selected. Look for "congratulations", "you have been selected", "confirmed", "accepted", "welcome aboard".
- WAITLISTED: The email says the user is on a waiting list, their application is pending, under review, or they will be notified later. Look for "waitlisted", "pending", "under review", "will notify", "shortlisting in progress".
- REJECTED: The email says the user was not selected, their application was declined, or there's no spot available. Look for "unfortunately", "not selected", "declined", "rejected", "unable to accommodate".

Important: If the email is clearly a mass announcement or newsletter inviting people to register for something, classify as TO_REGISTER. If the email is a response to the user's own application/registration, classify based on the outcome.`;

export const classifyEmail = async (apiKey: string, email: Partial<Email>) => {
  try {
    const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy' });

    const prompt = `Subject: ${email.subject}\nSender: ${email.senderName} <${email.senderEmail}>\nBody:\n${email.body}`;
    const contentToClassify = Object.keys(email).length > 0 ? prompt : 'Please classify this empty email.';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contentToClassify,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0,
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    
    try {
      const result = JSON.parse(text);
      return {
        eventName: result.event_name,
        eventDate: result.event_date,
        status: result.status as Status,
        reason: result.reason,
        actionRequired: result.action_required,
        registrationLink: result.registration_link,
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON response:', text);
      return null;
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

// Helper to delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Batch processing
export const classifyEmailsInBatches = async (
  apiKey: string, 
  emails: Email[], 
  onProgress: (classified: Email[], current: number, total: number) => void
) => {
  const results: Email[] = [];
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    
    const batchPromises = batch.map(async (email) => {
      try {
        const classification = await classifyEmail(apiKey, email);
        if (classification) {
          return { ...email, ...classification };
        }
        return { ...email, status: 'UNCLASSIFIED' as Status, reason: 'Failed to classify' };
      } catch (error) {
        return { ...email, status: 'UNCLASSIFIED' as Status, reason: 'API Error' };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults as Email[]);
    
    onProgress(results, Math.min(i + BATCH_SIZE, emails.length), emails.length);

    if (i + BATCH_SIZE < emails.length) {
      await delay(1000); // 1 second delay between batches
    }
  }
  
  return results;
};
