import Dexie from "dexie";
import { useNavigate, useLocation } from "react-router-dom";
import { openDB } from "idb";
import { v4 as uuidv4 } from "uuid";

const db = new Dexie("GreenHse");

db.version(1).stores({
  files: '++id, name, url',
});

db.version(2).stores({
  files: '++id, name, url, file',
});

db.version(3).stores({
  files: "++id, name, file, *croppedFiles,removedPages",
});

db.version(4).stores({
  files: "++id, name, file, estimateName, *croppedFiles, removedPages, lightPlacement",

})
db.version(5).stores({
  files: "++id, name, file, estimateName, *croppedFiles, removedPages, lightPlacement,pdfSideView",
  pdfSideView: "++id, fileId, pageIndex, pdfSideViewImg"
})

db.version(6).stores({
  files: "++id, name, file, estimateName, *croppedFiles, removedPages, lightPlacement, *pdfSideView, documentsForDownload"
})

db.version(7).stores({
  files: "++id, uid, name, file, estimateName, *croppedFiles, removedPages, lightPlacement, *pdfSideView, documentsForDownload"
})

db.version(8).stores({
  files: "++id, &uid, name, file, estimateName, *croppedFiles, removedPages, lightPlacement, *pdfSideView, documentsForDownload"
})

db.version(9).stores({
  files: "++id, &uid, email, first_name, last_name, name, file, estimateName, *croppedFiles, removedPages, lightPlacement, *pdfSideView, documentsForDownload"
})


export const exportFile = async (fileName, originalFile, uid, email, first_name, last_name) => {
  try {
    // const existing = await db.files.where("uid").equals(uid).first();

    // if (existing) {
    //   return { inserted: false, file: existing };
    // }

    await db.files.put({
      uid,
      email,
      first_name,
      last_name,
      name: fileName,
      file: originalFile,
      estimateName: fileName.replace(/\.[^/.]+$/, ""),
      croppedFiles: [],
      removedPages: [],
      lightPlacement: [],
      pdfSideView: [],
      documentsForDownload: [],
    });

    return { inserted: true };
  } catch (error) {
    console.error("IndexedDB error:", error);
    return { inserted: false };
  }
};


export const saveFile = async (fileName, originalFile, cropedFiles) => {
  try {
    const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
    const uid = uuidv4();
    const pdfSideView = [];
    var list = [];

    await db.files.add({
      uid: uid,
      name: fileName,
      file: originalFile,
      croppedFiles: list,
      estimateName: fileNameWithoutExtension,
      removedPages: [],
      lightPlacement: [],
      // pdfSideView: pdfSideView
      pdfSideView: [],
      documentsForDownload: []
    });
  } catch (error) {
    console.error("Error saving file:", error);
  }
};

export const saveLayoutToDB = async (id, layout) => {
  const db = await openDB("LightingDB", 1, {
    upgrade(db) {
      db.createObjectStore("layouts", { keyPath: "id" });
    },
  });
  await db.put("layouts", { id, layout });
};
export const getLayoutsFromDB = async (id) => {
  const db = await openDB("LightingDB", 1);
  return await db.get("layouts", id);
};


export const saveLightPlacementPositions = async (filename, placeLight, positions, selectedProductList) => {
  try {
    const lightPlacementList = await db.files
      .where("name")
      .equals(filename)
      .toArray();

    if (lightPlacementList !== undefined) {
      const existingLightPlacement = lightPlacementList[0].lightPlacement.find(pl => pl.filename === filename);

      if (existingLightPlacement) {
        // Consolidate products with the same SKU
        selectedProductList.forEach(product => {
          const existingProduct = existingLightPlacement.selectedProductList.find(p => p.sku === product.sku);
          if (existingProduct) {
            existingProduct.quantity += product.quantity;
          } else {
            existingLightPlacement.selectedProductList.push({ ...product });
          }
        });

        existingLightPlacement.numberOfLights = placeLight;
        existingLightPlacement.positions = positions;
        // existingLightPlacement[0].positions = positions
      } else {
        const newLightPlacement = {
          filename: filename,
          numberOfLights: placeLight,
          positions: positions,
          selectedProductList: selectedProductList
        };
        lightPlacementList[0].lightPlacement = positions;

        // lightPlacementList[0].lightPlacement.push(newLightPlacement);
      }

      const response = await db.files
        .where("name")
        .equals(filename)
        .modify({ lightPlacement: lightPlacementList[0].lightPlacement });

      if (response) {
        // console.log("Light Positions Saved successfully.", response);
        return response;
      }
    }
  } catch (error) {
    console.error("Error saving Positions:", error);
  }
};



