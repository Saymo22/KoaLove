// Mídias locais de QA, sem conteúdo pessoal. Arquivos gerados são ignorados pelo Git.
const fs = require('node:fs');
const path = require('node:path');
const directory = path.resolve(__dirname, '../.snapshots/media');
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'foto.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><rect width="800" height="1000" fill="#563e68"/><circle cx="400" cy="380" r="180" fill="#e5a96e"/><text x="400" y="720" font-family="serif" font-size="50" text-anchor="middle" fill="white">Nossa foto de teste</text></svg>');
const samples = 8000 * 8, wav = Buffer.alloc(44 + samples * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVE', 8); wav.write('fmt ', 12);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40); fs.writeFileSync(path.join(directory, 'silencio.wav'), wav);
console.log(directory);
