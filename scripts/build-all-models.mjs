import fs from 'fs';
import path from 'path';

// Helper for 3D vector rotation around Euler angles [rx, ry, rz]
function rotateVector(x, y, z, rx = 0, ry = 0, rz = 0) {
  // Rotate around X
  let y1 = y * Math.cos(rx) - z * Math.sin(rx);
  let z1 = y * Math.sin(rx) + z * Math.cos(rx);
  let x1 = x;

  // Rotate around Y
  let x2 = x1 * Math.cos(ry) + z1 * Math.sin(ry);
  let z2 = -x1 * Math.sin(ry) + z1 * Math.cos(ry);
  let y2 = y1;

  // Rotate around Z
  let x3 = x2 * Math.cos(rz) - y2 * Math.sin(rz);
  let y3 = x2 * Math.sin(rz) + y2 * Math.cos(rz);
  let z3 = z2;

  return [x3, y3, z3];
}

class GlbBuilder {
  constructor() {
    this.nodes = [];
    this.meshes = [];
    this.materials = [];
    this.accessors = [];
    this.bufferViews = [];
    this.binaryChunks = [];
    this.byteOffset = 0;
  }

  addMaterial(name, color = [0.8, 0.8, 0.8, 1.0], roughness = 0.5, metalness = 0.5, emissive = [0, 0, 0]) {
    const idx = this.materials.length;
    const mat = {
      name,
      pbrMetallicRoughness: {
        baseColorFactor: color,
        roughnessFactor: roughness,
        metallicFactor: metalness,
      },
    };
    if (emissive[0] > 0 || emissive[1] > 0 || emissive[2] > 0) {
      mat.emissiveFactor = emissive;
    }
    if (color[3] < 1.0) {
      mat.alphaMode = 'BLEND';
    }
    this.materials.push(mat);
    return idx;
  }

  addCustomGeometry(nodeName, positions, normals, indices, materialIdx, position = [0, 0, 0], rotation = [0, 0, 0], uvs = null) {
    const finalPositions = [];
    const finalNormals = [];

    let minPos = [Infinity, Infinity, Infinity];
    let maxPos = [-Infinity, -Infinity, -Infinity];

    for (let i = 0; i < positions.length; i += 3) {
      const [rx, ry, rz] = rotateVector(positions[i], positions[i + 1], positions[i + 2], rotation[0], rotation[1], rotation[2]);
      finalPositions.push(rx, ry, rz);
      minPos[0] = Math.min(minPos[0], rx);
      minPos[1] = Math.min(minPos[1], ry);
      minPos[2] = Math.min(minPos[2], rz);
      maxPos[0] = Math.max(maxPos[0], rx);
      maxPos[1] = Math.max(maxPos[1], ry);
      maxPos[2] = Math.max(maxPos[2], rz);
    }

    for (let i = 0; i < normals.length; i += 3) {
      const [nx, ny, nz] = rotateVector(normals[i], normals[i + 1], normals[i + 2], rotation[0], rotation[1], rotation[2]);
      finalNormals.push(nx, ny, nz);
    }

    const posBuffer = Buffer.alloc(finalPositions.length * 4);
    for (let i = 0; i < finalPositions.length; i++) {
      posBuffer.writeFloatLE(finalPositions[i], i * 4);
    }

    const normBuffer = Buffer.alloc(finalNormals.length * 4);
    for (let i = 0; i < finalNormals.length; i++) {
      normBuffer.writeFloatLE(finalNormals[i], i * 4);
    }

    const idxBuffer = Buffer.alloc(indices.length * 2);
    for (let i = 0; i < indices.length; i++) {
      idxBuffer.writeUInt16LE(indices[i], i * 2);
    }

    // BufferViews
    const posBvIdx = this.bufferViews.length;
    this.bufferViews.push({
      buffer: 0,
      byteOffset: this.byteOffset,
      byteLength: posBuffer.length,
      target: 34962, // ARRAY_BUFFER
    });
    this.binaryChunks.push(posBuffer);
    this.byteOffset += posBuffer.length;

    const normBvIdx = this.bufferViews.length;
    this.bufferViews.push({
      buffer: 0,
      byteOffset: this.byteOffset,
      byteLength: normBuffer.length,
      target: 34962,
    });
    this.binaryChunks.push(normBuffer);
    this.byteOffset += normBuffer.length;

    const idxBvIdx = this.bufferViews.length;
    this.bufferViews.push({
      buffer: 0,
      byteOffset: this.byteOffset,
      byteLength: idxBuffer.length,
      target: 34963, // ELEMENT_ARRAY_BUFFER
    });
    this.binaryChunks.push(idxBuffer);
    this.byteOffset += idxBuffer.length;

    let uvAccIdx = null;
    if (uvs && uvs.length > 0) {
      const uvBuffer = Buffer.alloc(uvs.length * 4);
      for (let i = 0; i < uvs.length; i++) {
        uvBuffer.writeFloatLE(uvs[i], i * 4);
      }
      const uvBvIdx = this.bufferViews.length;
      this.bufferViews.push({
        buffer: 0,
        byteOffset: this.byteOffset,
        byteLength: uvBuffer.length,
        target: 34962,
      });
      this.binaryChunks.push(uvBuffer);
      this.byteOffset += uvBuffer.length;

      const uvPad = (4 - (this.byteOffset % 4)) % 4;
      if (uvPad > 0) {
        this.binaryChunks.push(Buffer.alloc(uvPad, 0));
        this.byteOffset += uvPad;
      }

      uvAccIdx = this.accessors.length;
      this.accessors.push({
        bufferView: uvBvIdx,
        byteOffset: 0,
        componentType: 5126,
        count: uvs.length / 2,
        type: 'VEC2',
      });
    }

    const padding = (4 - (this.byteOffset % 4)) % 4;
    if (padding > 0) {
      this.binaryChunks.push(Buffer.alloc(padding, 0));
      this.byteOffset += padding;
    }

    // Accessors
    const posAccIdx = this.accessors.length;
    this.accessors.push({
      bufferView: posBvIdx,
      byteOffset: 0,
      componentType: 5126,
      count: finalPositions.length / 3,
      type: 'VEC3',
      max: maxPos,
      min: minPos,
    });

    const normAccIdx = this.accessors.length;
    this.accessors.push({
      bufferView: normBvIdx,
      byteOffset: 0,
      componentType: 5126,
      count: finalNormals.length / 3,
      type: 'VEC3',
    });

    const idxAccIdx = this.accessors.length;
    this.accessors.push({
      bufferView: idxBvIdx,
      byteOffset: 0,
      componentType: 5123,
      count: indices.length,
      type: 'SCALAR',
    });

    const meshIdx = this.meshes.length;
    const attributes = {
      POSITION: posAccIdx,
      NORMAL: normAccIdx,
    };
    if (uvAccIdx !== null) {
      attributes.TEXCOORD_0 = uvAccIdx;
    }
    this.meshes.push({
      name: `${nodeName}_mesh`,
      primitives: [
        {
          attributes,
          indices: idxAccIdx,
          material: materialIdx,
        },
      ],
    });

    const nodeIdx = this.nodes.length;
    this.nodes.push({
      name: nodeName,
      mesh: meshIdx,
      translation: position,
    });

    return nodeIdx;
  }

