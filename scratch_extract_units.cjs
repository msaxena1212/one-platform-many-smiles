const fs = require('fs');
const path = require('path');

const logPath = 'C:\\Users\\mindz\\.gemini\\antigravity-ide\\brain\\68e22abf-7a5d-4abe-a449-f734c063c4b9\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n').filter(Boolean);

let targetPrompt = null;
for (const line of lines) {
  const data = JSON.parse(line);
  if (data.type === 'USER_INPUT' && data.content && data.content.includes('Unit AC Codes:')) {
    targetPrompt = data.content;
    break;
  }
}

if (targetPrompt) {
  console.log('Found the prompt! First 500 chars:');
  console.log(targetPrompt.substring(0, 500));
  fs.writeFileSync('extracted_units.txt', targetPrompt);
  console.log('Saved to extracted_units.txt');
} else {
  console.log('Not found');
}
