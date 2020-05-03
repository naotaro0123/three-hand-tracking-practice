import * as THREE from 'three';

import { DatGUI } from '../common/DatGUI';
import { TransOrbitControls } from '../common/TransOrbitControls';
import { TransControlMode } from '../../models/Mode';

export class QuaternionDebug {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private mesh: THREE.Mesh;
  private gui: DatGUI;
  private mode: TransControlMode = 'rotate';

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    this.init();
  }

  init() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.set(0, 10, -50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.scene = new THREE.Scene();

    const gridHelper = new THREE.GridHelper(200, 50);
    this.scene.add(gridHelper);

    this.addObject();
    this.commonInit();
    this.setQuaternion();
    this.tick();
  }

  commonInit() {
    this.gui = new DatGUI(this.mode, this.mesh);
    new TransOrbitControls(
      this.mode,
      this.camera,
      this.renderer,
      this.scene,
      this.mesh,
      this.tick()
    );
  }

  addObject() {
    const geometry = new THREE.BoxBufferGeometry(4, 7, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);

    this.addWireframe(geometry);
  }

  addWireframe(geometry) {
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    line.material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0.25,
      transparent: true,
    });
    this.scene.add(line);
  }

  setQuaternion() {
    const target = new THREE.Quaternion();
    const axis = new THREE.Vector3(0, 0, 1).normalize();
    target.setFromAxisAngle(axis, Math.PI / 2);
    this.mesh.rotation.setFromQuaternion(target);
    // quaternion.multiply(target);
  }

  tick() {
    this.gui.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }
}
