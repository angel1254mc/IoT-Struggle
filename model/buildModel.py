# Credit for like 90% of this code goes to Nicholas Renotte the GOAT
# https://www.youtube.com/watch?v=jztwpsIzEGc&t=102s&pp=ygUfdGVuc29yZmxvdyBpbWFnZSBjbGFzc2lmaWNhdGlvbg%3D%3D

import tensorflow as tf #Tensorflow is a machine learning dataset used for building Neural Nets
import os #Used to navigate through file structures
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures, StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split

# Avoid OOM errors by setting GPU Memory Consumption Growth (So tf doesn't use all the memory)
gpus = tf.config.experimental.list_physical_devices('GPU')
for gpu in gpus:
    #limit the memory growth for each gpu
    tf.config.experimental.set_memory_growth(gpu, True)

#all the available gpus
tf.config.list_physical_devices('GPU')


import cv2
import imghdr

data_dir = './data'

image_exts = ['jpeg','jpg', 'bmp', 'png']

for image_class in os.listdir(data_dir):
#For each folder in the garbage_classification directory,
    for image in os.listdir(os.path.join(data_dir, image_class)):
    #go through each image and check the file path and remove if the image doesn't fit the bill
        image_path = os.path.join(data_dir, image_class, image)
        print(image_path);
        try:
            img = cv2.imread(image_path)
            tip = imghdr.what(image_path)
            if tip not in image_exts:
                print('Image not in ext list {}'.format(image_path))
                os.remove(image_path)
        except Exception as e:
            print('Issue with image {}'.format(image_path))
            # os.remove(image_path)


import numpy as np #For making arrays
from matplotlib import pyplot as plt #Used for plotting data

#Where we load our data. It actually does a lot of preprocessing for us too. We'll split the data later
data = tf.keras.utils.image_dataset_from_directory(
    data_dir,
    batch_size=32,
    image_size=(180, 180)
    )

data_iterator = data.as_numpy_iterator()
batch = data_iterator.next()

class_names = data.class_names
print(class_names)

def displayImages(batch):
  fig, ax = plt.subplots(ncols=8, figsize=(20,20))
  for idx, img in enumerate(batch[0][:8]):
      ax[idx].imshow(img.astype(int))
      select = batch[1][idx]
      ax[idx].title.set_text(class_names[select])

displayImages(batch)

AUTOTUNE = tf.data.AUTOTUNE
data = data.cache().shuffle(1000).prefetch(buffer_size=AUTOTUNE)

from tensorflow.keras import layers

IMG_SIZE = 180

resize_and_rescale = tf.keras.Sequential([
  layers.Resizing(IMG_SIZE, IMG_SIZE),
  layers.Rescaling(1./255)
])

#Using the rescaling in the plot we made earlier
fig, ax = plt.subplots(ncols=8, figsize=(20,20))
for idx, img in enumerate(batch[0][:8]):
    result = resize_and_rescale(img)
    #below string verifies that the pixels are in the [0,1] range
    print("Min and max pixel values:", result.numpy().min(), result.numpy().max())
    ax[idx].imshow(result)
    select = batch[1][idx]
    ax[idx].title.set_text(class_names[select])


len(data)

train_size = int(len(data)*.7)
val_size = int(len(data)*.2)+1
test_size = int(len(data)*.1)+1

print(train_size)
print(val_size)
print(test_size)

train_data = data.take(train_size)
val_data = data.take(val_size)
test_data = data.take(test_size)

# Start of training here

from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Dense, Flatten, Dropout

num_classes = len(class_names)

baseModel = tf.keras.applications.ResNet152(input_shape=(180, 180,3), weights='imagenet', include_top=False, classes=11)
for layers in baseModel.layers:
  layers.trainable=False

last_output = baseModel.layers[-1].output
x = tf.keras.layers.Dropout(0.5) (last_output)
x = tf.keras.layers.Flatten()(x)
x = tf.keras.layers.Dense(128, activation = 'relu')(x)
x = tf.keras.layers.Dense(11, activation='softmax')(x)

model = tf.keras.Model(inputs=baseModel.input,outputs=x)

model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001), loss=tf.keras.losses.SparseCategoricalCrossentropy(),metrics=['accuracy'])
# model.build??

model.build(input_shape=(None, 180, 180, 3))

model.summary()

#training the data
epochs=8
history = model.fit(
  train_data,
  validation_data=val_data,
  epochs=epochs
)

fig = plt.figure()
plt.plot(history.history['loss'], color='teal', label='loss')
plt.plot(history.history['val_loss'], color='orange', label='val_loss')
fig.suptitle('Loss', fontsize=20)
plt.legend(loc="upper left")
plt.show()

fig = plt.figure()
plt.plot(history.history['accuracy'], color='teal', label='accuracy')
plt.plot(history.history['val_accuracy'], color='orange', label='val_accuracy')
fig.suptitle('Accuracy', fontsize=20)
plt.legend(loc="upper left")
plt.show()

from tensorflow.keras.models import load_model

# Commented out IPython magic to ensure Python compatibility.
# %cd '/content/drive/MyDrive/Colab Notebooks/data_folder'
# %ldir

model.save(os.path.join('models','garbageclassifier3.keras'))

model.evaluate(test_data)

import tensorflowjs as tfjs

tfjs.converters.save_keras_model(model, "./model")