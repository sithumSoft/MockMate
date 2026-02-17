# MockMate - AI Interview Practice Platform

An intelligent interview practice application powered by Groq AI featuring performance analytics, multi-language code editor, and PDF exports.

## 🚀 Features

### Core Features
- ✅ **AI-Powered Interviews**: Practice technical, behavioral, and system design interviews
- ✅ **Real-time Evaluation**: Get instant feedback on your answers with detailed scores
- ✅ **Speech Recognition**: Answer questions using voice input
- ✅ **Interview History**: Track all your past interviews and progress

### New Features (Recently Added)
- 📊 **Performance Analytics Dashboard**: Comprehensive visualizations with charts showing progress over time
- 💻 **Code Editor**: Multi-language support (JavaScript, Python, TypeScript, Java, C++, C) with execution
- 📄 **PDF Export**: Export interview reports and analytics to professional PDF documents
- 🎯 **Real-time Code Execution**: Run code in multiple languages with backend server integration

## 📦 Installation

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```env
# Groq API Key (required for AI features)
VITE_GROQ_API_KEY=your_groq_api_key_here

# Code Execution Backend (optional, for code editor)
VITE_CODE_EXECUTION_URL=http://localhost:3001/api
```

Get your Groq API key from: https://console.groq.com/

## 🏃 Running the Application

### Option 1: Run Frontend Only (Without Code Execution)

```bash
npm run dev
```

### Option 2: Run Full Stack (With Code Execution)

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Or use the quick start script (Windows):**
```bash
start-backend.bat
```

Then in another terminal:
```bash
npm run dev
```

## 🔧 Code Execution Setup

For the code editor to execute code, you need:

1. **Required**: Node.js (v18+) - Already installed if you're running this project
2. **Optional Language Support**:
   - **Python**: https://www.python.org/downloads/
   - **Java JDK**: https://www.oracle.com/java/technologies/downloads/
   - **GCC/G++** (C/C++): 
     - Windows: MinGW or WSL
     - Mac: Xcode Command Line Tools
     - Linux: `sudo apt install build-essential`
   - **TypeScript**: `npm install -g ts-node typescript`

See [CODE_EXECUTION_SETUP.md](CODE_EXECUTION_SETUP.md) for detailed instructions.

## 📚 Documentation

- [Features Guide](FEATURES.md) - Detailed feature documentation
- [Code Execution Setup](CODE_EXECUTION_SETUP.md) - Backend setup guide

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Radix UI (Components)
- Recharts (Analytics charts)
- Monaco Editor (Code editor)
- Framer Motion (Animations)

### Backend
- Node.js + Express
- Multi-language code execution
- File system management

### AI/ML
- Groq API (LLaMA 3.3 70B)
- Speech Recognition API

## 🎯 Usage

1. **Start Interview**: Enter job description and select interview type
2. **Answer Questions**: Type or speak your answers
3. **Get Feedback**: Receive instant evaluation and suggestions
4. **View Analytics**: Track your progress in the Analytics dashboard
5. **Practice Coding**: Use the Code Practice environment
6. **Export Reports**: Download PDF reports of your interviews

## 📊 Analytics Features

- Progress tracking over time
- Category performance (Technical/Behavioral/System Design)
- Difficulty level analysis
- Strengths and weaknesses identification
- Score distribution visualizations

## 💻 Code Editor Features

- Syntax highlighting for multiple languages
- Real-time code execution
- Server status indicator
- Language availability checker
- Clean, professional output display

## 📄 PDF Export Features

- Complete interview transcripts
- Performance scores with visual indicators
- Feedback and recommendations
- Analytics summaries
- Professional formatting

## � Deployment to Vercel

### Frontend Deployment

1. **Push to GitHub** (`.env` won't be uploaded - it's in `.gitignore`)

2. **Import to Vercel**: Visit https://vercel.com/new

3. **Configure Environment Variables** in Vercel Dashboard:
   - Navigate to: Project Settings → Environment Variables
   - Add `VITE_GROQ_API_KEY` with your Groq API key
   - Add `VITE_CODE_EXECUTION_URL` with your backend URL (if deploying backend)

4. **Deploy**: Vercel will automatically build and deploy your app

### Backend Deployment (Optional - for Code Editor)

Deploy the `server/` directory to:
- **Render**: https://render.com (Recommended, has free tier)
- **Railway**: https://railway.app
- **Heroku**: https://heroku.com

Then update `VITE_CODE_EXECUTION_URL` in Vercel with your backend URL.

### Important Deployment Notes

- ✅ **Users will access AI features using YOUR API key**
- ⚠️ **Monitor API Usage**: Check https://console.groq.com/usage regularly
- 💡 **Rate Limiting**: Consider implementing if expecting high traffic
- 🔒 **Never commit `.env`**: Already protected by `.gitignore`

## �🔒 Security Note

⚠️ The code execution backend is for **development/learning purposes only**. For production:
- Implement sandboxing (Docker containers)
- Add resource limits
- Implement rate limiting
- Add authentication
- Sanitize all inputs

## 🤝 Contributing

Contributions welcome! Please check existing features in [FEATURES.md](FEATURES.md) before proposing new ones.

## 📝 License

MIT License - feel free to use this project for learning and practice!

---

**Happy Interviewing! 🎉**

For issues or questions, refer to the documentation files or check the inline code comments.
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
