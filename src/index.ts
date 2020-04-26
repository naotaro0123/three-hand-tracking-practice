// import Simple from './Components/FirstStep';
// import { HandPoseMediaPipe as HelloPose } from './Components/HandPoseMediaPipe';
// import { FaceMeshMediaPipe as HelloPose } from './Components/FaceMeshMediaPipe';
import { HandPose3DModel as HelloPose } from './Components/HandPose3DModel';
// import { HandPose3DCubes as HelloPose } from './Components/HandPose3DCubes';
// import { QuaternionSimple as HelloPose } from './Components/QuaternionSimple';

window.addEventListener('DOMContentLoaded', () => {
  new HelloPose();
});