// Get all light  positions api
export const GetAllLightPlacement = async (filename) => {
  // console.log("File Name:", filename); // Log the filename being fetched
  var file = await db.files.where("name").equals(filename).first(); // Query the database
  // console.log('records', file.lightPlacement);
  // return "lightPlacement" in file ? file.lightPlacement : null;
  return file && 'lightPlacement' in file ? file.lightPlacement : null;
}

export const updateFile = async (
  originalFileName,
  croppedFileName,
  croppedFile
) => {
  try {
    // console.log("Update file:", originalFileName);
    // var croppedFileId=1;
    //var croppedFileList = await db.files.where('name').equals(originalFileName).toArray().equals('croppedFiles');
    var croppedFileList = await db.files
      .where("name")
      .equals(originalFileName)
      .toArray();

    // console.log("get File From DB : ", croppedFileList);

    //var croppedFileList = originalFile[0];
    //await db.files.where('name').equals()
    //var croppedFileId = croppedFileList.length;

    if (croppedFileList !== undefined) {
      croppedFileList[0].croppedFiles.push({
        id: croppedFileList[0].croppedFiles[
          croppedFileList[0].croppedFiles.length - 1
        ].id++,
        name: croppedFileName,
        croppedFile: croppedFile,
      });
      await db.files
        .where("name")
        .equals(originalFileName)
        .modify({ croppedFiles: croppedFileList[0].croppedFiles });
    }

    // console.log("File updated successfully.");
  } catch (error) {
    console.error("Error updating file:", error);
  }
};

export const updateCroppedFile = async (
  originalFileName,
  croppedFileName,
  croppedFile
) => {
  try {
    // console.log("Update file:", originalFileName);
    var croppedFileId = 1;
    var croppedFileList = [
      { id: croppedFileId, name: croppedFileName, croppedFile: croppedFile },
    ];
    await db.files
      .where("name")
      .equals(originalFileName)
      .modify({ croppedFiles: croppedFileList });

    // console.log("File updated successfully.");
  } catch (error) {
    console.error("Error updating file:", error);
  }
};


export const createCroppedCopyOfPDF = async (fileObj, fileName, croppedFileName, croppedFile) => {
  try {
    // console.log("Creating Copy: ", fileObj);
    var croppedFileId = 1;
    var croppedFileList = [
      { id: croppedFileId, name: croppedFileName, croppedFile: croppedFile },
    ];
    var file = {
      name: fileName,
      file: fileObj.file,
      estimateName: fileObj.estimateName,
      croppedFiles: croppedFileList
    }

    await db.files.add(file);

  } catch (error) {
    console.log(error);
  }
}

export const updateCroppedCopyOfPDF = async (fileObj, fileName, croppedFileName, croppedFile, pageNumber) => {
  try {
    // console.log("Update Copy: ", fileName);

    var file = await db.files.where("name").equals(fileName).first();

    // console.log(file);

    if (!file) {
      await createCroppedCopyOfPDF(fileObj, fileName, croppedFileName, croppedFile);
      return;
    }

    var allCroppedFiles = file.croppedFiles;

    allCroppedFiles = allCroppedFiles.filter(x => !x.name.includes(`page-${pageNumber}`));

    // console.log("After removing croppedOne: ", allCroppedFiles);
    allCroppedFiles.push({ id: allCroppedFiles.length + 1, name: croppedFileName, croppedFile: croppedFile });

    await db.files
      .where("name")
      .equals(fileName)
      .modify({ croppedFiles: allCroppedFiles });


  }
  catch (error) {
    console.log(error);
  }
}

// export const getEstimateName = async (fileName) => {
//   var file = await db.files.where("name").equals(fileName).first(); // Query the database

//   return "estimateName" in file ? file.estimateName : null;
// }
export const getEstimateName = async (fileName) => {
  if (!fileName || (typeof fileName !== 'string' && typeof fileName !== 'number' && !(fileName instanceof Date))) {
    console.error("Invalid fileName for getEstimateName:", fileName);
    return null;
  }

  var file = await db.files.where("name").equals(fileName).first();
  return file && "estimateName" in file ? file.estimateName : null;
};

export const getFileId = async (fileName) => {
  if (!fileName || (typeof fileName !== 'string' && typeof fileName !== 'number' && !(fileName instanceof Date))) {
    console.error("Invalid fileName for UID:", fileName);
    return null;
  }

  var file = await db.files.where("name").equals(fileName).first();
  return file ? file.uid : null;
};

export const getFileById = async (fileId) => {
  if (!fileId) {
    console.error("Invalid UID:", fileId);
    return null;
  }

  var file = await db.files.where("uid").equals(fileId).first();
  return file ? file : null;
};



