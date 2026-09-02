# 🌸 Katana - Daily Student Companion

Katana is a beautiful, dynamic daily planner and timetable application designed for students (specifically built with VIT-AP in mind, but flexible for anyone). It features a sleek glassmorphic UI, smooth animations, and a background that subtly changes based on the time of day.

## ✨ Features

- **🧠 AI-Powered Timetable Import**: Paste your raw timetable text and Katana uses the Gemini AI API to automatically parse your classes, rooms, timings, and labs instantly.
- **🌅 Dynamic Environment**: The app's background and color palette seamlessly shift between Morning, Afternoon, Evening, and Night, complete with beautiful static cherry blossoms during the day.
- **📅 Smart Dashboard**: Get a quick overview of your "Up Next" classes, current weather, and unread notifications at a single glance.
- **✅ To-Do & Task Management**: A fully integrated task manager with due dates, priority tags, and a "Focus Mode" to help you get things done.
- **🍽️ Mess Menu**: Keep track of your daily meals easily.
- **📱 Native Mobile Ready**: Built using web technologies but fully prepared to be compiled into a native Android `.apk` using Capacitor.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Pure CSS (Glassmorphism, custom CSS variables, responsive design)
- **Icons**: Lucide React
- **Mobile Runtime**: Capacitor (for Android bridging)
- **AI Integration**: Google Gemini API

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/20112007sreejith-cloud/My-Daily-Student-App.git
   cd My-Daily-Student-App
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Building the Android APK
If you have Android Studio and Java/Gradle installed:
1. Build the web project:
   ```bash
   npm run build
   ```
2. Sync with Capacitor:
   ```bash
   npx cap sync android
   ```
3. Build the APK using Gradle (or open in Android Studio):
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

## ⚙️ Settings & Configuration
To use the AI Timetable extraction feature, you will need to generate a free API key from Google AI Studio and enter it into the app's **Settings** tab. All data (timetable, todos, preferences) is stored locally on your device for maximum privacy and speed.

---
*Built with ❤️ and a lot of caffeine.*
