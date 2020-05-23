import * as THREE from 'three';
import { GUI } from 'dat.gui';

import { TransControlMode } from '../../models/Mode';

export class DatGUI {
  private gui: GUI;

  constructor(private mode: TransControlMode, private object: THREE.Object3D) {
    this.initGUI();
  }

  private target(object: THREE.Object3D) {
    switch (this.mode) {
      case 'translate':
        return object.position;
      case 'rotate':
        return object.rotation;
      case 'scale':
        return object.scale;
      default:
        return object.position;
    }
  }

  private initGUI() {
    this.gui = new GUI();
    if (this.object instanceof THREE.Mesh) {
      this.addFolder(this.mode, this.object, true);
    } else if (this.object instanceof THREE.Bone) {
      this.addFoldersHandPose(this.object);
    }
  }

  private addFolder(folderName: string, object: THREE.Object3D, isOpen: boolean = false) {
    const guiFolder = this.gui.addFolder(folderName);
    const max = 10;
    const min = -max;
    ['x', 'y', 'z'].forEach((pos) => {
      guiFolder.add(this.target(object), pos, min, max, 0.01);
    });
    if (isOpen) {
      guiFolder.open();
    }
  }

  private addFoldersHandPose(group: THREE.Bone) {
    group.traverse((object) => {
      this.addFolder(object.name, object);
    });
  }

  update() {
    this.gui.updateDisplay();
  }
}
