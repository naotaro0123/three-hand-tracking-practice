import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class HandPose3DModel {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private controls: OrbitControls;
  private mesh: THREE.Mesh;

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    this.initSetup();
  }

  initSetup() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      1,
      10000
    );
    this.camera.position.set(0, 30, -100);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.scene = new THREE.Scene();

    this.addObject();
    this.tick();
  }

  addObject() {
    const geometry = new THREE.BoxBufferGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide
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
      transparent: true
    });
    this.scene.add(line);
  }

  tick() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }
}
