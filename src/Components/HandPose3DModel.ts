import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as handpose from '@tensorflow-models/handpose';

const WIDTH = 500;
const HEIGHT = 500;
const DEPTH = 0;

type Position = [number, number, number];

export class HandPose3DModel {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private palmBaseMesh: THREE.Mesh;
  private middleFingerMesh: THREE.Mesh;
  private thumbMesh: THREE.Mesh;
  private model: handpose.HandPose;
  private video: HTMLVideoElement;

  constructor() {
    this.width = WIDTH;
    this.height = HEIGHT;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    this.init();
  }

  async init() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.set(0, 10, -50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.scene = new THREE.Scene();

    const gridHelper = new THREE.GridHelper(200, 50);
    this.scene.add(gridHelper);

    await this.addParentObject();
    this.middleFingerMesh = await this.addChildObject(this.middleFingerMesh, 0x00ffff);
    this.thumbMesh = await this.addChildObject(this.thumbMesh, 0x0000ff);
    await this.initControls();
    await this.initHandPose();
    await this.tick();
  }

  initControls() {
    const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    orbitControls.update();
    orbitControls.addEventListener('change', () => this.tick);

    const transControls = new TransformControls(this.camera, this.renderer.domElement);
    transControls.addEventListener('change', () => this.tick);
    transControls.attach(this.palmBaseMesh);
    transControls.addEventListener('dragging-changed', event => {
      orbitControls.enabled = !event.value;
    });
    this.scene.add(transControls);
  }

  addParentObject() {
    const geometry = new THREE.BoxBufferGeometry(4, 7, 4);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide
    });
    this.palmBaseMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.palmBaseMesh);

    this.addWireframe(geometry);
  }

  addChildObject(mesh: THREE.Mesh, color: number): THREE.Mesh {
    const geometry = new THREE.ConeBufferGeometry(2, 5, 32);
    const material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide
    });
    mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    return mesh;
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

  async initHandPose() {
    this.model = await handpose.load();
    this.video = await this.setupCamera();
    await this.video.play();
  }

  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const video = document.createElement('video');
    video.style.transform = 'scaleX(-1)';
    document.body.appendChild(video);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        // Only setting the video to a specified size in order to accommodate a
        // point cloud, so on mobile devices accept the default size.
        width: WIDTH,
        height: HEIGHT
      }
    });
    video.srcObject = stream;
    return new Promise<HTMLVideoElement>(resolve => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  }

  tick() {
    this.predict();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }

  async predict() {
    const predictions = await this.model.estimateHands(this.video);
    if (predictions.length > 0) {
      const result = predictions[0].annotations;
      this.calclate(this.palmBaseMesh, result['palmBase'][0], result['middleFinger'][0]);
      this.calclate(this.middleFingerMesh, result['middleFinger'][3]);
      this.calclate(this.thumbMesh, result['thumb'][0]);
      const palmBase = this.normalizePosition(result['palmBase'][0]);
      const thumb = this.normalizePosition(result['thumb'][0]);
      console.log(
        `palmBase:${palmBase[0]}`,
        `thumb:${thumb[0]}`,
        thumb[0] - palmBase[0],
        palmBase[0] < thumb[0] ? '手の平' : '手の裏'
      );
    }
  }

  async calclate(mesh: THREE.Mesh, position: Position, comparePosition?: Position) {
    const rePosition = this.normalizePosition(position);
    mesh.position.set(...rePosition);

    if (comparePosition) {
      const reComparePosition = this.normalizePosition(comparePosition);
      this.normalizeRotation(mesh, rePosition, reComparePosition);
    } else {
      mesh.rotation.setFromQuaternion(this.palmBaseMesh.quaternion);
    }
  }

  normalizePosition(position: Position): Position {
    let normalizePosition: Position = [0, 0, 0];
    // Canvasの解像度位置で返されるので、WebGL用に-1.0〜1.0の値に正規化
    // normalizePosition[0] = (position[0] * 2.0 - WIDTH) / WIDTH; // X
    // normalizePosition[1] = (position[1] * 2.0 - HEIGHT) / HEIGHT; // Y
    const offset = 16;
    normalizePosition[0] = ((position[0] * 2.0 - WIDTH) / WIDTH) * offset + 2; // X
    normalizePosition[1] = -((position[1] * 2.0 - HEIGHT) / HEIGHT) * offset + 4; // Y
    // normalizePosition[2] = (position[2] * 2.0 - DEPTH) / DEPTH; // Z
    return normalizePosition;
  }

  normalizeRotation(mesh: THREE.Mesh, position: Position, comparePosition: Position) {
    let radian = Math.atan2(comparePosition[1] - position[1], comparePosition[0] - position[0]);
    const radian90 = Math.PI / 2;
    radian = radian - radian90;
    const target = new THREE.Quaternion();
    const axis = new THREE.Vector3(0, 0, 1).normalize();
    target.setFromAxisAngle(axis, radian);
    mesh.rotation.setFromQuaternion(target);
  }
}
