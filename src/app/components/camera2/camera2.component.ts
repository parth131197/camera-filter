import { Component, OnInit } from '@angular/core';

declare var MediaRecorder: any;
declare var MediaSource: any;
declare var window: any;

@Component({
  selector: 'app-camera2',
  templateUrl: './camera2.component.html',
  styleUrls: ['./camera2.component.scss']
})
export class Camera2Component implements OnInit {

   mediaRecorder: any;
   recordedBlobs: any;
   sourceBuffer: any;
   mediaSource: any;
  //  downloadButton: any;
   showVideoButtons: boolean = false;
   showCrossButton: boolean = false;
   videoRecordingStatus: boolean =  false;
   timerValue: number = 5;
   intervalSub: any;
   videoCanvas: any;
   videoCanvasCtx :any;
   videoPlayer: any;
  //  playButton: any;
  constructor() { }

  ngOnInit() {
    
    this.setupElements();

  }

  async setupElements(){
    this.mediaSource = new MediaSource();
    this.mediaSource.addEventListener('sourceopen',()=>{this.handleSourceOpen} , false);
    
    const constraints = {
      audio: {
        echoCancellation: {exact: true}
      },
      video: true
    };
    console.log('Using media constraints:', constraints);
    await this.init(constraints);

  }

  startButtonClicked(){
    this.showCrossButton = false;
    this.showVideoButtons = true;
    this.videoRecordingStatus = true;
    this.startRecording();

    setTimeout(()=>{
      this.stopRecording();
      this.showCrossButton = true;
      this.videoRecordingStatus = false;
    }, this.timerValue*1000);

    this.intervalSub = setInterval(()=>{
      this.timerValue--;
    },1000);
  }

  playVideo(){
    const superBuffer = new Blob(this.recordedBlobs, {type: 'video/webm'});


    const recordedVideo = document.createElement('video');

    recordedVideo.className = 'recordedVideo';
    recordedVideo.id = 'recorded';

    recordedVideo.setAttribute('autoPlay', 'true');
    recordedVideo.setAttribute('loop', 'true');
    recordedVideo.setAttribute('controls', 'true');
    recordedVideo.setAttribute('playsinline', '');
            
    recordedVideo.src = null;
    recordedVideo.srcObject = null;
    recordedVideo.src = window.URL.createObjectURL(superBuffer);
    recordedVideo.controls = true;
    recordedVideo.play();

    document.getElementById('recorded-player-container').appendChild(recordedVideo);
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
      alert(`${options.mimeType} is not Supported`);
      options = {mimeType: 'video/webm;codecs=vp8'};
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not Supported`);
        alert(`${options.mimeType} is not Supported`);
        options = {mimeType: 'video/webm'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not Supported`);
          alert(`${options.mimeType} is not Supported`);
          options = {mimeType: ''};
        }
      }
    }

    try {
      this.mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e);
      alert(`Exception while creating MediaRecorder: ${JSON.stringify(e)}`);
      return;
    }

    console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);
    // this.playButton.disabled = true;
    this.mediaRecorder.onstop = (event) => {
      console.log('Recorder stopped: ', event);
      this.playVideo();
    };
    this.mediaRecorder.ondataavailable = this.handleDataAvailable;
    this.mediaRecorder.start(10); // collect 10ms of data
    console.log('MediaRecorder started', this.mediaRecorder);
  }

  stopRecording() {
    this.mediaRecorder.stop();
    if(this.intervalSub){
      clearInterval(this.intervalSub);
    }
    console.log('Recorded Blobs: ', this.recordedBlobs);
  }

  handleSuccess(stream) {
    console.log('getUserMedia() got stream:', stream);
    this.videoCanvas = document.getElementById('videoCanvas');
    // this.videoCanvasCtx = this.videoCanvas.getContext('2d');
    this.videoCanvasCtx = this.videoCanvas.getContext('2d', {alpha: false});
    this.videoCanvasCtx.filter = 'grayscale(100%)';
    console.log("videoCanvas:",this.videoCanvasCtx );
    // canvas stream
    
    let canvasStream = this.videoCanvas.captureStream();
    if (stream.getAudioTracks().length) {
      canvasStream.addTrack(stream.getAudioTracks()[0]);
    }


    window.stream = canvasStream;
    const gumVideo:any = document.querySelector('video#gum');
    gumVideo.srcObject = stream;
    gumVideo.muted = true;
    this.videoPlayer = gumVideo;
    
    // canvas.setAttribute('width',videoElement.videoWidth);
    // canvas.setAttribute('height',videoElement.videoHeight);


    this.drawVideoCanvas();
  }

  drawVideoCanvas(){
    this.videoCanvasCtx.drawImage(this.videoPlayer ,0, 0, 300, 225);
    requestAnimationFrame(()=> this.drawVideoCanvas());
  }

  async init(constraints) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.handleSuccess(stream);
    } catch (e) {
      console.error('navigator.getUserMedia error:', e);
      alert(`navigator.getUserMedia error:${e.toString()}`)
    }
  }
  closeVideo(){
    // document.getElementById('recorded').style.visibility = 'hidden';
    let recordedVideo: any = document.getElementById('recorded');
    document.getElementById('recorded-player-container').removeChild(recordedVideo);

    this.recordedBlobs = [];
    this.showCrossButton = false;
    this.showVideoButtons = false;
    this.timerValue = 5;
    
  }

  sendVideo(){
    console.log('Send clicked');
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
  }

  getTimerValue(){
    if(this.timerValue.toString().length < 2){
      return '0'+this.timerValue;
    }else return this.timerValue;
  }

}
