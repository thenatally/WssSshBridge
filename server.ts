
import net from 'net';
import { WebSocketServer } from 'ws';

const REMOTE_SSH_HOST = 'localhost';
const REMOTE_SSH_PORT = 22;
const WS_PORT = 8080;

const wss = new WebSocketServer({ port: WS_PORT });
wss.on('connection', ws => {
  console.log('WS tunnel connected');
  const sshSocket = net.connect(REMOTE_SSH_PORT, REMOTE_SSH_HOST, () => {
    console.log('Connected to SSH server');
  });

  ws.on('message', msg => sshSocket.write(msg as Buffer));
  sshSocket.on('data', data => ws.send(data));

  const cleanup = () => { sshSocket.destroy(); ws.close(); };
  ws.on('close', cleanup);
  ws.on('error', cleanup);
  sshSocket.on('close', cleanup);
  sshSocket.on('error', cleanup);
});

console.log(`Server wrapper listening on WS port ${WS_PORT}`);
