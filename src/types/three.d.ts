import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    group: object;
    mesh: object;
    ambientLight: object;
    directionalLight: object;
    pointLight: object;
    spotLight: object;
    points: object;
    bufferGeometry: object;
    bufferAttribute: object;
    pointsMaterial: object;
    boxGeometry: object;
    planeGeometry: object;
    ringGeometry: object;
    circleGeometry: object;
    torusGeometry: object;
    meshBasicMaterial: object;
    meshStandardMaterial: object;
    primitive: object;
    color: object;
    shaderMaterial: object;
  }
}
