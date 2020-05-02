import * as THREE from 'three';

export const rotationAxis = {
  x: [1, 0, 0],
  y: [0, 1, 0],
  z: [0, 0, 1],
};
export type RotationAxis = keyof typeof rotationAxis;

export type Position = [number, number, number];

export type HandMeshs = {
  palmBase: THREE.Mesh[];
  thumb: THREE.Mesh[];
  indexFinger: THREE.Mesh[];
  middleFinger: THREE.Mesh[];
  ringFinger: THREE.Mesh[];
  pinky: THREE.Mesh[];
};
export type HandMeshType = keyof HandMeshs;
