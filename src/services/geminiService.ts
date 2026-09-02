import { GoogleGenAI } from '@google/genai';
import { ClassEvent } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// Helper to convert File to Base64
function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const schema = {
  type: "array",
  description: "List of classes found in the timetable",
  items: {
    type: "object",
    properties: {
      day: { type: "string", enum: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"], description: "Day of the week" },
      type: { type: "string", enum: ["CLASS"], description: "Always CLASS" },
      classType: { type: "string", enum: ["THEORY", "LAB"], description: "THEORY or LAB depending on the slot" },
      startTime: { type: "string", description: "Start time in HH:mm format (e.g. 08:00)" },
      endTime: { type: "string", description: "End time in HH:mm format (e.g. 08:50)" },
      slotCode: { type: "string", description: "Slot code (e.g. A1, F2, L31, TFF1)" },
      courseCode: { type: "string", description: "Course code (e.g. CSE1001, MAT2002)" },
      subject: { type: "string", description: "The full name of the course or subject (e.g. Data Structures, Digital Logic Design)" },
      room: { type: "string", description: "Room number or venue (e.g. CB-102, AB1-204)" },
      rawText: { type: "string", description: "The raw text extracted for this block" }
    },
    required: ["day", "type", "classType", "startTime", "endTime", "slotCode", "courseCode", "rawText"]
  }
};

export const geminiService = {
  async extractTimetableFromImage(
    file: File,
    apiKey: string,
    onProgress?: (message: string) => void
  ): Promise<ClassEvent[]> {
    if (onProgress) onProgress('Initializing AI engine...');
    
    const ai = new GoogleGenAI({ apiKey });
    
    if (onProgress) onProgress('Preparing image for analysis...');
    const imagePart = await fileToGenerativePart(file);

    const prompt = `
      You are an expert AI assistant that extracts schedule information from university timetables.
      Carefully analyze this timetable image. The days are usually on the left column, and the times are on the top row.
      Extract every single class block into the requested structured JSON array format.
      Make sure to accurately correlate the class blocks with their correct Day (row) and Time (column).
      
      CRITICAL INSTRUCTIONS:
      1. ONLY extract cells that represent an ACTUAL scheduled class (must contain a Course Code like CSE2001). Ignore all empty cells that only have a slot label (e.g. L25, E1) printed in the background.
      2. The VIT-AP timetable splits each day into a THEORY row and a LAB row. You MUST determine the classType ("THEORY" or "LAB") strictly based on which row the class appears in. Do NOT guess it from the course code.
      3. For the startTime and endTime, look at the exact time ranges printed in the column header for that specific cell. LAB slots and THEORY slots have different timings. Do not guess the times; read them directly from the column headers.
    `;

    if (onProgress) onProgress('AI is extracting timetable (this may take 5-15 seconds)...');

    try {
      let response;
      const requestConfig = {
        contents: [prompt, imagePart],
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1
        }
      };

      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          ...requestConfig
        });
      } catch (primaryError: any) {
        if (primaryError.message?.includes('503') || primaryError.message?.includes('high demand') || primaryError.message?.includes('UNAVAILABLE')) {
          if (onProgress) onProgress('Primary AI model is busy, trying fallback model (3.5-flash-lite)...');
          response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            ...requestConfig
          });
        } else {
          throw primaryError;
        }
      }

      if (!response || !response.text) {
        throw new Error("AI returned empty response");
      }

      let jsonText = response.text;
      const match = jsonText.match(/```json\n([\s\S]*?)\n```/);
      if (match) {
        jsonText = match[1];
      }

      const events: ClassEvent[] = JSON.parse(jsonText);
      
      const finalEvents = events.map(e => {
        let startTime = e.startTime;
        let endTime = e.endTime;
        
        if (startTime && startTime.endsWith('1')) {
          startTime = startTime.slice(0, -1) + '0';
        }
        if (endTime && endTime.endsWith('1')) {
          endTime = endTime.slice(0, -1) + '0';
        }

        return {
          ...e,
          startTime,
          endTime,
          id: Math.random().toString(36).substr(2, 9),
          type: 'CLASS' as const
        };
      });

      if (onProgress) onProgress('Extraction complete!');
      return finalEvents;

    } catch (error: any) {
      console.error("Gemini Extraction Error:", error);
      throw new Error(error.message || "Failed to analyze image with AI.");
    }
  },

  async extractTimetableFromText(rawText: string, apiKey: string, onProgress?: (msg: string) => void): Promise<ClassEvent[]> {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are an expert AI assistant that extracts schedule information from university timetables.
      The user has pasted the raw text of their timetable. 
      Extract every single class block into the requested structured JSON array format.
      
      CRITICAL INSTRUCTIONS:
      1. ONLY extract ACTUAL scheduled classes. Ignore empty slots or unrelated UI text.
      2. You MUST determine the classType ("THEORY" or "LAB") if indicated.
      3. Extract the exact Start and End times.
      4. Include Course Code, Subject (if available), Room/Location.
      
      Raw Timetable Text:
      ${rawText}
    `;

    if (onProgress) onProgress('AI is parsing timetable text (usually takes 3-5 seconds)...');

    try {
      let response;
      const requestConfig = {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.1
        }
      };

      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          ...requestConfig
        });
      } catch (primaryError: any) {
        if (primaryError.message?.includes('503') || primaryError.message?.includes('high demand') || primaryError.message?.includes('UNAVAILABLE')) {
          if (onProgress) onProgress('Primary AI model is busy, trying fallback model (3.5-flash-lite)...');
          response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            ...requestConfig
          });
        } else {
          throw primaryError;
        }
      }

      if (!response || !response.text) {
        throw new Error("AI returned empty response");
      }

      let jsonText = response.text;
      const match = jsonText.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (match) {
        jsonText = match[1];
      }

      const parsedClasses: any[] = JSON.parse(jsonText);
      
      // Map to full ClassEvent objects adding IDs and duration
      const finalEvents: ClassEvent[] = parsedClasses.map(c => {
        // Sanitize times to end in 0 (e.g. 15:01 -> 15:00, 09:51 -> 09:50)
        let startTime = c.startTime;
        let endTime = c.endTime;
        
        if (startTime && startTime.endsWith('1')) {
          startTime = startTime.slice(0, -1) + '0';
        }
        if (endTime && endTime.endsWith('1')) {
          endTime = endTime.slice(0, -1) + '0';
        }

        // Calculate duration safely
        let duration = 50;
        try {
          const start = startTime.split(':');
          const end = endTime.split(':');
          const startMins = parseInt(start[0]) * 60 + parseInt(start[1]);
          const endMins = parseInt(end[0]) * 60 + parseInt(end[1]);
          duration = endMins - startMins;
        } catch (e) {
          // fallback
        }

        return {
          ...c,
          startTime,
          endTime,
          id: uuidv4(),
          durationMinutes: duration,
        };
      });

      if (onProgress) onProgress('Extraction complete!');
      return finalEvents;

    } catch (error: any) {
      console.error("Gemini Extraction Error:", error);
      throw new Error(error.message || "Failed to analyze image with AI.");
    }
  },
  
  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: "Respond with OK",
      });
      return response.text ? response.text.includes("OK") || response.text.length > 0 : false;
    } catch (e) {
      return false;
    }
  }
};
