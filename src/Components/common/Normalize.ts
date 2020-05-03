import * as THREE from 'three';

import { rotationAxis, RotationAxisTypes, PositionTypes } from '../../models/HandPose';

export class Normalize {
  constructor(private width: number, private height: number) {}

  async calclate(
    mesh: THREE.Mesh,
    originPosition: PositionTypes,
    comparePosition: PositionTypes,
    thumbPredict: PositionTypes
  ) {
    const rePosition = this.normalizePosition(originPosition);
    mesh.position.set(...rePosition);

    const reComparePosition = this.normalizePosition(comparePosition);
    const quaternion = this.normalizeRotation(rePosition, reComparePosition, 'z');

    const thumb = this.normalizePosition(thumbPredict);
    const quaternionRotation = this.normalizeRotation(rePosition, thumb, 'y');
    mesh.rotation.setFromQuaternion(quaternion.multiply(quaternionRotation));
  }

  private normalizePosition(originPosition: PositionTypes): PositionTypes {
    let normalizePosition: PositionTypes = [0, 0, 0];
    // Canvasの解像度位置で返されるので、WebGL用に-1.0〜1.0の値に正規化
    // normalizePosition[0] = (position[0] * 2.0 - this.width) / this.width; // X
    // normalizePosition[1] = (position[1] * 2.0 - this.height) / this.height; // Y
    const offset = 16;
    normalizePosition[0] = ((originPosition[0] * 2.0 - this.width) / this.width) * offset + 2; // X
    normalizePosition[1] = -((originPosition[1] * 2.0 - this.height) / this.height) * offset + 4; // Y
    normalizePosition[2] = originPosition[2] * 0.1; // Z
    return normalizePosition;
  }

  private normalizeRotation(
    originPosition: PositionTypes,
    comparePosition: PositionTypes,
    selectAxis: RotationAxisTypes
  ): THREE.Quaternion {
    let radian = Math.atan2(
      comparePosition[1] - originPosition[1],
      comparePosition[0] - originPosition[0]
    );
    const radian90 = Math.PI / 2;
    radian = radian - radian90;
    const quaternion = new THREE.Quaternion();
    const axis = new THREE.Vector3(...rotationAxis[selectAxis]).normalize();
    quaternion.setFromAxisAngle(axis, radian);
    return quaternion;
  }
}
