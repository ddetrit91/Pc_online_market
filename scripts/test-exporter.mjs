import * as THREE from 'three';
import fs from 'fs';

if (typeof FileReader === 'undefined') {
  global.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
      });
    }
  };
}

const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');

const exporter = new GLTFExporter();
const scene = new THREE.Scene();
const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
scene.add(box);

try {
  const gltf = await exporter.parseAsync(scene, { binary: true });
  fs.writeFileSync('public/models/test.glb', Buffer.from(gltf));
  console.log('SUCCESS! test.glb size:', fs.statSync('public/models/test.glb').size);
} catch (e) {
  console.error('FAILED:', e);
}