  addBox(nodeName, width, height, depth, materialIdx, position = [0, 0, 0], rotation = [0, 0, 0]) {
    const hw = width / 2;
    const hh = height / 2;
    const hd = depth / 2;

    const positions = [
      // Front
      -hw, -hh,  hd,   hw, -hh,  hd,   hw,  hh,  hd,  -hw,  hh,  hd,
      // Back
      -hw, -hh, -hd,  -hw,  hh, -hd,   hw,  hh, -hd,   hw, -hh, -hd,
      // Top
      -hw,  hh, -hd,  -hw,  hh,  hd,   hw,  hh,  hd,   hw,  hh, -hd,
      // Bottom
      -hw, -hh, -hd,   hw, -hh, -hd,   hw, -hh,  hd,  -hw, -hh,  hd,
      // Right
       hw, -hh, -hd,   hw,  hh, -hd,   hw,  hh,  hd,   hw, -hh,  hd,
      // Left
      -hw, -hh, -hd,  -hw, -hh,  hd,  -hw,  hh,  hd,  -hw,  hh, -hd,
    ];

    const normals = [
      // Front
       0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1,
      // Back
       0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1,
      // Top
       0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0,
      // Bottom
       0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0,
      // Right
       1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0,
      // Left
      -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,
    ];

    const indices = [];
    for (let f = 0; f < 6; f++) {
      const base = f * 4;
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    const uvs = [
      // Front
      0, 0,  1, 0,  1, 1,  0, 1,
      // Back
      1, 0,  0, 0,  0, 1,  1, 1,
      // Top
      0, 1,  0, 0,  1, 0,  1, 1,
      // Bottom
      0, 0,  1, 0,  1, 1,  0, 1,
      // Right
      0, 0,  1, 0,  1, 1,  0, 1,
      // Left
      1, 0,  0, 0,  0, 1,  1, 1,
    ];

    return this.addCustomGeometry(nodeName, positions, normals, indices, materialIdx, position, rotation, uvs);
  }

  addCylinder(nodeName, radiusTop, radiusBottom, height, segments = 16, materialIdx, position = [0, 0, 0], rotation = [0, 0, 0]) {
    const positions = [];
    const normals = [];
    const indices = [];
    const uvs = [];
    const halfH = height / 2;

    // Body
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const u = i / segments;

      positions.push(cos * radiusTop, halfH, sin * radiusTop);
      normals.push(cos, 0, sin);
      uvs.push(u, 1);

      positions.push(cos * radiusBottom, -halfH, sin * radiusBottom);
      normals.push(cos, 0, sin);
      uvs.push(u, 0);
    }

    for (let i = 0; i < segments; i++) {
      const v1 = i * 2;
      const v2 = v1 + 1;
      const v3 = (i + 1) * 2;
      const v4 = v3 + 1;
      indices.push(v1, v2, v3);
      indices.push(v3, v2, v4);
    }

    // Top cap
    const topCenterIdx = positions.length / 3;
    positions.push(0, halfH, 0);
    normals.push(0, 1, 0);
    uvs.push(0.5, 0.5);

    const topStartIdx = positions.length / 3;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions.push(Math.cos(angle) * radiusTop, halfH, Math.sin(angle) * radiusTop);
      normals.push(0, 1, 0);
      uvs.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
    }
    for (let i = 0; i < segments; i++) {
      indices.push(topCenterIdx, topStartIdx + i, topStartIdx + i + 1);
    }

