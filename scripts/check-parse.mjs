import fs from 'fs';

try {
  const data = fs.readFileSync('apps/ai-service/debug-gemini-failed.json', 'utf8');
  JSON.parse(data);
  fs.writeFileSync('error.txt', 'Parsed successfully!');
} catch (e) {
  fs.writeFileSync('error.txt', e.message);
}
