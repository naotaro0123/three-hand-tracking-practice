import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class QuaternionSimple {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private mesh: THREE.Mesh;
  private guiFolder: GUI;

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
    this.initControls();
    this.initGUI();
    this.tick();
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

  initControls() {
    const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    orbitControls.update();
    orbitControls.addEventListener('change', () => this.tick);

    const transControls = new TransformControls(this.camera, this.renderer.domElement);
    transControls.setMode('rotate');
    transControls.addEventListener('change', () => this.tick);
    transControls.attach(this.mesh);
    transControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
    });
    this.scene.add(transControls);
  }

  initGUI() {
    const gui = new GUI();
    this.guiFolder = gui.addFolder('Rotate');
    this.guiFolder.add(this.mesh.rotation, 'x', 0, Math.PI * 2, 0.01);
    this.guiFolder.add(this.mesh.rotation, 'y', 0, Math.PI * 2, 0.01);
    this.guiFolder.add(this.mesh.rotation, 'z', 0, Math.PI * 2, 0.01);
    this.guiFolder.open();
  }

  tick() {
    this.setQuaternion();
    this.guiFolder.updateDisplay();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }
}
