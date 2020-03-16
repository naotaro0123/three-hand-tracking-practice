import * as handpose from '@tensorflow-models/handpose';
import { ScatterGL, Point3D } from 'scatter-gl';

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 500;
const fingerLookupIndices = {
  thumb: [0, 1, 2, 3, 4],
  indexFinger: [0, 5, 6, 7, 8],
  middleFinger: [0, 9, 10, 11, 12],
  ringFinger: [0, 13, 14, 15, 16],
  pinky: [0, 17, 18, 19, 20]
}; // for rendering each finger as a polyline

export default class HelloMediaPipe {
  private model: handpose.HandPose;
  private video: HTMLVideoElement;
  private scatterGL: ScatterGL;
  private scatterGLHasInitialized: boolean = false;

  constructor() {
    this.init();
  }

  async init() {
    this.model = await handpose.load();
    await this.initContainer();
    await this.initVideo();
    await this.landmarksRealTime();
  }

  initContainer() {
    const div = document.createElement('div');
    div.id = 'parent';
    div.style.width = `${VIDEO_WIDTH}px`;
    div.style.height = `${VIDEO_HEIGHT}px`;
    document.body.appendChild(div);

    this.scatterGL = new ScatterGL(div, { 'rotateOnStart': false, 'selectEnabled': false });
  }

  async initVideo() {
    this.video = await this.setupCamera();
    this.video.play();
  }

  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const video = document.createElement('video');
    video.style.position = 'absolute';
    video.style.right = '0px';
    video.style.top = '0px';
    video.style.transform = 'scaleX(-1)';
    document.body.appendChild(video);
    const stream = await navigator.mediaDevices.getUserMedia({
      'audio': false,
      'video': {
        facingMode: 'user',
        // Only setting the video to a specified size in order to accommodate a
        // point cloud, so on mobile devices accept the default size.
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT
      },
    });
    video.srcObject = stream;
    return new Promise<HTMLVideoElement>((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  }

  landmarksRealTime() {
    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;
    this.video.width = videoWidth;
    this.video.height = videoHeight;
    this.frameLandmarks();
  }

  async frameLandmarks() {
    // These anchor points allow the hand pointcloud to resize according to its
    // position in the input.
    const ANCHOR_POINTS: Point3D[] = [
      [0, 0, 0], [0, -VIDEO_HEIGHT, 0],
      [-VIDEO_WIDTH, 0, 0], [-VIDEO_WIDTH, -VIDEO_HEIGHT, 0]
    ];
    const predictions = await this.model.estimateHands(this.video);
    if (predictions.length > 0) {
      const result = predictions[0].landmarks;

      if (this.scatterGL) {
        const pointsData = result.map(point => {
          return [-point[0], -point[1], -point[2]] as Point3D;
        });
        const dataset = new ScatterGL.Dataset([...pointsData, ...ANCHOR_POINTS]);

        if (!this.scatterGLHasInitialized) {
          this.scatterGL.render(dataset);

          const fingers = Object.keys(fingerLookupIndices);

          this.scatterGL.setSequences(fingers.map(finger => ({ indices: fingerLookupIndices[finger] })));
          this.scatterGL.setPointColorer((index) => {
            if (index < pointsData.length) {
              return 'steelblue';
            }
            return 'white';
          });
        } else {
          this.scatterGL.updateDataset(dataset);
        }
        this.scatterGLHasInitialized = true;
      }
    }
    requestAnimationFrame(() => this.frameLandmarks());
  }
}