    // Bottom cap
    const botCenterIdx = positions.length / 3;
    positions.push(0, -halfH, 0);
    normals.push(0, -1, 0);
    uvs.push(0.5, 0.5);

    const botStartIdx = positions.length / 3;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      positions.push(Math.cos(angle) * radiusBottom, -halfH, Math.sin(angle) * radiusBottom);
      normals.push(0, -1, 0);
      uvs.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
    }
    for (let i = 0; i < segments; i++) {
      indices.push(botCenterIdx, botStartIdx + i + 1, botStartIdx + i);
    }

    return this.addCustomGeometry(nodeName, positions, normals, indices, materialIdx, position, rotation, uvs);
  }

  build() {
    const fullBinBuffer = Buffer.concat(this.binaryChunks);
    const json = {
      asset: { version: '2.0', generator: 'PC-Ultra-Market-GlbBuilder-PRO' },
      scene: 0,
      scenes: [{ nodes: this.nodes.map((_, i) => i) }],
      nodes: this.nodes,
      meshes: this.meshes,
      materials: this.materials,
      accessors: this.accessors,
      bufferViews: this.bufferViews,
      buffers: [{ byteLength: fullBinBuffer.length }],
    };

    const jsonString = JSON.stringify(json);
    let jsonBuffer = Buffer.from(jsonString, 'utf8');
    const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
    if (jsonPadding > 0) {
      jsonBuffer = Buffer.concat([jsonBuffer, Buffer.alloc(jsonPadding, 0x20)]);
    }

    const totalLength = 12 + 8 + jsonBuffer.length + 8 + fullBinBuffer.length;

    const header = Buffer.alloc(12);
    header.writeUInt32LE(0x46546c67, 0); // "glTF"
    header.writeUInt32LE(2, 4); // version 2
    header.writeUInt32LE(totalLength, 8);

    const jsonChunkHeader = Buffer.alloc(8);
    jsonChunkHeader.writeUInt32LE(jsonBuffer.length, 0);
    jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4); // "JSON"

    const binChunkHeader = Buffer.alloc(8);
    binChunkHeader.writeUInt32LE(fullBinBuffer.length, 0);
    binChunkHeader.writeUInt32LE(0x004e4942, 4); // "BIN\0"

    return Buffer.concat([header, jsonChunkHeader, jsonBuffer, binChunkHeader, fullBinBuffer]);
  }
}

// -------------------------------------------------------------
// 1. MOTHERBOARD (ATX Enthusiast Class - ROG / AORUS Style)
// -------------------------------------------------------------
console.log('Generating Motherboard...');
const mb = new GlbBuilder();
const mbPcb = mb.addMaterial('MB_PCB', [0.06, 0.08, 0.12, 1.0], 0.7, 0.1);
const mbArmor = mb.addMaterial('MB_Armor', [0.12, 0.14, 0.18, 1.0], 0.35, 0.85);
const mbSilver = mb.addMaterial('MB_Silver', [0.75, 0.8, 0.85, 1.0], 0.2, 0.95);
const mbGold = mb.addMaterial('MB_Gold', [0.85, 0.7, 0.2, 1.0], 0.25, 0.95);
const mbCapacitor = mb.addMaterial('MB_Capacitor', [0.8, 0.82, 0.88, 1.0], 0.15, 0.9);
const mbSlotBlack = mb.addMaterial('MB_SlotBlack', [0.08, 0.09, 0.11, 1.0], 0.5, 0.2);
const mbRgb = mb.addMaterial('MB_RGB', [0.2, 0.5, 1.0, 1.0], 0.1, 0.0, [0.3, 0.6, 1.0]);

// Multi-layer main PCB
mb.addBox('PCB', 2.44, 0.04, 2.44, mbPcb, [0, 0, 0]);

// CPU Socket AM5 / LGA1700
mb.addBox('CPU_Socket_Base', 0.72, 0.05, 0.72, mbSlotBlack, [-0.2, 0.045, -0.28]);
mb.addBox('CPU_Socket_Pins', 0.6, 0.02, 0.6, mbGold, [-0.2, 0.075, -0.28]);
mb.addCylinder('Socket_Lever', 0.015, 0.015, 0.68, 12, mbSilver, [-0.58, 0.08, -0.28], [Math.PI / 2, 0, 0]);

// Massive VRM Heatsinks with fin grooves
mb.addBox('VRM_Top_Main', 1.15, 0.28, 0.38, mbArmor, [-0.2, 0.16, -0.85]);
for (let i = 0; i < 4; i++) {
  mb.addBox(`VRM_Top_Fin_${i}`, 1.1, 0.04, 0.02, mbSilver, [-0.2, 0.12 + i * 0.05, -0.7 + i * 0.04]);
}
mb.addBox('VRM_Left_IO', 0.38, 0.35, 1.15, mbArmor, [-0.88, 0.19, -0.32]);
mb.addBox('IO_Shield_Cover', 0.36, 0.4, 0.7, mbArmor, [-0.9, 0.22, -0.85]);
mb.addBox('IO_RGB_Badge', 0.15, 0.08, 0.35, mbRgb, [-0.88, 0.38, -0.8]);

