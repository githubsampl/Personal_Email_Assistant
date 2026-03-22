import { extractEmailDetails } from '../utils/emailParser';

export const fetchLatestEmails = async (token: string, maxResults = 50) => {
  try {
    // 1. Fetch message IDs
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      throw new Error('Failed to fetch messages');
    }

    const data = await response.json();
    const messages = data.messages || [];

    // 2. Fetch full details for each message
    const emailPromises = messages.map(async (msg: any) => {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!msgRes.ok) return null;
      const msgData = await msgRes.json();
      return extractEmailDetails(msgData);
    });

    const fullEmails = (await Promise.all(emailPromises)).filter(Boolean);
    return fullEmails;

  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

export const filterEmailsByKeywords = (emails: any[], keywords: string[]) => {
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  return emails.filter(email => {
    const lowerSubject = email.subject.toLowerCase();
    return lowerKeywords.some(keyword => lowerSubject.includes(keyword));
  });
};
