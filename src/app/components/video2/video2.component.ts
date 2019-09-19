import { Component, OnInit } from '@angular/core';
import * as filters from 'opentok-camera-filters-new/src/filters.js';


declare var MediaRecorder: any;

@Component({
  selector: 'app-video2',
  templateUrl: './video2.component.html',
  styleUrls: ['./video2.component.scss']
})
export class Video2Component implements OnInit {

  public readonly TEMP_TIMER_SECONDS:any = 3;

  currentFilter;
  timerCount = this.TEMP_TIMER_SECONDS;
  intervalReference:any;
  showCounter: boolean = true;

  constructor() { }

  ngOnInit() {
    this.initVideoRecorder();
  }

  ngOnDestroy(){
    if(this.intervalReference){
      clearInterval(this.intervalReference);
    }
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
      
      videoElement.setAttribute('playsinline', '');
      setTimeout(() => {
        videoElement.play();
      });
      videoElement.addEventListener('loadedmetadata', () => {
        canvas.setAttribute('width',videoElement.videoWidth);
        canvas.setAttribute('height',videoElement.videoHeight);

        let context = canvas.getContext('2d', {alpha: false});
        let canvasStream = canvas.captureStream();

        this.filterPicker(videoElement, canvas, filters, document.body, stream);
        if (stream.getAudioTracks().length) {
          canvasStream.addTrack(stream.getAudioTracks()[0]);
        }
        this.captureButton(canvas, canvasStream, document.body);
      });
    });
  }

  filterPicker = (videoElement, canvas, filters, appendTo, stream) => {
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

    let f;

    for (f of Object.keys(filters)) {
      const option = document.createElement('div');
      option.className = 'filterOption';
      const span = document.createElement('span');
      span.innerHTML = f;
      option.appendChild(span);

      
      let videoFilterPlayer:any = document.createElement('video');
      videoFilterPlayer.srcObject = stream;

      videoFilterPlayer.setAttribute('playsinline', '');
      setTimeout(() => {
        videoFilterPlayer.play();
      });
      videoFilterPlayer.muted = true;
      videoFilterPlayer.style.height = "0%";
      videoFilterPlayer.style.width = "100%";
      videoFilterPlayer.className = 'videoFilterPlayer';
      let videoFilterCanvas = <HTMLCanvasElement> document.createElement('canvas');
      filters[f](videoFilterPlayer,videoFilterCanvas);
      videoFilterCanvas.style.height = "100%";
      videoFilterCanvas.style.width = "100%";
      option.appendChild(videoFilterCanvas);

      option.addEventListener('click', changeFilter.bind(this, f));
      
      selector.appendChild(option);
      
    }
    changeFilter('Normal');
  };
  
  copy(){
    let videoPlayerCanvas = <HTMLCanvasElement> document.getElementById('videoPlayerCanvas');
    let videoPlayerCanvasCtx = videoPlayerCanvas.getContext('2d');
    
    const displayData = <HTMLCanvasElement> document.getElementById('displayData');
    let ctx = displayData.getContext("2d");
    // ctx.drawImage(videoPlayerCanvas,0,0)
    this.fitImageOn(displayData, videoPlayerCanvas,ctx);
    filters['Fade'](videoPlayerCanvas,displayData);
  }

  changeFilterStatus(){
    let videoFilterContainer = document.getElementById('videoFilterContainer');
    // changing the visibility of the filter selector
    videoFilterContainer.style.visibility == 'hidden' ? videoFilterContainer.style.visibility = 'visible':videoFilterContainer.style.visibility='hidden';
    

  }


  fitImageOn(canvas, imageObj, context) {
    var imageAspectRatio = imageObj.width / imageObj.height;
    var canvasAspectRatio = canvas.width / canvas.height;
    var renderableHeight, renderableWidth, xStart, yStart;
  
    // If image's aspect ratio is less than canvas's we fit on height
    // and place the image centrally along width
    if(imageAspectRatio < canvasAspectRatio) {
      renderableHeight = canvas.height;
      renderableWidth = imageObj.width * (renderableHeight / imageObj.height);
      xStart = (canvas.width - renderableWidth) / 2;
      yStart = 0;
    }
  
    // If image's aspect ratio is greater than canvas's we fit on width
    // and place the image centrally along height
    else if(imageAspectRatio > canvasAspectRatio) {
      renderableWidth = canvas.width
      renderableHeight = imageObj.height * (renderableWidth / imageObj.width);
      xStart = 0;
      yStart = (canvas.height - renderableHeight) / 2;
    }
  
    // Happy path - keep aspect ratio
    else {
      renderableHeight = canvas.height;
      renderableWidth = canvas.width;
      xStart = 0;
      yStart = 0;
    }
    context.drawImage(imageObj, xStart, yStart, renderableWidth, renderableHeight);
  };
  
  captureButton(canvas, canvasStream, appendTo) {

    const videoButtonsContainer = document.getElementById('videoButtonsContainer');
    const captureBtn = document.getElementById('recordButton');
    let canvasElement = document.getElementById('videoPlayerCanvas');
    let top =  canvasElement.clientHeight-125;
    
    // videoButtonsContainer.style.left = 'calc(50% - 20px)';
    videoButtonsContainer.style.top = top+'px';
    videoButtonsContainer.style.visibility = 'visible';

    let topFilter = top - 120;
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
        
        if(this.intervalReference){
          clearInterval(this.intervalReference);
        }

      }, this.TEMP_TIMER_SECONDS*1000);

      // Start timer count
      this.timerCount= this.TEMP_TIMER_SECONDS;
      let timer = this.TEMP_TIMER_SECONDS;
      this.intervalReference = setInterval(()=>{
        timer--;
        if(timer.toString().length <= 1){
          this.timerCount = "0"+timer;
        }else{
          this.timerCount = timer;
        }
      },1000);

    });
    // appendTo.appendChild(captureBtn);
  };


  captureContainer(canvas, canvasStream, appendTo) {
    // hiding download button initially
    document.getElementById('downloadButtonContainerId').style.visibility = 'hidden';
    let captured;
    const capturingVideo = this.captureVideo(canvasStream);
  
    const container = document.createElement('div');
    container.className = 'recording-container';
  
    const close = () => {
      document.getElementById('videoPlayerComponents').removeChild(container);

      document.getElementById('videoFilterContainer').style.visibility = 'hidden';
      // Show the buttons container 
      document.getElementById('filterContainerId').style.visibility = 'visible';
      document.getElementById('recordButtonContainerId').style.visibility = 'visible'; 
      document.getElementById('downloadButtonContainerId').style.visibility = 'hidden';
      
      this.timerCount = '';
      this.showCounter = true;  
    };
    const closeButton = document.createElement('i');
    closeButton.className = 'videoCloseButton';
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
          document.getElementById('videoFilterContainer').style.visibility = 'hidden';

          document.getElementById('filterContainerId').style.visibility = 'hidden';
          document.getElementById('recordButtonContainerId').style.visibility = 'hidden';
          document.getElementById('downloadButtonContainerId').style.visibility = 'visible';
          this.showCounter = false; 

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
          alert('The browser does not support camera recording');
          return false;
        }
        recordedBlobs = [];
        const options = { mimeType: 'video/webm;codecs=vp9' };
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
              const superBuffer = new Blob(recordedBlobs, { type: 'video/webm;codecs=vp9' });
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
  
  getFilterOpenStatus(){
    let videoFilterContainer = document.getElementById('videoFilterContainer');
    if(videoFilterContainer.style.visibility == 'visible'){
      return true;
    }else{
      return false;
    } 
  }
}

