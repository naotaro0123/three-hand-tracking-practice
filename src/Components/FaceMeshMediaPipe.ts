import * as facemesh from '@tensorflow-models/facemesh';
import { ScatterGL } from 'scatter-gl';

import { TRIANGULATION } from '../const/triangulation';

const VIDEO_SIZE = 430;

export class FaceMeshMediaPipe {
  private container: HTMLDivElement;
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private model: facemesh.FaceMesh;
  private scatterGL: ScatterGL;
  private scatterGLHasInitialized: boolean = false;

  constructor() {
    this.init();
  }

  async init() {
    this.video = await this.setupCamera();
    this.video.play();
    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;
    this.video.width = videoWidth;
    this.video.height = videoHeight;

    this.canvas = document.createElement('canvas');
    this.canvas.id = 'output';
    this.canvas.width = videoWidth;
    this.canvas.height = videoHeight;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0px';
    this.canvas.style.right = '0px';
    this.canvas.style.zIndex = '5';
    document.body.appendChild(this.canvas);

    this.initContainer();

    this.context = this.canvas.getContext('2d');
    this.context.translate(this.canvas.width, 0);
    this.context.scale(-1, 1);
    this.context.fillStyle = '#32EEDB';
    this.context.strokeStyle = '#32EEDB';
    this.context.lineWidth = 0.5;

    this.model = await facemesh.load({ maxFaces: 10 });
    this.renderPrediction();

    this.scatterGL = new ScatterGL(this.container, {
      rotateOnStart: false,
      selectEnabled: false,
    });
  }

  initContainer() {
    this.container = document.createElement('div');
    this.container.id = 'parent';
    this.container.style.width = `${VIDEO_SIZE}px`;
    this.container.style.height = `${VIDEO_SIZE}px`;
    document.body.appendChild(this.container);
  }

  async setupCamera() {
    const video = document.createElement('video');
    video.style.position = 'absolute';
    video.style.left = VIDEO_SIZE + 'px';
    video.style.top = '0px';
    video.style.transform = 'scaleX(-1)';
    document.body.appendChild(video);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        // Only setting the video to a specified size in order to accommodate a
        // point cloud, so on mobile devices accept the default size.
        width: VIDEO_SIZE,
        height: VIDEO_SIZE,
      },
    });
    video.srcObject = stream;

    return new Promise<HTMLVideoElement>((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  }

  async renderPrediction() {
    const predictions = await this.model.estimateFaces(this.video);
    this.context.drawImage(
      this.video,
      0,
      0,
      VIDEO_SIZE,
      VIDEO_SIZE,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    if (predictions.length > 0) {
      predictions.forEach((prediction) => {
        const keypoints = prediction.scaledMesh;

        for (let i = 0; i < TRIANGULATION.length / 3; i++) {
          const points = [
            TRIANGULATION[i * 3],
            TRIANGULATION[i * 3 + 1],
            TRIANGULATION[i * 3 + 2],
          ].map((index) => keypoints[index]);
          this.drawPath(points);
        }
      });

      const pointData = predictions.map((prediction) => {
        const scaledMesh = prediction.scaledMesh as [];
        return scaledMesh.map((point) => [-point[0], -point[1], -point[2]]);
      });

      let flattenedPointsData = [];
      for (let i = 0; i < pointData.length; i++) {
        flattenedPointsData = flattenedPointsData.concat(pointData[i]);
      }

      const dataset = new ScatterGL.Dataset(flattenedPointsData);
      if (!this.scatterGLHasInitialized) {
        this.scatterGL.render(dataset);
      } else {
        this.scatterGL.updateDataset(dataset);
      }
      this.scatterGLHasInitialized = true;
    }
    requestAnimationFrame(() => this.renderPrediction());
  }

  drawPoint(y: number, x: number, r: number) {
    this.context.beginPath();
    this.context.arc(x, y, r, 0, 2 * Math.PI);
    this.context.fill();
  }

  drawPath(points: number[]) {
    const region = new Path2D();
    region.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      region.lineTo(point[0], point[1]);
    }
    this.context.stroke(region);
  }
}
