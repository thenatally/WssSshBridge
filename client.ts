import net from 'net';
import WebSocket from 'ws';
import crypto from 'crypto';
import fs from 'fs';

const WS_SERVER_URL = 'ws://sshbridge.tally.gay';  
const LOCAL_SSH_PORT = 2222;
const SECRET = fs.readFileSync('secret', 'utf8').trim();

const tcpServer = net.createServer(tcpSocket => {
  console.log('SSH client connected opening WS tunnel');
  const ws = new WebSocket(WS_SERVER_URL);

  ws.on('open', () => {
    const hmac = crypto.createHmac('sha256', SECRET).update('auth').digest('hex');
    ws.send(hmac); 

    tcpSocket.on('data', data => ws.send(data));
    ws.on('message', msg => tcpSocket.write(msg as Buffer));
  });

  const cleanup = () => { tcpSocket.destroy(); ws.close(); };
  tcpSocket.on('close', cleanup);
  tcpSocket.on('error', cleanup);
  ws.on('close', cleanup);
  ws.on('error', cleanup);
});

tcpServer.listen(LOCAL_SSH_PORT, () => {
  console.log(`Client wrapper running. Point SSH to localhost:${LOCAL_SSH_PORT}`);
});
