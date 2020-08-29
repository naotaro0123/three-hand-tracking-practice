// Convert MediaPipe Sample to TypeScript
// import { HandPoseMediaPipe as HelloPose } from './Components/HandPose/HandPoseMediaPipe';
// import { FaceMeshMediaPipe as HelloPose } from './Components/FaceMesh/FaceMeshMediaPipe';

// Original Test Code
// import { HandPoseCubeHands as HelloPose } from './Components/HandPose/HandPoseCubeHands';
// import { HandPoseGLTFHands as HelloPose } from './Components/HandPose/HandPoseGLTFHands';
// import { HandPoseGLTFCube as HelloPose } from './Components/HandPose/HandPoseGLTFCube';

// Debug Sample
// import { DebugQuaternion as HelloPose } from './Components/Debug/DebugQuaternion';
// import { DebugHandPoseRotation as HelloPose } from './Components/Debug/DebugHandPoseRotation';
// import { DebugSkelton as HelloPose } from './Components/Debug/DebugSkelton';
import { DebugHandGLTF as HelloPose } from './Components/Debug/DebugHandGLTF';

window.addEventListener('DOMContentLoaded', () => {
  new HelloPose();
});
