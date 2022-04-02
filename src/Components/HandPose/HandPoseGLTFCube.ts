import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';

import { Video } from '../common/Video';
import { DatGUI } from '../common/DatGUI';
import { Normalize } from '../common/Normalize';
import { TransOrbitControls } from '../common/TransOrbitControls';
import { TransControlMode } from '../../models/Mode';
import { PositionTypes, HandNameTypes } from '../../models/HandPose';

const WIDTH = 600;
const HEIGHT = 600;
const GLTF_PATH = './assets/cube.gltf';
const radius180 = Math.PI;
const characterInfo = {
  position: [0.0, 0.0, 0.0],
  rotation: [0.0, radius180, 0.0],
  scale: [4.0, 4.0, 4.0],
};
const isNoPredict = false;
const isShowHelper = false;

export class HandPoseGLTFCube {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private model: handpose.HandPose;
  private video: HTMLVideoElement;
  private predictResult: { [key: string]: PositionTypes[] };
  private gui: DatGUI;
  private mode: TransControlMode = 'rotate';
  private normalize: Normalize;
  private characterGroup: THREE.Group;
  private rootBone: THREE.Bone;

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

  init() {
    this.scene = new THREE.Scene();
    const gridHelper = new THREE.GridHelper(200, 50);
    this.scene.add(gridHelper);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(0, 2, -2);
    this.scene.add(directionalLight);

    if (isShowHelper) {
      const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 15);
      this.scene.add(directionalLightHelper);
    }

    const pointLightLeft = new THREE.PointLight(0xffffff, 1.0);
    pointLightLeft.position.set(10, 5, -2);
    this.scene.add(pointLightLeft);

    if (isShowHelper) {
      const pointLightLeftHelper = new THREE.PointLightHelper(pointLightLeft);
      this.scene.add(pointLightLeftHelper);
    }

    const pointLightRight = new THREE.PointLight(0xffffff, 1.0);
    pointLightRight.position.set(-10, 5, -2);
    this.scene.add(pointLightRight);

    if (isShowHelper) {
      const pointLightRightHelper = new THREE.PointLightHelper(pointLightRight);
      this.scene.add(pointLightRightHelper);
    }

    this.initCamera();

    this.addObject();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
    this.camera.position.set(0, 10, -50);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
  }

  async addObject() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(GLTF_PATH);
    this.characterGroup = gltf.scene;
    const {
      position: [posX, posY, posZ],
      rotation: [rotateX, rotateY, rotateZ],
      scale: [scaleX, scaleY, scaleZ],
    } = characterInfo;
    this.characterGroup.position.set(posX, posY, posZ);
    this.characterGroup.rotation.set(rotateX, rotateY, rotateZ);
    this.characterGroup.scale.set(scaleX, scaleY, scaleZ);
    this.scene.add(this.characterGroup);

    const armature = this.characterGroup.children[0];
    const skeltonHelper = new THREE.SkeletonHelper(armature);
    this.scene.add(skeltonHelper);

    this.characterGroup.traverse(async (mesh) => {
      if (mesh.type === 'SkinnedMesh') {
        await this.initHandPose();
        await this.commonInit(mesh as THREE.SkinnedMesh);
        await this.tick();
      }
    });
  }

  async initHandPose() {
    if (!isNoPredict) {
      this.model = await handpose.load();
    }
    this.normalize = new Normalize(this.width, this.height);
    const video = new Video(this.width, this.height);
    this.video = await video.setupWebCamera();
    await this.video.play();
  }

  commonInit(operateMesh: THREE.SkinnedMesh) {
    this.rootBone = operateMesh.skeleton.bones[0];

    this.gui = new DatGUI(this.mode, this.rootBone);
    new TransOrbitControls(
      this.mode,
      this.camera,
      this.renderer,
      this.scene,
      this.rootBone,
      this.tick()
    );
  }

  tick() {
    if (!isNoPredict) {
      this.predict();
    }

    this.gui.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }

  async predict() {
    const predictions = await this.model.estimateHands(this.video);
    if (predictions.length > 0) {
      this.predictResult = predictions[0].annotations;
      this.rePositionMeshs();
    }
  }

  rePositionMeshs() {
    const thumbPredict = this.predictResult['thumb'][0];
    this.rootBone.traverse((bone) => {
      const index = Number(bone.name.replace(/[a-zA-Z]/g, ''));
      const boneName = bone.name.replace(/[0-9]/g, '') as HandNameTypes;
      if (boneName === 'palmBase') {
        this.normalize.calclate(
          bone,
          this.predictResult[boneName][index],
          this.predictResult['middleFinger'][0],
          thumbPredict
        );
      } else {
        const comprePredictResult =
          index === 0 ? this.predictResult['palmBase'][0] : this.predictResult[boneName][index - 1];
        this.normalize.calclate(
          bone,
          this.predictResult[boneName][index],
          comprePredictResult,
          thumbPredict,
          false
        );
      }
    });
  }
}
