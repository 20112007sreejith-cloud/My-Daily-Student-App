export const parseCourseString = (rawText: string) => {
  if (!rawText || rawText.trim() === '' || rawText.includes('--') || rawText === '-') {
    return null;
  }

  // Common pattern: SLOT-COURSECODE-BUILDING-ROOM-SECTION
  // e.g. F2-STS2010-TH-523-CB-ALL
  // Sometimes: COURSECODE-BUILDING-ROOM-SECTION
  // e.g. CSE2001-ELA-102-CB-ALL

  const parts = rawText.split('-');
  
  if (parts.length >= 4) {
    // If first part looks like a slot (e.g. F2, A1, TC1, TDD2)
    const isSlot = /^[A-Z]{1,3}\d{1}$/.test(parts[0]);
    
    if (isSlot && parts.length >= 5) {
      return {
        slotCode: parts[0],
        courseCode: parts[1],
        building: parts[2],
        room: parts[3],
        section: parts.slice(4).join('-'),
        rawText
      };
    } else {
      return {
        courseCode: parts[0],
        building: parts[1],
        room: parts[2],
        section: parts.slice(3).join('-'),
        rawText
      };
    }
  }

  // Fallback, just return raw
  return { rawText, courseCode: rawText };
};
