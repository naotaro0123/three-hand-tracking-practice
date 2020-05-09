import * as THREE from 'three';
import { Uint16BufferAttribute, Float32BufferAttribute, DoubleSide } from 'three';
import { GUI } from 'dat.gui';
import { TransOrbitControls } from '../common/TransOrbitControls';
import { TransControlMode } from '../../models/Mode';

type SizingType = {
  segmentHeight: number;
  segmentCount: number;
  height: number;
  halfHeight: number;
};

const state = {
  animateBones: false,
};

export class GLTFSkelton {
  private width: number;
  private height: number;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private gui: GUI;
  private mesh: THREE.SkinnedMesh;
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
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x444444);

    this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 200);
    this.camera.position.z = 30;
    this.camera.position.y = 30;

    const lights: THREE.PointLight[] = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[0].position.set(0, 200, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1].position.set(100, 200, 100);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2].position.set(-100, -200, -100);
    lights.forEach((light) => {
      this.scene.add(light);
    });

    window.addEventListener(
      'resize',
      () => {
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
      },
      false
    );

    this.initBones();
    this.tick();
  }

  initBones() {
    const segmentHeight = 8;
    const segmentCount = 4;
    const height = segmentHeight * segmentCount;
    const sizing: SizingType = {
      segmentHeight,
      segmentCount,
      height,
      halfHeight: height * 0.5,
    };
    const geometry = this.createGeometry(sizing);
    const bones = this.createBones(sizing);
    this.mesh = this.createMesh(geometry, bones);
    this.mesh.scale.multiplyScalar(1);
    this.scene.add(this.mesh);
  }

  createBones(sizing: SizingType) {
    const bones: THREE.Bone[] = [];
    let prevBone = new THREE.Bone();
    bones.push(prevBone);
    prevBone.position.y = -sizing.halfHeight;

    for (let i = 0; i < sizing.segmentCount; i++) {
      const bone = new THREE.Bone();
      bone.position.y = sizing.segmentHeight;
      bones.push(bone);
      prevBone.add(bone);
      prevBone = bone;
    }
    return bones;
  }

  createMesh(geometry: THREE.CylinderBufferGeometry, bones: THREE.Bone[]) {
    const material = new THREE.MeshPhongMaterial({
      skinning: true,
      color: 0x156289,
      emissive: 0x072534,
      side: DoubleSide,
      flatShading: true,
    });
    const skinnedMesh = new THREE.SkinnedMesh(geometry, material);
    const skelton = new THREE.Skeleton(bones);
    skinnedMesh.add(bones[0]);
    skinnedMesh.bind(skelton);
    const skeltonHelper = new THREE.SkeletonHelper(skinnedMesh);
    this.scene.add(skeltonHelper);
    this.setupDatGui(bones);
    this.setupTransOrbitControl(bones[0]);
    return skinnedMesh;
  }

  setupDatGui(bones: THREE.Bone[]) {
    this.gui = new GUI();
    const folder = this.gui.addFolder('General Options');
    folder.add(state, 'animateBones');
    folder.__controllers[0].name('Animate Bones');

    for (let i = 0; i < bones.length; i++) {
      const bone = bones[i];
      const childFolder = this.gui.addFolder(`Bone${i}`);
      childFolder.add(bone.position, 'x', -10 + bone.position.x, 10 + bone.position.x);
      childFolder.add(bone.position, 'y', -10 + bone.position.y, 10 + bone.position.y);
      childFolder.add(bone.position, 'z', -10 + bone.position.z, 10 + bone.position.z);

      childFolder.add(bone.rotation, 'x', -Math.PI * 0.5, Math.PI * 0.5);
      childFolder.add(bone.rotation, 'y', -Math.PI * 0.5, Math.PI * 0.5);
      childFolder.add(bone.rotation, 'z', -Math.PI * 0.5, Math.PI * 0.5);

      childFolder.add(bone.scale, 'x', 0, 2);
      childFolder.add(bone.scale, 'y', 0, 2);
      childFolder.add(bone.scale, 'z', 0, 2);

      childFolder.__controllers[0].name('position.x');
      childFolder.__controllers[1].name('position.y');
      childFolder.__controllers[2].name('position.z');

      childFolder.__controllers[3].name('rotation.x');
      childFolder.__controllers[4].name('rotation.y');
      childFolder.__controllers[5].name('rotation.z');

      childFolder.__controllers[6].name('scale.x');
      childFolder.__controllers[7].name('scale.y');
      childFolder.__controllers[8].name('scale.z');
    }
  }

  setupTransOrbitControl(rootBone: THREE.Bone) {
    new TransOrbitControls(
      this.mode,
      this.camera,
      this.renderer,
      this.scene,
      rootBone,
      this.tick()
    );
  }

  createGeometry(sizing: SizingType) {
    const geometry = new THREE.CylinderBufferGeometry(
      5,
      5,
      sizing.height,
      8,
      sizing.segmentCount * 3,
      true
    );
    const position = geometry.attributes.position as THREE.BufferAttribute;
    const vertex = new THREE.Vector3();
    const skinIndices = [];
    const skinWeights = [];
    for (let i = 0; i < position.count; i++) {
      vertex.fromBufferAttribute(position, i);
      const y = vertex.y + sizing.halfHeight;
      const skinIndex = Math.floor(y / sizing.segmentHeight);
      const skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;
      skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
      skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
    }
    geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
    geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));
    return geometry;
  }

  tick() {
    this.gui.updateDisplay();
    const timer = Date.now() * 0.001;
    if (state.animateBones) {
      for (let i = 0; i < this.mesh.skeleton.bones.length; i++) {
        this.mesh.skeleton.bones[i].rotation.z =
          (Math.sin(timer) * 2) / this.mesh.skeleton.bones.length;
      }
    }
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.tick());
  }
}
