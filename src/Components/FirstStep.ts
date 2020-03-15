import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function FirstStep() {
  init();

  function init() {
    const width = 960;
    const height = 540;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({
      canvas
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(0, 500, 1000);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const controls = new OrbitControls(camera, renderer.domElement);
    // 滑らかにカメラコントローラーを制御する
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    const container = new THREE.Object3D();
    scene.add(container);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0x999999);
    scene.add(ambientLight);

    const material = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide
    });

    const geometryList = [
      new THREE.SphereBufferGeometry(50),
      new THREE.BoxBufferGeometry(100, 100, 100),
      new THREE.PlaneBufferGeometry(100, 100),
      new THREE.TetrahedronBufferGeometry(100, 0),
      new THREE.ConeBufferGeometry(100, 100, 32),
      new THREE.CylinderBufferGeometry(50, 50, 100, 32),
      new THREE.TorusBufferGeometry(50, 30, 16, 100)
    ];

    geometryList.forEach((geometry, index) => {
      const mesh = new THREE.Mesh(geometry, material);
      container.add(mesh);

      mesh.position.x =
        400 * Math.sin((index / geometryList.length) * Math.PI * 2);
      mesh.position.z =
        400 * Math.cos((index / geometryList.length) * Math.PI * 2);
    });

    tick();

    function tick() {
      controls.update();
      container.rotation.y += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }
  }
}
