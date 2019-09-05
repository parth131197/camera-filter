import { Component, OnInit } from '@angular/core';
import * as filters from 'opentok-camera-filters/src/filters.js';


declare var MediaRecorder: any;

@Component({
  selector: 'app-video2',
  templateUrl: './video2.component.html',
  styleUrls: ['./video2.component.scss']
})
export class Video2Component implements OnInit {

  constructor() { }

  currentFilter;

  ngOnInit() {
    this.initVideoRecorder();
  }

  initVideoRecorder(){
    const canvas:any = document.getElementById('videoPlayerCanvas');

    let videoElement;
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    }).then(stream => {
      videoElement = document.getElementById('videoPlayer');
      videoElement.srcObject = stream;
      videoElement.muted = true;
      videoElement.setAttribute('id', 'videoPlayer');
      // videoElement.setAttribute('height',window.innerHeight);
      // videoElement.setAttribute('width',window.innerWidth);

      videoElement.setAttribute('playsinline', '');
      setTimeout(() => {
        videoElement.play();
      });
      videoElement.addEventListener('loadedmetadata', () => {
        // canvas.width = videoElement.videoWidth;
        // canvas.height = videoElement.videoHeight;
        canvas.setAttribute('width',videoElement.videoWidth);
        canvas.setAttribute('height',videoElement.videoHeight);

        let context = canvas.getContext('2d', {alpha: false});
        let canvasStream = canvas.captureStream();

        this.filterPicker(videoElement, canvas, filters, document.body);
        if (stream.getAudioTracks().length) {
          canvasStream.addTrack(stream.getAudioTracks()[0]);
        }
        // let videoPlayerContainer = document.getElementById('videoPlayerContainer');
        // document.body.appendChild(canvas);
        // videoPlayerContainer.appendChild(canvas);
        this.captureButton(canvas, canvasStream, document.body);
      });
    });
  }

  filterPicker = (videoElement, canvas, filters, appendTo) => {
    // hiding the filter initially
    let videoFilterContainer = document.getElementById('videoFilterContainer');
    videoFilterContainer.style.visibility = 'hidden';


    const changeFilter = f => {
      if (this.currentFilter) {
        this.currentFilter.stop();
      }
      this.currentFilter = filters[f](videoElement, canvas);
    };
  
    const selector = document.getElementById('videoFilterContainer');
    // selector.className = 'filterPicker';
    let f;
    for (f of Object.keys(filters)) {
      const option = document.createElement('div');
      option.className = 'filterOption';
      const span = document.createElement('span');
      span.innerHTML = f;
      option.appendChild(span);
      option.addEventListener('click', changeFilter.bind(this, f));
      selector.appendChild(option);
    }
    // appendTo.appendChild(selector);
    changeFilter('Normal');
  };
  
  changeFilterStatus(){
    let videoFilterContainer = document.getElementById('videoFilterContainer');
    console.log("videoFilterContainer.style.visibility:",JSON.stringify(videoFilterContainer.style.visibility) )

    videoFilterContainer.style.visibility == 'hidden' ? videoFilterContainer.style.visibility = 'visible':videoFilterContainer.style.visibility='hidden';
  }
  
  captureButton(canvas, canvasStream, appendTo) {

    const videoButtonsContainer = document.getElementById('videoButtonsContainer');
    const captureBtn = document.getElementById('recordButton');
    let canvasElement = document.getElementById('videoPlayerCanvas');
    let top =  canvasElement.clientHeight-120;
    
    // videoButtonsContainer.style.left = 'calc(50% - 20px)';
    videoButtonsContainer.style.top = top+'px';
    videoButtonsContainer.style.visibility = 'visible';

    let topFilter = top - 70;
    const videoFilterContainer = document.getElementById('videoFilterContainer');
    videoFilterContainer.style.top = topFilter+'px';
    const container = this.captureContainer(canvas, canvasStream, appendTo);
    // captureBtn.setAttribute('id', 'captureBtn');
    captureBtn.addEventListener('mousedown', () => {
      container.startCapturing();
    });
    captureBtn.addEventListener('mouseup', () => {
      setTimeout(()=>{
        container.stopCapturing();
        //appendTo.removeChild(recordingDiv);
      },3000)

    });
    // appendTo.appendChild(captureBtn);
  };


  captureContainer(canvas, canvasStream, appendTo) {
    let captured;
    const capturingVideo = this.captureVideo(canvasStream);
  
    const container = document.createElement('div');
    container.className = 'recording-container';
  
    const close = () => {
      document.getElementById('videoPlayerComponents').removeChild(container);
    };
    const closeButton = document.createElement('i');
    closeButton.className = 'closeButton ion-close-round';
    closeButton.addEventListener('click', close);
    container.appendChild(closeButton);
  
    const download = () => {
      if (captured) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = captured.getAttribute('src');
        a.download = `snap.${captured.tagName === 'IMG' ? 'png' : 'webm'}`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 100);
      }
    };
    const downloadButton = document.getElementById('downloadButton');
    // downloadButton.className = 'downloadButton ion-ios-download-outline';
    downloadButton.addEventListener('click', download);
    // container.appendChild(downloadButton);
  
    return {
      startCapturing: () => {
        return capturingVideo.start();
      },
      stopCapturing: () => {
        if (captured && captured.parentNode === container) {
          container.removeChild(captured);
        }
        capturingVideo.stop().then(c => {
          captured = c;
        }).catch(() => {
          // No enough video was captured, just get an image
          captured = this.captureImage(canvas);
        }).then(() => {
          container.appendChild(captured);
          document.getElementById('videoPlayerComponents').appendChild(container);
        });
      },
    };
  };
  
  captureVideo(canvasStream) {
    let mediaRecorder;
    let recordedBlobs;
    let capturePromise;
  
    return {
      start: () => {
        if (typeof MediaRecorder === 'undefined') {
          // We can't capture video we don't suppor the MediaRecorder API
          return false;
        }
        recordedBlobs = [];
        const options = { mimeType: 'video/webm;codecs=vp8' };
        mediaRecorder = new MediaRecorder(canvasStream, options);
        mediaRecorder.addEventListener('dataavailable', event => {
          if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
          }
          if (capturePromise) {
            // We have stopped and need to return all of the blobs
            if (
              // Firefox just has 1 really big blob
              (recordedBlobs.length === 1 && recordedBlobs[0].size > 300000) ||
              // Chrome has lots of little blobs
              recordedBlobs.length > 10
            ) {
              const recordedVideo = document.createElement('video');
              recordedVideo.className = 'captureVideo';
              recordedVideo.setAttribute('autoPlay', 'true');
              recordedVideo.setAttribute('loop', 'true');
              recordedVideo.setAttribute('controls', 'true');
              const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
              recordedVideo.src = window.URL.createObjectURL(superBuffer);
              capturePromise.resolve(recordedVideo);
            } else {
              capturePromise.reject('video not long enough');
            }
            capturePromise = null;
          }
        });
        mediaRecorder.start(10); // collect 10ms of data at a time
      },
      stop: () => {
        if (mediaRecorder) {
          mediaRecorder.stop();
          return new Promise((resolve, reject) => {
            capturePromise = {
              resolve,
              reject
            };
          });
        } else {
          // We don't support MediaRecorder API just take a snapshot
          return Promise.reject('We do not support the MediaRecorder API');
        }
      },
    };
  };

  captureImage(canvas) {
    const image = document.createElement('img');
    image.setAttribute('src', canvas.toDataURL('image/png'));
    image.className = 'captureImage';
    return image;
  };
  

}