// 4x DDR5 RAM DIMM Slots with lock clips
for (let i = 0; i < 4; i++) {
  const x = 0.58 + i * 0.13;
  mb.addBox(`RAM_Slot_${i}`, 0.08, 0.12, 1.35, mbSlotBlack, [x, 0.08, -0.32]);
  mb.addBox(`RAM_Clip_Top_${i}`, 0.07, 0.15, 0.08, mbSilver, [x, 0.09, -0.96]);
  mb.addBox(`RAM_Clip_Bot_${i}`, 0.07, 0.15, 0.08, mbSilver, [x, 0.09, 0.32]);
}

// 3x PCIe Slots (2x reinforced steel armor x16, 1x x4)
mb.addBox('PCIe_Slot_1_Armor', 1.7, 0.11, 0.12, mbSilver, [0.05, 0.075, 0.18]);
mb.addBox('PCIe_Slot_1_Gold', 1.5, 0.04, 0.03, mbGold, [0.05, 0.11, 0.18]);
mb.addBox('PCIe_Slot_2_Armor', 1.7, 0.11, 0.12, mbSilver, [0.05, 0.075, 0.78]);

// Dual M.2 Armor Shields with brushed silver trim
mb.addBox('M2_Shield_Top', 1.15, 0.08, 0.32, mbArmor, [0.05, 0.06, -0.06]);
mb.addBox('M2_Silver_Stripe', 1.1, 0.02, 0.04, mbSilver, [0.05, 0.105, -0.06]);
mb.addBox('M2_Shield_Bot', 1.15, 0.08, 0.32, mbArmor, [0.05, 0.06, 0.48]);

// Chipset Heatsink with geometric cuts
mb.addBox('Chipset_Block', 0.65, 0.18, 0.65, mbArmor, [0.72, 0.11, 0.65]);
mb.addBox('Chipset_RGB_Line', 0.55, 0.02, 0.04, mbRgb, [0.72, 0.205, 0.65]);

// 8x Solid Audio & VRM Cylindrical Capacitors
for (let i = 0; i < 4; i++) {
  mb.addCylinder(`Audio_Cap_${i}`, 0.04, 0.04, 0.12, 12, mbCapacitor, [-0.95, 0.08, 0.3 + i * 0.14]);
}
for (let i = 0; i < 4; i++) {
  mb.addCylinder(`VRM_Cap_${i}`, 0.035, 0.035, 0.14, 12, mbCapacitor, [-0.62, 0.09, -0.8 + i * 0.12]);
}

// 24-Pin ATX Main Power Connector
mb.addBox('ATX_24Pin', 0.16, 0.18, 0.52, mbSlotBlack, [1.08, 0.11, -0.15]);

fs.writeFileSync('public/models/motherboard.glb', mb.build());

// -------------------------------------------------------------
// 2. CPU PROCESSOR (AM5 / LGA1700 Flagship)
// -------------------------------------------------------------
console.log('Generating CPU...');
const cpu = new GlbBuilder();
const cpuSubstrate = cpu.addMaterial('CPU_Substrate', [0.12, 0.38, 0.2, 1.0], 0.6, 0.2);
const cpuIhs = cpu.addMaterial('CPU_IHS', [0.85, 0.88, 0.92, 1.0], 0.18, 0.98);
const cpuGoldPin = cpu.addMaterial('CPU_Pins', [0.92, 0.78, 0.25, 1.0], 0.2, 0.95);
const cpuCap = cpu.addMaterial('CPU_SMD', [0.4, 0.3, 0.15, 1.0], 0.5, 0.4);

// PCB Substrate with beveled wings
cpu.addBox('Substrate', 0.84, 0.03, 0.84, cpuSubstrate, [0, 0, 0]);
cpu.addBox('Alignment_Triangle', 0.04, 0.01, 0.04, cpuGoldPin, [-0.38, 0.02, -0.38]);

// Gold Contact Array underside
cpu.addBox('LGA_Pads', 0.76, 0.01, 0.76, cpuGoldPin, [0, -0.02, 0]);

// Nickel-Plated Copper IHS (Integrated Heat Spreader)
cpu.addBox('IHS_Base', 0.74, 0.03, 0.74, cpuIhs, [0, 0.03, 0]);
cpu.addBox('IHS_Cap', 0.66, 0.04, 0.66, cpuIhs, [0, 0.065, 0]);

// Center micro-etched laser engraving badge
cpu.addBox('IHS_Laser_Mark', 0.38, 0.005, 0.38, cpuIhs, [0, 0.088, 0]);

// 8x Miniature SMD Capacitors in perimeter cutouts
for (let i = 0; i < 4; i++) {
  cpu.addBox(`SMD_Cap_L_${i}`, 0.03, 0.02, 0.04, cpuCap, [-0.35, 0.03, -0.2 + i * 0.14]);
  cpu.addBox(`SMD_Cap_R_${i}`, 0.03, 0.02, 0.04, cpuCap, [0.35, 0.03, -0.2 + i * 0.14]);
}

fs.writeFileSync('public/models/cpu.glb', cpu.build());

