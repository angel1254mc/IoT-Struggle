import { NextResponse } from "next/server";
import { db } from "../../../../firebaseAdmin";
import { model } from "../../../../tensorFlowInit";
import tf from '@tensorflow/tfjs-node';


// This route handles receiving an image and running the TF model on it to see if its trash or recyclign  👁️👄👁️
export async function POST(request) {
  // First check the JSON Body of the request for a "file" field with Base64 data
  let base64Image = request?.body?.file;
  // Check to see if body actually contained iamge. If not, retrieve the most recently added image from Firebase
  if (!base64Image) {
    // get the base65
    let collectionSnap = await db.collection("images").orderBy("timestamp", "desc").limit(10).get();
    // Get most recent document, get the base64 data from it (stored in the "file" key)
    base64Image = collectionSnap.docs.at(0).file;
  }
  // Now, with that base64image, we can use the tensorflow client for js to run our model on it
  // I've initialized it in tensorFlowInit.js, and we can import the model stuff
  // Then make some predictions based on the model
  // First need to make an input tensor
  // To make an image tensor from base64 string data
  
    const b = Buffer.from(base64Image, 'base64')
    // get the tensor
    const t = tf.node.decodeImage(b)
    // make predictions based on the tensor
    const predictions = model.predict(t).dataSync();

    // I actually don't know what the predictions look like lol

  return NextResponse.json({ message: "Hello World" }, { status: 200 });
}

// Same logic to add a `PATCH`, `DELETE`...