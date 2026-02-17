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

## 🚀 Deployment

### Prerequisites
1. Push your code to GitHub: `git push origin main`
2. Get your Groq API key from: https://console.groq.com/

---

### 🎯 Deploy Backend to Railway

1. **Visit Railway**: https://railway.app/
2. **Sign in** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select Repository**: `sithumSoft/MockMate`
5. **Configure Service**:
   - Click on the service → Settings
   - **Root Directory**: `server`
   - **Start Command**: `npm start` (auto-detected)
6. **Deploy** - Railway will automatically deploy
7. **Get Backend URL**: 
   - Go to Settings → Networking
   - Copy the public URL (e.g., `https://mockmate-backend.up.railway.app`)

**✅ Test Backend**: Visit `https://your-backend-url.railway.app/api/health`

---

### 🌐 Deploy Frontend to Vercel

1. **Visit Vercel**: https://vercel.com/new
2. **Import Git Repository**: Select `sithumSoft/MockMate`
3. **Configure Project**:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables** (IMPORTANT - Add these):
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_CODE_EXECUTION_URL=https://your-backend-url.railway.app/api
   ```
5. **Deploy** - Vercel will build and deploy your app

**✅ Test Frontend**: Visit your Vercel URL (e.g., `https://mockmate.vercel.app`)

---

### 🔄 Update Backend CORS (Important!)

After deploying to Vercel, update your backend:

1. **Add Vercel URL to Railway Environment Variables**:
   - Go to Railway dashboard → Your service → Variables
   - Add: `FRONTEND_URL` = `https://mockmate.vercel.app` (your actual Vercel URL)
2. Railway will automatically redeploy with the new CORS settings

---

### ⚠️ Important Deployment Notes

- ✅ **Never commit `.env`** - Already protected by `.gitignore`
- 📊 **Monitor API Usage**: https://console.groq.com/usage
- 🔄 **Auto-Deploy**: Both platforms redeploy on `git push`
- 🆓 **Free Tiers**:
  - Vercel: Unlimited deployments, 100GB bandwidth/month
  - Railway: 500 hours/month free (server may sleep after inactivity)

---

### 🐛 Troubleshooting

**Backend not accessible**:
- Check Railway logs for errors
- Verify the service is running
- Ensure PORT environment variable is set correctly (Railway auto-sets it)

**Frontend can't connect to backend**:
- Verify `VITE_CODE_EXECUTION_URL` in Vercel environment variables
- Check browser console for CORS errors
- Test backend health endpoint directly: `https://your-backend-url/api/health`

**Code execution not working**:
- JavaScript/Python should work on Railway
- Java/C++/TypeScript may need additional setup (Railway installs Node.js and Python by default)
- Check Railway logs for missing dependencies

---

## 🔒 Security Note

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
