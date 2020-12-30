import { Injectable, EventEmitter, ElementRef } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs';
import { connect, createLocalTracks, createLocalVideoTrack } from 'twilio-video';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';


@Injectable()
export class TwilioService {

  remoteVideo: ElementRef;
  localVideo: ElementRef; 
  previewing: boolean;
  msgSubject = new BehaviorSubject("");
  roomObj: any;
  urls=[
    {name:'ht',url:'https://coviddrive-ht-api.piadvanta.com:444'},
    {name:'ms',url:'https://coviddrive-ht-api.piadvanta.com:444'},
  ];
  constructor(private http: HttpClient) {}

  getToken(username, roomName): Observable<any> {
    return this.http.post('https://provider-api.piadvanta.com:80/room/create', { room_name:roomName,identity:username  });
  }

  completeRoom(roomId): Observable<any> {
    return this.http.post('https://provider-api.piadvanta.com:80/room/complete', { roomId:roomId  })
  }
  connectToRoom(accessToken: string, options): void {
    connect(accessToken, options).then(room => {

      this.roomObj = room;

      if (!this.previewing) {
        //this.startLocalVideo();
        var tracks = Array.from(room.localParticipant.tracks.values());
        tracks.forEach((track : any) =>  {  
          this.localVideo.nativeElement.appendChild(track.track.attach());
        });
        this.previewing = true;
      }

      room.participants.forEach(participant => {
        // this.msgSubject.next("Already in Room: '" + participant.identity + "'");
        console.log("Already in Room: '" + participant.identity + "'");
        //this.attachParticipantTracks(participant);
      });

      room.on('participantDisconnected', (participant) => {
        // this.msgSubject.next("Participant '" + participant.identity + "' left the room");
        // console.log("Participant '" + participant.identity + "' left the room");

        this.detachParticipantTracks(participant);
      });

      room.on('participantConnected',  (participant) => {
        participant.tracks.forEach(track => {
         // this.remoteVideo.nativeElement.appendChild(track.attach());
        });

        participant.on('trackSubscribed', track => { 
          console.log('track added')
          this.remoteVideo.nativeElement.appendChild(track.attach());
           document.getElementById('remote-media-div').appendChild(track.attach());
        });
      });

      // When a Participant adds a Track, attach it to the DOM.
      room.on('trackSubscribed', (track, participant) => {
        console.log(participant.identity + " added track: " + track.kind);
        this.attachTracks([track]);
      });

      // When a Participant removes a Track, detach it from the DOM.
      room.on('trackRemoved', (track, participant) => {
        console.log(participant.identity + " removed track: " + track.kind);
        this.detachTracks([track]);
      });

      room.once('disconnected',  room => {
        this.previewing = false;
        console.log(room)
        this.localVideo.nativeElement.innerHTML = '';
        this.remoteVideo.nativeElement.innerHTML = '';
        // this.msgSubject.next('You left the Room:' + room.name);
        room.localParticipant.tracks.forEach(track => {
          var attachedElements = track.track.detach();
          attachedElements.forEach(element => element.remove());
        });
      });
    });
  }

  attachParticipantTracks(participant): void {
    var tracks = Array.from(participant.tracks.values());
    this.attachTracks([tracks]);
  }

  attachTracks(tracks) {
    tracks.forEach(track => {
      this.remoteVideo.nativeElement.appendChild(track.attach());
    });
  }

  startLocalVideo(): void {
    createLocalVideoTrack().then(track => {
      this.localVideo.nativeElement.appendChild(track.attach());
      
      // this.localVideo.nativeElement.appendChild(track.attach()).classList.add('md-video');
      
      // this.localVideo.nativeElement.ViewChild.v
    });
  } 

  localPreview(): void {
    createLocalVideoTrack().then(track => {
      this.localVideo.nativeElement.appendChild(track.attach());
    });
  }

  detachParticipantTracks(participant) {
    var tracks = Array.from(participant.tracks.values());
    this.detachTracks(tracks);
  }

  detachTracks(tracks): void {
    tracks.forEach(function (track) {
      track.detach().forEach(function (detachedElement) {
        detachedElement.remove();
      });
    });
  }

  checkPermission(token,site): Observable<any> {
    var url='';
    this.urls.forEach(element => {
      if(element.name==site){
        url=element.url;
      }
    });
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(url+'/api/CovidDriveThru/Registration/CheckUserhasperission', { headers });
  }

  getUrl(id,site): Observable<any> {
    var url='';
    this.urls.forEach(element => {
      if(element.name==site){
        url=element.url;
      }
    });
    const headers = new HttpHeaders().set('Accept', 'application/json, text/plain; charset=utf-8');
   return this.http.get(url+'/api/CovidDriveThru/Registration/Public/tinyurl/'+id, { headers });
  }
}
