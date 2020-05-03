import * as THREE from 'three';
import { GUI } from 'dat.gui';

import { TransControlMode } from '../../models/Mode';

export class DatGUI {
  public guiFolder: GUI;

  constructor(private mode: TransControlMode, private mesh: THREE.Mesh | THREE.Group) {
    this.initGUI();
  }

  private target(mesh: THREE.Mesh) {
    switch (this.mode) {
      case 'translate':
        return mesh.position;
      case 'rotate':
        return mesh.rotation;
      case 'scale':
        return mesh.scale;
      default:
        return mesh.position;
    }
  }

  private initGUI() {
    const gui = new GUI();
    this.guiFolder = gui.addFolder(this.mode);
    if (this.mesh instanceof THREE.Mesh) {
      this.guiFolder.add(this.target(this.mesh), 'x', 0, Math.PI * 2, 0.01);
      this.guiFolder.add(this.target(this.mesh), 'y', 0, Math.PI * 2, 0.01);
      this.guiFolder.add(this.target(this.mesh), 'z', 0, Math.PI * 2, 0.01);
    } else if (this.mesh instanceof THREE.Group) {
      // when hand model
      // this.guiFolder.add(this.target, 'x', 0, Math.PI * 2, 0.01);
      // this.guiFolder.add(this.target, 'y', 0, Math.PI * 2, 0.01);
      // this.guiFolder.add(this.target, 'z', 0, Math.PI * 2, 0.01);
      console.log(this.mesh);
    }
    this.guiFolder.open();
  }

  update() {
    this.guiFolder.updateDisplay();
  }
}
