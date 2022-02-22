# a webRTC example with typescript
- share your Screen and Audio by WebRTC. 
- exchange webRTC ICE,ANSWER,OFFER by websocket

## Usage
First. start websocket server by clone project [webRTC-STUN](https://github.com/huangyanxiong01/webRTC-STUN.git) to your computer.

```shell
git clone https://github.com/huangyanxiong01/webrtc-typescirpt
pnpm install
pnpm start
```

Now.open `http://localhost:8080/` and `http://localhost:8080/remote.html` in your browser.

## Limitations
- The user needs to opt in to sharing system sounds in the Chrome screen sharing dialog
- On Chrome for macOS & Linux it is only possible to share your audio when choosing to capture a Chrome tab
- Firefox does not yet support capturing for system sounds
