import { NextResponse } from "next/server";
import { db, storage } from "../../../../firebaseAdmin";
import { model } from "../../../../tensorFlowInit";
import { createCanvas, loadImage, Image } from 'canvas';
import tf from '@tensorflow/tfjs';

// This route handles receiving an image and running the TF model on it to see if its trash or recyclign  👁️👄👁️
export async function POST(request) {
  // First check the JSON Body of the request for a "file" field with Base64 data
  let base64Image = request?.body?.file;
  // Check to see if body actually contained iamge. If not, retrieve the most recently added image from Firebase
  let filename;
  if (!base64Image) {
    // In this case, Image gets stored as a literal image on a Firebase Bucket
    const bucket = storage.bucket();
    const file = bucket.file("data/photo.jpg");
    const buffer = await file.download();
    filename = await file.publicUrl();
    base64Image = buffer[0];
  }
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    var img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.onerror = err => { throw err };
    img.src = filename;
  
    let image = await tf.browser.fromPixels(canvas);
    console.log(image);
    // make predictions based on the tensor
    const predictions = model.predict(image).dataSync();

    // I actually don't know what the predictions look like lol
    console.log(predictions);

  return NextResponse.json({ message: "Hello World" }, { status: 200 });
}

// Same logic to add a `PATCH`, `DELETE`...