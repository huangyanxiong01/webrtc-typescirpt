export interface Candidate {
  sdp?: string,
  sdpMLineIndex?: number | null,
  sdpMid?: string | null,
  type: 'candidate',
}
export interface HTMLMediaElementWithCaputreStream extends HTMLMediaElement {
  captureStream(): MediaStream;
  mozCaptureStream(): MediaStream;
}