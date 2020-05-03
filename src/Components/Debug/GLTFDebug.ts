import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import { DatGUI } from '../common/DatGUI';
import { TransOrbitControls } from '../common/TransOrbitControls';
import { TransControlMode } from '../../models/Mode';

const GLTF_PATH = '../../assets/hand.gltf';
const radius180 = Math.PI;
const characterInfo = {
  position: [0.0, 5.0, 0.0],
  rotation: [0.0, radius180, 0.0],
  scale: [4.0, 4.0, 4.0],
};

export class GLTFDebug {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private gui: DatGUI;
  private mode: TransControlMode = 'rotate';
  private character: THREE.Group;

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(this.renderer.domElement);
    this.init();
  }

  async init() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.set(0, 10, -50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    this.scene = new THREE.Scene();

    const gridHelper = new THREE.GridHelper(200, 50);
    this.scene.add(gridHelper);

    const light = new THREE.DirectionalLight(0xffffff, 10);
    this.scene.add(light);

    this.addObject();
  }

  addObject() {
    const loader = new GLTFLoader();
    loader.load(GLTF_PATH, (gltf) => {
      this.character = gltf.scene;
      const {
        position: [posX, posY, posZ],
        rotation: [rotateX, rotateY, rotateZ],
        scale: [scaleX, scaleY, scaleZ],
      } = characterInfo;
      this.character.position.set(posX, posY, posZ);
      this.character.rotation.set(rotateX, rotateY, rotateZ);
      this.character.scale.set(scaleX, scaleY, scaleZ);

      this.character.traverse((mesh) => {
        if (mesh instanceof THREE.Mesh) {
          mesh.material = new THREE.MeshLambertMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
          });
        }
      });
      this.scene.add(this.character);

      this.commonInit();
      this.tick();
    });
  }

  commonInit() {
    this.gui = new DatGUI(this.mode, this.character);
    new TransOrbitControls(
      this.mode,
      this.camera,
      this.renderer,
      this.scene,
      this.character,
      this.tick()
    );
  }

  tick() {
    this.gui.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }
}
