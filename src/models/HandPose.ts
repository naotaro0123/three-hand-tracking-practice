import * as THREE from 'three';

export const rotationAxis = {
  x: [1, 0, 0],
  y: [0, 1, 0],
  z: [0, 0, 1],
};
export type RotationAxisTypes = keyof typeof rotationAxis;

export type PositionTypes = [number, number, number];

export type HandNameTypes =
  | 'palmBase'
  | 'thumb'
  | 'indexFinger'
  | 'middleFinger'
  | 'ringFinger'
  | 'pinky';
export type HandMeshTypes = { [k in HandNameTypes]?: THREE.Mesh[] };
export type HandBoneTypes = { [k in HandNameTypes]?: THREE.Bone };
