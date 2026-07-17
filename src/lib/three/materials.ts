import * as THREE from 'three';

/** Gold metallic material for card borders */
export function createGoldMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#D4A843'),
    metalness: 0.9,
    roughness: 0.3,
    emissive: new THREE.Color('#3d2b0a'),
    emissiveIntensity: 0.4,
  });
}

/** Dark card surface material */
export function createCardFrontMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1a1a2e'),
    metalness: 0.2,
    roughness: 0.5,
    emissive: new THREE.Color('#0a0a1a'),
    emissiveIntensity: 0.2,
  });
}

/** Card back material with gold geometric pattern feel */
export function createCardBackMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#0d0d1a'),
    metalness: 0.7,
    roughness: 0.2,
    emissive: new THREE.Color('#1a1a05'),
    emissiveIntensity: 0.5,
  });
}

/** Glow material (additive blending for halo effects) */
export function createGlowMaterial(color: string = '#D4A843'): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

/** Energy ring material */
export function createRingMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#D4A843') },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vPosition;
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float uTime;
      uniform vec3 uColor;
      void main() {
        float alpha = 0.15 + 0.05 * sin(uTime * 2.0 + vUv.x * 10.0);
        alpha *= smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

/** Gold particle sprite texture (generated on-the-fly) */
export function createParticleTexture(): THREE.Texture {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 215, 0, 1)');
  gradient.addColorStop(0.2, 'rgba(212, 168, 67, 0.8)');
  gradient.addColorStop(0.5, 'rgba(180, 130, 30, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