export const getFile = async (fileName, croppedFileName) => {
  try {
    // console.log("Fetching file:", fileName); // Log the filename being fetched
    var file = await db.files.where("name").equals(fileName).first(); // Query the database

    // if(fileName.includes("pdf")){
    //   return "file" in file ? file : "croppedFile" in file ? file.croppedFile : null;
    // }

    if (croppedFileName != "null" && croppedFileName != undefined && croppedFileName != "" && croppedFileName != null) {
      file = file.croppedFiles.find(x => x.name == croppedFileName);
    }
    // console.log("File fetched from database:", file); // Log the fetched file
    return "file" in file ? file.file : "croppedFile" in file ? file.croppedFile : null; // Return the file URL if found, otherwise return null
  } catch (error) {
    console.error("Error getting file:", error); // Log any errors that occur during fetching
    return null; // Return null in case of error
  }
};

export const getMainFile = async (fileName) => {
  try {
    var file = await db.files.where("name").equals(fileName).first();
    return file.file;
  } catch (error) {
    console.log(error);
  }
}

export const getCroppedFile = async (fileName) => {
  try {
    var file = await db.files.where("name").equals(fileName).first();
    return file.croppedFiles;
  }
  catch (error) {
    console.log(error);
  }
}

export const getPDFFile = async (fileName) => {
  try {
    var file = await db.files.where("name").equals(fileName).first();

    return file;
  }
  catch (error) {
    console.log('error getting file: ', error);
    return null;
  }
}

export const getFilesStored = async () => {
  try {
    // console.log('Fetching file:', fileName); // Log the filename being fetched
    const files = await db.files.toArray(); // Query the database

    var fileBlobs = [];
    if (files) {
      files.map((value, index) => {
        if ("file" in value) {
          fileBlobs.push(value);
        }
      });
    }

    // console.log('File fetched from getFilesStored:', files); // Log the fetched file
    return fileBlobs; // Return the file URL if found, otherwise return null
  } catch (error) {
    console.error("Error getting file:", error); // Log any errors that occur during fetching
    return null; // Return null in case of error
  }
};

export const deleteCroppedFile = async (fileName, croppedFileName) => {
  try {
    var file = await db.files.where("name").equals(fileName).first();
    if (croppedFileName != "null" && croppedFileName != undefined && croppedFileName != "" && croppedFileName != null) {
      file = file.croppedFiles.filter(x => x.name != croppedFileName);
    }
    // console.log("Deleting cropped file:", croppedFileName);
    await db.files.where("name").equals(fileName).modify({ croppedFiles: file ? file : [] }); // Delete the cropped file from the database
    // console.log("Cropped file deleted successfully.");
  } catch (error) {
    console.error("Error deleting cropped file:", error);
  }
};

const createNewFileFromCropped = async (file) => {
  await file.croppedFiles.map(async (value, idx) => {
    await saveFile(value.name, value.croppedFile);
  })
}

export const deleteMainFile = async (fileName) => {
  try {
    // console.log("Deleting main file:", fileName);

    // await db.files.where("name").equals(file).modify({croppedFiles: [{}]});

    var file = await db.files.where("name").equals(fileName).first();
    db.files.where("name").equals(fileName).modify(function () { delete this.value; });

    // await createNewFileFromCropped(file);


    // await db.files.where("name").equals(file).delete(); // Delete the main file from the database
    // console.log("Main file deleted successfully.");
  } catch (error) {
    console.error("Error deleting main file:", error);
  }
};
export const updateEstimateName = async (fileName, newEstimateName) => {
  try {
    // console.log("estimateName", newEstimateName)
    await db.files.where("name").equals(fileName).modify({ estimateName: newEstimateName });
    // console.log("Estimate name updated successfully.");
  } catch (error) {
    console.error("Error updating estimate name:", error);
  }
}


export const deletePages = async (fileName, pageNumbers, totalPages, removedPages, callback) => {

  try {
    // Convert the array of page numbers to a comma-separated string
    const removedPagesString = pageNumbers.join(",");
    // var totalPages = 0;

    // console.log("Deleting pages:", pageNumbers, "from file:", fileName);

    const file = await db.files.where("name").equals(fileName).first();

    if (file) {

      var removedPages = file.removedPages;
      if (removedPages == "") {
        removedPages = `${pageNumbers[0]}`;
      }
      else {
        removedPages += `,${pageNumbers[0]}`;
      }

      if (totalPages === removedPages.split(',').length) {
        // console.log("I am in");
        db.files.where("name").equals(fileName).modify(function () { delete this.value; });
        callback(true);
      }
      else {
        // console.log("I am in else",totalPages, removedPages.split(',').length);
        await db.files.where("name").equals(fileName).modify({ removedPages: removedPages });
        callback(false);
      }

    } else {
      console.error("File not found:", fileName);
    }
  } catch (error) {
    console.error("Error deleting pages:", error);
  }
};

