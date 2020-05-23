// Convert MediaPipe Sample to TypeScript
// import { HandPoseMediaPipe as HelloPose } from './Components/HandPose/HandPoseMediaPipe';
// import { FaceMeshMediaPipe as HelloPose } from './Components/FaceMesh/FaceMeshMediaPipe';

// Original Test Code
// import { HandPoseCubeHands as HelloPose } from './Components/HandPose/HandPoseCubeHands';
import { HandPoseGLTF as HelloPose } from './Components/HandPose/HandPoseGLTF';

// Debug Sample
// import { DebugQuaternion as HelloPose } from './Components/Debug/DebugQuaternion';
// import { DebugHandPoseRotation as HelloPose } from './Components/Debug/DebugHandPoseRotation';
// import { DebugSkelton as HelloPose } from './Components/Debug/DebugSkelton';
// import { DebugGLTF as HelloPose } from './Components/Debug/DebugGLTF';

window.addEventListener('DOMContentLoaded', () => {
  new HelloPose();
});
