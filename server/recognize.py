import firebase_admin
from firebase_admin import credentials, storage, firestore
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers
import asyncio
from io import BytesIO
import cv2
import time
from flask import Flask, jsonify, request
# Initialize Firebase with your credentials
cred = credentials.Certificate("./serviceAccount.json")
firebase_admin.initialize_app(cred, {'storageBucket': "iotstruggle.appspot.com"})
resize_and_rescale = tf.keras.Sequential([
  layers.Resizing(256, 256),
])
db = firestore.client()
# Load your TensorFlow model
model_path = "../model/garbageclassifier3.keras"
print("Loading Model")
model = tf.keras.models.load_model(model_path)
print("Model Loaded!")

# Define a function to make predictions on an image
def predict_image(image_path):
    # Download the image from Firebase Storage
    retrieve_and_preprocess_start = time.time();
    bucket = storage.bucket()
    blob = bucket.blob(image_path)
    image_data = blob.download_as_bytes()
    # Decode image from bytes
    nparr = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    image = cv2.resize(image, (256, 256), interpolation = cv2.INTER_AREA)

    # Resize, rescale, and expand
    image = resize_and_rescale(image)
    image = np.expand_dims(image, axis=0)
    retrieve_and_preprocess_end = time.time();
    print("Finished Retrieving and Preprocessing. This took: " + str(retrieve_and_preprocess_end - retrieve_and_preprocess_start))

    # Make a prediction'
    predict_start = time.time()
    print("Beginning Model Prediction...");
    prediction = model.predict(image)
    predict_end = time.time();
    print("Model Prediction Finalized and took: " + str(predict_end - predict_start))
    
    # Decode the prediction 
    classes = ["battery", "biological", "cardboard", "clothes", "metal", "nonrecyclableglass", "paper", "plastic", "recyclableglass", "shoes", "trash"]
    predicted_class = classes[np.argmax(prediction)]

    return predicted_class

def updateUserData(activeUser, prediction, recyclableCategories):
    user_ref = db.collection("Users").document(activeUser)
    user_data = user_ref.get()

    # Yeah we live life dangerously here
    user_dict = user_data.to_dict()
            
    if prediction in recyclableCategories:
        # Increment the totalRecycled field
        user_dict["totalRecycled"] = user_dict.get("totalRecycled", 0) + 1
    else:
        # Increment the totalDisposed field
        user_dict["totalDisposed"] = user_dict.get("totalDisposed", 0) + 1

    user_ref.update(user_dict)


app = Flask(__name__)

@app.route('/api/recognize', methods=['GET'])
def recognize():
    macAddress = "A0:B7:65:FE:DB:5C"
    doc_ref = db.collection("Mac-To-Users").document(macAddress)
    activeUser = "nothing right now"; #placeholder value while we retrieve active user id
    doc = "nothing as well";
    try:
        doc = doc_ref.get()
        print(doc.exists)
        if doc.exists:
            # Access the data as a dictionary
            print(doc.to_dict())
            activeUser = doc.to_dict()['ActiveUserID']
    except Exception as e:
        print(f"Error: {e}")
        print("God Has Failed Us if we reach this")

    
    image_path = activeUser + "/photo.jpg";
    print(image_path);
    print("Beginning predict_image function")
    predicted_class = predict_image(image_path)
    print("predict_image Ended")

    updateUserData(activeUser, predicted_class, doc.get('recycleCategories'))
    # Replace this list with your actual predictions
    predictions = [predicted_class]

    # Create a JSON response
    response = {
        "prediction": predictions
    }

    return jsonify(response)

if __name__ == '__main__':
    
    app.run(host='0.0.0.0', port=3001)

