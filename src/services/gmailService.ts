import { extractEmailDetails } from '../utils/emailParser';

export const fetchEmailMetadata = async (token: string, maxResults = 5, query = '') => {
  try {
    const url = new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    url.searchParams.append('maxResults', maxResults.toString());
    if (query) url.searchParams.append('q', query);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error(response.status === 401 ? 'UNAUTHORIZED' : 'Failed to fetch message list');

    const data = await response.json();
    const messages = data.messages || [];

    // Fetch only metadata (keeps it extremely light)
    const emailPromises = messages.map(async (msg: any) => {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!msgRes.ok) return null;
      const msgData = await msgRes.json();
      return extractEmailDetails(msgData); // Body will naturally be empty, snippet will exist
    });

    return (await Promise.all(emailPromises)).filter(Boolean);
  } catch (error) {
    console.error('Error fetching email metadata:', error);
    throw error;
  }
};

export const readFullEmails = async (token: string, ids: string[]) => {
  try {
    const emailPromises = ids.map(async (id) => {
      const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!msgRes.ok) return null;
      const msgData = await msgRes.json();
      
      const parsed = extractEmailDetails(msgData);
      
      // Additional safety strip for residual HTML and limit to 800 chars
      const cleanBody = parsed.body
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 800);
        
      return { ...parsed, body: cleanBody };
    });

    return (await Promise.all(emailPromises)).filter(Boolean);
  } catch (error) {
    console.error('Error reading full emails:', error);
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
