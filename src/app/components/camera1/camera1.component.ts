import { Component, OnInit } from '@angular/core';

declare var MediaRecorder: any;
declare var MediaSource: any;
declare var window: any;
@Component({
  selector: 'app-camera1',
  templateUrl: './camera1.component.html',
  styleUrls: ['./camera1.component.scss']
})
export class Camera1Component implements OnInit {
   mediaRecorder: any;
   recordedBlobs: any;
   sourceBuffer: any;
   mediaSource: any;
   errorMsgElement: any;
   recordButton: any;
   downloadButton: any;
   playButton: any;
  constructor() { }

  ngOnInit() {
    this.setupElements();
  }

  setupElements(){
    this.mediaSource = new MediaSource();
    this.mediaSource.addEventListener('sourceopen',()=>{this.handleSourceOpen} , false);


    this.errorMsgElement = document.querySelector('span#errorMsg');
    const recordedVideo :any= document.querySelector('video#recorded');
    this.recordButton = document.querySelector('button#record');
    this.recordButton.addEventListener('click', () => {
      if (this.recordButton.textContent === 'Start Recording') {
        this.startRecording();
      } else {
        this.stopRecording();
        this.recordButton.textContent = 'Start Recording';
        this.playButton.disabled = false;
        this.downloadButton.disabled = false;
      }
    });

    this.playButton = document.getElementById('play');
    this.playButton.addEventListener('click', () => {
      const superBuffer = new Blob(this.recordedBlobs, {type: 'video/webm'});
      recordedVideo.src = null;
      recordedVideo.srcObject = null;
      recordedVideo.src = window.URL.createObjectURL(superBuffer);
      recordedVideo.controls = true;
      recordedVideo.play();
    });

    this.downloadButton = document.querySelector('button#download');
    this.downloadButton.addEventListener('click', () => {
      const blob = new Blob(this.recordedBlobs, {type: 'video/webm'});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'test.webm';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    });



    document.querySelector('button#start').addEventListener('click', async () => {
      let echo: any = document.querySelector('#echoCancellation'); 
      const hasEchoCancellation = echo.checked;
      const constraints = {
        audio: {
          echoCancellation: {exact: hasEchoCancellation}
        },
        video: {
          width: 640, height: 480
        }
      };
      console.log('Using media constraints:', constraints);
      await this.init(constraints);
    });
  }

handleSourceOpen(event) {
  console.log('MediaSource opened');
  this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  console.log('Source buffer: ', this.sourceBuffer);
}

handleDataAvailable = (event)=> {
  if (event.data && event.data.size > 0) {
    this.recordedBlobs.push(event.data);
  }
}

startRecording() {
  this.recordedBlobs = [];
  let options = {mimeType: 'video/webm;codecs=vp9'};
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    console.error(`${options.mimeType} is not Supported`);
    this.errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
    options = {mimeType: 'video/webm;codecs=vp8'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not Supported`);
      this.errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
      options = {mimeType: 'video/webm'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not Supported`);
        this.errorMsgElement.innerHTML = `${options.mimeType} is not Supported`;
        options = {mimeType: ''};
      }
    }
  }

  try {
    this.mediaRecorder = new MediaRecorder(window.stream, options);
  } catch (e) {
    console.error('Exception while creating MediaRecorder:', e);
    this.errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
    return;
  }

  console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);
  this.recordButton.textContent = 'Stop Recording';
  this.playButton.disabled = true;
  this.downloadButton.disabled = true;
  this.mediaRecorder.onstop = (event) => {
    console.log('Recorder stopped: ', event);
  };
  this.mediaRecorder.ondataavailable = this.handleDataAvailable;
  this.mediaRecorder.start(10); // collect 10ms of data
  console.log('MediaRecorder started', this.mediaRecorder);
}

stopRecording() {
  this.mediaRecorder.stop();
  console.log('Recorded Blobs: ', this.recordedBlobs);
}

handleSuccess(stream) {
  this.recordButton.disabled = false;
  console.log('getUserMedia() got stream:', stream);
  window.stream = stream;

  const gumVideo:any = document.querySelector('video#gum');
  gumVideo.srcObject = stream;
}

async init(constraints) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.handleSuccess(stream);
  } catch (e) {
    console.error('navigator.getUserMedia error:', e);
    this.errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  }
}

}
