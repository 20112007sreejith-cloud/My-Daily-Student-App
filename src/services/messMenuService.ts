import * as XLSX from 'xlsx';
import { MessDay, Meal } from '../models/types';

export const parseMessMenuExcel = async (file: File): Promise<MessDay[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Assume first sheet is Veg & Non-Veg, second is Special
        const vegSheetName = workbook.SheetNames[0];
        const specialSheetName = workbook.SheetNames.length > 1 ? workbook.SheetNames[1] : workbook.SheetNames[0];

        const vegSheet = workbook.Sheets[vegSheetName];
        const specialSheet = workbook.Sheets[specialSheetName];

        const vegJson = XLSX.utils.sheet_to_json<any>(vegSheet, { header: 1 });
        const specialJson = XLSX.utils.sheet_to_json<any>(specialSheet, { header: 1 });

        const processSheet = (json: any[]) => {
          const daysMap: Record<string, Meal[]> = {};
          
          let currentDates: number[] = [];

          for (let i = 0; i < json.length; i++) {
            const row = json[i];
            if (!row || row.length === 0) continue;

            const dayCol = row[0];
            
            // Check if dayCol contains numbers (e.g. "1, 15, 29" or "1,15,29")
            if (typeof dayCol === 'string' && /\d/.test(dayCol) && !dayCol.toLowerCase().includes('breakfast')) {
              // Parse dates
              const dateStr = dayCol.replace(/[a-zA-Z]/g, '').trim();
              if (dateStr) {
                currentDates = dateStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
              }
            }

            // If we have currentDates, and we see meals, map them
            if (currentDates.length > 0 && row.length >= 4) {
              // Usually: 1: Breakfast, 2: Lunch, 3: Snacks, 4: Dinner
              // Note: The structure in the screenshot has column indices which might vary.
              // Let's heuristically extract items if we have at least 4 text strings
              
              const breakfastStr = typeof row[1] === 'string' ? row[1] : '';
              const lunchStr = typeof row[2] === 'string' ? row[2] : '';
              const snacksStr = typeof row[3] === 'string' ? row[3] : '';
              const dinnerStr = typeof row[4] === 'string' ? row[4] : '';
              
              // Only process if it actually contains food items (heuristic: length > 3)
              if (breakfastStr.length > 3 || lunchStr.length > 3) {
                 const meals: Meal[] = [
                    { type: 'BREAKFAST', items: breakfastStr.split('\n').map(s => s.trim()).filter(s => s) },
                    { type: 'LUNCH', items: lunchStr.split('\n').map(s => s.trim()).filter(s => s) },
                    { type: 'SNACKS', items: snacksStr.split('\n').map(s => s.trim()).filter(s => s) },
                    { type: 'DINNER', items: dinnerStr.split('\n').map(s => s.trim()).filter(s => s) },
                 ];

                 // Assign to all dates
                 currentDates.forEach(dateNum => {
                   const formattedDate = `2026-09-${dateNum.toString().padStart(2, '0')}`;
                   // Merge items if already exists
                   if (!daysMap[formattedDate]) {
                     // Must clone the array so references aren't shared across multiple dates
                     daysMap[formattedDate] = JSON.parse(JSON.stringify(meals));
                   } else {
                     // Append
                     daysMap[formattedDate][0].items.push(...meals[0].items);
                     daysMap[formattedDate][1].items.push(...meals[1].items);
                     daysMap[formattedDate][2].items.push(...meals[2].items);
                     daysMap[formattedDate][3].items.push(...meals[3].items);
                     
                     // Deduplicate to be safe
                     daysMap[formattedDate][0].items = Array.from(new Set(daysMap[formattedDate][0].items));
                     daysMap[formattedDate][1].items = Array.from(new Set(daysMap[formattedDate][1].items));
                     daysMap[formattedDate][2].items = Array.from(new Set(daysMap[formattedDate][2].items));
                     daysMap[formattedDate][3].items = Array.from(new Set(daysMap[formattedDate][3].items));
                   }
                 });
                 // Clear to prevent duplicating to next rows incorrectly if layout differs
                 // currentDates = [];
              }
            }
          }
          return daysMap;
        };

        const vegMap = processSheet(vegJson);
        const specialMap = processSheet(specialJson);

        const allDates = new Set([...Object.keys(vegMap), ...Object.keys(specialMap)]);
        const result: MessDay[] = Array.from(allDates).map(date => ({
          date,
          vegNonVeg: vegMap[date] || [],
          special: specialMap[date] || []
        }));

        resolve(result);
      } catch (err) {
        console.error(err);
        reject(new Error("Failed to parse Mess Menu Excel file"));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
