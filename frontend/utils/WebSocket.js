import { w3cwebsocket as W3CWebSocket } from 'websocket';

class WebSocketService {
  constructor() {
    this.client = null;
  }
  connect(roomId, username, onMessage) {
    this.client = new W3CWebSocket(`ws://localhost:8080/ws?room=${roomId}&username=${username}`);
    this.client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    this.client.onmessage = (message) => {
      const data = JSON.parse(message.data);
      onMessage(data);
    };
    this.client.onclose = () => {
      console.log('WebSocket Client Disconnected');
    };
  }

  send(message) {
    if (this.client) {
      this.client.send(JSON.stringify(message));
    }
  }
  disconnect() {
    if (this.client) {
      this.client.close();
      this.client = null;
    }
  }
}

export default new WebSocketService();