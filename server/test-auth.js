const http = require('http');
const mongoose = require('mongoose');
const User = require('./models/User.js');
require('dotenv').config({ path: './.env' });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ username: { $exists: true } });
  if (!user) {
    console.log("No user found");
    process.exit(1);
  }
  const token = require('./utils/jwt').generateToken(user._id, 'user');
  console.log("Token:", token);
  
  const receiver = await User.findOne({ _id: { $ne: user._id }, username: { $exists: true } });
  
  const data = JSON.stringify({
    receiverId: receiver._id,
    message: "Test message API"
  });

  const req = http.request({
    hostname: 'localhost',
    port: 5001,
    path: '/api/v1/chat/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'Authorization': 'Bearer ' + token
    }
  }, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Response:', res.statusCode, body));
  });

  req.on('error', e => console.error(e));
  req.write(data);
  req.end();
  
  setTimeout(() => process.exit(0), 1000);
}
test();
