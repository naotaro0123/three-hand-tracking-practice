import * as THREE from 'three';
import * as handpose from '@tensorflow-models/handpose';

import { Video } from '../common/Video';
import { DatGUI } from '../common/DatGUI';
import { Normalize } from '../common/Normalize';
import { TransOrbitControls } from '../common/TransOrbitControls';
import { TransControlMode } from '../../models/Mode';
import { PositionTypes } from '../../models/HandPose';

const WIDTH = 500;
const HEIGHT = 500;

export class DebugHandPoseRotation {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private palmBaseMesh: THREE.Mesh;
  private middleFingerMesh: THREE.Mesh[];
  private thumbMesh: THREE.Mesh;
  private model: handpose.HandPose;
  private video: HTMLVideoElement;
  private predictResult: { [key: string]: PositionTypes[] };
  private gui: DatGUI;
  private mode: TransControlMode = 'translate';
  private normalize: Normalize;

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

    await this.addParentObject();
    this.middleFingerMesh = await [
      this.addChildObject(0x00ffff),
      this.addChildObject(0x00ffaa),
      this.addChildObject(0x00ff55),
      this.addChildObject(0x00ff00),
    ];
    this.thumbMesh = await this.addChildObject(0xffffff);
    await this.initHandPose();
    await this.commonInit(this.palmBaseMesh);
    await this.tick();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.set(0, 10, -50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  commonInit(operateMesh: THREE.Mesh) {
    this.gui = new DatGUI(this.mode, operateMesh);
    new TransOrbitControls(
      this.mode,
      this.camera,
      this.renderer,
      this.scene,
      operateMesh,
      this.tick()
    );
  }

  addParentObject() {
    const geometry = new THREE.BoxBufferGeometry(3, 4, 3);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
    });
    this.palmBaseMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.palmBaseMesh);

    this.addWireframe(geometry);
  }

  addChildObject(color: number): THREE.Mesh {
    const geometry = new THREE.BoxBufferGeometry(2, 3, 2);
    const material = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);
    return mesh;
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
    this.normalize = new Normalize(this.width, this.height);
    const video = new Video(this.width, this.height);
    this.video = await video.setupWebCamera();
    await this.video.play();
  }

  tick() {
    this.predict();

    this.gui.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }

  async predict() {
    const predictions = await this.model.estimateHands(this.video);
    if (predictions.length > 0) {
      this.predictResult = predictions[0].annotations;
      const thumbPredict = this.predictResult['thumb'][0];
      // palmBaseMesh
      this.normalize.calclate(
        this.palmBaseMesh,
        this.predictResult['palmBase'][0],
        this.predictResult['middleFinger'][0],
        thumbPredict
      );
      // middleFingerMesh
      this.normalize.calclate(
        this.middleFingerMesh[0],
        this.predictResult['middleFinger'][0],
        this.predictResult['palmBase'][0],
        thumbPredict
      );
      this.normalize.calclate(
        this.middleFingerMesh[1],
        this.predictResult['middleFinger'][1],
        this.predictResult['middleFinger'][0],
        thumbPredict
      );
      this.normalize.calclate(
        this.middleFingerMesh[2],
        this.predictResult['middleFinger'][2],
        this.predictResult['middleFinger'][1],
        thumbPredict
      );
      this.normalize.calclate(
        this.middleFingerMesh[3],
        this.predictResult['middleFinger'][3],
        this.predictResult['middleFinger'][2],
        thumbPredict
      );
      // thumbMesh
      this.normalize.calclate(
        this.thumbMesh,
        this.predictResult['thumb'][0],
        this.predictResult['palmBase'][0],
        thumbPredict
      );

      console.log(
        this.predictResult.palmBase[0] < this.predictResult.thumb[0] ? 'FrontSide' : 'BackSide'
      );
    }
  }
}
