import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { TransControlMode } from '../../models/Mode';

export class TransOrbitControls {
  constructor(
    private mode: TransControlMode,
    private camera: THREE.Camera,
    private renderer: THREE.WebGLRenderer,
    private scene: THREE.Scene,
    private mesh: THREE.Mesh | THREE.Group,
    private tick: void
  ) {
    this.initControls();
  }

  private initControls() {
    const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    orbitControls.update();
    orbitControls.addEventListener('change', () => this.tick);

    const transControls = new TransformControls(this.camera, this.renderer.domElement);
    transControls.setMode(this.mode);
    transControls.addEventListener('change', () => this.tick);
    transControls.attach(this.mesh);
    transControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
    });
    this.scene.add(transControls);
  }
}
