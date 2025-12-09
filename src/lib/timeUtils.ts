export function parseTaskInput(input: string): { title: string; duration: number | null } {
  // Regex to find patterns like "in 30m", "in 1h", "in 1.5h", "30 mins"
  // Supports m/min/mins/minute/minutes and h/hr/hrs/hour/hours
  const timeRegex = /\s+in\s+(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours)\b/i;
  
  const match = input.match(timeRegex);
  
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    
    let durationInMinutes = 0;
    
    if (unit.startsWith('h')) {
      durationInMinutes = value * 60;
    } else {
      durationInMinutes = value;
    }
    
    // Remove the time string from the title
    const title = input.replace(match[0], '').trim();
    
    return {
      title,
      duration: Math.round(durationInMinutes)
    };
  }
  
  return {
    title: input.trim(),
    duration: null
  };
}