// -------------------------------------------------------------
// 3. GRAPHICS CARD GPU (Triple-Fan RTX 4090 / ROG Strix)
// -------------------------------------------------------------
console.log('Generating GPU...');
const gpu = new GlbBuilder();
const gpuShroud = gpu.addMaterial('GPU_Shroud', [0.1, 0.12, 0.16, 1.0], 0.4, 0.8);
const gpuSilverPlate = gpu.addMaterial('GPU_Silver', [0.75, 0.78, 0.82, 1.0], 0.2, 0.95);
const gpuFins = gpu.addMaterial('GPU_Fins', [0.65, 0.7, 0.75, 1.0], 0.15, 0.9);
const gpuCopperPipe = gpu.addMaterial('GPU_Copper', [0.85, 0.45, 0.2, 1.0], 0.25, 0.95);
const gpuFanBlade = gpu.addMaterial('GPU_Blade', [0.15, 0.18, 0.22, 1.0], 0.3, 0.4);
const gpuRgbMat = gpu.addMaterial('GPU_RGB', [0.2, 0.55, 1.0, 1.0], 0.1, 0.0, [0.3, 0.6, 1.0]);
const gpuGoldFinger = gpu.addMaterial('GPU_Gold_PCIe', [0.88, 0.72, 0.2, 1.0], 0.2, 0.95);

// Solid metal backplate with geometric flow-through cutouts
gpu.addBox('Backplate', 2.95, 0.04, 1.15, gpuSilverPlate, [0, 0.54, 0]);
gpu.addBox('FlowThrough_Cutout', 0.5, 0.06, 0.8, gpuShroud, [0.95, 0.54, 0]);

// Dense aluminum fin stack heatsink block with individual visible cooling fins on side
gpu.addBox('Heatsink_FinBlock', 2.85, 0.42, 1.05, gpuFins, [0, 0.28, 0]);
for (let i = 0; i < 28; i++) {
  gpu.addBox(`Heatsink_Fin_${i}`, 0.02, 0.38, 0.08, gpuFins, [-1.35 + i * 0.1, 0.28, 0.54]);
}

// 4x Copper Heatpipes piercing the radiator and looping out on the visible side
for (let i = 0; i < 4; i++) {
  gpu.addCylinder(`Heatpipe_${i}`, 0.025, 0.025, 2.7, 12, gpuCopperPipe, [0, 0.18 + i * 0.06, -0.3 + i * 0.2], [0, 0, Math.PI / 2]);
  gpu.addCylinder(`Side_Heatpipe_${i}`, 0.022, 0.022, 2.5, 12, gpuCopperPipe, [-0.1, 0.16 + i * 0.07, 0.53], [0, 0, Math.PI / 2]);
}

// Aerodynamic sculpted front fan shroud
gpu.addBox('Front_Shroud', 3.0, 0.12, 1.2, gpuShroud, [0, 0.04, 0]);
gpu.addBox('Silver_Facet_L', 0.8, 0.03, 1.18, gpuSilverPlate, [-0.95, 0.11, 0]);
gpu.addBox('Silver_Facet_R', 0.8, 0.03, 1.18, gpuSilverPlate, [0.95, 0.11, 0]);

// Side GEFORCE RTX Illuminated Logo Plate
gpu.addBox('Side_Shroud_Frame', 2.4, 0.14, 0.04, gpuShroud, [-0.1, 0.32, 0.59]);
gpu.addBox('RGB_Side_Strip', 1.8, 0.09, 0.03, gpuRgbMat, [-0.1, 0.32, 0.61]);

// 3x High-Static Pressure Axial Fans
const fanCenters = [-0.85, 0, 0.85];
fanCenters.forEach((cx, fIdx) => {
  // Fan ring housing
  gpu.addCylinder(`Fan_Well_${fIdx}`, 0.38, 0.38, 0.06, 24, gpuShroud, [cx, 0.04, 0]);
  // Center metallic hub
  gpu.addCylinder(`Fan_Hub_${fIdx}`, 0.11, 0.11, 0.08, 16, gpuSilverPlate, [cx, 0.05, 0]);

  // 9x curved aerodynamic blades per fan
  for (let b = 0; b < 9; b++) {
    const angle = (b / 9) * Math.PI * 2;
    const bx = cx + Math.cos(angle) * 0.22;
    const bz = Math.sin(angle) * 0.22;
    gpu.addBox(`Blade_${fIdx}_${b}`, 0.18, 0.015, 0.06, gpuFanBlade, [bx, 0.05, bz], [0.3, -angle, 0]);
  }
});

// Dual-Slot PCIe Metal Mounting Bracket with DisplayPort / HDMI cutouts
gpu.addBox('PCIe_Bracket', 0.04, 0.85, 0.35, gpuSilverPlate, [-1.52, 0.22, 0.35]);
gpu.addBox('HDMI_Cutout_1', 0.05, 0.08, 0.04, gpuShroud, [-1.53, 0.12, 0.35]);
gpu.addBox('DP_Cutout_1', 0.05, 0.08, 0.04, gpuShroud, [-1.53, 0.26, 0.35]);
gpu.addBox('DP_Cutout_2', 0.05, 0.08, 0.04, gpuShroud, [-1.53, 0.40, 0.35]);

// Gold PCIe x16 Connector at bottom
gpu.addBox('PCIe_Gold_Fingers', 1.5, 0.08, 0.03, gpuGoldFinger, [-0.3, -0.06, -0.56]);

