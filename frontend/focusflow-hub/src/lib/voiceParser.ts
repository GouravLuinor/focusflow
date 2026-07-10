// Regex-based extraction (instant, offline, free)
export interface ParsedTaskData {
  title: string;
  estimatedMinutes: number | null;
  priority: string | null;
  deadline: string | null;  // YYYY-MM-DD string
}

export function quickParse(transcript: string): ParsedTaskData {
  let title = transcript.trim();
  let estimatedMinutes: number | null = null;
  let priority: string | null = null;
  let deadline: string | null = null;

  // Extract time: "45 min", "30 minutes", "about 1 hour", "2 hours", "90min"
  const minuteMatch = title.match(/(\d+)\s*(min|minutes?)/i);
  const hourMatch = title.match(/(\d+)\s*(hour|hours?|hr)/i);
  
  if (minuteMatch) {
    estimatedMinutes = parseInt(minuteMatch[1], 10);
    title = title.replace(minuteMatch[0], '').trim();
  } else if (hourMatch) {
    estimatedMinutes = parseInt(hourMatch[1], 10) * 60;
    title = title.replace(hourMatch[0], '').trim();
  }

  // Extract priority: "high priority", "urgent", "low priority", "medium priority"
  const priorityMatch = title.match(/\b(urgent|high priority|low priority|medium priority|priority)\b/i);
  if (priorityMatch) {
    const word = priorityMatch[1].toLowerCase();
    if (word.includes('urgent')) priority = 'URGENT';
    else if (word.includes('high')) priority = 'HIGH';
    else if (word.includes('low')) priority = 'LOW';
    else if (word.includes('medium')) priority = 'MEDIUM';
    title = title.replace(priorityMatch[0], '').trim();
  }

  // Extract deadline: "by Friday", "by next week", "by July 20th", "by tomorrow"
  const deadlineMatch = title.match(/\b(by|due)\s+(.+?)(?:\s*$|,)/i);
  if (deadlineMatch) {
    const dateStr = deadlineMatch[2];
    // Try to parse common relative dates
    const parsed = parseRelativeDate(dateStr);
    if (parsed) deadline = parsed;
    title = title.replace(deadlineMatch[0], '').trim();
  }

  // Clean up title (remove trailing/leading punctuation, double spaces)
  title = title.replace(/\s+/g, ' ').replace(/^[,.:;! ?\s]+|[,.:;! ?\s]+$/g, '').trim();

  return { title, estimatedMinutes, priority, deadline };
}

function parseRelativeDate(str: string): string | null {
  const now = new Date();
  const lower = str.toLowerCase().trim();
  
  if (lower === 'tomorrow') {
    now.setDate(now.getDate() + 1);
    return now.toISOString().split('T')[0];
  }
  if (lower === 'next week') {
    now.setDate(now.getDate() + 7);
    return now.toISOString().split('T')[0];
  }
  
  return null;
}

// LLM-based extraction (slower, cloud, more accurate)
export async function aiParse(transcript: string): Promise<ParsedTaskData> {
  const token = localStorage.getItem('token');
  const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:8000'
    : window.location.origin;

  const response = await fetch(`${API_BASE_URL}/ai/parse-task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text: transcript }),
  });

  if (!response.ok) {
    throw new Error('AI parsing failed');
  }

  const data = await response.json();
  return {
    title: data.title || transcript.trim(),
    estimatedMinutes: data.estimated_minutes || null,
    priority: data.priority || null,
    deadline: data.deadline || null,
  };
}
