import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Temporary directory for code execution
const TEMP_DIR = path.join(__dirname, 'temp');

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  }
}

// Language configurations
const languageConfigs = {
  javascript: {
    extension: '.js',
    command: 'node',
    args: (file) => [file],
  },
  typescript: {
    extension: '.ts',
    command: 'ts-node',
    args: (file) => [file],
  },
  python: {
    extension: '.py',
    command: 'python',
    args: (file) => [file],
  },
  java: {
    extension: '.java',
    command: 'javac',
    compileArgs: (file) => [file],
    runCommand: 'java',
    runArgs: (className) => [className],
  },
  cpp: {
    extension: '.cpp',
    command: 'g++',
    compileArgs: (file, output) => [file, '-o', output],
    runCommand: null, // Will run the compiled executable directly
  },
  c: {
    extension: '.c',
    command: 'gcc',
    compileArgs: (file, output) => [file, '-o', output],
    runCommand: null,
  },
};

// Execute command with timeout
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const { timeout = 5000, cwd } = options;
    const process = spawn(command, args, { cwd });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      process.kill();
      reject(new Error('Execution timeout (5 seconds)'));
    }, timeout);

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) return;
      
      if (code !== 0 && stderr) {
        reject(new Error(stderr));
      } else {
        resolve({ stdout, stderr, code });
      }
    });

    process.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

// Clean up temporary files
async function cleanupFiles(files) {
  for (const file of files) {
    try {
      await fs.unlink(file);
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}

// Execute code endpoint
app.post('/api/execute', async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  const config = languageConfigs[language.toLowerCase()];
  if (!config) {
    return res.status(400).json({ error: `Unsupported language: ${language}` });
  }

  const sessionId = uuidv4();
  const fileName = `code_${sessionId}`;
  const filePath = path.join(TEMP_DIR, fileName + config.extension);
  const filesToCleanup = [filePath];

  try {
    await ensureTempDir();
    
    // Write code to file
    await fs.writeFile(filePath, code);

    let output = '';

    // Handle compiled languages (Java, C++, C)
    if (config.compileArgs) {
      let executablePath;
      let className;

      if (language.toLowerCase() === 'java') {
        // Extract class name from Java code
        const classMatch = code.match(/public\s+class\s+(\w+)/);
        if (!classMatch) {
          throw new Error('Could not find public class declaration');
        }
        className = classMatch[1];
        const javaFilePath = path.join(TEMP_DIR, `${className}.java`);
        await fs.writeFile(javaFilePath, code);
        filesToCleanup.push(javaFilePath);
        filesToCleanup.push(path.join(TEMP_DIR, `${className}.class`));

        // Compile Java
        await executeCommand(config.command, config.compileArgs(javaFilePath));
        
        // Run Java
        const result = await executeCommand(
          config.runCommand,
          config.runArgs(className),
          { cwd: TEMP_DIR }
        );
        output = result.stdout;
      } else {
        // C/C++ compilation
        executablePath = path.join(TEMP_DIR, `${fileName}.exe`);
        filesToCleanup.push(executablePath);

        // Compile
        await executeCommand(
          config.command,
          config.compileArgs(filePath, executablePath)
        );

        // Run executable
        const result = await executeCommand(executablePath, []);
        output = result.stdout;
      }
    } else {
      // Interpreted languages (Python, JavaScript, TypeScript)
      const result = await executeCommand(config.command, config.args(filePath));
      output = result.stdout;
    }

    res.json({
      success: true,
      output: output.trim(),
      error: null,
    });
  } catch (err) {
    res.json({
      success: false,
      output: '',
      error: err.message,
    });
  } finally {
    // Cleanup temporary files after a delay
    setTimeout(() => cleanupFiles(filesToCleanup), 1000);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Check language availability
app.get('/api/languages', async (req, res) => {
  const availableLanguages = {};
  
  for (const [lang, config] of Object.entries(languageConfigs)) {
    try {
      await executeCommand(config.command, ['--version'], { timeout: 2000 });
      availableLanguages[lang] = true;
    } catch {
      availableLanguages[lang] = false;
    }
  }
  
  res.json(availableLanguages);
});

app.listen(PORT, () => {
  console.log(`🚀 Code execution server running on http://localhost:${PORT}`);
  console.log(`📝 Temp directory: ${TEMP_DIR}`);
  console.log(`\n✅ Available endpoints:`);
  console.log(`   POST /api/execute - Execute code`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   GET  /api/languages - Check available languages`);
});