// 16-Pin 12VHPWR Power Socket
gpu.addBox('12VHPWR_Socket', 0.26, 0.12, 0.12, gpuShroud, [0.35, 0.46, 0.52]);

fs.writeFileSync('public/models/gpu.glb', gpu.build());

// -------------------------------------------------------------
// 4. DDR5 RAM MODULES (Dual Kit with ARGB Diffuser)
// -------------------------------------------------------------
console.log('Generating RAM...');
const ram = new GlbBuilder();
const ramHeatsink = ram.addMaterial('RAM_Armor', [0.12, 0.14, 0.18, 1.0], 0.3, 0.85);
const ramSilverEdge = ram.addMaterial('RAM_Silver', [0.75, 0.8, 0.85, 1.0], 0.2, 0.95);
const ramRgbDiffuser = ram.addMaterial('RAM_RGB_Bar', [0.35, 0.65, 1.0, 0.9], 0.15, 0.0, [0.4, 0.7, 1.0]);
const ramGold = ram.addMaterial('RAM_GoldPins', [0.9, 0.75, 0.2, 1.0], 0.2, 0.95);

// Stick 1
ram.addBox('Stick1_PCB', 0.03, 0.72, 1.34, ramHeatsink, [-0.07, 0, 0]);
ram.addBox('Stick1_Gold', 0.02, 0.06, 1.25, ramGold, [-0.07, -0.38, 0]);
ram.addBox('Stick1_Armor_L', 0.03, 0.65, 1.35, ramHeatsink, [-0.09, 0.04, 0]);
ram.addBox('Stick1_SilverAccent', 0.035, 0.15, 0.85, ramSilverEdge, [-0.09, 0.15, 0]);
ram.addBox('Stick1_RGB_Bar', 0.06, 0.11, 1.36, ramRgbDiffuser, [-0.07, 0.41, 0]);

// Stick 2 (Matched Pair)
ram.addBox('Stick2_PCB', 0.03, 0.72, 1.34, ramHeatsink, [0.07, 0, 0]);
ram.addBox('Stick2_Gold', 0.02, 0.06, 1.25, ramGold, [0.07, -0.38, 0]);
ram.addBox('Stick2_Armor_R', 0.03, 0.65, 1.35, ramHeatsink, [0.09, 0.04, 0]);
ram.addBox('Stick2_SilverAccent', 0.035, 0.15, 0.85, ramSilverEdge, [0.09, 0.15, 0]);
ram.addBox('Stick2_RGB_Bar', 0.06, 0.11, 1.36, ramRgbDiffuser, [0.07, 0.41, 0]);

fs.writeFileSync('public/models/ram.glb', ram.build());

// -------------------------------------------------------------
// 5. CPU COOLER (DeepCool AK620 Digital Dual-Tower ARGB)
// -------------------------------------------------------------
console.log('Generating Cooler...');
const cooler = new GlbBuilder();
const coolerBase = cooler.addMaterial('Cooler_MirrorBase', [0.85, 0.5, 0.25, 1.0], 0.15, 0.98);
const coolerFin = cooler.addMaterial('Cooler_Fins', [0.7, 0.75, 0.8, 1.0], 0.2, 0.95);
const coolerPipe = cooler.addMaterial('Cooler_CopperPipes', [0.88, 0.48, 0.22, 1.0], 0.2, 0.95);
const coolerFanBody = cooler.addMaterial('Cooler_FanFrame', [0.1, 0.12, 0.15, 1.0], 0.4, 0.3);
const coolerLcdGlass = cooler.addMaterial('Cooler_LCD_Display', [0.05, 0.08, 0.12, 1.0], 0.05, 0.9);
const coolerLcdText = cooler.addMaterial('Cooler_LCD_Glow', [0.2, 0.6, 1.0, 1.0], 0.1, 0.0, [0.3, 0.7, 1.0]);

// Mirror copper contact base
cooler.addBox('Base_Plate', 0.75, 0.08, 0.75, coolerBase, [0, -0.65, 0]);

// 6x U-shaped copper heatpipes
for (let i = 0; i < 3; i++) {
  const z = -0.22 + i * 0.22;
  cooler.addCylinder(`Pipe_L_${i}`, 0.03, 0.03, 1.25, 12, coolerPipe, [-0.28, 0, z]);
  cooler.addCylinder(`Pipe_R_${i}`, 0.03, 0.03, 1.25, 12, coolerPipe, [0.28, 0, z]);
}

// Tower 1 (Front Aluminum Matrix Fin Block)
cooler.addBox('Tower_Front', 0.42, 1.15, 1.15, coolerFin, [-0.32, 0, 0]);
// Tower 2 (Back Aluminum Matrix Fin Block)
cooler.addBox('Tower_Back', 0.42, 1.15, 1.15, coolerFin, [0.32, 0, 0]);

// Center 120mm PWM Fan
cooler.addBox('Center_Fan_Frame', 0.16, 1.12, 1.12, coolerFanBody, [0, 0, 0]);
cooler.addCylinder('Center_Fan_Hub', 0.18, 0.18, 0.17, 16, coolerFanBody, [0, 0, 0], [0, 0, Math.PI / 2]);

