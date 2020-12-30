import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { TwilioService } from './services/twilio.service';
// import * as Video from 'twilio-video';;

@Component({
  selector: 'app-twilio',
  templateUrl: './twilio.component.html',
  styleUrls: ['./twilio.component.css']
})
export class TwilioComponent implements OnInit {


  
  message: string;
  accessToken: string;
  roomName: string;
  username: string;
  hasPermission=false;
  @ViewChild('localVideo') localVideo: ElementRef;
  @ViewChild('remoteVideo') remoteVideo: ElementRef;

  constructor(private twilioService: TwilioService) {
    this.twilioService.msgSubject.subscribe(r => {
      this.message = r;
    });
  }


  ngOnInit() {
    this.twilioService.localVideo = this.localVideo;
    this.twilioService.remoteVideo = this.remoteVideo;
    var url=window.location.href;
   if(url){
     var params=url.split('chat');
     
     if(params&&params.length>1){
       var queryData=params[1].split('/');
       if(queryData&&queryData.length>3){
        this.hasPermission=true;
        var val=new Date().valueOf();
        this.connect(queryData[2],val);
       }       
     }
  }
}

  log(message) {
    this.message = message;
  }

  disconnect() {
    if (this.twilioService.roomObj && this.twilioService.roomObj !== null) {
      const roomId = this.twilioService.roomObj.sid;
      this.twilioService.completeRoom(roomId).subscribe();
      this.twilioService.roomObj.disconnect();
      this.twilioService.roomObj = null;
    }
  }


  connect(roomName,username): void {
    let storage = JSON.parse(localStorage.getItem('token') || '{}');
    storage = {};
    let date = Date.now();
    if (!roomName || !username) { this.message = "enter username and room name."; return;}
    if (storage['token'] && storage['created_at'] + 3600000 > date) {
      this.accessToken = storage['token'];
      this.twilioService.connectToRoom(this.accessToken, { name: roomName, audio: true, video: { width: 240 } }) 
      return;
    }
    this.twilioService.getToken(username , roomName).subscribe(d => {
      this.accessToken = d['token'];
      localStorage.setItem('token', JSON.stringify({
        token: this.accessToken,
        created_at: date
      }));
      //  { name: this.roomName, audio: true, video: { width: 240 } , logLevel: 'debug'}
      this.twilioService.connectToRoom(this.accessToken , {  logLevel: 'off'})
    },
      error => this.log(JSON.stringify(error)));
  }
 
}
