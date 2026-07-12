const http = require('http');

const data = JSON.stringify({
  username: 'admin',
  password: 'password123'
});

const req = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/v1/admin/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
