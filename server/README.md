# Code Execution Server

Backend server for executing code in multiple programming languages.

## Quick Start

```bash
npm install
npm start
```

Server runs on http://localhost:3001

## Supported Languages

- JavaScript (Node.js)
- TypeScript (ts-node)
- Python
- Java
- C++
- C

## Security

⚠️ **For development only** - not production-ready!

This server executes arbitrary code without sandboxing. For production:
- Use Docker containers
- Implement resource limits
- Add authentication
- Sanitize all inputs
- Rate limiting

## API

### POST /api/execute
Execute code
```json
{
  "code": "console.log('Hello')",
  "language": "javascript"
}
```

### GET /api/health
Health check

### GET /api/languages
Check available languages
