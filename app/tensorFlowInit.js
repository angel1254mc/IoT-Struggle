import tf from '@tensorflow/tfjs-node';

// First lets get the path to the model
const modelPath = './model/model.json'; 
// Then we get the actual model by loading it
const model = await tf.loadLayersModel(`file://${modelPath}`);
// We can export the model and use it later in the routes

export {model};
// I actually dodn't