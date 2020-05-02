import * as THREE from 'three';
import * as handpose from '@tensorflow-models/handpose';

import { TransOrbitControls } from '../common/TransOrbitControls';
import { PositionTypes, HandMeshTypes } from '../../models/HandPose';

const WIDTH = 500;
const HEIGHT = 500;

export class HandPose3DHands {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private meshes: HandMeshTypes = {
    palmBase: [],
    thumb: [],
    indexFinger: [],
    middleFinger: [],
    ringFinger: [],
    pinky: [],
  };
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
    this.scene = new THREE.Scene();
    const gridHelper = new THREE.GridHelper(200, 50);
    this.scene.add(gridHelper);
    this.initCamera();
    await this.addObject();
    await this.commonInit();
    await this.initHandPose();
    await this.tick();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.set(0, 10, -40);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  commonInit() {
    new TransOrbitControls(
      'rotate',
      this.camera,
      this.renderer,
      this.scene,
      this.meshes.palmBase[0],
      this.tick()
    );
  }

  addObject() {
    const geometry = new THREE.BoxBufferGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
    });
    this.meshes.palmBase[0] = new THREE.Mesh(geometry, material);
    this.scene.add(this.meshes.palmBase[0]);

    this.addWireframe(geometry);
    // create non palmBase Mesh
    this.addOtherObjects(material);
  }

  addOtherObjects(material: THREE.MeshBasicMaterial) {
    const materials = [material.clone(), material.clone(), material.clone(), material.clone()];
    materials[0].color = new THREE.Color(0x00ffff);
    materials[1].color = new THREE.Color(0x0000ff);
    materials[2].color = new THREE.Color(0xff00ff);
    materials[3].color = new THREE.Color(0xff0000);

    const meshNames = Object.keys(this.meshes);
    for (let i = 1; i < meshNames.length; i++) {
      const mesh = this.meshes[meshNames[i]];
      for (let j = 0; j < 4; j++) {
        mesh[j] = this.meshes.palmBase[0].clone();
        mesh[j].material = materials[j];
        this.scene.add(mesh[j]);
      }
    }
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
        height: HEIGHT,
      },
    });
    video.srcObject = stream;
    return new Promise<HTMLVideoElement>((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  }

  tick() {
    this.predict();
    // console.log(this.mesh.position);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }

  async predict() {
    const predictions = await this.model.estimateHands(this.video);
    if (predictions.length > 0) {
      const result = predictions[0].annotations;
      const meshNames = Object.keys(this.meshes);
      meshNames.forEach((meshName) => {
        this.rePositionMeshes(result[meshName], this.meshes[meshName]);
      });
    }
  }

  rePositionMeshes(positions: PositionTypes[], mesh: THREE.Mesh) {
    positions.forEach((value, i) => {
      mesh[i].position.set(...this.normalize(value));
    });
  }

  normalize(position: PositionTypes): PositionTypes {
    let normalizePosition: PositionTypes = [0, 0, 0];
    // Canvasの解像度位置で返されるので、WebGL用に-1.0〜1.0の値に正規化
    // normalizePosition[0] = (position[0] * 2.0 - WIDTH) / WIDTH; // X
    // normalizePosition[1] = (position[1] * 2.0 - HEIGHT) / HEIGHT; // Y
    const offset = 16;
    normalizePosition[0] = ((position[0] * 2.0 - WIDTH) / WIDTH) * offset + 2; // X
    normalizePosition[1] = -((position[1] * 2.0 - HEIGHT) / HEIGHT) * offset + 4; // Y
    normalizePosition[2] = 0; // Z
    // console.log('position:', position);
    // console.log('normalizePosition:', normalizePosition);
    return normalizePosition;
  }
}
