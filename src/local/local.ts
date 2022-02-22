import { io } from "socket.io-client";
import { Candidate, HTMLMediaElementWithCaputreStream } from "../util";
const socket = io();
let isFireFox = navigator.userAgent.indexOf('Firefox') > -1

async function main() {
  let peerConnection: RTCPeerConnection
  let videoEle = document.querySelector("#localVideo") as HTMLMediaElementWithCaputreStream

  socket.on('joined', async (event: Event) => {
    console.log("create peerConnection")
    peerConnection = new RTCPeerConnection()
    console.log("add stream to peerConnection")

    // add steam to Peerconnection
    let mediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    videoEle.srcObject = mediaStream
    ///let mediaStream = isFireFox ? videoEle.mozCaptureStream() : videoEle.captureStream()

    mediaStream.getTracks().forEach(function (track: MediaStreamTrack) {
      console.info("foreach getTracks", track)
      peerConnection.addTrack(track, mediaStream);
    });


    peerConnection.addEventListener('icecandidate', async (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        console.log('sending candidate: ', {
          type: 'candidate',
          sdpMLineIndex: event?.candidate?.sdpMLineIndex,
          sdpMid: event?.candidate?.sdpMid,
          sdp: event?.candidate?.candidate
        })
        socket.emit("candidate", {
          type: 'candidate',
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid,
          sdp: event.candidate.candidate
        })
      }
    });

    console.log("create offer...")
    let sdp = await peerConnection.createOffer({
      offerToReceiveVideo: true
    })
    peerConnection.setLocalDescription(sdp)
    console.log('Sending offer to peer');
    socket.emit("offer", sdp)
  });

  socket.on("candidate", async (candidate: Candidate) => {
    console.log("reviced candidate: ", candidate)
    await peerConnection.addIceCandidate(new RTCIceCandidate({
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
      candidate: candidate.sdp
    }))
  })

  socket.on("answer", async (sdp: RTCSessionDescriptionInit) => {
    console.log("reviced answer: ", sdp)
    peerConnection.setRemoteDescription(sdp)
  })

}

main().then(console.log).catch(console.error)