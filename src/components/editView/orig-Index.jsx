//#region imports

//Local Imports
import React, { useEffect, useRef, useState } from "react";
import {
  getFile,
  updateCroppedFile,
  updateEstimateName,
  deleteCroppedFile,
  deleteMainFile,
  getPDFFile,
  updateCroppedCopyOfPDF,
  getCroppedFile,
  getMainFile,
  deletePages,
  saveLightPlacementPositions,
  storeDocumentsForDownload,
  GetAllLightPlacement,
  removeInvalidLightPlacements,
  GetScreenShot,
  saveScreenshotFile,
} from "../../IndexedDB.js";
import Header from "../header/Index.js";
import hamburger from "../../assets/img/hamburgergroup.svg";
import backArraow from "../../assets/img/back_arrow.svg";
import alertIcon from "../../assets/img/alert_icon.svg";
import crossIcon from "../../assets/img/cross.svg";
import "./Index.css";
import LightPlacementComponent from "../lightPlacementView/Index.jsx";
import FourCircles, {
  OneCircles,
  SixCircles,
  EightCircles,
  TwoCircles,
} from "../groupOfCircle/Index.js";
import { OldSpinnerLoader } from "../../loader/Index.jsx";
import grids from "../../assets/img/gridlines.svg";
import greeHseSVG from "../../assets/img/greenhseicon.svg";

//Third Party Imports
import DeleteIcon from "@mui/icons-material/Delete";
import CropIcon from "@mui/icons-material/Crop";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useNavigate, useLocation } from "react-router-dom";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import "react-tiny-fab/dist/styles.css";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CloseIcon from "@mui/icons-material/Close";
import html2canvas from "html2canvas";
import Sidebar from "react-sidebar";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import Joyride, { STATUS } from "react-joyride";
import Icon from "@mdi/react";
import { mdiDownload } from "@mdi/js";
import { mdiPrinter } from "@mdi/js";
import { mdiFileDownloadOutline } from "@mdi/js";
import { jsPDF } from "jspdf";
import printJS from "print-js";
import greenHseSmallLogo from "../../assets/img/greenhse-logo-small.png";
import {
  loadLogo,
  convertSVGToPNG,
} from "../../utilities/helpers/commonHelper.js";
import { emailAndAddress } from "../config/config.js";

//#endregion

//#region External variables
const PDFJS = window.pdfjsLib;
PDFJS.disableWorker = true;
var pdfWithCroppedImagesList = [];

//#endregion

