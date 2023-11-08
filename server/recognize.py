import os
import time
import firebase_admin
from firebase_admin import credentials, storage
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras import layers
from io import BytesIO
import cv2
# Initialize Firebase with your credentials
cred = credentials.Certificate("./serviceAccount.json")
firebase_admin.initialize_app(cred, {'storageBucket': "fullstack-iot-web.appspot.com"})
resize_and_rescale = tf.keras.Sequential([
  layers.Resizing(256, 256),
])

# Load your TensorFlow model
model_path = "../model/garbageclassifier2.keras"
print("Loading Model");
model = tf.keras.models.load_model(model_path)
print("Model Loaded!");

# Define a function to make predictions on an image
def predict_image(image_path):
    # Download the image from Firebase Storage
    bucket = storage.bucket()
    blob = bucket.blob(image_path)
    image_data = blob.download_as_bytes()
    # Decode image from bytes
    nparr = np.fromstring(image_data, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    image = cv2.resize(image, (256, 256), interpolation = cv2.INTER_AREA)

    # Resize, rescale, and expand
    image = resize_and_rescale(image)
    image = np.expand_dims(image, axis=0)

    # Make a prediction
    prediction = model.predict(image)
    
    # Decode the prediction 
    classes = ["Aluminum", "Cardboard", "Glass", "Organic", "Plastic", "Paper", "Plastic", "Textiles", "Wood"];
    predicted_class = classes[np.argmax(prediction)]

    return predicted_class


from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/recognize', methods=['GET'])
def recognize():
    
    image_path = "data/photo.jpg"
    print("Beginning Model Prediction...")
    predicted_class = predict_image(image_path)
    print("Model Prediction Finalized!")
    # Replace this list with your actual predictions
    predictions = [predicted_class];

    # Create a JSON response
    response = {
        "prediction": predictions
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)

