import { io } from "socket.io-client";
import { Candidate, HTMLMediaElementWithCaputreStream } from "../util";
const socket = io();
const audioContext = new AudioContext();

async function main() {
  let peerConnection: RTCPeerConnection
  let videoEle = document.querySelector("#localVideo") as HTMLMediaElementWithCaputreStream
  // create audio buffer from file
  let opusEle = document.querySelector("#opus") as HTMLInputElement
  const audioBufferSource = audioContext.createBufferSource();
  opusEle.addEventListener("change", async (event) => {
    const arrayBuffer = await (event.target as HTMLInputElement).files?.item(0)?.arrayBuffer()
    if (arrayBuffer) {
      audioContext.decodeAudioData(arrayBuffer, (audioBuffer: AudioBuffer) => {
        audioBufferSource.buffer = audioBuffer
        audioBufferSource.start();
      });
    }
  }, false)

  socket.on('joined', async (event: Event) => {
    console.log("create peerConnection")
    peerConnection = new RTCPeerConnection()
    console.log("add stream to peerConnection")

    // video stream
    let videoMediastream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    videoEle.srcObject = videoMediastream

    // audio stream
    const audioMediastream = audioContext.createMediaStreamDestination();
    audioBufferSource.connect(audioMediastream);

    // merge mediastream 
    let tracks: MediaStreamTrack[] = [];
    tracks = tracks.concat(audioMediastream.stream.getTracks());
    tracks = tracks.concat(videoMediastream.getTracks());
    const mediaStream = new MediaStream(tracks);

    // add mediastream to peerconnection
    mediaStream.getTracks().forEach((track: MediaStreamTrack) => {
      peerConnection.addTrack(track, mediaStream);
    });

    peerConnection.addEventListener('icecandidate', async (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        let candidate = {
          type: 'candidate',
          sdpMLineIndex: event.candidate.sdpMLineIndex,
          sdpMid: event.candidate.sdpMid,
          sdp: event.candidate.candidate
        };
        console.log('sending candidate: ', candidate)
        socket.emit("candidate", candidate)
      }
    });

    console.log("create offer...")
    let sdp = await peerConnection.createOffer({
      offerToReceiveVideo: true
    })
    console.info(JSON.stringify(sdp))
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