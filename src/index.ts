// Convert MediaPipe Sample to TypeScript
// import { HandPoseMediaPipe as HelloPose } from './Components/HandPose/HandPoseMediaPipe';
// import { FaceMeshMediaPipe as HelloPose } from './Components/FaceMesh/FaceMeshMediaPipe';

// Original Test Code
// import { HandPoseDebug as HelloPose } from './Components/HandPose/HandPoseDebug';
// import { HandPose3DHands as HelloPose } from './Components/HandPose/HandPose3DHands';

// Debug Sample
// import { QuaternionDebug as HelloPose } from './Components/Debug/QuaternionDebug';
// import { GLTFDebug as HelloPose } from './Components/Debug/GLTFDebug';
import { GLTFSkelton as HelloPose } from './Components/Debug/GLTFSkelton';

window.addEventListener('DOMContentLoaded', () => {
  new HelloPose();
});