const EditView = () => {
  //#region States and Variables
  const navigate = useNavigate();
  const cropperRef = useRef(null);
  const [fileObj, setFileObj] = useState();
  const [error, setError] = useState("");
  const [actualFileName, setActualFileName] = useState("");
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showHamburgerBlock, setShowHamburgerBlock] = useState(false);
  //Original File name
  const [mainFileName, setMainFileName] = useState("");
  const [pdfFile, setPdfFile] = useState();
  const [mainImageUrl, setMainImageUrl] = useState("");
  //Use state to manage croping is start or not on edit icon clicked
  const [startCropping, setStartCropping] = useState(false);
  //Get PDF document from uri.
  const [pdf, setPdf] = React.useState("");
  //Array of images extracted from PDF.
  const [pdfImages, setPdfImages] = React.useState([]);
  const [pdfActualImages, setPDFActualImages] = React.useState([]);
  //Array of images extracted from PDF.
  const [selectedPdfImageForCrop, setSelectedPdfImageForCrop] = React.useState(
    []
  );
  const [pdfCropImagePageNumber, setPdfCropImagePageNumber] = useState(() => {
    const savedIndex = parseInt(localStorage.getItem("activePageIndex"), 10);
    return isNaN(savedIndex) ? 0 : savedIndex - 1;
  });
  const [pdfRendering, setPdfRendering] = React.useState("");
  const [croppedFileName, setCroppedFileName] = useState("");
  const [fetchCount, setFetchCount] = useState(0);
  const [fileData, setFileData] = useState();
  const [activePage, setActivePage] = useState(() => {
    const savedPage = parseInt(localStorage.getItem("activePage"), 10);
    return isNaN(savedPage) ? 0 : savedPage;
  });
  const [totalPages, setTotalPages] = useState([]);
  const [isLightPlacement, setIsLightPlacement] = useState(false);
  const [lightColorsArray, setLightColorArray] = useState([]);
  const [circleUrl, setCircleUrl] = useState("");
  const [headerText, setHeaderText] = useState("Edit Images");
  const [headerSaveText, setHeaderSaveText] = useState("Estimate");
  // Get positions hook
  const [isLoading, setIsLoading] = useState(false);
  const [isGridBlockClicked, setIsGridBlockClicked] = useState(false);
  const [isSavePopupOpen, setIsSavePopupOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hideSideView, setHideSideView] = useState(false);
  const [hideHamburgerIcon, setHideHamburgerIcon] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [changePopupText, setChangePopupText] = useState(false);
  const [count, setCount] = useState(0);

  const [localStorageArr, setLocalStorageArr] = useState(
    JSON.parse(localStorage.getItem("currentNodePositions"))
  );
  const [localActiveIndex, setLocalActiveIndex] = useState(() => {
    const savedIndex = parseInt(localStorage.getItem("activePageIndex"), 10);
    return isNaN(savedIndex) ? 0 : savedIndex;
  });
  const [activePageIndex, setActivePageIndex] = useState(() => {
    const savedIndex = parseInt(localStorage.getItem("activePageIndex"), 10);
    return isNaN(savedIndex) ? 0 : savedIndex;
  });

  // Get positions hook
  const [lightPlacementPositions, setLightPlacementPositions] = useState([]);
  const [pdfSideView, setPdfSideView] = useState([]);
  const [resolvedImages, setResolvedImages] = useState([]);
  const [showLightPlacementComp, setShowLightPlacementComp] = useState(false);
  const [selectedProductcomp, setselectedProductComp] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showHomepage, setShowHomepage] = useState(
    () => JSON.parse(localStorage.getItem("showHomepage")) !== false
  );
  // Check save button click
  const [isSaveHandleClick, setIsSaveHandleClick] = useState(false);
  const [showJoyride, setShowJoyride] = useState(false);
  const theRef = React.useRef(null);
  const ref = useRef();
  var croppedFile;
  const location = useLocation();
  const selectedProduct = selectedProductcomp;
  var selectedProductList = [];
  selectedProductList.push(selectedProduct);

  //States used for zoom
  const [zoomCount, setZoomCount] = useState(0);
  const [isZoomIn, setIsZoomIn] = useState(false);
  const [isSingleClick, setIsSingleClick] = useState(false);
  const [run1, setRun1] = useState(true);
  const [run2, setRun2] = useState(true);
  var difference;
  const [startingPositions, setStartingPositions] = useState({
    normalStart: 0,
    zoomedStart: 0,
    normalEnd: 0,
    zoomedEnd: 0,
    normalWidth: 0,
    zoomedWidth: 0,
    normalAttempt: 0,
    zoomedAttempt: 0,
  });
  const [dimensions, setDimensions] = useState({});
  const [getFileName, setGetFileName] = useState(
    window.location.href.replaceAll("%20", "").split("=")[1]
  );

  //#endregion

  //#region UseEffect
  useEffect(() => {
    fetchFile();
    getAllPositions();
    CheckForLightPlacement();

    // // Check if the user has visited before
    const editViewVisited = localStorage.getItem("editViewVisited");
    if (editViewVisited) {
      setRun1(false);
    }

    console.log("window.href", getFileName);

    // const gridApplyVisited = localStorage.getItem('gridApplyVisited');
    // if (gridApplyVisited) {
    //   setRun2(false);
    // }

    const gridApplyVisited = localStorage.getItem(
      `${getFileName}IsGridVisited`
    );
    // console.log('gridApplyVisited', gridApplyVisited, typeof(gridApplyVisited));
    if (gridApplyVisited === "true") {
      setRun2(false);
    } else if (gridApplyVisited == "false") {
      // console.log('Hello');
      setRun2(true);
    }
  }, []);

  useEffect(() => {
    if (pdfImages.length > 0) {
      resolveImages();
    }
  }, [pdfImages]);

  useEffect(() => {
    localStorage.setItem("activePageIndex", activePageIndex);
  }, [activePageIndex]);

  useEffect(() => {
    localStorage.setItem("activePage", activePage);
  }, [activePage]);

  //useEffect to manage pdf change
  useEffect(() => {
    getAllPositions();
    pdf && renderPage();
    setPdfRendering(false);

    CheckForLightPlacement();
    setLocalStorageArr(
      JSON.parse(localStorage.getItem("currentNodePositions"))
    );
  }, [pdf]);

  useEffect(() => {
    if (isSaveHandleClick == true) {
      console.log("useeffect call");
      getAllPositions();
      setIsSaveHandleClick(false);
    }
  }, [localStorageArr]);

  useEffect(() => {
    storeDocumentsForDownload(mainFileName, resolvedImages);
  }, [resolvedImages]);

  //UseEffect to reflect changes at zoomed in and normal view
  useEffect(() => {
    var elementHeight = document.getElementById("bg-grid-block-area");
    localStorage.setItem("imageHeight", elementHeight.offsetHeight);
  }, [zoomCount]);

  var elementHeight = document.getElementById("bg-grid-block-area");
  localStorage.setItem("imageHeight", elementHeight?.offsetHeight);
  //#endregion

  //#region Most Used Functions

  const IsZoomed = (value) => {
    if (value % 2 == 0) {
      return false;
    } else {
      return true;
    }
  };

  console.log('localStorageArr',localStorageArr)

  const GetImagePositions = () => {
    var positionObject, start, end, Point, top, bottom;
    Point = document.querySelector("#bg-grid-block-area");
    start = Math.trunc(Point.getBoundingClientRect().left + window.scrollX);
    end = Math.trunc(Point.getBoundingClientRect().right + window.scrollX);
    top = Math.trunc(Point.getBoundingClientRect().top + window.scrollY);
    bottom = Math.trunc(Point.getBoundingClientRect().bottom + window.scrollY);

    return { s: start, b: bottom, t: top, e: end };
  };

  const GetXDifference = (value, zoomStatus) => {
    console.log("Position value", value);
    var positionObject, start, end, Point, top, bottom;
    Point = document.querySelector("#bg-grid-block-area");
    start = Math.trunc(Point.getBoundingClientRect().left + window.scrollX);
    end = Math.trunc(Point.getBoundingClientRect().right + window.scrollX);
    top = Math.trunc(Point.getBoundingClientRect().top + window.scrollY);
    bottom = Math.trunc(Point.getBoundingClientRect().bottom + window.scrollY);

    console.log(
      "Top and Bottom",
      top,
      "bottom",
      bottom,
      "start",
      start,
      "end",
      end
    );

    var printableValue = "";
    if (zoomStatus == true) {
      positionObject = {
        zoomedStart: start,
        zoomedEnd: end,
        normalStart: start + 150,
        normalEnd: end - 100,
        normalDistance: end - 100 - (start + 150),
        zoomedDistance: end - start,
        normalLoopAttempt: (end - 100 - (start + 150)) / 10,
        zoomedLoopAttempt: (end - start) / 20,
      };
      console.log("positionObject", positionObject);
      setDimensions(positionObject);
      for (
        let i = 1,
          j = positionObject.zoomedStart,
          prevValue = 0,
          zoomValue = positionObject.normalStart;
        i <= positionObject.normalLoopAttempt;
        i++
      ) {
        // if (value >= 830 && value <= 855) {
        //   console.log("I am in iffff of difference", i, "j", j);
        //   printableValue = value;
        //   difference = value;
        //   break;
        // }
        if (value >= start && value <= start + 17) {
          printableValue = zoomValue;
          difference = zoomValue;
          return difference;
          break;
        } else {
          console.log("I am in else of difference", i);
          if (value >= prevValue && value <= j) {
            console.log(
              "I am in if below",
              "value",
              value,
              "prev",
              prevValue,
              "j",
              j,
              "zoomValue",
              zoomValue
            );

            printableValue = zoomValue;
            difference = zoomValue;
            return difference;
            break;
          } else {
            console.log(
              "I am in else before",
              "value",
              value,
              "prev",
              prevValue,
              "j",
              j,
              "zoomValue",
              zoomValue
            );

            prevValue = j;
            j = j + 17;
            zoomValue = zoomValue + 9.5;
            console.log(
              "I am in else after",
              "value",
              value,
              "prev",
              prevValue,
              "j",
              j,
              "zoomValue",
              zoomValue
            );
          }
        }
      }
    } else {
      positionObject = {
        normalStart: start,
        normalEnd: end,
        zoomedStart: start - 150,
        zoomedEnd: end + 70,
        normalDistance: end - start,
        zoomedDistance: end + 100 - (start - 150),
        normalLoopAttempt: (end - start) / 10,
        zoomedLoopAttempt: (end + 100 - (start - 150)) / 20,
      };
      console.log("hhh", positionObject);
      setDimensions(positionObject);
      for (
        let i = 1,
          j = positionObject.normalStart,
          prevValue = 0,
          zoomValue = positionObject.zoomedStart;
        i <= positionObject.normalLoopAttempt;
        i++
      ) {
        // if (value >= 845 && value <= 855) {
        //   console.log("I am in iffff of difference", i, "j", j);
        //   printableValue = value;
        //   difference = value;
        //   break;
        // }
        if (value >= start && value <= start + 10) {
          printableValue = zoomValue;
          difference = zoomValue;
          return difference;
          break;
        } else {
          console.log("I am in else of difference", i);
          if (value >= prevValue && value <= j) {
            console.log(
              "I am in if below",
              "value",
              value,
              "prev",
              prevValue,
              "j",
              j,
              "zoomValue",
              zoomValue
            );

            printableValue = zoomValue;
            difference = zoomValue;
            return difference;
            break;
          } else {
            console.log(
              "I am in else before",
              "value",
              value,
              "prev",
              prevValue,
              "j",
              j,
              "zoomValue",
              zoomValue
            );

            prevValue = j;
            j = j + 10;
            zoomValue = zoomValue + 17;
            console.log(
              "I am in else after",
              "value",
              value,
              "prev",
              prevValue,
              "j",
              j,
              "zoomValue",
              zoomValue
            );
          }
        }
      }
    }
    console.log(
      "PrintableValue",
      printableValue,
      "normalLoopAttempt",
      startingPositions.normalAttempt,
      "zoomedLoopAttempt",
      startingPositions.zoomedAttempt
    );
  };

  const CheckForLightPlacement = () => {
    var isGridEnable = localStorage.getItem("isGridEnable");

    if (isGridEnable == "true") {
      EnableGrid();
    } else {
      DisableGrid();
    }
  };

  const saveLightPositions = async (id = 1) => {
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");
    // console.log('fileName', fileName);
    var placeLights = new URLSearchParams(window.location.href);
    placeLights = placeLights.get("placeLight");

    var array = [];
    // if (localStorageArr != null && localStorageArr.length > 0) {
    if (lightPlacementPositions != null && lightPlacementPositions.length > 0) {
      array = lightPlacementPositions;
      var positionArray = lightPlacementPositions;
      if (localStorageArr != null && localStorageArr.length > 0) {
        for (let i = 0; i < localStorageArr.length; i++) {
          var isEdit = false;
          var index;
          for (let j = 0; j < positionArray.length; j++) {
            if (localStorageArr[i].nodeId == positionArray[j].nodeId) {
              isEdit = true;
              index = j;
            }
          }
          if (isEdit == true) {
            positionArray[index] = localStorageArr[i];
          } else {
            positionArray.push(localStorageArr[i]);
          }
        }
      }

      array = positionArray;
      // console.log("Array", array);
    } else if (localStorageArr != null && localStorageArr.length > 0) {
      array = localStorageArr;
    }
    //  Remove object if placelight is empty
    const finalArr = array.filter((item) => item.placeLight != "");

    // Set isActiveAction false on save
    for (let i = 0; i < finalArr.length; i++) {
      finalArr[i].isActiveAction = false;
    }

    localStorage.removeItem("currentNodePositions");
    saveLightPlacementPositions(
      fileName,
      placeLights,
      finalArr,
      selectedProductList
    );
    console.log("resolvedImages", resolvedImages);
    if (fileObj && fileObj.type == "application/pdf") {
      console.log("resolvedImages", resolvedImages, "pdfImages", pdfImages);
      storeDocumentsForDownload(fileName, resolvedImages);
    } else {
      const element = document.querySelector("#screenshot-for-image");
      if (element) {
        html2canvas(element).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          console.log("imageData", imgData);
          const tempArr = [{ idx: 0, finalImage: imgData }];
          storeDocumentsForDownload(fileName, tempArr);
        });
      } else {
        console.error("Element not found or not attached to the document.");
      }
    }
    setIsSaveHandleClick(true);
  };

  const lightPlacementClickHandler = (e) => {
    var rect = e?.target?.getBoundingClientRect();
    var xAxis = e.clientX;
    var yAxis = e.clientY + window.scrollY;
    var positions = GetImagePositions();

    console.log(
      "rect",
      rect,
      "xAxis",
      xAxis,
      "yAxis",
      yAxis,
      "positions",
      positions
    );
    //Condition added to restrict user to place lights outside the floor plan
    if (
      xAxis >= positions.s &&
      xAxis <= positions.e &&
      yAxis >= positions.t &&
      yAxis <= positions.b
    ) {
      setShowJoyride(true);
      if (showLightPlacementComp == true) {
        var localData = JSON.parse(
          localStorage.getItem("currentNodePositions")
        );
        if (localData.length > 0) {
          if (localData[localData.length - 1].placeLight == "") {
            localData.pop();
            if (localData.length == 0) {
              localStorage.removeItem("currentNodePositions");
              setLocalStorageArr(null);
            } else {
              localStorage.setItem(
                "currentNodePositions",
                JSON.stringify(localData)
              );
              setLocalStorageArr(localData);
            }
          }
        }
        setShowLightPlacementComp(false);
      } else {
        const params = new URLSearchParams(window.location.search);
        const fileName = params.get("file");
        // const placeLight = params.get("placeLight");
        const externalComponents = circleUrl ? `&circles=${circleUrl}` : "";
        var iw = window.innerWidth;
        var ih = window.innerHeight;
        console.log("window innerWidth", iw);
        console.log("window innerHeight", ih);
        //Code for zoom
        console.log("e for eta", e);

        console.log(
          "resopnsive width distance",
          Math.round(((33 / 100) * iw) / 2)
        );
        if (IsZoomed(zoomCount) == true) {
          console.log("Zoom true!");
          var zoomX = e.clientX;
          var zoomY = e.clientY - rect.top - 0;
          // GetXDifferenceForZoom(zoomX, true);
          // GetXDifference(zoomX, true);

          // var x = difference;
          var x = GetXDifference(zoomX, true);
          var y = zoomY - (40.8 / 100) * zoomY - 5;
          console.log(
            "resopnsive width distance",
            Math.round(((33 / 100) * iw) / 2)
          );
          // if (iw < 1450) {
          //   x = CalculateResponsiveXPosition(x, true, iw);
          // }
          if (iw <= 992) {
            var drawerX = x + Math.round(((32 / 100) * iw) / 2);
            var zoomDrawerX = zoomX + Math.round(((32 / 100) * iw) / 2);
          } else if (iw <= 1300) {
            var drawerX = x + Math.round(((33 / 100) * iw) / 2);
            var zoomDrawerX = zoomX + Math.round(((33 / 100) * iw) / 2);
          } else if (iw <= 1600) {
            var drawerX = x + Math.round(((29 / 100) * iw) / 2);
            var zoomDrawerX = zoomX + Math.round(((29 / 100) * iw) / 2);
          } else if (iw <= 2000) {
            var drawerX = x + Math.round(((36 / 100) * iw) / 2);
            var zoomDrawerX = zoomX + Math.round(((36 / 100) * iw) / 2);
          }
        } else if (IsZoomed(zoomCount) == false) {
          console.log("Zoom false!");
          var x = e.clientX;
          var y = e.clientY - rect.top - 0;
          GetXDifference(x, false);
          // difference = difference - 25;
          // var zoomX = difference;
          var zoomX = GetXDifference(x, false);
          var zoomY = (80.8 / 100) * y + y - 13;
          // if (iw < 1450) {
          //   zoomX = CalculateResponsiveXPosition(zoomX, false, iw)
          // }
          if (iw <= 992) {
            var drawerX = x + Math.round(((32 / 100) * iw) / 2);
            var zoomDrawerX = zoomX + Math.round(((32 / 100) * iw) / 2);
          } else if (iw <= 1300) {
            var drawerX = x + Math.round(((33 / 100) * iw) / 2);
            var zoomDrawerX = zoomX + Math.round(((33 / 100) * iw) / 2);
          } else if (iw <= 1600) {
            var drawerX = x + Math.round(((29 / 100) * iw) / 2);
            var zoomDrawerX = zoomX + Math.round(((29 / 100) * iw) / 2);
          } else if (iw <= 2000) {
            var drawerX = x + Math.round(((36 / 100) * iw) / 2);
            var zoomDrawerX = zoomX + Math.round(((36 / 100) * iw) / 2);
          }
          console.log("x", x);
          console.log("drawerX", drawerX);
          // var zoomDrawerX = zoomX + 190;
          // var drawerX = x + 190;
        }
        var height = 25;
        var width = 50;
        var zoomedHeight = 50;
        var zoomedWidth = 80;
        // var x = e.clientX;
        // var drawerX = x + 185;
        // var y = e.clientY - rect.top;
        var nodeId = Date.now() + Math.floor(Math.random() * 10); //y position within the element.
        // const posObj = { nodeId, x, y, drawerX, rotateDegree: 0, placeLight: '' }
        //  Check isActiveAction attribute in local storage array
        let tempLocalArr = JSON.parse(
          localStorage.getItem("currentNodePositions")
        );
        if (tempLocalArr && tempLocalArr.length > 0) {
          const updateArr = tempLocalArr.map((item) => {
            if (item.isActiveAction && item.isActiveAction == true) {
              item.isActiveAction = false;
              console.log("item", item);
              return { ...item };
            }
            return item;
          });
          localStorage.setItem(
            "currentNodePositions",
            JSON.stringify(updateArr)
          );
        }
        // Add property for action icon hide/show
        const posObj = {
          height,
          width,
          zoomedHeight,
          zoomedWidth,
          nodeId,
          x,
          y,
          drawerX,
          zoomX,
          zoomY,
          isZoomed: IsZoomed(zoomCount),
          zoomDrawerX,
          placeLight: "",
          rotateDegree: 0,
          isActiveAction: true,
        };
        // localStorage.setItem('currentLightPositons', JSON.stringify(posObj));
        console.log("node positions", posObj);
        addObjectToArrayInLocalStorage(posObj);
        localStorage.setItem("activePageIndex", activePage);
        localStorage.setItem("activePageIndex", activePage);
        setShowLightPlacementComp(true);
        // setIsSaveHandleClick();
      }
    } else {
      if (showLightPlacementComp == true) {
        var localData = JSON.parse(
          localStorage.getItem("currentNodePositions")
        );
        if (localData.length > 0) {
          if (localData[localData.length - 1].placeLight == "") {
            localData.pop();
            if (localData.length == 0) {
              localStorage.removeItem("currentNodePositions");
              setLocalStorageArr(null);
            } else {
              localStorage.setItem(
                "currentNodePositions",
                JSON.stringify(localData)
              );
              setLocalStorageArr(localData);
            }
          }
        }
        setShowLightPlacementComp(false);
      } else {
        console.log("Invalid position place");
      }
    }
  };
  const handleLightbulbClick = () => {
    setIsGridBlockClicked(true);
    setShowGrid(true);
    setHideSideView(true);
    setHideHamburgerIcon(true);
    setIsLightPlacement(true);
    setHeaderText("Light Placement");
    setHeaderSaveText("Save");
    localStorage.setItem("isGridEnable", "true");
    const imagesWithIndex = pdfImages.map((image, index) => ({ index, image }));
    localStorage.setItem("pdfImages", JSON.stringify(imagesWithIndex));
    console.log("pdfImages saved to localStorage:", imagesWithIndex);
  };

  const handleSaveClick = () => {
    if (startCropping == true) {
      setIsSavePopupOpen(true);
    } else if (isLightPlacement == true) {
      setStartCropping(false);
      setIsSavePopupOpen(true);
      setChangePopupText(true);
    }
  };

  const confirmSaveButton = () => {
    saveLightPositions();
    setHideSideView(false);
    setShowGrid(false);
    setIsGridBlockClicked(false);
    setHeaderSaveText("Estimate");
    setHeaderText("Edit Images");
    setHideHamburgerIcon(false);
    setShowHamburgerBlock(false);
    setIsLightPlacement(false);
    setShowLightPlacementComp(false);

    localStorage.setItem("isGridEnable", "false");
    if (fileObj && fileObj.type == "application/pdf") {
      let image = document.querySelector("#bg-grid-block-area");
      const element = document.querySelector("#uploaded-image-screenshot");
      if (element) {
        requestAnimationFrame(() => {
          html2canvas(ref.current, {
            scale: 2,
            // width: element.scrollWidth,
            // height: element.scrollHeight,
            x: Math.trunc(image.getBoundingClientRect().left) + window.scrollX,
            y:
              Math.trunc(image.getBoundingClientRect().top) +
              window.scrollY -
              100,

            width: image.scrollWidth,
            height: image.scrollHeight,
          })
            .then(async (canvas) => {
              const screenshot = canvas.toDataURL("image/png");

              // Convert base64 to Blob
              const byteCharacters = atob(screenshot.split(",")[1]);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: "image/png" });

              // Create a File object from the Blob
              const file = new File([blob], "screenshot.png", {
                type: "image/png",
              });
              const params = new URLSearchParams(window.location.search);
              const fileName = decodeURIComponent(params.get("file"));
              // Save the file using saveFile function
              // saveFile('screenshot.png', file, []);
              var screenShot = [];
              screenShot.push({
                pageIndex: activePage,
                screenshot: file,
              });
              //screenShot.push(file);

              await saveScreenshotFile(fileName, activePage, screenShot);
              //saveScreenshotFile(fileName,activePage, screenShot);

              // Now 'file' is a File object containing your screenshot
              console.log("Screenshot File:", file);
              await renderPage();
              if (fileObj && fileObj.type == "application/pdf") {
                console.log(
                  "resolvedImages",
                  resolvedImages,
                  "pdfImages",
                  pdfImages
                );
                storeDocumentsForDownload(fileName, resolvedImages);
              } else {
                const element = document.querySelector("#screenshot-for-image");
                let image = document.querySelector("#bg-grid-block-area");

                if (element) {
                  html2canvas(element, {
                    scale: 2,
                    x:
                      Math.trunc(image.getBoundingClientRect().left) +
                      window.scrollX,
                    y:
                      Math.trunc(image.getBoundingClientRect().top) +
                      window.scrollY -
                      100,

                    width: image.scrollWidth,
                    height: image.scrollHeight,
                  }).then((canvas) => {
                    const imgData = canvas.toDataURL("image/png");
                    console.log("imageData", imgData);
                    const tempArr = [{ idx: 0, finalImage: imgData }];
                    storeDocumentsForDownload(fileName, tempArr);
                  });
                } else {
                  console.error(
                    "Element not found or not attached to the document."
                  );
                }
              }
            })
            .catch((error) => {
              console.error("Error capturing canvas:", error);
            });
        });
      } else {
        console.error("Element not found or not attached to the document.");
      }
    } else {
      let image = document.querySelector("#bg-grid-block-area");
      console.log("image case");
      const element = document.querySelector("#screenshot-for-image");
      if (element) {
        requestAnimationFrame(() => {
          html2canvas(ref.current, {
            // width: element.scrollWidth,
            // height: element.scrollHeight,
            scale: 2,
            x: Math.trunc(image.getBoundingClientRect().left) + window.scrollX,
            y:
              Math.trunc(image.getBoundingClientRect().top) +
              window.scrollY -
              100,

            width: image.scrollWidth,
            height: image.scrollHeight,
          })
            .then(async (canvas) => {
              const screenshot = canvas.toDataURL("image/png");
              console.log("screenshot", screenshot);

              // Convert base64 to Blob
              const byteCharacters = atob(screenshot.split(",")[1]);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: "image/png" });

              // Create a File object from the Blob
              const file = new File([blob], "screenshot.png", {
                type: "image/png",
              });
              const params = new URLSearchParams(window.location.search);
              const fileName = decodeURIComponent(params.get("file"));
              // Save the file using saveFile function
              // saveFile('screenshot.png', file, []);
              var screenShot = [];
              screenShot.push({
                pageIndex: 0,
                screenshot: file,
              });
              //screenShot.push(file);

              await saveScreenshotFile(fileName, 0, screenShot);
              //saveScreenshotFile(fileName,activePage, screenShot);

              // Now 'file' is a File object containing your screenshot
              console.log("Screenshot File:", file);
              await renderPage();
              if (fileObj && fileObj.type == "application/pdf") {
                console.log(
                  "resolvedImages",
                  resolvedImages,
                  "pdfImages",
                  pdfImages
                );
                storeDocumentsForDownload(fileName, resolvedImages);
              } else {
                const element = document.querySelector("#screenshot-for-image");
                if (element) {
                  html2canvas(element, {
                    scale: 2,
                    x:
                      Math.trunc(image.getBoundingClientRect().left) +
                      window.scrollX,
                    y:
                      Math.trunc(image.getBoundingClientRect().top) +
                      window.scrollY -
                      100,

                    width: image.scrollWidth,
                    height: image.scrollHeight - 50,
                  }).then((canvas) => {
                    const imgData = canvas.toDataURL("image/png");
                    console.log("imageData", imgData);
                    const tempArr = [{ idx: 0, finalImage: imgData }];
                    storeDocumentsForDownload(fileName, tempArr);
                  });
                } else {
                  console.error(
                    "Element not found or not attached to the document."
                  );
                }
              }
            })
            .catch((error) => {
              console.error("Error capturing canvas:", error);
            });
        });
      } else {
        console.error("Element not found or not attached to the document.");
      }
    }
  };

  const fetchFile = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      // console.log('params', params);
      const fileName = params.get("file");
      const croppedFileName = params.get("croppedFile");
      const fileNameAfterURLDecode = decodeURIComponent(fileName);
      const croppedFileNameAfterURLDecode = decodeURIComponent(croppedFileName);

      var isPlaceLight = new URLSearchParams(window.location.href);
      isPlaceLight = isPlaceLight.get("placeLight");
      setCircleUrl(isPlaceLight);
      // console.log('isPlaceLight', isPlaceLight);
      if (isPlaceLight) {
        const colors = isPlaceLight.split(",");
        setLightColorArray(colors);
      }

      if (startCropping) {
        if (fileNameAfterURLDecode.includes(".pdf")) {
          renderPage();
        }
        setStartCropping(false);

        return;
      }

      setActualFileName(fileNameAfterURLDecode);

      if (
        mainFileName == "croppedFileSet" ||
        mainFileName == fileNameAfterURLDecode
      ) {
        if (mainFileName == fileNameAfterURLDecode) {
          navigate(-1);
        }
      }

      setMainFileName(fileNameAfterURLDecode);
      setCroppedFileName(croppedFileNameAfterURLDecode);
      // Ensure the fileUrlObj fetched from getFile is correct
      const storedFile = await getFile(
        fileNameAfterURLDecode,
        croppedFileNameAfterURLDecode != "null" ||
          croppedFileNameAfterURLDecode != null
          ? croppedFileNameAfterURLDecode
          : undefined
      );

      if (fileNameAfterURLDecode.includes("pdf")) {
        var pdfFile = await getPDFFile(fileNameAfterURLDecode);
        setPdfFile(pdfFile);
        const uri = URL.createObjectURL(pdfFile.file);
        PDFJS.getDocument(uri).promise.then(function (pdf) {
          setPdf(pdf);
        });
      }

      const fileData = {
        ...storedFile,
      };

      var uri = URL.createObjectURL(storedFile);

      if (!fileNameAfterURLDecode.includes("pdf")) {
        if (
          mainFileName == "croppedFileSet" &&
          !fileNameAfterURLDecode.includes("pdf")
        ) {
          var mainFile = await getMainFile(fileNameAfterURLDecode);
          uri = URL.createObjectURL(mainFile);
        } else {
          var croppedImages = await getCroppedFile(fileNameAfterURLDecode);
          var croppedFileSRC = croppedImages[0];
          if (croppedImages.length > 0) {
            uri = URL.createObjectURL(new Blob([croppedFileSRC.croppedFile]));
          }
        }
      }

      //When file type is pdf
      if (storedFile && storedFile.type == "application/pdf") {
        setPdfRendering(true);
        setFileData(storedFile);
        //Get the pdf file to convert it into images.
        PDFJS.getDocument(uri).promise.then(function (pdf) {
          setPdf(pdf);
        });
        setPdfRendering(false);
      } else {
        setSelectedPdfImageForCrop(uri);
        setMainImageUrl(uri);
      }

      if (storedFile) {
        setFileObj(storedFile);

        setError(""); // Clear error state if file is successfully loaded
      } else {
        setError("File not found in Database");
      }

      setFileObj(storedFile);

      setFetchCount(fetchCount++);

      for (let i = 0; i < croppedImages.length; i++) {
        if (i == localActiveIndex) {
          // console.log('Called fetch', i, localActiveIndex);
          // setSelectedPdfImageForCrop(imagesList[i].image);
          let croppedBuffer = new Blob([croppedImages[i].croppedFile]);
          uri = URL.createObjectURL(croppedBuffer);
        }
      }
    } catch (error) {
      // console.error('Error fetching file:', error);
      // setError('Error fetching file');
    }
  };

  // Get All Light Placement positions
  const getAllPositions = async () => {
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");
    var records = await GetAllLightPlacement(fileName);

    if (records && records.length > 0) {
      // console.log("inside", records);
      setLightPlacementPositions(records);
    }
  };

  //Added to get pdf pages as Image
  async function renderPage() {
    var imagesList = await LoadPDF();
    storeDocumentsForDownload(fileObj.name, imagesList);
    if (pdfWithCroppedImagesList.length > 0) {
      setPdfImages(pdfWithCroppedImagesList);
    } else {
      setPdfImages(imagesList);
    }

    // if (croppedFileName != null) {
    // if (croppedFileName == null || croppedFileName == "null" || croppedFileName == "") {
    if (pdfFile && pdfFile.croppedFiles) {
      var file = pdfFile.croppedFiles.find((x) =>
        x.name.includes(`page-${activePage + 1}`)
      );
      if (file) {
        let arrayBuffer = new Blob([file.croppedFile]);
        setSelectedPdfImageForCrop(URL.createObjectURL(arrayBuffer));
      } else {
        var found = true;
        var activePageNumber = activePage + 1;

        for (var i = 1; i < pdf.numPages; i++) {
          var removedPages = pdfFile.removedPages;

          if (removedPages.includes(activePageNumber)) {
            activePageNumber = activePageNumber + 1;
          } else {
            found = false;
          }
        }

        // setActivePage(activePageNumber - 1);
        setSelectedPdfImageForCrop(imagesList[activePageNumber - 1]);
      }
    }

    for (let i = 0; i < imagesList.length; i++) {
      if (i == localActiveIndex) {
        // console.log('Called render', i, localActiveIndex, "imagesList, ", imagesList);
        setSelectedPdfImageForCrop(imagesList[i]);
        setActivePage(i);
        ChangePdfPage(imagesList[i], i);
      }
    }

    if (theRef.current) {
      for (var i = 0; i < theRef.current.children.length; i++) {
        if (theRef.current.children[i].classList.value == "active") {
          theRef.current.children[i].click();
          break;
        }
      }
    }

    if (pdfFile && pdfFile.pdfSideView) {
      setPdfSideView(pdfFile.pdfSideView);
    }
  }
  //#endregion
  //#region Functions
  const handleMessage = (data) => {
    console.log("data", data);
    setLocalStorageArr(
      JSON.parse(localStorage.getItem("currentNodePositions"))
    );
    setselectedProductComp(data);
  };

  const setMainImageToCrop = async () => {
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");
    const fileNameAfterURLDecode = decodeURIComponent(fileName);
    if (!fileNameAfterURLDecode.includes("pdf")) {
      const storedFile = await getFile(fileNameAfterURLDecode, undefined);
      const uri = URL.createObjectURL(storedFile);
      setSelectedPdfImageForCrop(uri);
    }
  };

  // Add an event listener for beforeunload event
  window.addEventListener("beforeunload", function (e) {
    // Remove the localStorage item you want to clear
    localStorage.removeItem("currentNodePositions");
    localStorage.removeItem("editCurrentNodeId");

    // console.log('remove local storage data');
  });

  const handleDeleteFile = async (idx, totalPages, removedPages) => {
    try {
      // Add 1 to idx to match page numbering
      const pageNumberToDelete = idx + 1;

      const params = new URLSearchParams(window.location.search);
      const fileName = params.get("file");
      const croppedFileName = params.get("croppedFile");
      const fileNameAfterURLDecode = decodeURIComponent(fileName);
      const croppedFileNameAfterURLDecode = decodeURIComponent(croppedFileName);

      let pageNumbersToDelete = [pageNumberToDelete]; // Initialize array with the page number to delete

      if (
        croppedFileNameAfterURLDecode === "null" ||
        !croppedFileNameAfterURLDecode
      ) {
        // If no cropped file, delete page from main file
        if (fileNameAfterURLDecode.includes(".pdf")) {
          // If it's a PDF, use PDFJS to delete the page
          await deletePages(
            fileNameAfterURLDecode,
            pageNumbersToDelete,
            totalPages,
            removedPages,
            async (shouldNavigate) => {
              await removeInvalidLightPlacements(fileNameAfterURLDecode);

              if (shouldNavigate) {
                navigate("/");
              } else {
                localStorage.clear();
                window.location.reload();
              }
            }
          );
        } else {
          // If it's not a PDF, delete the page from the main file
          await deleteMainFile(fileNameAfterURLDecode, pageNumbersToDelete);
          navigate("/");
        }
      } else {
        // If cropped file exists, delete page from cropped file
        await deleteCroppedFile(
          fileNameAfterURLDecode,
          croppedFileNameAfterURLDecode,
          pageNumbersToDelete
        );
        // navigate("/");
      }

      // Clear file URL state
      setFileObj("");
      setShowDeletePopup(false); // Close the delete confirmation pop-up after deleting the file
    } catch (error) {
      console.error("Error deleting file:", error);
      setError("Error deleting file");
    }
  };

  const onCropComplete = () => {
    const cropper = cropperRef.current?.cropper;
    // console.log("kkkk", cropper.getCroppedCanvas().toDataURL());
    var base64 = cropper.getCroppedCanvas().toDataURL();

    var file = b64toBlob(
      base64,
      base64.substr(
        base64.indexOf(":") - 1,
        base64.indexOf(";") - (base64.indexOf(":") + 1)
      )
    );
    var newfile = blobToFile(file);
    croppedFile = newfile;
    console.log("cropppedFile", croppedFile);
    // setSelectedPdfImageForCrop(URL.createObjectURL(newfile));
  };

  /**
   *
   * convert the blob to file so we can create a URL.createObjectUrl
   *
   * @param {*} theBlob
   * @returns
   */
  function blobToFile(theBlob) {
    theBlob.lastModifiedDate = new Date();
    theBlob.name = mainFileName;
    return theBlob;
  }

  /**
   *
   * convert the base64 to blob so we can make blob to file
   *
   * @param {*} b64Data
   * @param {*} contentType
   * @param {*} sliceSize
   * @returns
   */
  const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
    const byteCharacters = atob(b64Data.split(",")[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    var blob;
    if (fileObj && fileObj.type == "application/pdf") {
      blob = new Blob(byteArrays, { type: "image/png" });
    } else blob = new Blob(byteArrays, { type: fileObj.type });
    return blob;
  };

  const confirmFileCrop = async () => {
    try {
      var fileName = mainFileName;
      console.log("confirm file crop");
      setMainFileName("croppedFileSet");
      let croppedBlob = await getCroppedBlob(); // Function to get the cropped blob
      let croppedBuffer = await croppedBlob.arrayBuffer();
      const timestamp = Date.now();
      var newFileName = "";
      if (fileName.includes(".pdf")) {
        newFileName = `${timestamp}_Cropped_page-${
          pdfCropImagePageNumber + 1
        }.png`;
        var copyFileName = pdfFile.name;
        await updateCroppedCopyOfPDF(
          pdfFile,
          copyFileName,
          newFileName,
          croppedBuffer,
          pdfCropImagePageNumber + 1
        );
      } else {
        newFileName = `${timestamp}_Cropped.png`;
        await updateCroppedFile(mainFileName, newFileName, croppedBuffer);
        const newFile = await updateCroppedFile(
          mainFileName,
          newFileName,
          croppedBuffer
        );
        console.log("newFile", newFile);
      }

      setStartCropping(false);
      setHeaderText("Edit Images");
      setHeaderSaveText("Estimate");
      setIsLoading(true);
      await fetchFile();

      setSelectedPdfImageForCrop(URL.createObjectURL(new Blob([croppedBlob])));

      await renderPage();

      if (theRef.current) {
        for (var i = 0; i < theRef.current.children.length; i++) {
          if (theRef.current.children[i].classList.value == "active") {
            theRef.current.children[i].click();
            break;
          }
        }
      }

      setTimeout(() => {
        window.location.reload();
      }, 25);

      //  window.location.reload();
    } catch (error) {
      console.error("Error confirming file crop:", error);
    }
  };

  // Function to get the cropped blob from the cropper component
  const getCroppedBlob = async () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      return new Promise((resolve, reject) => {
        croppedCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blobToFile(blob));
          } else {
            reject("Error converting canvas to blob");
          }
        });
      });
    } else {
      throw new Error("Cropper not initialized");
    }
  };

  async function LoadPDF() {
    const imagesList = [];
    const canvas = document.createElement("canvas");
    canvas.setAttribute("className", "canv");
    let canv = document.querySelector(".canv");
    // console.log("PDFDFDFDFD",pdf.numPages);
    setTotalPages(pdf.numPages);
    // fetchFile(pdf.numPages);

    for (let i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i);
      var viewport = page.getViewport({ scale: 1 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      var render_context = {
        canvasContext: canvas.getContext("2d"),
        viewport: viewport,
      };
      // console.log("page lenght", pdf.numPages);
      //setWidth(viewport.width);
      //setHeight(viewport.height);
      await page.render(render_context).promise;
      let img = canvas.toDataURL("image/png");
      imagesList.push(img);
    }

    return imagesList;
  }

  const ChangePdfPage = async (src, idx) => {
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");
    const croppedFileName = params.get("croppedFile");
    const fileNameAfterURLDecode = decodeURIComponent(fileName);
    setActivePage(idx);
    // console.log("activePage",activePage)
    const storedFile = await getPDFFile(fileNameAfterURLDecode);
    var croppedImage;

    if (storedFile && "croppedFiles" in storedFile) {
      if (storedFile.croppedFiles.length > 0) {
        croppedImage = storedFile.croppedFiles.find((x) =>
          x.name.includes(`page-${idx + 1}`)
        );
      }
    }
    localStorage.setItem("activePageIndex", idx);
    // setSelectedPdfImageForCrop(croppedImage ? URL.createObjectURL(blobToFile(croppedImage.croppedFile)) : pdfImages[idx]);
    setSelectedPdfImageForCrop(
      croppedImage
        ? URL.createObjectURL(blobToFile(new Blob([croppedImage.croppedFile])))
        : pdfImages && pdfImages[idx]
        ? pdfImages[idx]
        : src
    );

    // console.log(idx);
    setPdfCropImagePageNumber(idx);
    // document.getElementById("activePdfPage").src = (croppedImage ? URL.createObjectURL(blobToFile(croppedImage.croppedFile)) : pdfImages[idx]);
  };

  const toggleHamburgerBlock = () => {
    setShowHamburgerBlock(!showHamburgerBlock);
  };

  const onUpdateEstimateName = async (fileName, newEstimateName) => {
    try {
      await updateEstimateName(fileName, newEstimateName);
    } catch (error) {
      console.error("Error updating estimate name:", error);
    }
  };

  const addObjectToArrayInLocalStorage = (object) => {
    // Retrieve existing array from localStorage
    let existingArray =
      JSON.parse(localStorage.getItem("currentNodePositions")) || [];
    // Add new object to the array
    existingArray.push(object);
    console.log('node positions2',existingArray)
    // Store the updated array back in localStorage
    localStorage.setItem("currentNodePositions", JSON.stringify(existingArray));
    setLocalStorageArr(existingArray);
  };

  const handleEstimate = () => {
    // console.log("Estimate called!");
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");
    const externalComponents = circleUrl ? `&circles=${circleUrl}` : "";
    navigate(
      `/estimate?file=${decodeURIComponent(fileName)}${externalComponents}`,
      { replace: false },
      selectedProductList
    );
  };

  // Function to load the logo
  const loadLogo = async () => {
    return new Promise((resolve, reject) => {
      const logo = new Image();
      logo.src = greenHseSmallLogo; // Update the path to your logo
      logo.onload = () => resolve(logo);
      logo.onerror = (err) => reject(err);
    });
  };

  //  Save image and pdf screenshot in local system
  const handleDownload = async () => {
    var pdf = new jsPDF();
    const logoDataUrl = await convertSVGToPNG(greeHseSVG);
    // const greenhseLogo = await loadLogo()
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    // Logo dimensions
    const logoWidth = 45;
    const logoHeight = 12.9;
    let emailAndAddressWidth = pdf.getTextWidth(emailAndAddress);

    // Calculate position to center the logo horizontally
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = 10;

    pdf.setFont("monospace", "normal", "normal");
    pdf.setFontSize(10);

    if (fileObj && fileObj.type === "application/pdf") {
      for (const { idx, finalImage } of resolvedImages) {
        if (idx > 0) {
          pdf.addPage();
        }
        pdf.addImage(
          logoDataUrl,
          "PNG",
          pageWidth - 55,
          5,
          logoWidth,
          logoHeight
        );
        pdf.text(emailAndAddress, 138, 23);
        // Add the main image
        if (finalImage.startsWith("blob:")) {
          pdf.addImage(
            finalImage,
            "PNG",
            logoX - 20,
            logoY + logoHeight + 10,
            100,
            0
          );
        } else {
          pdf.addImage(finalImage, "PNG", 10, logoY + logoHeight + 10, 190, 0);
          console.log("not blob found");
        }
      }
      let pdfName = "screenshots_" + Date.now() + ".pdf";
      pdf.save(pdfName);
    } else {
      const element = document.querySelector("#screenshot-for-image");
      let image = document.querySelector("#bg-grid-block-area");
      if (element) {
        html2canvas(element, {
          scale: 2,
          x: Math.trunc(image.getBoundingClientRect().left) + window.scrollX,
          y:
            Math.trunc(image.getBoundingClientRect().top) +
            window.scrollY -
            100,
          width: image.scrollWidth,
          height: image.scrollHeight,
        }).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          pdf.addImage(
            logoDataUrl,
            "PNG",
            pageWidth - 55,
            5,
            logoWidth,
            logoHeight
          );
          pdf.text(emailAndAddress, 138, 23);
          pdf.addImage(
            imgData,
            "PNG",
            logoX - 20,
            logoY + logoHeight + 10,
            100,
            0
          );
          // let pdfName = 'screenshots_' + Date.now() + '.pdf';
          pdf.save("img-" + Date.now());
        });
      } else {
        console.error("Element not found or not attached to the document.");
      }
    }
  };

  const isSafari = () => {
    const plateformSelection = navigator.userAgent.toLowerCase();
    return (
      plateformSelection.includes("safari") &&
      !plateformSelection.includes("chrome")
    );
  };

  // Print image and pdf
  const handlePrint = async (ele) => {
    console.log("handle print called", ele);
    const isSafariBrowser = isSafari();

    if (fileObj && fileObj.type === "application/pdf") {
      const currentPdfImages = [];
      for (let i = 0; i < resolvedImages.length; i++) {
        currentPdfImages.push(resolvedImages[i].finalImage);
      }
      console.log("currentPdfImages arr", currentPdfImages);

      // Define the header as a constant
      const headerHTML = `
  <div class="header-logo">
    <img class="header-logo-img" src=${greeHseSVG} />
    <div class="address-email">${emailAndAddress}</div>
  </div>`;

      // Combine the header with each image using a page template
      const imagesWithHeader = currentPdfImages
        .map(
          (imageSrc) => `
  <div class="print-page">
    ${headerHTML}
    <div class="image-container">
      <img  src="${imageSrc}" class="print-image">
    </div>
  </div>
`
        )
        .join("");

      console.log("imagesWithHeader", imagesWithHeader);

      // Print the combined content
      printJS({
        printable: imagesWithHeader,
        type: "raw-html",
        documentTitle: "GreenHse",
        style: `
    .print-page {
     page-break-after: ${isSafariBrowser ? "auto" : "always"};
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: center;
      height: 100%;
    }
    .header-logo { 
      width: 100%; 
      display: block; 
      text-align: right; 
      height:15%;
      margin-bottom: 25px; /* Adjust as necessary */
    }
    .header-logo-img { 
      max-width: 100%; 
      width:140px;
    }
    .image-container {
      width: 100%;
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
     height: ${isSafariBrowser ? "850px" : "850px"};
    }
    .print-image {
      max-width: 100%;
      max-height: 100%;
      width:85%;
    }
  `,
      });
    } else {
      const element = document.querySelector("#screenshot-for-image");
      let image = document.querySelector("#bg-grid-block-area");

      if (element) {
        html2canvas(element, {
          x: Math.trunc(image.getBoundingClientRect().left) + window.scrollX,
          y:
            Math.trunc(image.getBoundingClientRect().top) +
            window.scrollY -
            100,
          width: image.scrollWidth,
          height: image.scrollHeight,
        }).then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          console.log("imgData", imgData);
          // Define the header as a constant
          const headerHTML = `
            <div class="print-page" >
              <div class="header-logo">
                <img class="header-logo-img" src=${greeHseSVG} />
                <div class="address-email">${emailAndAddress}</div>
              </div>
   
            <div class="image-container">
              <img  src="${imgData}" class="print-image">
            </div>
    </div >`;

          // printJS({ printable: imgData, type: 'image', documentTitle: 'GreenHse', header: '' });
          printJS({
            printable: headerHTML,
            type: "raw-html",
            documentTitle: "GreenHse",
            style: `
            .print-page {
             page-break-after: ${isSafariBrowser ? "auto" : "always"};
              display: flex;
              flex-direction: column;
              justify-content: start;
              align-items: center;
              height: 100%;
            }
            .header-logo { 
              width: 100%; 
              display: block; 
              text-align: right; 
              height:15%;
              margin-bottom: 25px; /* Adjust as necessary */
            }
            .header-logo-img { 
              max-width: 100%; 
              width:140px;
            }
            .image-container {
              width: 100%;
              flex-grow: 1;
              display: flex;
              justify-content: center;
              align-items: center;
              height: ${isSafariBrowser ? "850px" : "850px"};
            }
            .print-image {
              max-width: 100%;
              max-height: 100%;
              width:85%;
           
            }
          `,
          });
        });
      }
    }
  };

  // Set Zoom Level
  function handleTransform(e) {
    // console.log('Zoom level', e.instance.transformState.scale); // output scale factor
    setZoomLevel(e.instance.transformState);
  }

  const closeSavePopup = () => {
    setIsSavePopupOpen(false);
  };

  const EnableGrid = () => {
    setIsGridBlockClicked(true);
    setHideSideView(true);
    setHideHamburgerIcon(true);
    setHeaderText("Light Placement");
    setHeaderSaveText("Save");
    setIsLightPlacement(true);
    setShowGrid(true);
  };

  const DisableGrid = () => {
    setIsGridBlockClicked(false);
    setHideSideView(false);
    setHideHamburgerIcon(false);
    setShowHamburgerBlock(false);
    setHeaderText("Edit Images");
    setHeaderSaveText("Estimate");
    setIsLightPlacement(false);
    setShowGrid(false);
  };

  const onSetSidebarOpen = (open) => {
    setSidebarOpen(open);
  };
  const backClick = () => {
    setShowLightPlacementComp(false);
    if (isLightPlacement == true) {
      DisableGrid();
    } else if (startCropping == true) {
      setStartCropping(false);
      DisableGrid();
    } else {
      navigate("/");
      localStorage.setItem("showHomepage", "false");
    }
  };

  //#endregion

  const loadImage = async (fileName, idx) => {
    try {
      const screenshot = await GetScreenShot(fileName, idx);
      const ss = URL.createObjectURL(
        screenshot.find((x) => x[0].pageIndex === idx)[0].screenshotData[0]
          .screenshot
      );
      return ss;
    } catch (error) {
      return null;
    }
  };

  const resolveImages = async () => {
    const promises = pdfImages.map(async (image, idx) => {
      const screenshotImage = await loadImage(pdfFile.name, idx);
      const croppedImage = pdfFile.croppedFiles.find((x) =>
        x.name.includes(`page-${idx + 1}`)
      );
      const finalImage =
        screenshotImage ||
        (croppedImage
          ? URL.createObjectURL(new Blob([croppedImage.croppedFile]))
          : image);
      return { idx, finalImage };
    });

    const results = await Promise.all(promises);
    setResolvedImages(results);
    localStorage.setItem("pdfUrls", JSON.stringify(results));
  };

  const handleLightPlacementToggle = () => {
    if (showLightPlacementComp == true) {
      setShowLightPlacementComp(false);
      var localData = JSON.parse(localStorage.getItem("currentNodePositions"));
      if (localData.length > 0) {
        localData.pop();
        console.log('node positions3',localData)
        localStorage.setItem("currentNodePositions", JSON.stringify(localData));
        setLocalStorageArr(localData);
      }
    } else {
      setShowLightPlacementComp(true);
    }
  };
  const closeSidebar = () => {
    setShowLightPlacementComp(false); // Close sidebar when close icon clicked
    var localData = JSON.parse(localStorage.getItem("currentNodePositions"));

    if (localData.length > 0) {
      if (localData[localData.length - 1].placeLight == "") {
        localData.pop();
      }
      if (localData.length == 0) {
        console.log("if");
        localStorage.removeItem("currentNodePositions");
        setLocalStorageArr(null);
      } else {
        console.log("else");
        console.log('node positions4',localData)
        localStorage.setItem("currentNodePositions", JSON.stringify(localData));
        setLocalStorageArr(localData);
      }
    }
  };

  // Code for  Guided tours
  const steps1 = [
    {
      target: ".estimate-block",
      content: "By clicking on estimate button go to estimate page",
      disableBeacon: true,
      hideCloseButton: true,
      debug: true,
    },
    {
      target: ".hamburger-bar-icon",
      content:
        "By clicking on this you can view crop, lights, delete button once you tap on it",
      hideCloseButton: true,
      hideBackButton: true,
      debug: true,
    },
  ];

  const steps2 = [
    {
      target: ".bg-grid-img",
      content:
        "By double clicking on image you can select room type and product lights",
      disableBeacon: true,
      hideCloseButton: true,
      hideBackButton: true,
      debug: true,
      placement: "center",
    },
  ];

  const handleJoyrideCallback = (caseNo, data) => {
    console.log("case number", caseNo);
    console.log("data", data);

    const { action, index, origin, status, type } = data;

    switch (caseNo) {
      case 1:
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
          // You need to set our running state to false, so we can restart if we click start again.
          localStorage.setItem("editViewVisited", "true");
          setRun1(false);
        }
        break;
      case 2:
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
          // You need to set our running state to false, so we can restart if we click start again.
          localStorage.setItem(`${getFileName}IsGridVisited`, "true");
          setRun2(false);
        }
        break;
      default:
        console.log("default case run for guided tour");
    }
  };

  //#region JSX
  return (
    <div>
      <Joyride
        callback={(data) => handleJoyrideCallback(1, data)}
        steps={steps1}
        run={run1}
        styles={{
          options: {
            primaryColor: "#5CB226",
          },
        }}
        continuous
        showSkipButton
        showProgress
        disableOverlayClose={true}
      />

      <div className="page-content-custom-block">
        <div className="back-button">
          <button
            onClick={() => {
              backClick();
            }}
          >
            {" "}
            <img src={backArraow} />
            Back
          </button>
        </div>

        {(startCropping == true || isLightPlacement == true) && (
          <div className="save-button save-button-block">
            {startCropping == false && isLightPlacement == true && (
              <>
                {zoomCount % 2 == 0 ? (
                  <ZoomInRoundedIcon
                    className="zoom-in-icon"
                    color="white"
                    onClick={() => {
                      setIsSingleClick(true);
                      if (zoomCount % 2 == 0) {
                        setZoomCount((zoomCount) => zoomCount + 1);
                      }
                    }}
                  />
                ) : (
                  <ZoomOutRoundedIcon
                    className="zoom-out-icon"
                    color="white"
                    onClick={() => {
                      setIsSingleClick(false);
                      if (zoomCount % 2 != 0) {
                        setZoomCount((zoomCount) => zoomCount + 1);
                      }
                    }}
                  />
                )}
              </>
            )}
            <button onClick={handleSaveClick}>
              {/* {startCropping ? "Crop" : "Save"} */}
              {headerSaveText}
            </button>
          </div>
        )}

        {startCropping == false && isLightPlacement == false && (
          <>
            <div className="estimate-block">
              <button onClick={handleEstimate}>{headerSaveText}</button>

              {zoomCount % 2 == 0 ? (
                <ZoomInRoundedIcon
                  className="zoom-in-icon"
                  color="white"
                  onClick={() => {
                    setIsSingleClick(true);
                    if (zoomCount % 2 == 0) {
                      setZoomCount((zoomCount) => zoomCount + 1);
                    }
                  }}
                />
              ) : (
                <ZoomOutRoundedIcon
                  className="zoom-out-icon"
                  color="white"
                  onClick={() => {
                    setIsSingleClick(false);
                    if (zoomCount % 2 != 0) {
                      setZoomCount((zoomCount) => zoomCount + 1);
                    }
                  }}
                />
              )}
              {/* <button onClick={handleDownload}>
                Download
              </button> */}
              <span className="file-download-icon" onClick={handleDownload}>
                <Icon path={mdiDownload} size={1} />
              </span>
              <span className="file-download-icon print-icon">
                <Icon
                  path={mdiPrinter}
                  size={1}
                  onClick={() => handlePrint("screenshot-for-image")}
                />
              </span>
            </div>
          </>
        )}

        <Header
          headerText={headerText}
          headerSaveText={headerSaveText}
          onUpdateEstimateName={onUpdateEstimateName}
          showEstimateName={true}
          showEditIcon={true}
        />

        {isSavePopupOpen && (
          <Popup
            open={isSavePopupOpen}
            closeOnDocumentClick
            onClose={closeSavePopup}
            className="delete-popup-content-content"
          >
            <div className="delete-popup-button-block crop-delete-popup">
              <h5>Save Changes</h5>
              <p>
                Are you sure you want to save this{" "}
                {changePopupText ? "lights?" : "image?"}{" "}
              </p>
              <div className="delete-btn-block">
                <button
                  onClick={() => {
                    if (startCropping == true) {
                      setStartCropping(false); // Reset startCropping state
                      setHeaderText("Edit Images");
                      if (fileObj && fileObj.type === "application/pdf") {
                        renderPage(); // Render PDF pages again if it's a PDF
                      } else {
                        setSelectedPdfImageForCrop(mainImageUrl); // Render JPEG file if it's not a PDF
                      }
                    }

                    closeSavePopup(); // Close the popup or perform any other actions
                  }}
                >
                  Cancel
                </button>
                <button
                  className="delete-block"
                  onClick={() => {
                    if (startCropping == true) {
                      confirmFileCrop();
                    } else {
                      confirmSaveButton();
                    }
                    closeSavePopup();
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </Popup>
        )}
      </div>

      <div className="row">
        {/* <div className={`col-md-4 ${showLightPlacementComp ? 'col-md-4 sidebar-open sidebar-block-area' : ''}`}> */}
        <div
          className={`col-md-12 uploaded-pdf-section-inner ${
            showLightPlacementComp ? "col-md-8" : ""
          }`}
        >
          {/* <div className={`uploaded-pdf ${showLightPlacementComp ? 'offset-4 col-md-8 uploaded-pdf-custom-area' : ''}`} > */}
          <div
            className={`uploaded-pdf ${
              showLightPlacementComp ? "col-md-12 uploaded-pdf-custom-area" : ""
            }`}
          >
            {isGridBlockClicked && (
              <>
                <Joyride
                  callback={(data) => handleJoyrideCallback(2, data)}
                  steps={steps2}
                  run={run2}
                  styles={{
                    options: {
                      primaryColor: "#5CB226",
                    },
                  }}
                  // continuous
                  showSkipButton
                  showProgress
                  disableOverlayClose={true}
                />
              </>
            )}

            {error && <div>Error: {error}</div>}

            {startCropping ? (
              <>
                <div
                  className="upload-block-image-cropper "
                  style={{ textAlign: "center" }}
                >
                  <div className="cropper-wrapper-inner">
                    {/* <Cropper
                        src={pdfImages.length > 0 ? pdfImages[pdfCropImagePageNumber] : selectedPdfImageForCrop}
                        style={{ height: "98%", width: "auto" }}
                        initialAspectRatio={1 / 1}
                        guides={false}
                        zoom={false}
                        zoomOnTouch={false}
                        zoomOnWheel={false}
                        scrolling={false}
                        movable={false}
                        background={false}
                        // ready={onReady}
                        cropend={onCropComplete}
                        ref={cropperRef}
                      /> */}

                    <Cropper
                      src={
                        pdfImages.length > 0
                          ? pdfImages[pdfCropImagePageNumber]
                          : selectedPdfImageForCrop
                      }
                      style={{
                        height: "auto",
                        width: "100%",
                        paddingBottom: "20px",
                      }}
                      initialAspectRatio={1 / 1}
                      guides={false}
                      zoom={false}
                      zoomOnTouch={false}
                      zoomOnWheel={false}
                      scrolling={false}
                      movable={false}
                      background={false}
                      responsive={true}
                      // autoCropArea={1}
                      checkOrientation={false}
                      cropBoxResizable={true}
                      // dragMode="move"

                      cropBoxMovable={true}
                      viewMode={1}
                      minCropBoxHeight={10}
                      minCropBoxWidth={10}
                      cropend={onCropComplete}
                      ref={cropperRef}
                    />
                  </div>
                </div>
              </>
            ) : fileObj && fileObj.type == "application/pdf" ? (
              <>
                {/* <button className="zoom-button" onClick={() => { setIsSingleClick(isSingleClick => !isSingleClick); setZoomCount(zoomCount => zoomCount + 1) }}>ZoomIn</button> */}

                <div
                  className={`upload-block-image ${
                    IsZoomed(zoomCount) == true ? "zoomIn-upload-block-img" : ""
                  }`}
                  style={{ textAlign: "center" }}
                  id="uploaded-image-screenshot"
                  ref={ref}
                >
                  {pdfImages.length > 0 ? (
                    <>
                      {/* {localActiveIndex == activePage && */}
                      <>
                        {localStorageArr?.length > 0 && (
                          <>
                            {localStorageArr?.map((item, index) => {
                              {
                                if (item.pageIndex == activePage) {
                                  if (
                                    item.placeLight
                                      .toLowerCase()
                                      .includes("one")
                                  ) {
                                    console.log("item", item);
                                    return (
                                      <OneCircles
                                        GetDifference={GetXDifference}
                                        dimensions={dimensions}
                                        color={item.placeLight.split("_")[1]}
                                        posObj={item}
                                        storePositionsArr={localStorageArr}
                                        setPositions={setLocalStorageArr}
                                        isGridEnabled={isGridBlockClicked}
                                        count={count}
                                        setCount={setCount}
                                        isLocalStorageArr={true}
                                        showLightPlacementComp={
                                          showLightPlacementComp
                                        }
                                        setShowLightPlacementComp={
                                          setShowLightPlacementComp
                                        }
                                        zoomCount={zoomCount}
                                        IsZoomed={IsZoomed}
                                        anotherArray={lightPlacementPositions}
                                        setAnotherArray={
                                          setLightPlacementPositions
                                        }
                                      />
                                    );
                                  } else if (
                                    item.placeLight
                                      .toLowerCase()
                                      .includes("two")
                                  ) {
                                    return (
                                      <TwoCircles
                                        GetDifference={GetXDifference}
                                        dimensions={dimensions}
                                        color={item.placeLight.split("_")[1]}
                                        posObj={item}
                                        storePositionsArr={localStorageArr}
                                        setPositions={setLocalStorageArr}
                                        isGridEnabled={isGridBlockClicked}
                                        showLightPlacementComp={
                                          showLightPlacementComp
                                        }
                                        setShowLightPlacementComp={
                                          setShowLightPlacementComp
                                        }
                                        zoomCount={zoomCount}
                                        IsZoomed={IsZoomed}
                                        anotherArray={lightPlacementPositions}
                                        setAnotherArray={
                                          setLightPlacementPositions
                                        }
                                      />
                                    );
                                  } else if (
                                    item.placeLight
                                      .toLowerCase()
                                      .includes("four")
                                  ) {
                                    return (
                                      <FourCircles
                                        GetDifference={GetXDifference}
                                        dimensions={dimensions}
                                        color={item.placeLight.split("_")[1]}
                                        posObj={item}
                                        storePositionsArr={localStorageArr}
                                        setPositions={setLocalStorageArr}
                                        isGridEnabled={isGridBlockClicked}
                                        showLightPlacementComp={
                                          showLightPlacementComp
                                        }
                                        setShowLightPlacementComp={
                                          setShowLightPlacementComp
                                        }
                                        zoomCount={zoomCount}
                                        IsZoomed={IsZoomed}
                                        anotherArray={lightPlacementPositions}
                                        setAnotherArray={
                                          setLightPlacementPositions
                                        }
                                      />
                                    );
                                  } else if (
                                    item.placeLight
                                      .toLowerCase()
                                      .includes("six")
                                  ) {
                                    return (
                                      <SixCircles
                                        GetDifference={GetXDifference}
                                        dimensions={dimensions}
                                        color={item.placeLight.split("_")[1]}
                                        posObj={item}
                                        storePositionsArr={localStorageArr}
                                        setPositions={setLocalStorageArr}
                                        isGridEnabled={isGridBlockClicked}
                                        showLightPlacementComp={
                                          showLightPlacementComp
                                        }
                                        setShowLightPlacementComp={
                                          setShowLightPlacementComp
                                        }
                                        zoomCount={zoomCount}
                                        IsZoomed={IsZoomed}
                                        anotherArray={lightPlacementPositions}
                                        setAnotherArray={
                                          setLightPlacementPositions
                                        }
                                      />
                                    );
                                  } else if (
                                    item.placeLight
                                      .toLowerCase()
                                      .includes("eight")
                                  ) {
                                    return (
                                      <EightCircles
                                        GetDifference={GetXDifference}
                                        dimensions={dimensions}
                                        color={item.placeLight.split("_")[1]}
                                        posObj={item}
                                        storePositionsArr={localStorageArr}
                                        setPositions={setLocalStorageArr}
                                        isGridEnabled={isGridBlockClicked}
                                        showLightPlacementComp={
                                          showLightPlacementComp
                                        }
                                        setShowLightPlacementComp={
                                          setShowLightPlacementComp
                                        }
                                        zoomCount={zoomCount}
                                        IsZoomed={IsZoomed}
                                        anotherArray={lightPlacementPositions}
                                        setAnotherArray={
                                          setLightPlacementPositions
                                        }
                                      />
                                    );
                                  }
                                }
                              }
                            })}
                          </>
                        )}
                        {lightPlacementPositions.length > 0 && (
                          <>
                            <>
                              {lightPlacementPositions?.map((item, i) => {
                                if (localStorageArr?.length >= 0) {
                                  var isInsert = false;
                                  for (
                                    let i = 0;
                                    i < localStorageArr?.length;
                                    i++
                                  ) {
                                    if (
                                      localStorageArr[i].nodeId != item?.nodeId
                                    ) {
                                      isInsert = true;
                                    } else {
                                      isInsert = false;
                                      break;
                                    }
                                  }
                                  if (isInsert == true) {
                                    if (item.pageIndex == activePage) {
                                      if (
                                        item?.placeLight
                                          ?.toLowerCase()
                                          .includes("one")
                                      ) {
                                        return (
                                          <OneCircles
                                            GetDifference={GetXDifference}
                                            dimensions={dimensions}
                                            color={
                                              item.placeLight.split("_")[1]
                                            }
                                            posObj={item}
                                            storePositionsArr={
                                              lightPlacementPositions
                                            }
                                            setPositions={
                                              setLightPlacementPositions
                                            }
                                            isGridEnabled={isGridBlockClicked}
                                            showLightPlacementComp={
                                              showLightPlacementComp
                                            }
                                            setShowLightPlacementComp={
                                              setShowLightPlacementComp
                                            }
                                            zoomCount={zoomCount}
                                            IsZoomed={IsZoomed}
                                            anotherArray={localStorageArr}
                                            setAnotherArray={setLocalStorageArr}
                                          />
                                        );
                                      } else if (
                                        item?.placeLight
                                          ?.toLowerCase()
                                          .includes("two")
                                      ) {
                                        return (
                                          <TwoCircles
                                            GetDifference={GetXDifference}
                                            dimensions={dimensions}
                                            color={
                                              item.placeLight.split("_")[1]
                                            }
                                            posObj={item}
                                            storePositionsArr={
                                              lightPlacementPositions
                                            }
                                            setPositions={
                                              setLightPlacementPositions
                                            }
                                            isGridEnabled={isGridBlockClicked}
                                            showLightPlacementComp={
                                              showLightPlacementComp
                                            }
                                            setShowLightPlacementComp={
                                              setShowLightPlacementComp
                                            }
                                            zoomCount={zoomCount}
                                            IsZoomed={IsZoomed}
                                            anotherArray={localStorageArr}
                                            setAnotherArray={setLocalStorageArr}
                                          />
                                        );
                                      } else if (
                                        item?.placeLight
                                          ?.toLowerCase()
                                          .includes("four")
                                      ) {
                                        return (
                                          <FourCircles
                                            GetDifference={GetXDifference}
                                            dimensions={dimensions}
                                            color={
                                              item.placeLight.split("_")[1]
                                            }
                                            posObj={item}
                                            storePositionsArr={
                                              lightPlacementPositions
                                            }
                                            setPositions={
                                              setLightPlacementPositions
                                            }
                                            isGridEnabled={isGridBlockClicked}
                                            showLightPlacementComp={
                                              showLightPlacementComp
                                            }
                                            setShowLightPlacementComp={
                                              setShowLightPlacementComp
                                            }
                                            zoomCount={zoomCount}
                                            IsZoomed={IsZoomed}
                                            anotherArray={localStorageArr}
                                            setAnotherArray={setLocalStorageArr}
                                          />
                                        );
                                      } else if (
                                        item?.placeLight
                                          ?.toLowerCase()
                                          .includes("six")
                                      ) {
                                        return (
                                          <SixCircles
                                            GetDifference={GetXDifference}
                                            dimensions={dimensions}
                                            color={
                                              item.placeLight.split("_")[1]
                                            }
                                            posObj={item}
                                            storePositionsArr={
                                              lightPlacementPositions
                                            }
                                            setPositions={
                                              setLightPlacementPositions
                                            }
                                            isGridEnabled={isGridBlockClicked}
                                            showLightPlacementComp={
                                              showLightPlacementComp
                                            }
                                            setShowLightPlacementComp={
                                              setShowLightPlacementComp
                                            }
                                            zoomCount={zoomCount}
                                            IsZoomed={IsZoomed}
                                            anotherArray={localStorageArr}
                                            setAnotherArray={setLocalStorageArr}
                                          />
                                        );
                                      } else if (
                                        item?.placeLight
                                          ?.toLowerCase()
                                          .includes("eight")
                                      ) {
                                        return (
                                          <EightCircles
                                            GetDifference={GetXDifference}
                                            dimensions={dimensions}
                                            color={
                                              item.placeLight.split("_")[1]
                                            }
                                            posObj={item}
                                            storePositionsArr={
                                              lightPlacementPositions
                                            }
                                            setPositions={
                                              setLightPlacementPositions
                                            }
                                            isGridEnabled={isGridBlockClicked}
                                            showLightPlacementComp={
                                              showLightPlacementComp
                                            }
                                            setShowLightPlacementComp={
                                              setShowLightPlacementComp
                                            }
                                            zoomCount={zoomCount}
                                            IsZoomed={IsZoomed}
                                            anotherArray={localStorageArr}
                                            setAnotherArray={setLocalStorageArr}
                                          />
                                        );
                                      }
                                    }
                                  }
                                } else {
                                  if (item.pageIndex == activePage) {
                                    if (
                                      item?.placeLight
                                        ?.toLowerCase()
                                        .includes("one")
                                    ) {
                                      return (
                                        <OneCircles
                                          GetDifference={GetXDifference}
                                          dimensions={dimensions}
                                          color={item.placeLight.split("_")[1]}
                                          posObj={item}
                                          storePositionsArr={
                                            lightPlacementPositions
                                          }
                                          setPositions={
                                            setLightPlacementPositions
                                          }
                                          isGridEnabled={isGridBlockClicked}
                                          showLightPlacementComp={
                                            showLightPlacementComp
                                          }
                                          setShowLightPlacementComp={
                                            setShowLightPlacementComp
                                          }
                                          zoomCount={zoomCount}
                                          IsZoomed={IsZoomed}
                                          anotherArray={localStorageArr}
                                          setAnotherArray={setLocalStorageArr}
                                          // storePositionsArr={data.positions}
                                        />
                                      );
                                    } else if (
                                      item?.placeLight
                                        ?.toLowerCase()
                                        .includes("two")
                                    ) {
                                      return (
                                        <TwoCircles
                                          GetDifference={GetXDifference}
                                          dimensions={dimensions}
                                          color={item.placeLight.split("_")[1]}
                                          posObj={item}
                                          storePositionsArr={
                                            lightPlacementPositions
                                          }
                                          setPositions={
                                            setLightPlacementPositions
                                          }
                                          isGridEnabled={isGridBlockClicked}
                                          showLightPlacementComp={
                                            showLightPlacementComp
                                          }
                                          setShowLightPlacementComp={
                                            setShowLightPlacementComp
                                          }
                                          zoomCount={zoomCount}
                                          IsZoomed={IsZoomed}
                                          anotherArray={localStorageArr}
                                          setAnotherArray={setLocalStorageArr}
                                        />
                                      );
                                    } else if (
                                      item?.placeLight
                                        ?.toLowerCase()
                                        .includes("four")
                                    ) {
                                      return (
                                        <FourCircles
                                          GetDifference={GetXDifference}
                                          dimensions={dimensions}
                                          color={item.placeLight.split("_")[1]}
                                          posObj={item}
                                          storePositionsArr={
                                            lightPlacementPositions
                                          }
                                          setPositions={
                                            setLightPlacementPositions
                                          }
                                          isGridEnabled={isGridBlockClicked}
                                          showLightPlacementComp={
                                            showLightPlacementComp
                                          }
                                          setShowLightPlacementComp={
                                            setShowLightPlacementComp
                                          }
                                          zoomCount={zoomCount}
                                          IsZoomed={IsZoomed}
                                          anotherArray={localStorageArr}
                                          setAnotherArray={setLocalStorageArr}
                                        />
                                      );
                                    } else if (
                                      item?.placeLight
                                        ?.toLowerCase()
                                        .includes("six")
                                    ) {
                                      return (
                                        <SixCircles
                                          GetDifference={GetXDifference}
                                          dimensions={dimensions}
                                          color={item.placeLight.split("_")[1]}
                                          posObj={item}
                                          storePositionsArr={
                                            lightPlacementPositions
                                          }
                                          setPositions={
                                            setLightPlacementPositions
                                          }
                                          isGridEnabled={isGridBlockClicked}
                                          showLightPlacementComp={
                                            showLightPlacementComp
                                          }
                                          setShowLightPlacementComp={
                                            setShowLightPlacementComp
                                          }
                                          zoomCount={zoomCount}
                                          IsZoomed={IsZoomed}
                                          anotherArray={localStorageArr}
                                          setAnotherArray={setLocalStorageArr}
                                        />
                                      );
                                    } else if (
                                      item?.placeLight
                                        ?.toLowerCase()
                                        .includes("eight")
                                    ) {
                                      return (
                                        <EightCircles
                                          GetDifference={GetXDifference}
                                          dimensions={dimensions}
                                          color={item.placeLight.split("_")[1]}
                                          posObj={item}
                                          storePositionsArr={
                                            lightPlacementPositions
                                          }
                                          setPositions={
                                            setLightPlacementPositions
                                          }
                                          isGridEnabled={isGridBlockClicked}
                                          showLightPlacementComp={
                                            showLightPlacementComp
                                          }
                                          setShowLightPlacementComp={
                                            setShowLightPlacementComp
                                          }
                                          zoomCount={zoomCount}
                                          IsZoomed={IsZoomed}
                                          anotherArray={localStorageArr}
                                          setAnotherArray={setLocalStorageArr}
                                        />
                                      );
                                    }
                                  }
                                }
                              })}
                            </>
                            {/* })} */}
                          </>
                        )}
                      </>
                      {/* } */}
                      {/* <TransformWrapper
                      initialScale={1}
                      // initialPositionX={200}
                      // initialPositionY={100}
                      onTransformed={(e) => handleTransform(e)}
                    >
                      <TransformComponent> */}
                      {/* <div onDoubleClick={() => { isGridBlockClicked == true && handleClick() }}> */}
                      <div
                        className="bg-grid-block-area"
                        // onDoubleClick={(e) => { isGridBlockClicked == true && lightPlacementClickHandler(e) }}
                      >
                        <img
                          id="bg-grid-block-area"
                          src={selectedPdfImageForCrop}
                          // style={{ height: "auto", width: "400px", marginTop: "20px" }}
                          className={`${
                            localStorageArr?.length > 0
                              ? localStorageArr[localStorageArr?.length - 1]
                                  .isZoomed == true &&
                                IsZoomed(zoomCount) == true
                                ? "onclick-img-width"
                                : IsZoomed(zoomCount) == true &&
                                  localStorageArr[localStorageArr?.length - 1]
                                    .isZoomed == false
                                ? "onclick-img-width"
                                : IsZoomed(zoomCount) == false &&
                                  localStorageArr[localStorageArr?.length - 1]
                                    .isZoomed == true &&
                                  zoomCount == 0
                                ? "onclick-img-width"
                                : "normal-img-width"
                              : IsZoomed(zoomCount) == true
                              ? "onclick-img-width"
                              : "normal-img-width"
                          }`}
                          // id="activePdfPage"
                          alt="Pdf Loading..."
                          onDoubleClick={(e) => {
                            isGridBlockClicked == true &&
                              lightPlacementClickHandler(e);
                          }}
                        />
                        <div
                          className={`${
                            isGridBlockClicked ? "bg-grid-img" : ""
                          }`}
                          onDoubleClick={(e) => {
                            isGridBlockClicked == true &&
                              lightPlacementClickHandler(e);
                          }}
                        ></div>
                      </div>

                      {/* </TransformComponent>
                    </TransformWrapper> */}
                    </>
                  ) : (
                    <div>{OldSpinnerLoader()}</div>
                  )}
                </div>

                {!hideSideView && (
                  <div className="side_view" ref={theRef}>
                    {resolvedImages.map(({ idx, finalImage }) =>
                      !pdfFile.removedPages.includes(idx + 1) ? (
                        <img
                          src={finalImage}
                          onClick={() => ChangePdfPage(finalImage, idx)}
                          className={idx === activePage ? "active" : ""}
                          key={idx}
                        />
                      ) : null
                    )}
                  </div>
                )}
              </>
            ) : (
              <div
                className={`upload-block-image ${
                  IsZoomed(zoomCount) == true ? "zoomIn-upload-block-img" : ""
                }`}
                style={{ textAlign: "center" }}
                id="screenshot-for-image"
                ref={ref}
              >
                <div
                  className={`${
                    isGridBlockClicked ? "grid-block-icon-click" : "grid-block"
                  }`}
                >
                  <img className="grid-block-img" src={grids} />
                </div>
                <>
                  <>
                    {localStorageArr?.length > 0 && (
                      <>
                        {localStorageArr?.map((item, index) => {
                          // if (item.pageIndex == localActiveIndex) {
                          // console.log("Data at localstorage");
                          if (item.placeLight.toLowerCase().includes("one")) {
                            return (
                              <OneCircles
                                dimensions={dimensions}
                                GetDifference={GetXDifference}
                                color={item.placeLight.split("_")[1]}
                                posObj={item}
                                storePositionsArr={localStorageArr}
                                setPositions={setLocalStorageArr}
                                isGridEnabled={isGridBlockClicked}
                                showLightPlacementComp={showLightPlacementComp}
                                setShowLightPlacementComp={
                                  setShowLightPlacementComp
                                }
                                zoomCount={zoomCount}
                                IsZoomed={IsZoomed}
                                anotherArray={lightPlacementPositions}
                                setAnotherArray={setLightPlacementPositions}
                              />
                            );
                          } else if (
                            item.placeLight.toLowerCase().includes("two")
                          ) {
                            return (
                              <TwoCircles
                                GetDifference={GetXDifference}
                                dimensions={dimensions}
                                color={item.placeLight.split("_")[1]}
                                posObj={item}
                                storePositionsArr={localStorageArr}
                                setPositions={setLocalStorageArr}
                                isGridEnabled={isGridBlockClicked}
                                showLightPlacementComp={showLightPlacementComp}
                                setShowLightPlacementComp={
                                  setShowLightPlacementComp
                                }
                                zoomCount={zoomCount}
                                IsZoomed={IsZoomed}
                                anotherArray={lightPlacementPositions}
                                setAnotherArray={setLightPlacementPositions}
                              />
                            );
                          } else if (
                            item.placeLight.toLowerCase().includes("four")
                          ) {
                            return (
                              <FourCircles
                                GetDifference={GetXDifference}
                                dimensions={dimensions}
                                color={item.placeLight.split("_")[1]}
                                posObj={item}
                                storePositionsArr={localStorageArr}
                                setPositions={setLocalStorageArr}
                                isGridEnabled={isGridBlockClicked}
                                showLightPlacementComp={showLightPlacementComp}
                                setShowLightPlacementComp={
                                  setShowLightPlacementComp
                                }
                                zoomCount={zoomCount}
                                IsZoomed={IsZoomed}
                                anotherArray={lightPlacementPositions}
                                setAnotherArray={setLightPlacementPositions}
                              />
                            );
                          } else if (
                            item.placeLight.toLowerCase().includes("six")
                          ) {
                            return (
                              <SixCircles
                                GetDifference={GetXDifference}
                                dimensions={dimensions}
                                color={item.placeLight.split("_")[1]}
                                posObj={item}
                                storePositionsArr={localStorageArr}
                                setPositions={setLocalStorageArr}
                                isGridEnabled={isGridBlockClicked}
                                showLightPlacementComp={showLightPlacementComp}
                                setShowLightPlacementComp={
                                  setShowLightPlacementComp
                                }
                                zoomCount={zoomCount}
                                IsZoomed={IsZoomed}
                                anotherArray={lightPlacementPositions}
                                setAnotherArray={setLightPlacementPositions}
                              />
                            );
                          } else if (
                            item.placeLight.toLowerCase().includes("eight")
                          ) {
                            return (
                              <EightCircles
                                GetDifference={GetXDifference}
                                dimensions={dimensions}
                                color={item.placeLight.split("_")[1]}
                                posObj={item}
                                storePositionsArr={localStorageArr}
                                setPositions={setLocalStorageArr}
                                isGridEnabled={isGridBlockClicked}
                                showLightPlacementComp={showLightPlacementComp}
                                setShowLightPlacementComp={
                                  setShowLightPlacementComp
                                }
                                zoomCount={zoomCount}
                                IsZoomed={IsZoomed}
                                anotherArray={lightPlacementPositions}
                                setAnotherArray={setLightPlacementPositions}
                              />
                            );
                          }
                          // }
                        })}
                      </>
                    )}
                    {lightPlacementPositions.length > 0 && (
                      <>
                        {/* {lightPlacementPositions?.map((data, index) => { */}
                        <>
                          {lightPlacementPositions?.map((item, i) => {
                            // if (item.pageIndex == localActiveIndex) {
                            // console.log("Data at DB", item, i);

                            if (localStorageArr?.length >= 0) {
                              var isInsert = false;
                              for (
                                let i = 0;
                                i < localStorageArr?.length;
                                i++
                              ) {
                                if (localStorageArr[i].nodeId != item?.nodeId) {
                                  isInsert = true;
                                } else {
                                  isInsert = false;
                                  break;
                                }
                              }
                              if (isInsert == true) {
                                if (item.pageIndex == activePage) {
                                  if (
                                    item?.placeLight
                                      ?.toLowerCase()
                                      .includes("one")
                                  ) {
                                    return (
                                      <OneCircles
                                        GetDifference={GetXDifference}
                                        dimensions={dimensions}
                                        color={item.placeLight.split("_")[1]}
                                        posObj={item}
                                        storePositionsArr={
                                          lightPlacementPositions
                                        }
                                        setPositions={
                                          setLightPlacementPositions
                                        }
                                        isGridEnabled={isGridBlockClicked}
                                        showLightPlacementComp={
                                          showLightPlacementComp
                                        }
                                        setShowLightPlacementComp={
                                          setShowLightPlacementComp
                                        }
                                        zoomCount={zoomCount}
                                        anotherArray={localStorageArr}
                                        setAnotherArray={setLocalStorageArr}
                                      />
                                    );
                                  } else if (
                                    item?.placeLight
                                      ?.toLowerCase()
                                      .includes("two")
                                  ) {
                                    return (
                                      <TwoCircles
                                        GetDifference={GetXDifference}
                                        dimensions={dimensions}
                                        color={item.placeLight.split("_")[1]}
                                        posObj={item}
                                        storePositionsArr={
                                          lightPlacementPositions
                                        }
                                        setPositions={
                                          setLightPlacementPositions
                                        }
                                        isGridEnabled={isGridBlockClicked}
                                        showLightPlacementComp={
                                          showLightPlacementComp
                                        }
                                        setShowLightPlacementComp={
                                          setShowLightPlacementComp
                                        }
                                        zoomCount={zoomCount}
                                        IsZoomed={IsZoomed}
                                        anotherArray={localStorageArr}
                                        setAnotherArray={setLocalStorageArr}
                                      />
                                    );
                                  } else if (
                                    item?.placeLight
                                      ?.toLowerCase()
                                      .includes("four")
                                  ) {
                                    return (
                                      <FourCircles
                                        GetDifference={GetXDifference}
                                        dimensions={dimensions}
                                        color={item.placeLight.split("_")[1]}
                                        posObj={item}
                                        storePositionsArr={
                                          lightPlacementPositions
                                        }
                                        setPositions={
                                          setLightPlacementPositions
                                        }
                                        isGridEnabled={isGridBlockClicked}
                                        showLightPlacementComp={
                                          showLightPlacementComp
                                        }
                                        setShowLightPlacementComp={
                                          setShowLightPlacementComp
                                        }
                                        zoomCount={zoomCount}
                                        IsZoomed={IsZoomed}
                                        anotherArray={localStorageArr}
                                        setAnotherArray={setLocalStorageArr}
                                      />
                                    );
                                  } else if (
                                    item?.placeLight
                                      ?.toLowerCase()
                                      .includes("six")
                                  ) {
                                    return (
                                      <SixCircles
                                        GetDifference={GetXDifference}
                                        dimensions={dimensions}
                                        color={item.placeLight.split("_")[1]}
                                        posObj={item}
                                        storePositionsArr={
                                          lightPlacementPositions
                                        }
                                        setPositions={
                                          setLightPlacementPositions
                                        }
                                        isGridEnabled={isGridBlockClicked}
                                        showLightPlacementComp={
                                          showLightPlacementComp
                                        }
                                        setShowLightPlacementComp={
                                          setShowLightPlacementComp
                                        }
                                        zoomCount={zoomCount}
                                        IsZoomed={IsZoomed}
                                        anotherArray={localStorageArr}
                                        setAnotherArray={setLocalStorageArr}
                                      />
                                    );
                                  } else if (
                                    item?.placeLight
                                      ?.toLowerCase()
                                      .includes("eight")
                                  ) {
                                    return (
                                      <EightCircles
                                        GetDifference={GetXDifference}
                                        dimensions={dimensions}
                                        color={item.placeLight.split("_")[1]}
                                        posObj={item}
                                        storePositionsArr={
                                          lightPlacementPositions
                                        }
                                        setPositions={
                                          setLightPlacementPositions
                                        }
                                        isGridEnabled={isGridBlockClicked}
                                        showLightPlacementComp={
                                          showLightPlacementComp
                                        }
                                        setShowLightPlacementComp={
                                          setShowLightPlacementComp
                                        }
                                        zoomCount={zoomCount}
                                        IsZoomed={IsZoomed}
                                        anotherArray={localStorageArr}
                                        setAnotherArray={setLocalStorageArr}
                                      />
                                    );
                                  }
                                }
                              }
                            } else {
                              if (item.pageIndex == activePage) {
                                if (
                                  item?.placeLight
                                    ?.toLowerCase()
                                    .includes("one")
                                ) {
                                  return (
                                    <OneCircles
                                      GetDifference={GetXDifference}
                                      dimensions={dimensions}
                                      color={item.placeLight.split("_")[1]}
                                      posObj={item}
                                      storePositionsArr={
                                        lightPlacementPositions
                                      }
                                      setPositions={setLightPlacementPositions}
                                      isGridEnabled={isGridBlockClicked}
                                      showLightPlacementComp={
                                        showLightPlacementComp
                                      }
                                      setShowLightPlacementComp={
                                        setShowLightPlacementComp
                                      }
                                      zoomCount={zoomCount}
                                      IsZoomed={IsZoomed}
                                      anotherArray={localStorageArr}
                                      setAnotherArray={setLocalStorageArr}
                                    />
                                  );
                                } else if (
                                  item?.placeLight
                                    ?.toLowerCase()
                                    .includes("two")
                                ) {
                                  return (
                                    <TwoCircles
                                      GetDifference={GetXDifference}
                                      dimensions={dimensions}
                                      color={item.placeLight.split("_")[1]}
                                      posObj={item}
                                      storePositionsArr={
                                        lightPlacementPositions
                                      }
                                      setPositions={setLightPlacementPositions}
                                      isGridEnabled={isGridBlockClicked}
                                      showLightPlacementComp={
                                        showLightPlacementComp
                                      }
                                      setShowLightPlacementComp={
                                        setShowLightPlacementComp
                                      }
                                      zoomCount={zoomCount}
                                      IsZoomed={IsZoomed}
                                      anotherArray={localStorageArr}
                                      setAnotherArray={setLocalStorageArr}
                                    />
                                  );
                                } else if (
                                  item?.placeLight
                                    ?.toLowerCase()
                                    .includes("four")
                                ) {
                                  return (
                                    <FourCircles
                                      GetDifference={GetXDifference}
                                      dimensions={dimensions}
                                      color={item.placeLight.split("_")[1]}
                                      posObj={item}
                                      storePositionsArr={
                                        lightPlacementPositions
                                      }
                                      setPositions={setLightPlacementPositions}
                                      isGridEnabled={isGridBlockClicked}
                                      showLightPlacementComp={
                                        showLightPlacementComp
                                      }
                                      setShowLightPlacementComp={
                                        setShowLightPlacementComp
                                      }
                                      zoomCount={zoomCount}
                                      IsZoomed={IsZoomed}
                                      anotherArray={localStorageArr}
                                      setAnotherArray={setLocalStorageArr}
                                    />
                                  );
                                } else if (
                                  item?.placeLight
                                    ?.toLowerCase()
                                    .includes("six")
                                ) {
                                  return (
                                    <SixCircles
                                      GetDifference={GetXDifference}
                                      dimensions={dimensions}
                                      color={item.placeLight.split("_")[1]}
                                      posObj={item}
                                      storePositionsArr={
                                        lightPlacementPositions
                                      }
                                      setPositions={setLightPlacementPositions}
                                      isGridEnabled={isGridBlockClicked}
                                      showLightPlacementComp={
                                        showLightPlacementComp
                                      }
                                      setShowLightPlacementComp={
                                        setShowLightPlacementComp
                                      }
                                      zoomCount={zoomCount}
                                      IsZoomed={IsZoomed}
                                      anotherArray={localStorageArr}
                                      setAnotherArray={setLocalStorageArr}
                                    />
                                  );
                                } else if (
                                  item?.placeLight
                                    ?.toLowerCase()
                                    .includes("eight")
                                ) {
                                  return (
                                    <EightCircles
                                      GetDifference={GetXDifference}
                                      dimensions={dimensions}
                                      color={item.placeLight.split("_")[1]}
                                      posObj={item}
                                      storePositionsArr={
                                        lightPlacementPositions
                                      }
                                      setPositions={setLightPlacementPositions}
                                      isGridEnabled={isGridBlockClicked}
                                      showLightPlacementComp={
                                        showLightPlacementComp
                                      }
                                      setShowLightPlacementComp={
                                        setShowLightPlacementComp
                                      }
                                      zoomCount={zoomCount}
                                      IsZoomed={IsZoomed}
                                      anotherArray={localStorageArr}
                                      setAnotherArray={setLocalStorageArr}
                                    />
                                  );
                                }
                              }
                            }
                          })}
                        </>
                        {/* })} */}
                      </>
                    )}
                  </>
                </>
                {/* <TransformWrapper
                initialScale={1}
                onTransformed={(e) => handleTransform(e)}
              >
                <TransformComponent> */}
                <div
                  className="bg-grid-block-area"
                  // onDoubleClick={() => { isGridBlockClicked == true && lightPlacementClickHandler() }  }
                >
                  <img
                    onDoubleClick={(e) => {
                      isGridBlockClicked == true &&
                        lightPlacementClickHandler(e);
                    }}
                    id="bg-grid-block-area"
                    src={selectedPdfImageForCrop}
                    className={`${
                      localStorageArr?.length > 0
                        ? localStorageArr[localStorageArr?.length - 1]
                            .isZoomed == true && IsZoomed(zoomCount) == true
                          ? "onclick-img-width"
                          : IsZoomed(zoomCount) == true &&
                            localStorageArr[localStorageArr?.length - 1]
                              .isZoomed == false
                          ? "onclick-img-width"
                          : IsZoomed(zoomCount) == false &&
                            localStorageArr[localStorageArr?.length - 1]
                              .isZoomed == true &&
                            zoomCount == 0
                          ? "onclick-img-width"
                          : "normal-img-width"
                        : IsZoomed(zoomCount) == true
                        ? "onclick-img-width"
                        : "normal-img-width"
                    }`}
                    // style={{ height: "auto", width: "400px" }}
                  />

                  <div
                    className={`${isGridBlockClicked ? "bg-grid-img" : ""}`}
                    onDoubleClick={(e) => {
                      isGridBlockClicked == true &&
                        lightPlacementClickHandler(e);
                    }}
                  ></div>
                </div>

                {/* </TransformComponent>
              </TransformWrapper> */}
              </div>
            )}

            {!hideHamburgerIcon && showHamburgerBlock === false && (
              <div
                className="hamburger-bar-icon"
                onClick={toggleHamburgerBlock}
              >
                <img src={hamburger} alt="Hamburger Icon" />
              </div>
            )}
            {/* {((hideHamburgerIcon == false) && (showHamburgerBlock == true)) && ( */}
            {hideHamburgerIcon === false &&
              showHamburgerBlock === true &&
              !startCropping && (
                <div className="hamburger-block crop-icon-block">
                  <div className="hamburger-inner crop-section-block">
                    {!showDeletePopup && !startCropping ? (
                      <>
                        <div className="popup-custom-icon-block">
                          <div className="delete-icon-block custom-block1">
                            {fileObj && (
                              <Popup
                                trigger={<DeleteIcon />}
                                position="right center"
                                className="delete-popup"
                              >
                                {(close) => (
                                  <div className="delete-popup-button-block">
                                    <div className="alert-icon-info">
                                      <div className="alert-icon">
                                        <img src={alertIcon}></img>
                                      </div>
                                      <h5>Delete Selected image!</h5>
                                    </div>
                                    <p>
                                      Are you sure you want to delete this
                                      image?
                                    </p>
                                    <div className="delete-btn-block">
                                      <button onClick={close}>Cancel</button>
                                      <button
                                        className="delete-block"
                                        onClick={() => {
                                          handleDeleteFile(
                                            activePage,
                                            totalPages
                                          );
                                          close();
                                        }}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </Popup>
                            )}
                          </div>
                          <div className="delete-icon-block custom-block2">
                            <LightbulbIcon onClick={handleLightbulbClick} />
                          </div>

                          <div className="edit-icon-block custom-block3">
                            {/* <CropIcon */}
                            {/* <img
                        src={edit} */}
                            <CropIcon
                              onClick={async () => {
                                setStartCropping(true);
                                setHeaderText("Crop Image");
                                setHeaderSaveText("Crop");
                                setIsGridBlockClicked(false);
                                if (
                                  pdfActualImages.length > 0 &&
                                  croppedFileName
                                ) {
                                  // setSelectedPdfImageForCrop(images[croppedFileName.split("page-")[1]?.split(".")[0]])
                                }
                                setMainImageToCrop();
                              }}
                              alt="Edit Icon"
                            />
                          </div>
                          {/* <Popup
                          open={showLightPlacementPopup}
                          onClose={() => setShowLightPlacementPopup(false)}
                          className="light-placement-popup"
                        >
                          <div className="light-placement-popup-content">
                            <div className="alert-icon-info">
                              <div className="alert-icon">
                                <img src={alertIcon} alt="Alert Icon" />
                              </div>
                              <h5>Light Placement Alert!</h5>
                            </div>
                            <p>You have placed lights. You cannot crop the image now.</p>
                            <div className="popup-btn-block">
                              <button onClick={() => setShowLightPlacementPopup(false)}>OK</button>
                            </div>
                          </div>
                        </Popup> */}
                        </div>

                        <div className="hamburger-bar-icon close-icon-block">
                          {/* <img src={crossIcon} alt="Hamburger Icon" onClick={toggleHamburgerBlock} /> */}
                          <CloseIcon onClick={toggleHamburgerBlock} />
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              )}
          </div>
        </div>

        {isGridBlockClicked && (
          // ((isGridBlockClicked == true) && (showLightPlacementComp == true))
          // &&
          <>
            <div className="col-md-4 sidebar-open sidebar-block-area">
              <Sidebar
                contentClassName="contentClassName11"
                overlayClassName="overlayClassName11"
                rootClassName="rootClassName11"
                sidebarClassName={`sidebarClassName11 ${
                  IsZoomed(zoomCount) == true
                    ? "sidebar-with-zoomIn"
                    : "sidebar-with-zoomIn"
                }`}
                rootId="root-id11"
                sidebarId="sidebarId11"
                contentId="contentId11"
                sidebar={
                  <div className="sidebar-block-content">
                    <button className="close-icon" onClick={closeSidebar}>
                      <img src={crossIcon} alt="Close Icon" />
                    </button>
                    {showLightPlacementComp && (
                      <>
                        <LightPlacementComponent
                          categoryId={null}
                          nodeId={null}
                          selectedLight={null}
                          onSendMessage={handleMessage}
                          setShowLightPlacementComp={setShowLightPlacementComp}
                        />
                      </>
                    )}
                  </div>
                }
                open={showLightPlacementComp}
                onSetOpen={handleLightPlacementToggle}
                styles={{
                  sidebar: {
                    background: "white",
                    width: "650px",
                    zIndex: 99999999,
                    position: "fixed",
                    left: 0,
                  },
                  overlay: {
                    backgroundColor: "transparent",
                  },
                }}
                pullRight={false}
              />
              <div className="arrow-icon" onClick={handleLightPlacementToggle}>
                <img src={crossIcon} alt="Arrow Icon" />
              </div>
            </div>
          </>
        )}
      </div>
      {/* <div>   {GetImageDetails()}</div> */}
    </div>
  );
  //#endregion
};

export default EditView;
