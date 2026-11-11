import fs from 'fs';

function createGlb(json, binaryBuffer = Buffer.alloc(0)) {
  const jsonString = JSON.stringify(json);
  let jsonBuffer = Buffer.from(jsonString, 'utf8');
  // Pad JSON to 4-byte boundary with spaces (0x20)
  const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
  if (jsonPadding > 0) {
    jsonBuffer = Buffer.concat([jsonBuffer, Buffer.alloc(jsonPadding, 0x20)]);
  }

  // Pad Binary buffer to 4-byte boundary with zeros (0x00)
  let binBuffer = binaryBuffer;
  const binPadding = (4 - (binBuffer.length % 4)) % 4;
  if (binPadding > 0) {
    binBuffer = Buffer.concat([binBuffer, Buffer.alloc(binPadding, 0x00)]);
  }

  const hasBin = binBuffer.length > 0;
  const totalLength = 12 + 8 + jsonBuffer.length + (hasBin ? 8 + binBuffer.length : 0);

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // "glTF"
  header.writeUInt32LE(2, 4); // version 2
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4); // "JSON"

  const chunks = [header, jsonChunkHeader, jsonBuffer];

  if (hasBin) {
    const binChunkHeader = Buffer.alloc(8);
    binChunkHeader.writeUInt32LE(binBuffer.length, 0);
    binChunkHeader.writeUInt32LE(0x004e4942, 4); // "BIN\0"
    chunks.push(binChunkHeader, binBuffer);
  }

  return Buffer.concat(chunks);
}

// Minimal valid box glTF
const sampleGltf = {
  asset: { version: '2.0', generator: 'PC-Ultra-Market' },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ name: 'TestNode' }],
};

const glb = createGlb(sampleGltf);
fs.writeFileSync('public/models/test.glb', glb);
console.log('Written test.glb, size:', glb.length);
