import * as THREE from 'three';

export const rotationAxis = {
  x: [1, 0, 0],
  y: [0, 1, 0],
  z: [0, 0, 1],
};
export type RotationAxisTypes = keyof typeof rotationAxis;

export type PositionTypes = [number, number, number];

export type HandMeshTypes = {
  palmBase: THREE.Mesh[];
  thumb: THREE.Mesh[];
  indexFinger: THREE.Mesh[];
  middleFinger: THREE.Mesh[];
  ringFinger: THREE.Mesh[];
  pinky: THREE.Mesh[];
};
