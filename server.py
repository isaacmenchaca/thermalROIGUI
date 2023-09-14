import eel, json, os, cv2
import tkinter as tk
from tkinter import filedialog
import numpy as np
import pandas as pd
import base64


eel.init('web')

@eel.expose
def onClickChooseFileButton():
    root = tk.Tk()
    root.attributes('-topmost', 1)
    root.withdraw()
    filePath = filedialog.askopenfilename()
    root.destroy()
    return filePath


# this function checks the data for how many thermal images there are.
# it will also automatically display the first image available or
# the last image whose data was saved in terms of localizations.
@eel.expose
def loadThermalInfo(filePath):
    print(filePath)
    

    thermalImages = np.load( filePath)/ 10 - 100
    thermalImages = thermalImages.reshape(-1, 288, 382)
    print('Thermal data file shape:', thermalImages.shape)
    numImages = thermalImages.shape[0]


    coordinatesFilePath = "/".join(filePath.split(".npy")[:-1]) + "_COORDINATES.csv"

    if not os.path.exists(coordinatesFilePath): 
        currentImage = 1

    else:
        data = pd.read_csv(coordinatesFilePath)
        currentImage = int(np.max(data["imageNumber"].values)) + 1


    img = prepareImage(thermalImages[currentImage - 1, :, :])
    eel.updateImageSrc(img)()

    return numImages, currentImage


def prepareImage(thermalImage):
    min_temp = np.min(thermalImage)
    max_temp = np.max(thermalImage)

    normalized_thermal_image = ((thermalImage - min_temp) / (max_temp - min_temp) * 255).astype(np.uint8)
    colorized_image = cv2.applyColorMap(normalized_thermal_image, cv2.COLORMAP_BONE)

    ret, png = cv2.imencode('.png', colorized_image)
    img = base64.b64encode(png)
    img = img.decode("utf-8")

    return img

# TO DO: after this runs, we need to be able to check if there was already data for the next image.
    # That way we can draw it in automatically. Maybe do this in js.
@eel.expose
def saveCurrentProceedNextImage(filePath, currentImage, currentSavedCoordinates):
    coordinatesFilePath = "/".join(filePath.split(".npy")[:-1]) + "_COORDINATES.csv"

    if not os.path.exists(coordinatesFilePath): 
        print("creating new file")

        image_coord_dict = {
                "imageNumber": [currentImage],
                "leftBrow": [str(currentSavedCoordinates[0])],
                "rightBrow": [str(currentSavedCoordinates[1])],
                "noseTip": [str(currentSavedCoordinates[2])],
            }

        data = pd.DataFrame.from_dict(image_coord_dict)
        print(data)
        data.to_csv(coordinatesFilePath)

    else:
        data = pd.read_csv(coordinatesFilePath)[["imageNumber", 
                                                 "leftBrow", 
                                                 "rightBrow", 
                                                 "noseTip"]]
        
        # going to have to check if the coordinate already exists.
        # if there is previous data on the image, then just replace values.
        if np.sum(np.isin(data["imageNumber"].values, currentImage)):
            data.loc[data["imageNumber"] == currentImage, "leftBrow"] = [str(currentSavedCoordinates[0])]
            data.loc[data["imageNumber"] == currentImage, "rightBrow"] = [str(currentSavedCoordinates[1])]
            data.loc[data["imageNumber"] == currentImage, "noseTip"] = [str(currentSavedCoordinates[2])]
            data.to_csv(coordinatesFilePath, mode='w')


        # otherwise, just add it in.
        else:
            image_coord_dict = {
                    "imageNumber": [currentImage],
                    "leftBrow": [str(currentSavedCoordinates[0])],
                    "rightBrow": [str(currentSavedCoordinates[1])],
                    "noseTip": [str(currentSavedCoordinates[2])],
                }
            
            newData = pd.DataFrame.from_dict(image_coord_dict)

            data = pd.concat([data, newData], ignore_index=True)
            data.to_csv(coordinatesFilePath, mode='w')

    print(data)
    # now increment currentImage
    currentImage += 1
    thermalImages = np.load( filePath)/ 10 - 100
    thermalImages = thermalImages.reshape(-1, 288, 382)

    img = prepareImage(thermalImages[currentImage - 1, :, :])
    eel.updateImageSrc(img)()

    return currentImage
  
@eel.expose
def goToPreviousImage(filePath, currentImage):
    coordinatesFilePath = "/".join(filePath.split(".npy")[:-1]) + "_COORDINATES.csv"
    data = pd.read_csv(coordinatesFilePath)[["imageNumber", 
                                                    "leftBrow", 
                                                    "rightBrow", 
                                                    "noseTip"]]
    
    leftBrowCoord = data[data["imageNumber"] == currentImage]["leftBrow"].values[0].strip('[]').split(',')
    leftBrowCoord = [int(value.strip()) for value in leftBrowCoord]
    rightBrowCoord = data[data["imageNumber"] == currentImage]["rightBrow"].values[0].strip('[]').split(',')
    rightBrowCoord = [int(value.strip()) for value in rightBrowCoord]
    noseTipCoord = data[data["imageNumber"] == currentImage]["noseTip"].values[0].strip('[]').split(',')
    noseTipCoord = [int(value.strip()) for value in noseTipCoord]

    
    print(currentImage, leftBrowCoord, rightBrowCoord, noseTipCoord)

    thermalImages = np.load( filePath)/ 10 - 100
    thermalImages = thermalImages.reshape(-1, 288, 382)

    img = prepareImage(thermalImages[currentImage - 1, :, :])
    eel.updateImageSrc(img)()

    return leftBrowCoord, rightBrowCoord, noseTipCoord



@eel.expose
def getCoordinates(filePath, currentImage):
    coordinatesFilePath = "/".join(filePath.split(".npy")[:-1]) + "_COORDINATES.csv"
    data = pd.read_csv(coordinatesFilePath)[["imageNumber", 
                                                    "leftBrow", 
                                                    "rightBrow", 
                                                    "noseTip"]]
    
    leftBrowCoord = data[data["imageNumber"] == currentImage]["leftBrow"].values[0].strip('[]').split(',')
    leftBrowCoord = [int(value.strip()) for value in leftBrowCoord]
    rightBrowCoord = data[data["imageNumber"] == currentImage]["rightBrow"].values[0].strip('[]').split(',')
    rightBrowCoord = [int(value.strip()) for value in rightBrowCoord]
    noseTipCoord = data[data["imageNumber"] == currentImage]["noseTip"].values[0].strip('[]').split(',')
    noseTipCoord = [int(value.strip()) for value in noseTipCoord]

    return leftBrowCoord, rightBrowCoord, noseTipCoord



@eel.expose
def checkNextExists(filePath, currentImage):
    coordinatesFilePath = "/".join(filePath.split(".npy")[:-1]) + "_COORDINATES.csv"
    data = pd.read_csv(coordinatesFilePath)[["imageNumber", 
                                                 "leftBrow", 
                                                 "rightBrow", 
                                                 "noseTip"]]
    
    exists = False
    if np.sum(np.isin(data["imageNumber"].values, currentImage)):
        exists = True

    return exists


eel.start('index.html', size=(1000,750))            # Start (this blocks and enters loop)


# Current debugs to fix:
    # [X] after clicking previous, next button is disabled.
    # [] after going to previous and then transitioning to next, 
        # check if next has any history of data entry. currently 
        # its not accounting for that and making me put some coordinates.
    # [X] instances of many dots at once when checking on previous.
    # [X] CSV values arent being immediately saved after a certain row is changed 
