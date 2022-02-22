import { io } from "socket.io-client";
import { Candidate } from "../util";
const socket = io();

async function main() {
  let videoEle = document.querySelector("#remoteVideo") as HTMLVideoElement
  let audioEle = document.querySelector("#remoteAudio") as HTMLAudioElement
  let peerConnection = new RTCPeerConnection()

  peerConnection.addEventListener('icecandidate', async (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      console.log('candidate sending...: ', {
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

  //MediaStreamEvent
  peerConnection.addEventListener("track", (event: RTCTrackEvent) => {
    console.log('Remote stream added.');
    videoEle.srcObject = event.streams[0];
    audioEle.srcObject = event.streams[0];
  })

  //offer from webSocket 
  socket.on("offer", async (sdp: RTCSessionDescriptionInit) => {
    console.log("reviced peer offer: ", sdp)
    peerConnection.setRemoteDescription(sdp)
    console.log("create answer...")
    let answer = await peerConnection.createAnswer()
    peerConnection.setLocalDescription(answer)
    console.log("sending answer to peer")
    socket.emit("answer", answer)
  })

  socket.on("candidate", async (candidate: Candidate) => {
    console.log("reviced candidate: ", candidate)
    await peerConnection.addIceCandidate(new RTCIceCandidate({
      sdpMid: candidate.sdpMid,
      sdpMLineIndex: candidate.sdpMLineIndex,
      candidate: candidate.sdp
    }))
  })

}

main().then(console.log).catch(console.error)
