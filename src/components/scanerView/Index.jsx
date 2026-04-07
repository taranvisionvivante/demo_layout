import React, { useState, useRef, useEffect } from "react";
import greenhscLogo from "../../assets/img/greenhse-logo.png";
import scan from "../../assets/img/scan.svg";
import scan_big from "../../assets/img/scan_big.svg";
import camera from "../../assets/img/camera.svg";
import documentIcon from "../../assets/img/document.svg";
import html2canvas from "html2canvas";
import greeHseLogo from "../../assets/img/greenhse-logo.png";

import line from "../../assets/img/line.svg";
import {
  saveFile,
  getFilesStored,
  deleteMainFile,
  GetScreenShot,
  getPDFFile,
} from "../../IndexedDB.jsx";
import { Document, Page, pdfjs } from "react-pdf";
// import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import "./Index.css";
import { useNavigate, useLocation } from "react-router-dom";
import editIcon from "../../assets/img/edit.svg";
import DeleteIcon from "@mui/icons-material/Delete";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import Homepage from "../homepage/Index.jsx";
import Joyride, { ACTIONS, EVENTS, STATUS } from "react-joyride";
import Icon from "@mdi/react";
import { mdiDownload } from "@mdi/js";
import { mdiPrinter } from "@mdi/js";
import { jsPDF } from "jspdf";
import printJS from "print-js";
import greeHseSVG from "../../assets/img/greenhseicon.svg";
import Swal from "sweetalert2";
import greenHseSmallLogo from "../../assets/img/greenhse-logo-small.png";
import {
  loadLogo,
  convertSVGToPNG,
} from "../../utilities/helpers/commonHelper.js";
import { emailAndAddress } from "../config/config.jsx";
import * as pdfjsLib from "pdfjs-dist";
import { useSelector } from "react-redux";

// Configure PDF.js worker - use local worker file
// if (typeof window !== 'undefined') {
//   pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
//   pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
// }