export const removeInvalidLightPlacements = async (fileName) => {
  try {
    const file = await db.files.where("name").equals(fileName).first();
    if (file) {
      const removedPages = file.removedPages.split(',').map(Number);
      const validLightPlacements = file.lightPlacement.filter(
        (light) => !removedPages.includes(light.pageIndex + 1)
      );
      await db.files.where("name").equals(fileName).modify({ lightPlacement: validLightPlacements });
      console.log("Light placements updated successfully.");
    } else {
      console.error("File not found:", fileName);
    }
  } catch (error) {
    console.error("Error removing invalid light placements:", error);
  }
};

export const getAllEstimates = async (fileName) => {
  try {
    // const estimates = await db.files.toArray();
    var estimates = await db.files.where("name").equals(fileName).first();
    return estimates
    // return [];
  } catch (error) {
    console.error("Error getting all estimates:", error);
    return [];
  }
}

export const saveScreenshotFile = async (fileName, pageIndex, screenshotData) => {
  try {
    if (pageIndex === undefined) {
      console.error("Invalid page index:", pageIndex);
      return;
    }

    // Get the file entry from the database
    const file = await db.files.where('name').equals(fileName).first();
    let pdfSideView = file.pdfSideView;

    let isFound = false;

    // Check if there is already an entry with the same pageIndex
    for (let i = 0; i < pdfSideView.length; i++) {
      const innerArray = pdfSideView[i];
      if (innerArray.some(item => item.pageIndex === pageIndex)) {
        // Update the existing entry with the new screenshotData
        pdfSideView[i] = [{ pageIndex, screenshotData }];
        isFound = true;
        break;
      }
    }

    if (!isFound) {
      // If the pageIndex is not found, add a new entry
      pdfSideView.push([{ pageIndex, screenshotData }]);
    }

    // Update the pdfSideView in the database
    await db.files.where("name").equals(fileName).modify({ pdfSideView });

    console.log("Screenshot file saved successfully.");
  } catch (error) {
    console.error("Error saving screenshot file:", error);
  }
};

export const GetScreenShot = async (fileName, idx) => {
  var file = await db.files.where('name').equals(fileName).first();
  // console.log("ggg",file.pdfSideView);
  return file.pdfSideView;
}

// export const saveScreenshotFile = async (fileName, pageIndex, screenshotData) => {
//   try {
//     if (pageIndex == undefined) {
//       console.error("Invalid page index:", pageIndex);
//       return;
//     }

//     var screenshotDataList = db.files.where("name").equals(fileName).toArray();
//     console.log("screenshotDataList");
//     console.log(screenshotDataList);
//     console.log(screenshotDataList[0]);


//     var isFound = screenshotDataList.find(e => e.pageIndex == pageIndex);
//     console.log("isfound")
//     console.log(isFound);
//     if(isFound){
//       await db.files.where("name").equals(fileName).modify({ pdfSideView: screenshotData });
//     }
//     else{

//       var updatedList = screenshotDataList.push(screenshotData);
//       console.log("updatedList")
//       console.log(updatedList)
//       await db.files.where("name").equals(fileName).modify({ pdfSideView: updatedList });
//     }


//     //console.log("Screenshot File saved in the database:", file);
//   } catch (error) {
//     console.error("Error saving screenshot file:", error);
//   }
// };


// delete light from action icon
export const deleteLights = async (fileName, nodeId) => {
  try {
    var file = await db.files.where("name").equals(fileName).first();
    var fiteredArr = []
    if (file && file.lightPlacement.length > 0) {
      fiteredArr = file.lightPlacement.filter(item => item.nodeId != nodeId);
      await db.files.where("name").equals(fileName).modify({ lightPlacement: fiteredArr });
      console.log("Light placements updated successfully.");
    } else {
      console.error("File not found:", fileName);
    }
  } catch (error) {
    console.error("Error deleting with selected lights:", error);
  }
};

//  Store pdf urls as an array for download feature
export const storeDocumentsForDownload = async (filename, documentsArr) => {
  try {
    const fileData = await db.files.where('name').equals(filename).first();

    if (fileData) {
      const response = await db.files
        .where("name")
        .equals(filename)
        .modify({ documentsForDownload: documentsArr });

      if (response) {
        return response;
      }
    }
  } catch (error) {
    console.error("Error store document for download :", error);
  }
};

export const clearIndexedDB = async () => {
  try {
    await db.files.clear();
  } catch (err) {
    console.error("Error clearing IndexedDB", err);
  }
};

export const getFileByName = async (name) => {
  if (!name) return null;

  try {
    const fileEntry = await db.files.where("name").equals(name).first();
    return fileEntry || null;
  } catch (err) {
    console.log("getFileByName error:", err);
    return null;
  }
};



export default db;
