// upload-image.js
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const fs = require('fs');

// Use environment variable for MongoDB URI
const MONGO_URI = process.env.MONGO_URI;

async function uploadImage() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const conn = mongoose.connection;
    const gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');

    // Read image file (replace with your image path)
    const imageBuffer = fs.readFileSync('./harsha.jpg');
    
    // Upload to GridFS
    const writestream = gfs.createWriteStream({
      filename: 'harsha_face.jpg',
      metadata: { user: 'Harsha' }
    });

    const { Readable } = require('stream');
    const readable = new Readable();
    readable.push(imageBuffer);
    readable.push(null);
    readable.pipe(writestream);

    writestream.on('close', (file) => {
      console.log('✅ Image uploaded successfully!');
      console.log('📋 File ID:', file._id);
      console.log('📋 Use this ID in your user document:');
      console.log(`"imageId": "${file._id}"`);
      
      mongoose.disconnect();
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

uploadImage();