import { callLLM } from './llmService';
import { fetchEmailMetadata, readFullEmails } from './gmailService';
import type { ChatMessage } from '../store/useAppStore';

const THINK_PROMPT = `You are an intelligent email search strategist for an Indian user named Niteesh who lives in Bengaluru, India.
Your job is to analyze what the user is asking and return a JSON search strategy.

Indian context you must know:
Banks: hdfc, sbi, icici, axis, kotak, indusind, yesbank, rbl, federal, idbi, pnb, bob
Payments: paytm, gpay, phonepe, razorpay, upi, bhim, mobikwik, amazon pay
Food: swiggy, zomato
Travel: irctc, makemytrip, goibibo, redbus, ola, uber, rapido, yatra
Shopping: flipkart, amazon, meesho, myntra, ajio
Jobs: naukri, linkedin, instahyre, cutshort, foundit, hirist, wellfound
Events: devfolio, unstop, hackerearth, geeksforgeeks, leetcode, skillenza
Streaming: netflix, hotstar, primevideo, sonyliv, zee5, jiocinema

Given the user query, return ONLY this JSON:
{
  "query_type": "GREETING" | "VAGUE" | "SPECIFIC" | "FOLLOWUP",
  "gmail_search_query": "the gmail search string with OR operators if needed",
  "max_results": 5,
  "search_reason": "why you chose this query",
  "needs_full_body": true or false,
  "expected_email_types": ["string"]
}

Rules:
- NEVER exceed 5 for max_results
- gmail_search_query MUST use valid Gmail syntax (e.g. "from:swiggy OR subject:order")
- If query_type is GREETING or VAGUE, set gmail_search_query to ""`;

const REASON_PROMPT = `You are a highly intelligent personal email assistant for Niteesh, an Indian software engineer from Bengaluru working at Accenture.
You have just read his actual emails. Now reason deeply about them and answer his query precisely.

Your personality:
- Warm, friendly, personal
- Address user as 'Niteesh' naturally
- Think like a smart personal assistant
- Extract what actually matters
- Make decisions and give clear answers
- Don't just list emails — interpret them

When analyzing emails:
- Extract exact amounts (₹), dates, names
- Identify status (confirmed/rejected/pending)
- Spot action items or deadlines
- Flag anything urgent

Return ONLY JSON:
{
  "response_text": "Your main conversational answer to Niteesh, warm and precise",
  "key_findings": ["bullet point findings", "only if 2 or more findings exist"],
  "email_cards": [
    {
      "id": "original_email_id",
      "sender": "sender name",
      "subject": "",
      "date": "",
      "ai_summary": "one line intelligent summary",
      "status": "confirmed | rejected | pending | info",
      "important_detail": "amount/date/action needed",
      "urgency": "high | medium | low"
    }
  ],
  "action_items": ["anything Niteesh needs to do"],
  "follow_up_suggestions": ["3 related questions Niteesh might want to ask"]
}`;

interface AgentOptions {
  apiKey: string;
  accessToken: string;
  userQuery: string;
  history: ChatMessage[];
  onProgress?: (msg: string) => void;
}

export const runAgentLoop = async (options: AgentOptions) => {
  const { apiKey, accessToken, userQuery, history, onProgress } = options;
  const llmHistory = history.slice(-20).map(h => ({ role: h.role, content: h.content }));

  try {
    // PHASE 1: THINK
    onProgress?.("🤔 Understanding your request...");
    const thinkResponse = await callLLM({
      apiKey,
      systemPrompt: THINK_PROMPT,
      history: llmHistory,
      userQuery,
      jsonMode: true,
      temperature: 0.1
    });

    const strategy = JSON.parse(thinkResponse || '{}');
    const qType = strategy.query_type;

    if (qType === 'GREETING' || qType === 'VAGUE') {
      return {
        isGreeting: true,
        answer: qType === 'GREETING' 
          ? "Hey Niteesh! 👋 Good to see you.\nI'm connected to your Gmail and ready to help.\nWhat would you like to explore today?"
          : "I can help with that! Could you be a bit more specific so I can search your inbox perfectly?",
        emails: [],
        followUpOptions: [
          "💳 Bank & UPI Transactions",
          "💼 Jobs & Interviews",
          "🎯 Hackathons & Events",
          "✈️ Travel & Bookings",
          "🛵 Food & Orders",
          "⚠️ Urgent Emails"
        ]
      };
    }

    // PHASE 2: FETCH
    onProgress?.("🔍 Searching your inbox...");
    const gmailQuery = strategy.gmail_search_query || '';
    const metadataList = await fetchEmailMetadata(accessToken, Math.min(strategy.max_results || 5, 5), gmailQuery);

    if (metadataList.length === 0) {
      return {
        answer: `Hmm, I couldn't find anything matching that Niteesh. Your emails might be in Promotions or Spam folder. Want me to try a different search? Here are some ideas:`,
        emails: [],
        followUpOptions: [
          `Search "${gmailQuery.split(' ')[0]}" instead`,
          "Show me recent unread emails",
          "Show me urgent emails"
        ]
      };
    }

    // PHASE 3: READ
    onProgress?.("📖 Reading your emails...");
    const targetIds = metadataList.map((m: any) => m.id);
    const fullEmails = await readFullEmails(accessToken, targetIds);

    // PHASE 4: REASON
    onProgress?.("🧠 Analyzing what I found...");
    const emailPayload = fullEmails.map((e: any) => ({
      id: e.id,
      from: e.senderName,
      subject: e.subject,
      date: e.dateReceived,
      body: e.body
    }));

    let reasonResponse = await callLLM({
      apiKey,
      systemPrompt: REASON_PROMPT,
      history: llmHistory,
      userQuery: `User Request: "${userQuery}"\n\nActual Emails Found:\n${JSON.stringify(emailPayload)}`,
      jsonMode: true,
      temperature: 0.2
    }).catch(async () => {
      // Fallback if token limit hit: trim bodies drastically
      console.warn("Token limit hit, retrying with lighter context...");
      const lightPayload = emailPayload.slice(0, 3).map((e: any) => ({ ...e, body: e.body.substring(0, 400) }));
      return callLLM({
        apiKey,
        systemPrompt: REASON_PROMPT,
        history: llmHistory,
        userQuery: `User Request: "${userQuery}"\n\nFallback Emails:\n${JSON.stringify(lightPayload)}`,
        jsonMode: true,
        temperature: 0.2
      });
    });

    // PHASE 5: RESPOND
    const analysis = JSON.parse(reasonResponse || '{}');

    // Merge analysis back into email objects for rendering
    const processedEmails = fullEmails.map((re: any) => {
      const card = analysis.email_cards?.find((c: any) => c.id === re.id);
      if (card) {
        return { 
          ...re, 
          aiSummary: card.ai_summary,
          status: card.status,
          senderName: card.sender || re.senderName,
          importantDetail: card.important_detail,
          urgency: card.urgency
        };
      }
      return re;
    });

    return {
      answer: analysis.response_text || "I found some relevant emails for you.",
      emails: processedEmails,
      keyFindings: analysis.key_findings?.length >= 2 ? analysis.key_findings : undefined,
      actionItems: analysis.action_items?.length > 0 ? analysis.action_items : undefined,
      followUpOptions: analysis.follow_up_suggestions,
      classification: analysis.classification // keeping for backwards compatibility if needed
    };

  } catch (error: any) {
    throw error;
  }
};