const ScanerView = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  // Store a state to trigger re-render after image loads
  const [imgLoaded, setImgLoaded] = useState(false);
  const selectedProduct = location.state;
  var selectedProductList = [];
  selectedProductList.push(selectedProduct);

  // Initialize state variables
  const [run, setRun] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]); // State to store selected files
  const [error, setError] = useState("");
  const fileInputRef = useRef(null); // Reference to the file input element
  const [selectedFileUrl, setSelectedFileUrl] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [screenSize, setScreenSize] = useState(getCurrentDimension());
  const [singleScreen, setSingleScreen] = useState(false);
  const [showHomepage, setShowHomepage] = useState(
    () => JSON.parse(localStorage.getItem("showHomepage")) !== false
  );
  const [isRunningState, setIsRunningState] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const predefinedCombos = {
    1: [{ id: "A", fixed: true, fixedX: true, fixedY: true, row: 0, col: 0 }],
    2: [
      { id: "A", fixed: true, fixedX: true, fixedY: true, row: 0, col: 0 },
      { id: "B", fixed: false, fixedX: true, fixedY: false, row: 1, col: 0 },
    ],
    "2-1": [
      { id: "A", fixed: true, fixedX: true, fixedY: true, row: 0, col: 0 },
      { id: "B", fixed: false, fixedX: false, fixedY: true, row: 0, col: 1 },
    ],
    3: [
      { id: "A", fixed: true, fixedX: true, fixedY: true, row: 0, col: 0 },
      { id: "B", fixed: false, fixedX: true, fixedY: false, row: 1, col: 0 },
      { id: "C", fixed: false, fixedX: true, fixedY: false, row: 2, col: 0 },
    ],
    "3-1": [
      { id: "A", fixed: true, fixedX: true, fixedY: true, row: 0, col: 0 },
      { id: "B", fixed: false, fixedX: true, fixedY: false, row: 1, col: 0 },
      { id: "C", fixed: false, fixedX: false, fixedY: true, row: 0, col: 1 },
    ],
    4: [
      { id: "A", fixed: true, fixedX: true, fixedY: true, row: 0, col: 0 },
      { id: "B", fixed: false, fixedX: true, fixedY: false, row: 1, col: 0 },
      { id: "C", fixed: false, fixedX: false, fixedY: true, row: 0, col: 1 },
      { id: "D", fixed: false, fixedX: false, fixedY: false, row: 1, col: 1 },
    ],
    6: [
      { id: "A", fixed: true, fixedX: true, fixedY: true, row: 0, col: 0 },
      { id: "B", fixed: false, fixedX: true, fixedY: false, row: 1, col: 0 },
      { id: "C", fixed: false, fixedX: true, fixedY: false, row: 2, col: 0 },
      { id: "D", fixed: false, fixedX: false, fixedY: true, row: 0, col: 1 },
      { id: "E", fixed: false, fixedX: false, fixedY: false, row: 1, col: 1 },
      { id: "F", fixed: false, fixedX: false, fixedY: false, row: 2, col: 1 },
    ],
    "6-1": [
      { id: "A", fixed: true, fixedX: true, fixedY: true, row: 0, col: 0 },
      { id: "B", fixed: false, fixedX: true, fixedY: false, row: 1, col: 0 },
      { id: "C", fixed: false, fixedX: false, fixedY: true, row: 0, col: 1 },
      { id: "D", fixed: false, fixedX: false, fixedY: false, row: 1, col: 1 },
      { id: "E", fixed: false, fixedX: false, fixedY: true, row: 0, col: 2 },
      { id: "F", fixed: false, fixedX: false, fixedY: false, row: 1, col: 2 },
    ],

    8: [
      { id: "A", fixed: true, fixedX: true, fixedY: true, row: 0, col: 0 },
      { id: "B", fixed: false, fixedX: true, fixedY: false, row: 1, col: 0 },
      { id: "C", fixed: false, fixedX: true, fixedY: false, row: 2, col: 0 },
      { id: "D", fixed: false, fixedX: true, fixedY: false, row: 3, col: 0 },
      { id: "E", fixed: false, fixedX: false, fixedY: true, row: 0, col: 1 },
      { id: "F", fixed: false, fixedX: false, fixedY: false, row: 1, col: 1 },
      { id: "G", fixed: false, fixedX: false, fixedY: false, row: 2, col: 1 },
      { id: "H", fixed: false, fixedX: false, fixedY: false, row: 3, col: 1 },
    ],
    "8-1": [
      { id: "A", fixed: true, fixedX: true, fixedY: true, row: 0, col: 0 },
      { id: "B", fixed: false, fixedX: true, fixedY: false, row: 1, col: 0 },
      { id: "C", fixed: false, fixedX: false, fixedY: true, row: 0, col: 1 },
      { id: "D", fixed: false, fixedX: false, fixedY: false, row: 1, col: 1 },
      { id: "E", fixed: false, fixedX: false, fixedY: true, row: 0, col: 2 },
      { id: "F", fixed: false, fixedX: false, fixedY: false, row: 1, col: 2 },
      { id: "G", fixed: false, fixedX: false, fixedY: true, row: 0, col: 3 },
      { id: "H", fixed: false, fixedX: false, fixedY: false, row: 1, col: 3 },
    ],

    9: [
      { id: "A", fixed: true, fixedX: true, fixedY: true, row: 0, col: 0 },
      { id: "B", fixed: false, fixedX: true, fixedY: false, row: 1, col: 0 },
      { id: "C", fixed: false, fixedX: true, fixedY: false, row: 2, col: 0 },
      { id: "D", fixed: false, fixedX: false, fixedY: true, row: 0, col: 1 },
      { id: "E", fixed: false, fixedX: false, fixedY: false, row: 1, col: 1 },
      { id: "F", fixed: false, fixedX: false, fixedY: false, row: 2, col: 1 },
      { id: "G", fixed: false, fixedX: false, fixedY: true, row: 0, col: 2 },
      { id: "H", fixed: false, fixedX: false, fixedY: false, row: 1, col: 2 },
      { id: "I", fixed: false, fixedX: false, fixedY: false, row: 2, col: 2 },
    ],
  };
  // Hide homepage after 5 seconds
  useEffect(() => {
    if (showHomepage) {
      const timeoutId = setTimeout(() => {
        setShowHomepage(false);
        localStorage.setItem("showHomepage", JSON.stringify(false));
        setIsRunningState(true);
      }, 5000);

      return () => clearTimeout(timeoutId);
    }
  }, [showHomepage]);

  // console.log("selctetdddd filess", selectedFiles);

  // Check if user has visited before
  useEffect(() => {
    localStorage.setItem("showHomepage", JSON.stringify(true));
    const scannerViewVisited = localStorage.getItem("scannerViewVisited");
    if (scannerViewVisited) {
      setRun(false);
    }
  }, []);

  const handleSelectFloorPlan = () => {
    Swal.fire({
      // title: 'Select Floor Plan',
      text: "Please select a floor plan in PDF, JPG, or PNG format. For images, use a size of 1024px or a quality of minimum 1MB for better image quality.",
      icon: "info",
      // showCancelButton: true,
      confirmButtonText: "OK",
      // cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        // Trigger the file input click if the user confirms
        fileInputRef.current.click();
      }
    });
  };

  const handleFileChange = async (event) => {
    try {
      const filesArray = Array.from(event.target.files);

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const timestamp = `${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        const name = `${timestamp}_${file.name}`.replaceAll(" ", "");

        // Load existing layouts or initialize
        const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
        layouts[name] = layouts[name] || {
          lightPlacementPositions: [],
          estimate: layouts[name]?.estimate || 0,
          editedImage: null,
        };

        if (file.type === "application/pdf") {
          await saveFile(name, file, []);
          localStorage.setItem(`${name}IsGridVisited`, false);
          localStorage.setItem("layouts", JSON.stringify(layouts));
          navigate(`/editview?file=${name}`, { replace: false });
        } else {
          const reader = new FileReader();
          reader.onload = async () => {
            await saveFile(name, file);

            // Update layout properly (merge, do not overwrite)
            layouts[name] = {
              ...(layouts[name] || {}),
              editedImage: reader.result,
              lightPlacementPositions:
                layouts[name]?.lightPlacementPositions || [],
              estimate: layouts[name].estimate || 0.0,
            };

            localStorage.setItem("layouts", JSON.stringify(layouts));
            localStorage.setItem(`${name}IsGridVisited`, false);

            navigate(`/editview?file=${name}`, { replace: false });

            setSelectedFiles((prevFiles) => [
              ...prevFiles,
              {
                name,
                file,
                editedImage: reader.result,
                lightsCombo: layouts[name].lightPlacementPositions,
                estimate: layouts[name].estimate,
              },
            ]);
          };
          reader.readAsDataURL(file);
        }
      }
    } catch (error) {
      console.error("Error handling file change:", error);
      setError("Error handling file change");
    }
  };

  // Close the edit view popup
  const closeEditView = () => {
    setSelectedFileUrl("");
    setError("");
  };

  // Trigger file input click
  const handleScanPlan = () => {
    fileInputRef.current.click();
  };

  const handleEstimatePlan = (fileName) => {
    const cleanName = fileName.replaceAll(" ", "");

    // Get layouts from localStorage
    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");

    // Get the specific file's layout
    const parsedData = layouts[cleanName] || {
      editedImage: null,
      lights: { selectedProduct: [], lightPlacementPositions: [] },
      estimate: 0,
      estimateName: cleanName,
    };

    // Ensure arrays are properly formatted
    parsedData.lights.selectedProduct = Array.isArray(
      parsedData.lights.selectedProduct
    )
      ? parsedData.lights.selectedProduct
      : parsedData.lights.selectedProduct
        ? [parsedData.lights.selectedProduct]
        : [];

    parsedData.lights.lightPlacementPositions = Array.isArray(
      parsedData.lights.lightPlacementPositions
    )
      ? parsedData.lights.lightPlacementPositions
      : [];
    setSelectedProducts(parsedData.lights.selectedProduct);

    navigate("/estimate", {
      state: {
        ...parsedData,
        currentImageId: cleanName, // Include file name for navigation back
      }
    });
  };

  const imgRefs = useRef({});

  // Render file preview based on file type
  const renderFilePreview = (file, fileName, index) => {
    // console.log("filttttttteeeeeee", file, file.combos);
    let displayImg = file.editedImage
      ? file.editedImage
      : file.croppedFile || file.file;

    // Check if it's a PDF that hasn't been converted yet
    const isPdf = file.file && (
      file.file.type === "application/pdf" ||
      (file.name && file.name.toLowerCase().endsWith(".pdf"))
    );

    // Don't try to display PDFs directly - they need to be converted to images first
    if (isPdf && (!displayImg || displayImg instanceof Blob || displayImg instanceof File)) {
      // PDF not converted yet, show placeholder or trigger conversion
      displayImg = null;
    } else if (displayImg instanceof File || displayImg instanceof Blob) {
      displayImg = URL.createObjectURL(displayImg);
    }

    // Get offsets for combos
    const offsetsList = file.combos || [];

    return (
      <div
        className="canvas"
        data-filename={fileName}
        style={{ position: "relative", width: "100%", height: "auto" }}
      >
        {displayImg ? (
          <img
            ref={(el) => (imgRefs.current[fileName] = el)} // assign ref by fileName
            src={displayImg}
            alt={`selected-file-${index}`}
            style={{ width: "100%", height: "auto" }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(false)}
          />
        ) : (
          <div style={{
            width: "100%",
            height: "200px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f0f0f0",
            color: "#666"
          }}>
            {isPdf ? "Converting PDF..." : "Loading image..."}
          </div>
        )}

        {file.combos &&
          file.combos.length > 0 &&
          file.combos.map((combo, idx) => {
            const offsets = predefinedCombos[combo.baseKey] || [];
            const imgEl = imgRefs.current[fileName];
            const scaleX =
              (imgEl?.clientWidth || 1) / (imgEl?.naturalWidth || 1);
            const scaleY =
              (imgEl?.clientHeight || 1) / (imgEl?.naturalHeight || 1);

            return (
              <React.Fragment key={`combo-${idx}`}>
                {offsets.map((offset) => {
                  const stretchX = combo.stretch?.x || 0;
                  const stretchY = combo.stretch?.y || 0;

                  const left =
                    (combo.center.x +
                      (offset.fixedX ? 0 : offset.col * (30 + stretchX))) *
                    scaleX;

                  const top =
                    (combo.center.y +
                      (offset.fixedY ? 0 : offset.row * (30 + stretchY))) *
                    scaleY;

                  return (
                    <div
                      key={offset.id}
                      className="combo-dot"
                      style={{
                        position: "absolute",
                        left: `${left}px`,
                        top: `${top}px`,
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "purple",
                        transform: "translate(-50%, -50%)",
                      }}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
      </div>
    );
  };

  // Handle file deletion
  const handleDeleteFile = async (fileName) => {
    try {
      await deleteMainFile(fileName);
      setSelectedFiles((prevFiles) =>
        prevFiles.filter((file) => file.name !== fileName)
      );
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  // Display the edit view
  const displayEditView = async (file, mainFileName, croppedFileName) => {
    const cleanName = mainFileName.replaceAll(" ", "");
    const fileData = await getFilesStored().then((files) =>
      files.find((f) => f.name === mainFileName)
    );

    if (!fileData) return;

    const imageToUse = fileData.editedImage || fileData.file;
    const lightData = fileData.lightsCombo || [];

    // Merge layout properly
    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
    layouts[cleanName] = {
      ...layouts[cleanName],
      lightPlacementPositions: lightData,
      editedImage: imageToUse,
      estimate: layouts[cleanName]?.estimate || 0.0,
    };
    localStorage.setItem("layouts", JSON.stringify(layouts));

    navigate(
      `/editview?file=${mainFileName}${croppedFileName ? "&croppedFile=" + croppedFileName : ""
      }`,
      { state: { imageToUse, lightData } }
    );
  };

  // Convert PDF to image (first page only)
  const convertPdfToImage = async (pdfFile) => {
    try {
      if (!pdfjsLib || !pdfjsLib.getDocument) {
        console.error("PDF.js library not available");
        return null;
      }

      // Convert file to array buffer
      let arrayBuffer;
      if (pdfFile instanceof Blob || pdfFile instanceof File) {
        arrayBuffer = await pdfFile.arrayBuffer();
      } else {
        const blob = pdfFile instanceof Blob ? pdfFile : new Blob([pdfFile]);
        arrayBuffer = await blob.arrayBuffer();
      }

      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        console.error("ArrayBuffer is empty or invalid");
        return null;
      }

      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        verbosity: 0
      });
      const pdf = await loadingTask.promise;

      if (pdf.numPages === 0) {
        console.error("PDF has no pages");
        return null;
      }

      // Get first page
      const page = await pdf.getPage(1);
      const scale = 1.0;
      const viewport = page.getViewport({ scale: scale });

      // Render to canvas
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        console.error("Could not get 2D context from canvas");
        return null;
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      return dataUrl;
    } catch (error) {
      console.error("Error converting PDF to image:", error);
      return null;
    }
  };

  const mergeLayouts = async (files) => {
    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");

    // Process files and convert PDFs to images
    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const cleanName = (file.name || file.file?.name || "").replaceAll(" ", "");
        // console.log(cleanName, file);
        const layout = layouts[cleanName] || {};

        let editedImage =
          layout.editedImage ||
          file.editedImage ||
          (file.file instanceof Blob ? URL.createObjectURL(file.file) : null);

        // Check if file is a PDF and needs conversion
        const isPdf = file.file && (
          file.file.type === "application/pdf" ||
          (file.name && file.name.toLowerCase().endsWith(".pdf"))
        );

        // If it's a PDF and we don't have a converted image, convert it
        // if (isPdf && (!editedImage || !editedImage?.startsWith("data:image"))) {

        if (isPdf) {
          // console.log("Converting PDF to image for:", file.name);
          const pdfImage = await convertPdfToImage(file.file);
          if (pdfImage) {
            editedImage = pdfImage;
            // Save converted image to layout for future use
            layouts[cleanName] = {
              ...layouts[cleanName],
              editedImage: pdfImage
            };
            localStorage.setItem("layouts", JSON.stringify(layouts));
          } else {
            console.error("Failed to convert PDF to image");
          }
        }

        // Make sure Base64 URLs are valid
        if (
          editedImage &&
          typeof editedImage === "string" &&
          editedImage?.startsWith("data:image")
        ) {
          editedImage = editedImage; // Base64 ok
        } else if (file.file instanceof Blob && !isPdf) {
          editedImage = URL.createObjectURL(file.file);
        }

        return {
          ...file,
          editedImage,
          lightsCombo: layout.lightPlacementPositions || file.lightsCombo || [],
          combos: Array.isArray(layout.combos)
            ? layout.combos
            : Array.isArray(file.combos)
              ? file.combos
              : [],
          estimate: layout.estimate || file.estimate || 0,
          estimateName: layout.estimateName || file.estimateName || cleanName,
          estimatePrice: layout.estimatePrice ?? file.estimatePrice ?? 0,
          quantity: layout.quantity ?? file.quantity ?? 0,
        };
      })
    );

    return processedFiles;
  };

  const fetchStorage = async () => {
    try {
      const files = await getFilesStored();
      // console.log("NNNNNNNNNN", files);
      if (!files || files.length === 0) {
        setSelectedFiles([]);
        setLoadingFiles(false);
        return;
      }

      // console.log("merging ====>", files);
      // Merge layouts from localStorage properly (now async to handle PDF conversion)
      const mergedFiles = await mergeLayouts(files);

      // Save merged files to state
      setSelectedFiles(mergedFiles);
      setLoadingFiles(false);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Failed to load files from storage");
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    // Load stored files
    fetchStorage();

    // Update screen size
    window.addEventListener("resize", updateDimension);
    updateDimension();

    // Clean some localStorage items
    localStorage.removeItem("activePageIndex");
    localStorage.removeItem("currentNodePositions");
    localStorage.removeItem("isGridEnable");

    return () => {
      window.removeEventListener("resize", updateDimension);
    };
  }, []);
  // Refresh selected files when coming back from EditView
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchStorage(); // reload updated image and combos
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Function to load the logo
  const loadLogo = async () => {
    return new Promise((resolve, reject) => {
      const logo = new Image();
      logo.src = greenHseSmallLogo;
      logo.onload = () => resolve(logo);
      logo.onerror = (err) => reject(err);
    });
  };

  const handleDownload = async (fileName) => {
    try {
      const container = document.querySelector(
        `.canvas[data-filename="${fileName}"]`
      );
      if (!container) return;

      // ✅ Step 1: Freeze layout dimensions to prevent reflow
      const containerRect = container.getBoundingClientRect();
      container.style.width = `${containerRect.width}px`;
      container.style.height = `${containerRect.height}px`;
      container.style.position = "relative";
      container.style.overflow = "hidden";

      // ✅ Step 2: Get image & dots
      const img = container.querySelector("img");
      const dots = container.querySelectorAll(".combo-dot");

      // Freeze image
      let oldImgWidth = img?.style.width;
      let oldImgHeight = img?.style.height;
      if (img) {
        const rect = img.getBoundingClientRect();
        img.style.width = `${rect.width}px`;
        img.style.height = `${rect.height}px`;
        img.style.position = "absolute";
        img.style.left = "0";
        img.style.top = "0";
      }

      // ✅ Step 3: Lock dots in pixel-perfect position
      const dotPositions = [];
      dots.forEach((dot) => {
        const rect = dot.getBoundingClientRect();
        const left = rect.left - containerRect.left;
        const top = rect.top - containerRect.top;

        dotPositions.push({
          dot,
          oldLeft: dot.style.left,
          oldTop: dot.style.top,
          oldPosition: dot.style.position,
        });

        dot.style.position = "absolute";
        dot.style.left = `${left}px`;
        dot.style.top = `${top}px`;
        dot.style.transform = "none"; // remove translate shifts if any
      });

      // ✅ Step 4: Hide editing UI (handles, buttons, etc.)
      const hiddenEls = container.querySelectorAll(
        ".drag-handle, .stretch-handle, .delete-button"
      );
      hiddenEls.forEach((el) => (el.style.display = "none"));

      // Wait to ensure browser has applied all changes
      await new Promise((res) => setTimeout(res, 150));

      // ✅ Step 5: Capture clean screenshot
      const canvas = await html2canvas(container, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 2, // high-quality capture
        scrollX: 0,
        scrollY: 0,
        logging: false,
      });

      // ✅ Step 6: Restore everything to original state
      hiddenEls.forEach((el) => (el.style.display = ""));
      if (img) {
        img.style.width = oldImgWidth;
        img.style.height = oldImgHeight;
        img.style.position = "";
        img.style.left = "";
        img.style.top = "";
      }
      dotPositions.forEach(({ dot, oldLeft, oldTop, oldPosition }) => {
        dot.style.left = oldLeft;
        dot.style.top = oldTop;
        dot.style.position = oldPosition;
      });
      container.style.width = "";
      container.style.height = "";

      // ✅ Step 7: Generate PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Header with logo & info
      const logo = new Image();
      logo.src = greeHseLogo;
      await new Promise((res) => (logo.onload = res));
      pdf.addImage(logo, "PNG", pageWidth - 50, 10, 30, 15);
      pdf.setFontSize(10);
      pdf.text("info@greenhse.com • 123 Street, City", pageWidth - 10, 30, {
        align: "right",
      });

      // Add main layout
      pdf.addImage(imgData, "PNG", 10, 40, pdfWidth, pdfHeight);
      pdf.save(`${fileName.replace(".pdf", "")}_layout.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      Swal.fire("Error", "Failed to generate PDF", "error");
    }
  };

  const handlePrint = async (fileName) => {
    const container = document.querySelector(
      `.canvas[data-filename="${fileName}"]`
    );
    if (!container) return;

    try {
      const renderedCanvas = await html2canvas(container, {
        useCORS: true,
        scale: 1,
        backgroundColor: "#ffffff",
      });

      const dataURL = renderedCanvas.toDataURL("image/png");

      const printHTML = `
      <div style="width:100%; background:#fff; padding:20px 0; text-align:right;">
        <img src="${greeHseLogo}" alt="GreenHse Logo" style="height:80px; width:auto; display:inline-block; margin-right:20px;" />
        <div style="font-size:14px; color:#000; margin-top:5px; margin-right:20px;">
          info@greenhse.com, 123 Street, City
        </div>
      </div>
      <div style="width:100%; display:flex; justify-content:center; align-items:center; margin-top:180px;">
        <img src="${dataURL}" style="max-width:90%; height:auto; display:block;" />
      </div>
    `;

      printJS({
        printable: printHTML,
        documentTitle: "GreenHse",
        type: "raw-html",
        targetStyles: ["*"],
      });
    } catch (err) {
      console.error("Print failed:", err);
    }
  };

  useEffect(() => {
    new Promise(async (resolve, reject) => {
      var isSuccess = fetchStorage();
      if (isSuccess) resolve("done");
      else reject("cancel");
    });
    //functionality to set collapsible table
    window.addEventListener("resize", updateDimension);
    updateDimension();
    //Remove some items from local storage which are used inside edit view
    localStorage.removeItem("activePageIndex");
    localStorage.removeItem("currentNodePositions");
    localStorage.removeItem("isGridEnable");
    // removing eventlistener for no furhter effect after
    return () => {
      window.removeEventListener("resize", updateDimension);
    };
  }, []);

  // Update screen size on window resize
  const updateDimension = () => {
    setScreenSize(getCurrentDimension());
    var value = getCurrentDimension();
    // set a variable true when screen width reaches <768px
    if (value.width <= 767) {
      setSingleScreen(true);
    } else {
      setSingleScreen(false);
    }
  };

  function getCurrentDimension() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  // Code for Guided tours
  const [steps, setSteps] = useState([
    {
      target: ".upload-img-pdf",
      content:
        "By clicking on camera or document you can upload your pdf or image in jpg or png",
      disableBeacon: true,
      hideCloseButton: true,
      debug: true,
      // disableScrolling: true,
      // disableScrollParentFix: true
    },
  ]);

  // joyride callback function
  const handleJoyrideCallback = (data) => {
    const { action, index, origin, status, type } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // You need to set our running state to false, so we can restart if we click start again.
      localStorage.setItem("scannerViewVisited", "true");
      setRun(false);
    }
  };

  return (
    <div>
      <div className="scanner-view-container">
        {showHomepage ? (
          <>
            <Homepage />
            <Joyride
              callback={isRunningState && handleJoyrideCallback}
              steps={steps}
              run={run}
              styles={{
                options: {
                  primaryColor: "#5CB226",
                  height: "auto !important",
                },
              }}
              disableOverlayClose={true}
            />
          </> // Show Homepage if showHomepage is true
        ) : (
          <>
            <Joyride
              callback={handleJoyrideCallback}
              steps={steps}
              run={run}
              styles={{
                options: {
                  primaryColor: "#5CB226",
                  height: "auto !important",
                },
              }}
              disableOverlayClose={true}
            />



            <div>


              <div className="greenhsce-content-block">
                <div className="greenhsce-content-text">
                  <div class="upload-text">
                    <p>Upload your single - or multi-floor floorplan (PDF, JPG, or PNG) to start your lighting design and estimate</p>
                    <p>DISCLAIMER: All measurements and lighting positions will still need to be verified by your installer. Greenhouse is not responsible for any errors or inaccuracies</p>
                  </div>
                  <div className="greenhse-logo">
                    <img src={greenhscLogo} alt="right-icon" />
                  </div>
                </div>
              </div>

              
              <div className="heading-scan-view">
                <p>Estimated floor plannings</p>
              </div>

              {/* Conditionally render the scan_big image */}
              {selectedFiles && selectedFiles.length === 0 && (
                <div className="scanbig-img-block">
                  <img src={scan_big} alt="right-icon" />
                </div>
              )}

              <div style={{ minHeight: "100vh", overflow: "visible" }}>


                {/* Display selected files */}
                {!loadingFiles && selectedFiles && selectedFiles.length > 0 && (
                  <div className="file-upload-block row">
                    {selectedFiles.map((file, index) => (
                      <>
                        <div
                          key={index}
                          className="card upload-file-block-custom col-lg-4 col-md-6 col-sm-12"
                        >
                          <div className="card-body upload-file-block">
                            <div className="img-block"
                              onClick={() => {
                                if (file && renderFilePreview(file, file && "name" in file ? file.name : file.file.name, index)) {
                                  displayEditView(
                                    file, file && "name" in file ? file.name : file.file.name, ""
                                  )
                                }
                              }}
                            >
                              {file &&
                                renderFilePreview(
                                  file,
                                  file && "name" in file
                                    ? file.name
                                    : file.file.name,
                                  index
                                )}
                            </div>
                            <div className="card-content-block">
                              <h5 className="card-title">
                                {file && "name" in file
                                  ? file.estimateName
                                  : file.file.estimateName}
                              </h5>
                              <div className="edit-delete-block">
                                <div
                                  className="edit-icon"
                                  onClick={() =>
                                    displayEditView(
                                      file,
                                      file && "name" in file
                                        ? file.name
                                        : file.file.name,
                                      ""
                                    )
                                  }
                                >
                                  <img src={editIcon} alt="right-icon" />
                                </div>
                                <div
                                  className="delete-icon"
                                  onClick={() =>
                                    handleDeleteFile(
                                      file && "name" in file
                                        ? file.name
                                        : file.file.name
                                    )
                                  }
                                >
                                  <DeleteIcon />
                                </div>
                                <div
                                  className="delete-icon"
                                  onClick={() => handleEstimatePlan(file.name)}
                                >
                                  <PointOfSaleIcon />
                                </div>
                                <div
                                  className=""
                                  onClick={() => handleDownload(file.name)}
                                >
                                  <Icon path={mdiDownload} size={1} />
                                </div>
                                <div
                                  className="print-icon"
                                  onClick={() => handlePrint(file.name)}
                                >
                                  <Icon path={mdiPrinter} size={1} />
                                </div>
                              </div>
                            </div>

                            <div>
                              {/* <h5 className="card-title">
                      {file && "name" in file
                        ? file.estimateName
                        : file.file.estimateName}
                    </h5> */}
                            </div>
                          </div>
                        </div>
                      </>
                    ))}
                  </div>
                )}

              </div>

              {/* Button for selecting files */}
              <div className="select-button-custom-block">
                {singleScreen ? (
                  <button className="button-block" onClick={handleScanPlan}>
                    <img src={camera} alt="right-icon" />
                    <img src={line} alt="right-icon" />
                    <img src={documentIcon} alt="right-icon" />
                  </button>
                ) : (
                  <button
                    className="button-block select-button-full-width upload-img-pdf"
                    onClick={handleSelectFloorPlan}
                  >
                    <img src={documentIcon} alt="right-icon" />
                    <div className="button-text">
                      <span className="">UPLOAD NEW FLOORPLAN</span>
                      <span className="">(PDF, JPG, PNG)</span>
                    </div>

                  </button>

                )}
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  multiple
                />{" "}
                {/* Enable multiple file selection */}
              </div>



              {selectedFiles && selectedFileUrl && (
                <div className="editview-popup">
                  <button onClick={closeEditView}>Close</button>
                  {error && <div>Error: {error}</div>}
                  {selectedFileUrl && (
                    <iframe
                      className="popup-iframe-block"
                      title="PDF Viewer"
                      src={selectedFileUrl}
                      style={{ width: "100%", height: "calc(100vh - 100px)" }}
                      frameBorder="0"
                    ></iframe>
                  )}
                  {!selectedFileUrl && !error && <div>Loading...</div>}
                </div>
              )}



            </div>


          </>
        )}
      </div>

      {!showHomepage && <div
        style={{
          background: "#291814",
          color: "white",
          padding: "12px 20px",
          textAlign: "center",
          fontSize: "14.5px",
          width: "100%",
          position: "sticky",
          bottom: 0,
          zIndex: 100,
        }}
      >
        <strong>Layout App Benefits: </strong>
        By using this layout app, you benefit from up to
        <strong> 20% off lighting costs</strong>.
        Your plan can also be checked by <strong>Greenhse staff</strong>.
      </div>}

    </div>

  );
};

export default ScanerView;
