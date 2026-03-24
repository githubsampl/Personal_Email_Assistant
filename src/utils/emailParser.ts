export const extractEmailDetails = (message: any) => {
  const headers = message.payload.headers;
  
  const subjectHeader = headers.find((h: any) => h.name.toLowerCase() === 'subject');
  const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from');
  const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date');
  
  const subject = subjectHeader ? subjectHeader.value : 'No Subject';
  const from = fromHeader ? fromHeader.value : 'Unknown Sender';
  const dateReceived = dateHeader ? dateHeader.value : new Date().toISOString();
  
  // Parse sender name and email assuming format: "Name" <email@domain.com>
  let senderName = from;
  let senderEmail = from;
  
  const emailMatch = from.match(/<(.*)>/);
  if (emailMatch) {
    senderEmail = emailMatch[1];
    senderName = from.replace(/<.*>/, '').replace(/"/g, '').trim() || senderEmail;
  }
  
  // Extract body
  let body = '';

  const htmlToText = (html: string): string =>
    html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, ' ')
      .trim();

  const getBody = (payload: any): string => {
    // If this payload has inline body data, decode and strip HTML if needed
    if (payload.body && payload.body.data) {
      const raw = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      // If the MIME type for this part is HTML, strip it to plain text
      if (payload.mimeType === 'text/html') {
        return htmlToText(raw);
      }
      return raw;
    }

    if (payload.parts && payload.parts.length > 0) {
      // 1. Prefer plain text
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain') {
          const content = getBody(part);
          if (content) return content;
        }
      }

      // 2. Recurse into nested multipart (e.g. multipart/alternative, multipart/related)
      for (const part of payload.parts) {
        if (part.mimeType.startsWith('multipart/')) {
          const content = getBody(part);
          if (content) return content;
        }
      }

      // 3. Last resort: HTML fallback, stripped to plain text
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html') {
          const content = getBody(part);
          if (content) return content;
        }
      }
    }

    return '';
  };
  
  body = getBody(message.payload);
  
  return {
    id: message.id,
    subject,
    senderName,
    senderEmail,
    dateReceived,
    body
  };
};