// Top Magnetic Decorative Covers
cooler.addBox('Top_Plate_Front', 0.44, 0.06, 1.18, coolerLcdGlass, [-0.32, 0.6, 0]);
cooler.addBox('Top_Plate_Back', 0.44, 0.06, 1.18, coolerLcdGlass, [0.32, 0.6, 0]);

// Digital Real-time Temperature LCD Display
cooler.addBox('LCD_Display_Unit', 0.35, 0.07, 0.65, coolerLcdGlass, [0, 0.61, 0]);
cooler.addBox('LCD_Temp_Digits_52C', 0.22, 0.01, 0.38, coolerLcdText, [0, 0.65, 0]);

fs.writeFileSync('public/models/cooler.glb', cooler.build());

// -------------------------------------------------------------
// 6. STORAGE SSD M.2 2280 NVMe
// -------------------------------------------------------------
console.log('Generating SSD...');
const ssd = new GlbBuilder();
const ssdPcbMat = ssd.addMaterial('SSD_PCB', [0.08, 0.1, 0.14, 1.0], 0.7, 0.2);
const ssdHeatsinkMat = ssd.addMaterial('SSD_Heatsink', [0.15, 0.18, 0.22, 1.0], 0.3, 0.9);
const ssdSilverStripe = ssd.addMaterial('SSD_Silver_Trim', [0.75, 0.8, 0.85, 1.0], 0.2, 0.95);
const ssdGoldMat = ssd.addMaterial('SSD_Gold_Fingers', [0.9, 0.75, 0.2, 1.0], 0.2, 0.95);
const ssdNandMat = ssd.addMaterial('SSD_NAND', [0.05, 0.05, 0.05, 1.0], 0.5, 0.1);

// Standard M.2 2280 PCB
ssd.addBox('M2_PCB', 1.25, 0.03, 0.36, ssdPcbMat, [0, 0, 0]);

// Gold PCIe Pins
ssd.addBox('M2_Gold_Pins', 0.12, 0.02, 0.34, ssdGoldMat, [-0.58, 0, 0]);

// Dual 3D NAND Chips
ssd.addBox('NAND_Flash_1', 0.32, 0.04, 0.28, ssdNandMat, [-0.1, 0.03, 0]);
ssd.addBox('NAND_Flash_2', 0.32, 0.04, 0.28, ssdNandMat, [0.28, 0.03, 0]);

// High-Speed Controller Chip
ssd.addBox('Controller_Chip', 0.18, 0.035, 0.18, ssdSilverStripe, [-0.38, 0.03, 0]);

// Grooved Heatsink Thermal Armor
ssd.addBox('Heatsink_Cover', 1.1, 0.06, 0.35, ssdHeatsinkMat, [0.04, 0.07, 0]);
ssd.addBox('Silver_Branding_Stripe', 0.95, 0.015, 0.04, ssdSilverStripe, [0.04, 0.105, 0]);

fs.writeFileSync('public/models/storage.glb', ssd.build());

// -------------------------------------------------------------
// 7. POWER SUPPLY PSU (Modular ATX 3.0 Gold)
// -------------------------------------------------------------
console.log('Generating PSU...');
const psu = new GlbBuilder();
const psuCase = psu.addMaterial('PSU_Steel', [0.1, 0.12, 0.15, 1.0], 0.45, 0.65);
const psuGoldBadge = psu.addMaterial('PSU_80PlusGold', [0.85, 0.68, 0.18, 1.0], 0.2, 0.95);
const psuGrille = psu.addMaterial('PSU_FanGrille', [0.25, 0.28, 0.34, 1.0], 0.2, 0.9);
const psuSocket = psu.addMaterial('PSU_Socket', [0.05, 0.05, 0.06, 1.0], 0.6, 0.1);

// Stamped Steel Housing
psu.addBox('PSU_Chassis', 1.55, 0.86, 1.45, psuCase, [0, 0, 0]);

// 135mm Silent FDB Fan Well & Concentric Grille
psu.addCylinder('Fan_Recess', 0.58, 0.58, 0.02, 24, psuCase, [0, 0.44, 0]);
psu.addCylinder('Fan_Center_Badge', 0.14, 0.14, 0.04, 16, psuGoldBadge, [0, 0.45, 0]);
for (let r = 0.25; r <= 0.52; r += 0.09) {
  psu.addCylinder(`Wire_Ring_${r}`, r, r, 0.015, 24, psuGrille, [0, 0.445, 0]);
}

// Rear AC Inlet & Rocker Power Switch
psu.addBox('AC_Inlet_Plug', 0.05, 0.22, 0.32, psuSocket, [-0.78, 0.15, 0.35]);
psu.addBox('Power_Rocker_Switch', 0.06, 0.15, 0.18, psuCase, [-0.78, 0.15, -0.35]);

// Front Fully Modular Cable Sockets Array
for (let r = 0; r < 2; r++) {
  for (let c = 0; c < 4; c++) {
    psu.addBox(`Modular_Socket_${r}_${c}`, 0.06, 0.14, 0.22, psuSocket, [0.78, -0.15 + r * 0.25, -0.45 + c * 0.3]);
  }
}

// 80 PLUS GOLD Side Emblem
psu.addBox('Gold_Emblem_Side', 0.45, 0.25, 0.02, psuGoldBadge, [0, 0, 0.73]);

fs.writeFileSync('public/models/psu.glb', psu.build());

