# Code Execution Backend Setup

## 🎯 Quick Start

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Start Backend Server

```bash
npm start
```

Server will run on `http://localhost:3001`

### 3. Verify Server is Running

Visit `http://localhost:3001/api/health` - you should see `{"status":"ok"}`

---

## 📋 Prerequisites

### Required:
- **Node.js** (v18+): https://nodejs.org/

### Optional Language Support:

#### Python
- **Download**: https://www.python.org/downloads/
- **Verify**: `python --version`

#### Java
- **Download JDK**: https://www.oracle.com/java/technologies/downloads/
- **Verify**: `java --version` and `javac --version`

#### C/C++ (GCC/G++)
- **Windows**: Install MinGW from https://www.mingw-w64.org/ or use WSL
- **Mac**: Install Xcode Command Line Tools: `xcode-select --install`
- **Linux**: `sudo apt install build-essential`
- **Verify**: `gcc --version` and `g++ --version`

#### TypeScript
```bash
npm install -g ts-node typescript
```
- **Verify**: `ts-node --version`

---

## 🚀 Usage

1. **Start the backend server** (in terminal 1):
   ```bash
   cd server
   npm start
   ```

2. **Start the frontend** (in terminal 2):
   ```bash
   npm run dev
   ```

3. **Navigate to Code Practice**:
   - Click "Code Practice" in the navigation bar
   - Select your language
   - Write code and click "Run Code"

---

## 🔍 Check Available Languages

Visit: `http://localhost:3001/api/languages`

You'll see which languages are available on your system:
```json
{
  "javascript": true,
  "typescript": true,
  "python": true,
  "java": false,
  "cpp": true,
  "c": true
}
```

If a language shows `false`, install the required compiler/interpreter.

---

## 📝 API Endpoints

### POST `/api/execute`
Execute code in any supported language.

**Request:**
```json
{
  "code": "print('Hello World')",
  "language": "python"
}
```

**Response:**
```json
{
  "success": true,
  "output": "Hello World",
  "error": null
}
```

### GET `/api/health`
Check if server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T12:00:00.000Z"
}
```

### GET `/api/languages`
Check which language compilers/interpreters are available.

---

## ⚠️ Security Notes

**IMPORTANT**: This setup is for **development/learning only**!

### For Production, implement:
- ✅ Docker containers for sandboxed execution
- ✅ Resource limits (CPU, memory, disk I/O)
- ✅ Rate limiting per user/IP
- ✅ Input sanitization & validation
- ✅ Authentication & authorization
- ✅ Network isolation
- ✅ Timeout controls
- ✅ File system restrictions

### Current Limitations:
- No sandboxing (code runs directly on your machine)
- 5-second execution timeout
- No resource limits
- No authentication

---

## 🛠️ Troubleshooting

### Server won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill the process if needed (Windows)
taskkill /PID <PID> /F

# Or change the port in server.js
const PORT = process.env.PORT || 3002;
```

### "Backend server is offline" error
1. Make sure you ran `npm install` in the `server` folder
2. Start server: `cd server && npm start`
3. Check the server terminal for errors
4. Verify server is running: visit `http://localhost:3001/api/health`

### Language not available
1. Install the required compiler/interpreter
2. Restart the backend server
3. Check `/api/languages` endpoint to verify

### Python/Java/C++ not found
- Make sure the compiler/interpreter is in your system PATH
- Restart your terminal after installing
- On Windows, you may need to restart your computer

---

## 📁 Server File Structure

```
server/
├── package.json          # Dependencies
├── server.js            # Main server code
└── temp/                # Temporary code execution files (auto-created)
```

---

## 🎓 Example Code Snippets

### JavaScript
```javascript
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(10));
```

### Python
```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
```

### Java
```java
public class Solution {
    public static int sum(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        System.out.println(sum(10, 20));
    }
}
```

### C++
```cpp
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {1, 2, 3, 4, 5};
    int sum = 0;
    for (int num : nums) {
        sum += num;
    }
    cout << "Sum: " << sum << endl;
    return 0;
}
```

---

## 🤝 Support

For issues:
1. Check server is running on http://localhost:3001
2. Check browser console for errors (F12)
3. Check server terminal for backend errors
4. Verify language is installed: check `/api/languages`

---

**Happy Coding! 🚀**
