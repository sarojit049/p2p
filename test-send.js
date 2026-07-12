import axios from 'axios';
import mongoose from 'mongoose';
import User from './server/models/User.js';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

async function testSend() {
  mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({}).limit(2);
  if (users.length < 2) {
    console.log("Not enough users");
    process.exit(1);
  }
  console.log("User 1:", users[0].username, users[0]._id);
  console.log("User 2:", users[1].username, users[1]._id);
  
  // Actually, I can just write a script that connects directly to the DB and inserts, or calls the service.
  const chatService = require('./server/services/chatService');
  try {
    const msg = await chatService.sendMessage(users[0]._id, users[1]._id, "Hello test!");
    console.log("Success:", msg);
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}

testSend();