// -------------------------------------------------------------
// 8. FULL PC CASE (Panoramic Dual-Chamber O11 Dynamic Style)
// -------------------------------------------------------------
console.log('Generating Case...');
const pcCase = new GlbBuilder();
const caseChassis = pcCase.addMaterial('Case_Chassis', [0.08, 0.1, 0.14, 1.0], 0.35, 0.75);
const caseGlass = pcCase.addMaterial('Case_TemperedGlass', [0.95, 0.98, 1.0, 0.08], 0.02, 0.1);
const caseMesh = pcCase.addMaterial('Case_DustMesh', [0.14, 0.16, 0.2, 1.0], 0.6, 0.5);
const caseAluminumFoot = pcCase.addMaterial('Case_Foot', [0.75, 0.78, 0.85, 1.0], 0.2, 0.95);
const caseRgb = pcCase.addMaterial('Case_RGB_Strip', [0.2, 0.55, 1.0, 1.0], 0.1, 0.0, [0.3, 0.6, 1.0]);
const caseGrommet = pcCase.addMaterial('Case_RubberGrommet', [0.04, 0.04, 0.05, 1.0], 0.8, 0.1);
const caseRadFins = pcCase.addMaterial('Case_RadiatorFins', [0.18, 0.2, 0.24, 1.0], 0.25, 0.85);

// Bottom PSU Compartment Shroud with intake vents
pcCase.addBox('PSU_Shroud_Chamber', 3.4, 0.82, 1.75, caseChassis, [0, -1.2, 0]);
pcCase.addBox('Shroud_Vents', 1.8, 0.02, 1.5, caseMesh, [0, -0.78, 0]);
// GPU Power Cable pass-through grommet in PSU shroud
pcCase.addBox('Shroud_GPU_Grommet', 0.42, 0.02, 0.16, caseGrommet, [0.35, -0.78, 0.45]);

// Top Ventilation Roof Panel & 360mm Radiator Stack
pcCase.addBox('Top_Mesh_Panel', 3.42, 0.08, 1.76, caseMesh, [0, 1.52, 0]);
pcCase.addBox('Top_Radiator_360', 3.0, 0.12, 1.25, caseRadFins, [0, 1.42, 0]);

// Motherboard Mounting Tray with cable management grommet
pcCase.addBox('Motherboard_Tray', 2.8, 2.6, 0.04, caseChassis, [0, 0.22, -0.66]);
pcCase.addBox('Cable_Grommet_ATX', 0.12, 0.65, 0.05, caseGrommet, [0.82, 0.42, -0.65]);

// Side/Front Fan Mounting Bracket (holds the 3x 120mm fans firmly)
pcCase.addBox('Front_Fan_Bracket', 0.04, 2.5, 0.88, caseChassis, [1.54, 0.18, 0]);

// Rear Panel with 7x PCIe Expansion slot cutouts & 120mm exhaust mesh
pcCase.addBox('Rear_Chassis_Wall', 0.08, 2.7, 1.75, caseChassis, [-1.7, 0.15, 0]);
for (let p = 0; p < 7; p++) {
  pcCase.addBox(`PCIe_Slot_Cover_${p}`, 0.09, 0.08, 0.45, caseMesh, [-1.7, -0.55 + p * 0.12, 0.35]);
}

// Front Panoramic Framework
pcCase.addBox('Front_Pillar_Frame', 0.1, 3.45, 0.1, caseChassis, [1.7, -0.18, 0.85]);
pcCase.addBox('Front_Glass_Panel', 0.03, 2.65, 1.68, caseGlass, [1.7, 0.18, 0]);

// Right Side Steel Panel with Dust Filter
pcCase.addBox('Right_Side_Steel', 3.4, 2.65, 0.05, caseChassis, [0, 0.18, -0.88]);

// Top I/O Port Array (Power button ring, Type-C, USB 3.0, Audio)
pcCase.addCylinder('Power_Button_Ring', 0.08, 0.08, 0.03, 16, caseRgb, [1.4, 1.56, 0.65]);
pcCase.addBox('USB_TypeC_Port', 0.05, 0.02, 0.02, caseAluminumFoot, [1.15, 1.56, 0.65]);
pcCase.addBox('USB_3_Port_1', 0.08, 0.02, 0.04, caseChassis, [0.95, 1.56, 0.65]);
pcCase.addBox('USB_3_Port_2', 0.08, 0.02, 0.04, caseChassis, [0.8, 1.56, 0.65]);

// 4x CNC Milled Aluminum Isolation Feet with non-slip pads
const feetPos = [
  [1.4, -1.68, 0.68],
  [1.4, -1.68, -0.68],
  [-1.4, -1.68, 0.68],
  [-1.4, -1.68, -0.68],
];
feetPos.forEach(([fx, fy, fz], idx) => {
  pcCase.addCylinder(`Foot_Alu_${idx}`, 0.16, 0.16, 0.12, 16, caseAluminumFoot, [fx, fy, fz]);
  pcCase.addCylinder(`Foot_Pad_${idx}`, 0.14, 0.14, 0.04, 16, caseChassis, [fx, fy - 0.07, fz]);
});

fs.writeFileSync('public/models/case.glb', pcCase.build());

console.log('✅ ALL 8 DETAILED 3D GLB MODELS SUCCESSFULLY COMPILED!');
