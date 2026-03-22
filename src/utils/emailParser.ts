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
  
  const getBody = (payload: any): string => {
    if (payload.body && payload.body.data) {
      return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
    }
    
    if (payload.parts && payload.parts.length > 0) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain') {
          return getBody(part);
        }
      }
      
      // Fallback to HTML if plain text not found
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html') {
          // crude html to text
          const html = getBody(part);
          return html.replace(/<style[^>]*>.*<\/style>/gm, '')
                     .replace(/<script[^>]*>.*<\/script>/gm, '')
                     .replace(/<[^>]+>/g, ' ')
                     .replace(/\s+/g, ' ')
                     .trim();
        }
      }
      
      // Recurse into multipart
      for (const part of payload.parts) {
        if (part.mimeType.startsWith('multipart/')) {
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
