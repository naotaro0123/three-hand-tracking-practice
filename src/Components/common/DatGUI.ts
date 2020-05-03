import * as THREE from 'three';
import { GUI } from 'dat.gui';

import { TransControlMode } from '../../models/Mode';

export class DatGUI {
  public guiFolder: GUI;

  constructor(private mode: TransControlMode, private mesh: THREE.Mesh | THREE.Group) {
    this.initGUI();
  }

  get target() {
    switch (this.mode) {
      case 'translate':
        return this.mesh.position;
      case 'rotate':
        return this.mesh.rotation;
      case 'scale':
        return this.mesh.scale;
      default:
        return this.mesh.position;
    }
  }

  private initGUI() {
    const gui = new GUI();
    this.guiFolder = gui.addFolder(this.mode);
    this.guiFolder.add(this.target, 'x', 0, Math.PI * 2, 0.01);
    this.guiFolder.add(this.target, 'y', 0, Math.PI * 2, 0.01);
    this.guiFolder.add(this.target, 'z', 0, Math.PI * 2, 0.01);
    this.guiFolder.open();
  }

  update() {
    this.guiFolder.updateDisplay();
  }
}
