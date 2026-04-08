import React, { useEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "./Index.css";

import Header from "../header/Index.jsx";
import hamburger from "../../assets/img/hamburgergroup.svg";
import backArraow from "../../assets/img/back_arrow.svg";
import alertIcon from "../../assets/img/alert_icon.svg";
import crossIcon from "../../assets/img/cross.svg";
import grids from "../../assets/img/gridlines.svg";

import LightPlacementComponent from "../lightPlacementView/Index.jsx";

//Third Party Imports
import DeleteIcon from "@mui/icons-material/Delete";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { useNavigate, useLocation } from "react-router-dom";
import "cropperjs/dist/cropper.css";
import "react-tiny-fab/dist/styles.css";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import GridOnIcon from "@mui/icons-material/GridOn";
import GridOffIcon from "@mui/icons-material/GridOff";
import PanToolIcon from "@mui/icons-material/PanTool";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import Sidebar from "react-sidebar";
import printJS from "print-js";
// import greenHseSmallLogo from "../../assets/img/greenhse-logo-small.png";
import greenHseSmallLogo from "../../assets/img/fan.png";
import AirFlowIconLogo from "../../assets/img/airflow-img.png";
import OutDoorIconLogo from "../../assets/img/outdoor-img.png";
import SpecializedIconLogo from "../../assets/img/specialized-light-img.png";
import {
  loadLogo,
  convertSVGToPNG,
} from "../../utilities/helpers/commonHelper.js";
import { emailAndAddress, greenhseBaseUrl } from "../config/config.jsx";
import greenhscLogo from "../../assets/img/greenhse-logo.png";
import { getFile, getFileByName, updateEstimateName } from "../../IndexedDB.jsx";
import * as pdfjsLib from "pdfjs-dist";
import toast, { Toaster } from "react-hot-toast";

import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// Configure PDF.js worker - use local worker file
// if (typeof window !== 'undefined') {
//   // Use local worker file from public folder - served from root

//   //old
//   // pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

//   //new
//   pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
//     "pdfjs-dist/build/pdf.worker.min.mjs",
//     import.meta.url
//   ).toString();

//   console.log("PDF.js configured, version:", pdfjsLib.version || "unknown");
//   console.log("PDF.js worker source:", pdfjsLib.GlobalWorkerOptions.workerSrc);
//   console.log("PDF.js getDocument available:", typeof pdfjsLib.getDocument === 'function');
// }

const singleLightsflagMap = {
  "airflow": AirFlowIconLogo,
  "outdoor": OutDoorIconLogo,
  "specialized": SpecializedIconLogo
};

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

// const CLAUDE_API_KEY = import.meta.env.VITE_REACT_APP_CLAUDE_API_KEY;

// Function to get dot size based on product mm size
const getDotSize = (productData) => {
  if (!productData) {
    return 16; // Default size
  }

  // Extract mm size from product name or SKU
  const productName = (productData.name || "").toLowerCase();
  const productSku = (productData.sku || "").toLowerCase();
  const searchText = productName + " " + productSku;

  // Look for mm pattern (e.g., "90mm", "40mm", "30mm")
  const mmMatch = searchText.match(/(\d+)mm/);
  if (mmMatch) {
    const mmSize = parseInt(mmMatch[1], 10);

    if (mmSize >= 90) {
      return 10; // 90mm or larger → 20px
    } else if (mmSize >= 40) {
      return 12; // 40mm to 89mm → 15px
    } else {
      return 8; // Less than 40mm → 10px
    }
  }

  // Fallback: Check for common size patterns in product names
  if (productName.includes("90") || productSku.includes("90")) {
    return 20;
  } else if (productName.includes("40") || productSku.includes("40")) {
    return 15;
  } else if (productName.includes("30") || productSku.includes("30")) {
    return 10;
  }

  return 16; // Default size
};

// Color mapping for different product types/categories
const getProductColor = (productData) => {
  console.log("getProductColor - received productData:", productData);

  if (!productData) {
    // Generate a random color for unknown products
    const randomColors = [
      "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
      "#DDA0DD", "#98D8C8", "#F7DC6F", "#FF9FF3", "#54A0FF"
    ];
    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
    console.log("getProductColor - no productData, returning random color:", randomColor);
    return randomColor;
  }

  // FIRST PRIORITY: Use the color from hashcolor attribute (same as light bulb icon)
  if (productData.color) {
    console.log("getProductColor - using product color from hashcolor:", productData.color);
    return productData.color;
  }

  // SECOND PRIORITY: Check for hashcolor in custom_attributes
  if (productData.custom_attributes && Array.isArray(productData.custom_attributes)) {
    const hashColorAttr = productData.custom_attributes.find(
      (attr) => attr.attribute_code === "hashcolor"
    );
    if (hashColorAttr && hashColorAttr.value) {
      console.log("getProductColor - using hashcolor from custom_attributes:", hashColorAttr.value);
      return hashColorAttr.value;
    }
  }

  // FALLBACK: Map based on product name patterns or category
  const productName = (productData.name || "").toLowerCase();
  const categoryId = productData.category_id;

  console.log("getProductColor - productName:", productName, "categoryId:", categoryId);

  // Color mapping based on product characteristics
  if (productName.includes("dl10es") || productName.includes("flat")) {
    return "#10B981"; // Green for basic downlights
  } else if (productName.includes("dl8cct") || productName.includes("cct")) {
    return "#F59E0B"; // Yellow/Orange for CCT lights
  } else if (productName.includes("dl10ps") || productName.includes("ps")) {
    return "#EF4444"; // Red for PS series
  } else if (productName.includes("p18se") || productName.includes("p18")) {
    return "#EC4899"; // Pink for P18 series
  } else if (productName.includes("dl10pbt") || productName.includes("pbt")) {
    return "#8B5CF6"; // Purple for PBT series
  } else if (productName.includes("bluetooth") || productName.includes("bt")) {
    return "#06B6D4"; // Cyan for Bluetooth lights
  } else if (productName.includes("led") || productName.includes("light")) {
    return "#FFD93D"; // Bright yellow for LED lights
  } else if (productName.includes("spot") || productName.includes("track")) {
    return "#FF8A80"; // Light red for spot/track lights
  } else if (productName.includes("pendant") || productName.includes("hanging")) {
    return "#A5D6A7"; // Light green for pendant lights
  } else {
    // Enhanced fallback with more colors and better distribution
    const colors = [
      "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6",
      "#06B6D4", "#84CC16", "#F97316", "#3B82F6", "#10B981",
      "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#06B6D4",
      "#84CC16", "#F97316", "#3B82F6", "#FF6B6B", "#4ECDC4",
      "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"
    ];

    // Create a more unique hash based on multiple factors
    const hashString = `${productName}_${categoryId}_${productData.price || 0}_${Date.now()}`;
    const hash = hashString.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    const finalColor = colors[Math.abs(hash) % colors.length];
    console.log("getProductColor - fallback color selected:", finalColor);
    return finalColor;
  }
};

export default function App() {
  const [image, setImage] = useState(null);
  const [imageData, setImageData] = useState({});
  const [estimate, setEstimate] = useState({ lightPlacement: [] });
  const [currentKey, setCurrentKey] = useState(null);
  const [isSelect, setIsSelect] = useState(false);

  const [isDraggingGroup, setIsDraggingGroup] = useState(false);
  const [savedCombos, setSavedCombos] = useState([]);
  const [activeKey, setActiveKey] = useState("");
  const zoomRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const prevImageUrlRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isPanningEnabled, setIsPanningEnabled] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panBaseRef = useRef({ x: 0, y: 0 });
  const [activeImageId, setActiveImageId] = useState(null);
  const [currentImageId, setCurrentImageId] = useState(null);
  const [selectedPdfImageForCrop, setSelectedPdfImageForCrop] = React.useState(
    []
  );
  const [actualFileName, setActualFileName] = useState("");
  const [fileObj, setFileObj] = useState();
  const [error, setError] = useState("");
  const [headerText, setHeaderText] = useState("Edit Images");
  const [showHamburgerBlock, setShowHamburgerBlock] = useState(false);
  const [headerSaveText, setHeaderSaveText] = useState("Estimate");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();
  const cropperRef = useRef(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  // Get positions hook
  const [isLoading, setIsLoading] = useState(false);
  const [isGridBlockClicked, setIsGridBlockClicked] = useState(true);
  const [isSavePopupOpen, setIsSavePopupOpen] = useState(false);

  // Function to assign colors to existing combos that don't have them
  const assignColorsToExistingCombos = (combos) => {
    return combos.map((combo, index) => {
      if (!combo.color) {
        // Generate a unique color for this combo based on its index and timestamp
        const colors = [
          "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6",
          "#06B6D4", "#84CC16", "#F97316", "#3B82F6", "#FF6B6B",
          "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"
        ];
        const colorIndex = (index + Math.floor(Date.now() / 1000)) % colors.length;
        combo.color = colors[colorIndex];
        console.log(`Assigned color ${combo.color} to existing combo ${combo.comboKey}`);
      }
      return combo;
    });
  };
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hideSideView, setHideSideView] = useState(false);
  const [hideHamburgerIcon, setHideHamburgerIcon] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [changePopupText, setChangePopupText] = useState(false);
  const [count, setCount] = useState(0);
  const [showActionButtons, setShowActionButtons] = useState(true);
  const [hiddenComboKeys, setHiddenComboKeys] = useState(new Set());
  const [activeComboKeys, setActiveComboKeys] = useState(new Set());
  const [showOrientationPopup, setShowOrientationPopup] = useState(false);
  const [pendingProductData, setPendingProductData] = useState(null);
  const [showChangeProductPopup, setShowChangeProductPopup] = useState(false);
  const [comboToChangeProduct, setComboToChangeProduct] = useState(null);
  const [changeProductPopupKey, setChangeProductPopupKey] = useState(0);

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

  //points layout
  const [aiLoader, setAiLoader] = useState(false);
  const [analyzedCriteria, setAnalyzedCriteria] = useState({
    isAnalyzed: false,
    analyzedData: null,
  });
  const [fileName, setFileName] = useState("");
  const [points, setPoints] = useState([]);
  const [cmInput, setCmInput] = useState("");
  const [aiError, setAiError] = useState(null);
  const [result, setResult] = useState(null);
  const [showPointsPopup, setShowPointsPopup] = useState(false);
  const canvasRef = useRef();
  const s = {
    popupContainer: {
      background: "#fff",
      borderRadius: 12,
      width: 443,
      minWidth: 443,
      maxWidth: 443,
      maxHeight: "calc(100vh - 80px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      position: "relative",
    },

    popupHeader: {
      padding: "14px 20px",
      background: "#16c60c",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flex: "0 0 auto",
    },

    popupContent: {
      padding: "18px 20px",
      overflowY: "auto",
      flex: "1 1 auto",
    },

    popupFooter: {
      padding: "14px 20px",
      borderTop: "1px solid #eee",
      background: "#fff",
      flex: "0 0 auto",
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "9px 12px",
      fontSize: 15,
      border: "1px solid #ddd",
      borderRadius: 8,
      marginBottom: 16,
    },

    btnRow: { display: "flex", gap: 10 },

    btnPrimary: {
      flex: 1,
      padding: "9px 0",
      background: "#00c400",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontSize: 14,
      cursor: "pointer",
      fontWeight: 500,
    },

    btnSecondary: {
      flex: 1,
      padding: "9px 0",
      background: "transparent",
      color: "#555",
      border: "1px solid #ddd",
      borderRadius: 8,
      fontSize: 14,
      cursor: "pointer",
    },

    error: { color: "#dc2626", fontSize: 13, marginTop: 8 },
    overlay: { position: "absolute", top: 0, left: 0, pointerEvents: "none" },

    resultCard: {
      marginTop: 20,
      background: "#f8f9ff",
      border: "1px solid #dbeafe",
      borderRadius: 10,
      padding: "16px 20px",
    },

    sectionLabel: {
      fontSize: 13,
      fontWeight: 500,
      color: "#1e40af",
      margin: "12px 0 8px",
    },

    metricGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: 10,
      marginBottom: 12,
    },

    metricCard: {
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 8,
      padding: "10px 14px",
    },

    metricLabel: { fontSize: 11, color: "#888", marginBottom: 3 },

    metricValue: (size = 20) => ({
      fontSize: size,
      fontWeight: 500,
    }),

    coverageBarWrap: {
      background: "#e5e7eb",
      borderRadius: 6,
      height: 10,
      overflow: "hidden",
      marginTop: 4,
    },

    coverageBarFill: (pct) => ({
      width: `${Math.min(100, parseFloat(pct)).toFixed(1)}%`,
      background: "#2563EB",
      height: "100%",
      borderRadius: 6,
      transition: "width 0.4s ease",
    }),
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");

    if (!fileName) return;

    const decodedFileName = decodeURIComponent(fileName);
    setFileName(decodedFileName);

    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");

    const layoutFile = layouts[decodedFileName];

    if (!layoutFile) return;

    setAnalyzedCriteria({
      isAnalyzed: layoutFile?.ai_analyse || false,
      analyzedData: layoutFile?.ai_analyse_result || null,
    });

  }, []);

  const resetPoints = () => {
    setPoints([]);
    setShowPointsPopup(false);
    setCmInput("");
    setAiError(null);
    setResult(null);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleImgClick = (e) => {
    if (isPanningEnabled) return;
    if (points.length >= 2) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPoints = [...points, { x, y }];
    setPoints(newPoints);
    if (newPoints.length === 2) setTimeout(() => setShowPointsPopup(true), 150);
  };

  const drawOverlay = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    canvas.width = img.offsetWidth;
    canvas.height = img.offsetHeight;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // dashed line between scale points
    if (points.length === 2) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.strokeStyle = "#2563EB";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // numbered blue dot markers
    points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#2563EB";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(i + 1, p.x, p.y);
    });
  };

  useEffect(() => { drawOverlay(); }, [points]);

  const buildAnnotatedBase64 = () =>
    new Promise((resolve) => {
      const img = imageRef.current;
      const offCanvas = document.createElement("canvas");
      const scaleX = img.naturalWidth / img.offsetWidth;
      const scaleY = img.naturalHeight / img.offsetHeight;
      offCanvas.width = img.naturalWidth;
      offCanvas.height = img.naturalHeight;
      const ctx = offCanvas.getContext("2d");
      const baseImg = new Image();
      baseImg.onload = () => {
        ctx.drawImage(baseImg, 0, 0, img.naturalWidth, img.naturalHeight);
        const p1 = { x: points[0].x * scaleX, y: points[0].y * scaleY };
        const p2 = { x: points[1].x * scaleX, y: points[1].y * scaleY };
        const r = Math.max(10, Math.round(img.naturalWidth / 80));
        [p1, p2].forEach((p, i) => {
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = "#2563EB"; ctx.fill();
          ctx.strokeStyle = "#fff"; ctx.lineWidth = r * 0.3; ctx.stroke();
          ctx.fillStyle = "#fff"; ctx.font = `bold ${r * 1.2}px sans-serif`;
          ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillText(i + 1, p.x, p.y);
        });
        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = "#2563EB"; ctx.lineWidth = r * 0.4;
        ctx.setLineDash([r * 1.5, r]); ctx.stroke(); ctx.setLineDash([]);
        resolve(offCanvas.toDataURL("image/png").split(",")[1]);
      };
      baseImg.src = image;
    });

  const analyzeWithClaude = async () => {
    const cm = parseFloat(cmInput);
    if (!cm || cm <= 0) { setAiError("Please enter a valid distance in cm."); return; }
    setAiError(""); setAiLoader(true);
    try {
      const dx = points[0].x - points[1].x;
      const dy = points[0].y - points[1].y;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      const pixelsPerCm = pixelDist / cm;
      const annotatedBase64 = await buildAnnotatedBase64();

      const imgWidth = imageRef.current.offsetWidth;
      const imgHeight = imageRef.current.offsetHeight;

      // const prompt =
      //   `This is a floor plan image. I have marked two points (labeled 1 and 2) connected by a blue dashed line.
      //           The real-world distance between point 1 and point 2 is ${cm} cm.
      //           The pixel distance is ${pixelDist.toFixed(2)} pixels.
      //           The displayed image size is ${imgWidth}px wide and ${imgHeight}px tall.
      //           IMPORTANT SCALE RULE: 1 grid box = 10px (fixed).
      //           Using that rule:
      //           1. Count how many grid squares span between point 1 and point 2.
      //           2. Compute cm_per_grid = ${cm} / grids_between_points
      //           3. pixels_per_cm = 10 / cm_per_grid   (since 1 grid = 10px)
      //           4. floor_plan_width_cm  = ${imgWidth}  / pixels_per_cm
      //           5. floor_plan_height_cm = ${imgHeight} / pixels_per_cm
      //           6. floor_plan_area_cm2  = floor_plan_width_cm * floor_plan_height_cm
      //           7. floor_plan_area_m2   = floor_plan_area_cm2 / 10000
      //           8. A standard light fixture covers roughly a circular area of radius 200cm (r=200cm).
      //              light_coverage_area_cm2 = Math.PI * 200 * 200
      //              light_coverage_area_m2  = light_coverage_area_cm2 / 10000
      //           9. coverage_percent = (light_coverage_area_cm2 / floor_plan_area_cm2) * 100
      //           Use THIS computed pixels_per_cm for all further calculations, NOT the raw pixel/cm ratio.
      //           Respond ONLY as JSON, no markdown:
      //           {
      //             "grids_between_points":<number|null>,
      //             "cm_per_grid":<number|null>,
      //             "pixels_per_grid":10,
      //             "pixels_per_cm":<computed from 10px/grid rule>,
      //             "light_fixture_size_px":<pixels_per_cm * 30>,
      //             "floor_plan_width_cm":<number>,
      //             "floor_plan_height_cm":<number>,
      //             "floor_plan_area_cm2":<number>,
      //             "floor_plan_area_m2":<number>,
      //             "light_coverage_area_cm2":<number>,
      //             "light_coverage_area_m2":<number>,
      //             "coverage_percent":<number>,
      //             "explanation":"<brief>"
      //           }`;

      const prompt = `
       You are an architectural measurement engine. You do NOT estimate. You COUNT grid squares visually.

       INPUT FACTS (ground truth):
       - Real distance between point 1 and 2 = ${cm} cm
       - Pixel distance between point 1 and 2 = ${pixelDist.toFixed(2)} px
       - Image size = ${imgWidth}px width, ${imgHeight}px height
       - FIXED RULE: 1 grid square = 10 pixels EXACTLY

       MANDATORY VISION TASKS (must be done from the image):

       STEP 1 — Visually count how many grid squares lie between point 1 and 2.
       Call this: grids_between_points

       STEP 2 — Compute scale from grid rule (NOT from pixelDist):
       cm_per_grid = ${cm} / grids_between_points
       pixels_per_cm_from_grid = 10 / cm_per_grid

       STEP 3 — Compute scale from raw pixel distance (for validation):
       pixels_per_cm_from_pixels = ${pixelDist.toFixed(2)} / ${cm}

       STEP 4 — These two values MUST be close. If not, re-count grids.

       STEP 5 — Using pixels_per_cm_from_grid, compute full floor dimensions:
       floor_width_cm  = ${imgWidth}  / pixels_per_cm_from_grid
       floor_height_cm = ${imgHeight} / pixels_per_cm_from_grid
       floor_area_cm2  = floor_width_cm * floor_height_cm
       floor_area_m2   = floor_area_cm2 / 10000

       STEP 6 — Light coverage calculation:
       Light radius = 200 cm
       light_area_cm2 = π * 200 * 200
       light_area_m2  = light_area_cm2 / 10000
       coverage_percent = (light_area_cm2 / floor_area_cm2) * 100

       STEP 7 — Also return cm_per_pixel for:
       A) selected segment (points 1–2)
       B) entire floor width

       IMPORTANT RULES:
       - You MUST visually count grid squares from the image.
       - Do NOT guess.
       - Do NOT skip steps.
       - Output ONLY valid JSON. No markdown.

       OUTPUT FORMAT:
       {
         "grids_between_points": number,
         "cm_per_grid": number,
         "pixels_per_grid": 10,
         "pixels_per_cm_from_grid": number,
         "pixels_per_cm_from_pixels": number,
         "cm_per_pixel_selected_segment": number,
         "cm_per_pixel_floor_width": number,
         "floor_width_cm": number,
         "floor_height_cm": number,
         "floor_area_cm2": number,
         "floor_area_m2": number,
         "light_area_cm2": number,
         "light_area_m2": number,
         "coverage_percent": number,
         "light_fixture_size_px": number,
         "explanation": "brief reasoning of grid counting"
       }
    `;

      // const res = await fetch("https://api.anthropic.com/v1/messages", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "x-api-key": CLAUDE_API_KEY,
      //     "anthropic-version": "2023-06-01",
      //     "anthropic-dangerous-direct-browser-access": "true",
      //   },
      //   body: JSON.stringify({
      //     model: "claude-sonnet-4-5",
      //     max_tokens: 1000,
      //     messages: [{
      //       role: "user",
      //       content: [
      //         { type: "image", source: { type: "base64", media_type: "image/png", data: annotatedBase64 } },
      //         { type: "text", text: prompt },
      //       ],
      //     }],
      //   }),
      // });
      // const data = await res.json();

      const imagedata = { image: annotatedBase64, prompt };
      const apiUrl = greenhseBaseUrl + `index.php?type=getAIRequest`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(imagedata)
      });
      const apidata = await response.text();
      const data = JSON.parse(apidata);

      const raw = data?.content?.[0]?.text || "";
      const clean = raw.replace(/```json|```/g, "").trim();

      console.log("Claude clean response ======>", clean);

      let parsed;
      try { parsed = JSON.parse(clean); }
      catch {
        parsed = {
          pixels_per_cm: pixelsPerCm,
          light_fixture_size_px: Math.round(pixelsPerCm * 30),
          explanation: raw
        };
      }

      setResult({ pixelDist: pixelDist.toFixed(1), cm, pixelsPerCm: pixelsPerCm.toFixed(2), ...parsed });
      completeAI({ pixelDist: pixelDist.toFixed(1), cm, pixelsPerCm: pixelsPerCm.toFixed(2), ...parsed });
      // setShowLightPicker(true);

    } catch (err) {
      setAiError("Claude API error: " + err.message);
    } finally {
      setAiLoader(false);
    }
  };

  const completeAI = (data) => {
    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");

    const layoutFile = layouts[fileName];

    layoutFile.ai_analyse = true;
    layoutFile.ai_analyse_result = data;

    layouts[fileName] = layoutFile;
    localStorage.setItem("layouts", JSON.stringify(layouts));
    resetPoints();
    setAnalyzedCriteria({
      isAnalyzed: true,
      analyzedData: data,
    });
  };

  // console.log("points =======>", points);


  // Get positions hook
  const [lightPlacementPositions, setLightPlacementPositions] = useState([]);
  const [pdfSideView, setPdfSideView] = useState([]);
  const [resolvedImages, setResolvedImages] = useState([]);
  const [showLightPlacementComp, setShowLightPlacementComp] = useState(true);
  const [selectedProductcomp, setselectedProductComp] = useState([]);
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

  //Get Current Light Key
  // console.log("current key", currentKey);
  //previous
  // useEffect(() => {
  //   if (Array.isArray(savedCombos) && savedCombos?.length > 0) {
  //     const allProducts = savedCombos || [];
  //     if (!Array.isArray(allProducts) || allProducts.length === 0) return;
  //     const latestProduct = allProducts?.reduce((latest, item) =>
  //       item?.productData?.createdAt > latest?.productData?.createdAt ? item : latest
  //     );

  //     // console.log("LATEST", latestProduct, latestProduct?.productData?.isApplied === false);

  //     if (latestProduct && latestProduct?.productData?.isApplied === false) {
  //       setCurrentKey(latestProduct?.comboKey);
  //     } else {
  //       setCurrentKey(null);
  //     }

  //   }
  // }, [savedCombos]);

  //States used for zoom
  const [zoomCount, setZoomCount] = useState(0);
  const [isZoomIn, setIsZoomIn] = useState(false);
  const [isSingleClick, setIsSingleClick] = useState(false);
  const [run1, setRun1] = useState(true);
  const [run2, setRun2] = useState(true);
  const [estimateValue, setEstimateValue] = useState(0); // Track estimate

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

  useEffect(() => {
    fetchFile();
  }, []);
  const toggleHamburgerBlock = () => {
    setShowHamburgerBlock(!showHamburgerBlock);
  };
  const handleLightbulbClick = () => {
    setIsGridBlockClicked((prev) => !prev);
  };
  const closeSidebar = () => {
    // Sidebar always stays open - do nothing
  };
  const handleLightPlacementToggle = () => {
    // Sidebar always stays open - do nothing
  };

  // Handle product change for existing combo
  const handleProductChange = (comboKey) => {
    setComboToChangeProduct(comboKey);
    setShowChangeProductPopup(true);
    // Force component reset by changing key
    setChangeProductPopupKey(prev => prev + 1);
  };

  // console.log("@@@@@@@@@@@@@@", activeKey);

  // Handle product selection for changing existing combo
  const handleChangeProductSelection = (data) => {
    if (!comboToChangeProduct) return;

    const combo = savedCombos.find((c) => c.comboKey === comboToChangeProduct);
    if (!combo) {
      setShowChangeProductPopup(false);
      setComboToChangeProduct(null);
      return;
    }

    // Get new product color
    const newColor = getProductColor(data);

    // Update combo with new product data and color, but keep all other properties
    const updatedCombos = savedCombos.map((c) => {
      if (c.comboKey === comboToChangeProduct) {
        return {
          ...c,
          baseKey: data?.quantity,
          productData: data,
          color: newColor,
          // Keep all other properties: center, stretch, rotation, baseKey, etc.
        };
      }
      return c;
    });

    console.log("updated **********", updatedCombos);
    setSavedCombos(updatedCombos);

    // Update associated product in selectedProductcomp
    const dotCount = predefinedCombos[combo.baseKey]?.length || 1;
    const updatedProducts = selectedProductcomp.map((p) => {
      if (p.comboKey === comboToChangeProduct || p.comboParentKey === comboToChangeProduct) {
        return {
          ...p,
          ...data,
          unitQuantity: dotCount,
          quantity: dotCount,
          // Keep comboKey and comboParentKey
        };
      }
      return p;
    });
    setselectedProductComp(updatedProducts);

    // Update estimate
    const newEstimate = updatedProducts.reduce(
      (total, p) =>
        total + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 1),
      0
    );
    setEstimateValue(newEstimate);

    // Save layout
    saveLayout(updatedCombos, updatedProducts);

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("estimateUpdated", {
        detail: { updatedProducts, newEstimate },
      })
    );

    // Close popup
    setShowChangeProductPopup(false);
    setComboToChangeProduct(null);
  };

  // Handle product selection - check if popup is needed
  const handleMessage = (data, singleType) => {
    console.log("handleMessage - received data:", data, singleType);

    // Check if we're changing a product for an existing combo
    if (showChangeProductPopup && comboToChangeProduct) {
      handleChangeProductSelection(data);
      return;
    }

    const quantity = parseInt(data.quantity) || 1;

    // console.log("handleMessage - determined quantity *************:", quantity);

    // If quantity is 2, 6, 8, or 9, show orientation popup
    if ((quantity === 2 || quantity >= 6) || singleType) {
      setPendingProductData(data);
      setShowOrientationPopup(true);
      return;
    }

    // For quantities 1, 3, 4, or 5, process directly
    const comboBaseKey = predefinedCombos[quantity]
      ? quantity
      : Object.keys(predefinedCombos).find((key) =>
        key.startsWith(`${quantity}-`)
      ) || 1;

    processProductSelection(data, comboBaseKey);
    // console.log("&&&&&&&&&&&&&&&&&&&&&&****************",data);
    // setIsShown(false);

    setIsPanningEnabled(false);
    //previous
    // if (data?.isApplied === false) {
    // toast("Select the Area where you want to upload the light!", {
    //   id: "select-area-warning-1",
    //   icon: "⚠️",
    //   duration: 3000,
    //   style: {
    //     background: "#fff3cd",
    //     color: "#856404",
    //   },
    // });
    // }
  };

  // Handle orientation selection
  const handleOrientationSelection = (orientation) => {
    if (!pendingProductData) return;

    const quantity = parseInt(pendingProductData.quantity) || 1;
    let comboBaseKey;

    // Determine combo key based on orientation
    if (quantity === 2) {
      comboBaseKey = orientation === "horizontal" ? "2-1" : "2";
    } else if (quantity === 6) {
      comboBaseKey = orientation === "horizontal" ? "6-1" : "6";
    } else if (quantity === 8) {
      comboBaseKey = orientation === "horizontal" ? "8-1" : "8";
    } else if (quantity === 9) {
      comboBaseKey = "9"; // 9 is always 3x3 grid
    } else {
      comboBaseKey = quantity;
    }

    // Close popup
    setShowOrientationPopup(false);

    let updatedProduct = pendingProductData;

    if (pendingProductData?.isSingle !== null && pendingProductData?.isSingle !== undefined && pendingProductData?.isSingle === true) {
      updatedProduct = {
        ...pendingProductData,
        horizontal: orientation === "horizontal",
        vertical: orientation === "vertical",
      };
    }

    // Process the product with selected orientation
    // console.log("pending =======>", updatedProduct);
    processProductSelection(updatedProduct, comboBaseKey);

    // Clear pending product
    setPendingProductData(null);
    // setIsShown(false);
    setIsPanningEnabled(false);

    // previous
    // if (updatedProduct?.isApplied === false) {
    // toast("Select the Area where you want to upload the light!", {
    //   id: "select-area-warning-2",
    //   icon: "⚠️",
    //   duration: 3000,
    //   style: {
    //     background: "#fff3cd",
    //     color: "#856404",
    //   },
    // });
    // }
  };

  // Process product selection after orientation is chosen
  const processProductSelection = (data, comboBaseKey) => {
    console.log("processProductSelection - received data:", data);
    console.log("processProductSelection - comboBaseKey:", comboBaseKey);

    // Create new combo key with product data for unique color
    // addCombo creates the combo with color and adds it to savedCombos
    const newComboKey = addCombo(comboBaseKey, { silent: true, productData: data });

    if (!newComboKey) {
      console.error("Failed to create combo");
      return;
    }

    // Number of dots = number of items in that combo layout
    const dotCount = predefinedCombos[comboBaseKey]?.length || 1;

    const instance = {
      ...data,
      unitQuantity: dotCount, // store how many dots/lights are in this combo
      quantity: dotCount, // update quantity to reflect dot count
      comboKey: newComboKey,
      comboParentKey: newComboKey,
    };

    // Update selected products and save layout
    // addCombo already handled adding the combo with color to savedCombos
    setselectedProductComp((prev) => {
      const updated = [...(Array.isArray(prev) ? prev : []), instance];

      // Use setTimeout to ensure savedCombos state has been updated by addCombo
      setTimeout(() => {
        setSavedCombos((currentCombos) => {
          // Verify the combo has the color
          const combo = currentCombos.find((c) => c.comboKey === newComboKey);
          if (combo) {
            console.log("handleMessage - combo found with color:", combo.color);
            // Ensure color is set (should already be from addCombo)
            if (!combo.color && data.color) {
              combo.color = data.color;
              console.log("handleMessage - added missing color to combo:", combo.color);
            }
          }

          // Save layout with updated products
          saveLayout(currentCombos, updated);
          return currentCombos;
        });
      }, 10);

      return updated;
    });
  };

  const startPan = (clientX, clientY) => {
    if (!zoomRef.current) return;
    const state = zoomRef.current.instance?.transformState || {
      positionX: 0,
      positionY: 0,
    };
    panBaseRef.current = { x: state.positionX, y: state.positionY };
    panStartRef.current = { x: clientX, y: clientY };
    setIsPanning(true);
  };

  const movePan = (clientX, clientY) => {
    if (!zoomRef.current || !isPanning) return;
    const dx = clientX - panStartRef.current.x;
    const dy = clientY - panStartRef.current.y;
    const newX = panBaseRef.current.x + dx;
    const newY = panBaseRef.current.y + dy;
    const scale = zoomRef.current.instance?.transformState?.scale || 1;
    zoomRef.current.setTransform(newX, newY, scale, 0);
  };

  const endPan = () => {
    setIsPanning(false);
  };

  // Inside EditView.jsx
  const saveLayout = (combos = savedCombos, products = selectedProductcomp) => {
    // console.log("%%%%%%%%%%%%%%=======>", combos);
    if (!currentImageId) return;

    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
    const prevLayout = layouts[currentImageId] || {};

    const canvasElement = document.querySelector(".floor-image");
    let editedImage = prevLayout.editedImage;
    if (canvasElement) {
      try {
        // Use JPEG compression to reduce storage size and prevent quota issues
        // Only save if image is not too large (limit to ~2MB to avoid quota errors)
        const tempDataUrl = canvasElement.toDataURL("image/jpeg", 0.85);
        const sizeInBytes = (tempDataUrl.length * 3) / 4; // Approximate base64 size
        const sizeInMB = sizeInBytes / (1024 * 1024);

        if (sizeInMB > 2) {
          console.warn("Image too large to save to localStorage:", sizeInMB.toFixed(2), "MB. Skipping image save.");
          // Keep previous image or don't save the image part
          editedImage = prevLayout.editedImage || null;
        } else {
          editedImage = tempDataUrl;
        }
      } catch (err) {
        console.warn("Failed to capture edited image:", err);
        // If quota error, don't save the image
        if (err.name === 'QuotaExceededError' || err.message?.includes('quota')) {
          console.warn("Storage quota exceeded. Skipping image save.");
          editedImage = prevLayout.editedImage || null;
        }
      }
    }

    const currentEstimate = products.length
      ? products.reduce((total, product) => {
        const price = parseFloat(product.price) || 0;
        const qty = parseInt(product.quantity) || 0;
        const gst = parseFloat(product.gst) || 0;
        return total + price * qty * (1 + gst / 100);
      }, 0)
      : 0;

    layouts[currentImageId] = {
      ...prevLayout,
      editedImage,
      lights: {
        lightPlacementPositions,
        selectedProduct: products,
      },
      combos,
      estimate: currentEstimate,
    };

    localStorage.setItem("layouts", JSON.stringify(layouts));

    const savedData = JSON.parse(
      localStorage.getItem("savedLightingLayout") || "{}"
    );
    savedData.lights = { ...savedData.lights, selectedProduct: products };
    savedData.combos = combos;
    savedData.estimate = currentEstimate;
    localStorage.setItem("savedLightingLayout", JSON.stringify(savedData));

    window.dispatchEvent(
      new CustomEvent("estimateUpdated", {
        detail: { updatedProducts: products, newEstimate: currentEstimate },
      })
    );
  };

  const restoreLayout = (currentImageId) => {
    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
    const savedLayout = layouts[currentImageId] || {};

    const combosArray = savedLayout.combos || [];
    const productsArray = (savedLayout.lights?.selectedProduct || []).filter(
      (p) => combosArray.some((c) => c.comboKey === p.comboParentKey)
    );

    // Ensure combos have colors from their associated products
    const combosWithColors = combosArray.map((combo) => {
      if (!combo.color) {
        // Find the associated product for this combo
        const associatedProduct = productsArray.find(
          (p) => p.comboKey === combo.comboKey || p.comboParentKey === combo.comboKey
        );
        if (associatedProduct && associatedProduct.color) {
          combo.color = associatedProduct.color;
          console.log(`Restored color ${combo.color} to combo ${combo.comboKey} from product`);
        } else if (associatedProduct) {
          // Use getProductColor to get color from product data
          combo.color = getProductColor(associatedProduct);
          console.log(`Assigned color ${combo.color} to combo ${combo.comboKey} using getProductColor`);
        }
      }
      return combo;
    });

    setSavedCombos(combosWithColors);
    setLightPlacementPositions(
      savedLayout.lights?.lightPlacementPositions || []
    );
    setselectedProductComp(productsArray);
    setEstimateValue(savedLayout.estimate || 0);
  };

  const fetchFile = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fileName = params.get("file");

      if (!fileName) return;

      const decodedFileName = decodeURIComponent(fileName);
      setActualFileName(decodedFileName);

      try {
        const fileData = await getFileByName(decodedFileName);

        if (!fileData) {
          navigate('/');
        }

        if (fileData?.uid) {
          const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
          const savedLayout = layouts[decodedFileName];

          const res = await fetch(`https://www.getestimate.greenhse.com/index.php?type=getdata&uuid=${fileData?.uid}`,
            {
              method: "GET", headers: { Accept: "application/json" }
            }
          );

          const result = await res.json();
          const apiLayout = result?.data?.data?.layout;

          if (apiLayout && savedLayout) {
            const isDifferent = (a, b) =>
              JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);

            let hasChanges = false;

            ["combos", "estimate", "lights"].forEach((key) => {
              if (isDifferent(savedLayout[key], apiLayout[key])) {
                savedLayout[key] = apiLayout[key];
                hasChanges = true;
              }
            });

            if (hasChanges) {
              layouts[decodedFileName] = {
                ...savedLayout,
                status: 2,
              };
              localStorage.setItem("layouts", JSON.stringify(layouts));
              console.log("Layout updated from API");
            }
          }
        }
      } catch (apiError) {
        console.warn("API failed, continuing with local data:", apiError);
      }

      // Try to load from IndexedDB
      //  
      const storedFile = await getFile(decodedFileName);
      let uri = null;
      let isPdf = false;

      if (storedFile) {
        // Check if file is PDF
        isPdf = storedFile.type === "application/pdf" || decodedFileName.toLowerCase().endsWith(".pdf");
        console.log("File type check - storedFile.type:", storedFile.type, "isPdf:", isPdf, "fileName:", decodedFileName);

        if (isPdf) {
          // Render PDF first page to canvas
          try {
            console.log("Starting PDF rendering...");
            console.log("storedFile:", storedFile);
            console.log("pdfjsLib available:", !!pdfjsLib);
            console.log("pdfjsLib.getDocument available:", !!(pdfjsLib && pdfjsLib.getDocument));

            // Verify PDF.js is available
            if (!pdfjsLib) {
              throw new Error("PDF.js library not loaded");
            }

            // Check for getDocument method
            if (!pdfjsLib.getDocument) {
              console.error("pdfjsLib structure:", Object.keys(pdfjsLib));
              throw new Error("PDF.js getDocument method not found. Available methods: " + Object.keys(pdfjsLib).join(", "));
            }

            console.log("Using getDocument method from PDF.js");

            // Convert file to array buffer for better compatibility
            let arrayBuffer;
            if (storedFile instanceof Blob || storedFile instanceof File) {
              arrayBuffer = await storedFile.arrayBuffer();
            } else if (storedFile.data) {
              // If storedFile has a data property, use it
              arrayBuffer = storedFile.data instanceof ArrayBuffer
                ? storedFile.data
                : await new Response(storedFile.data).arrayBuffer();
            } else {
              // Try to convert to blob first
              const blob = storedFile instanceof Blob ? storedFile : new Blob([storedFile]);
              arrayBuffer = await blob.arrayBuffer();
            }

            console.log("ArrayBuffer created, size:", arrayBuffer.byteLength);

            if (!arrayBuffer || arrayBuffer.byteLength === 0) {
              throw new Error("ArrayBuffer is empty or invalid");
            }

            // Load PDF document using array buffer
            const loadingTask = pdfjsLib.getDocument({
              data: arrayBuffer,
              verbosity: 0
            });
            const pdf = await loadingTask.promise;
            console.log("PDF loaded successfully, pages:", pdf.numPages);

            if (pdf.numPages === 0) {
              throw new Error("PDF has no pages");
            }

            const page = await pdf.getPage(1); // Get first page
            console.log("Page 1 loaded successfully");

            // Use lower scale to reduce file size and prevent quota issues
            // Scale 1.0 is sufficient for most use cases and much smaller
            const scale = 1.0;
            const viewport = page.getViewport({ scale: scale });
            console.log("Viewport dimensions:", viewport.width, "x", viewport.height);

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            if (!context) {
              throw new Error("Could not get 2D context from canvas");
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            console.log("Canvas created with dimensions:", canvas.width, "x", canvas.height);

            const renderContext = {
              canvasContext: context,
              viewport: viewport
            };

            await page.render(renderContext).promise;
            // console.log("Page rendered to canvas successfully");

            // Convert canvas to data URL using JPEG with compression to reduce size
            // JPEG quality 0.85 provides good quality while significantly reducing file size
            uri = canvas.toDataURL("image/jpeg", 0.85);
            console.log("Canvas converted to JPEG data URL, length:", uri ? uri.length : 0);
            console.log("Data URL size (KB):", uri ? Math.round(uri.length / 1024) : 0);

            if (!uri || uri.length === 0 || !uri.startsWith("data:image")) {
              throw new Error("Failed to convert canvas to data URL or invalid data URL format");
            }

            // Check if the data URL is too large (warn if > 3MB)
            const sizeInKB = uri.length / 1024;
            if (sizeInKB > 3000) {
              console.warn("Large PDF image generated:", Math.round(sizeInKB / 1024), "MB. This may cause storage issues.");
            }

            console.log("PDF rendering completed successfully, URI created");
          } catch (pdfError) {
            console.error("Error rendering PDF:", pdfError);
            console.error("PDF Error details:", pdfError.message);
            if (pdfError.stack) {
              console.error("Stack trace:", pdfError.stack);
            }
            // Don't use object URL for PDFs - it won't work in img tags
            // Set error state so user knows what happened
            console.error("PDF rendering failed completely. Cannot display PDF as image.");
            setError("Failed to render PDF: " + pdfError.message);
            // Don't set uri - let it remain null so we can show an error
            uri = null;
          }
        } else {
          // console.log("Storinggggg======>", storedFile);
          uri = URL.createObjectURL(storedFile);
          console.log("Non-PDF file, created object URL");
        }
      } else {
        //If IndexedDB fails, fallback to localStorage base64
        const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
        const savedLayout = layouts[decodedFileName];
        if (savedLayout?.editedImage) {
          uri = savedLayout.editedImage; // base64 image
        }
      }

      if (!uri) {
        console.error("No URI generated for file:", decodedFileName);
        if (isPdf) {
          setError("Failed to render PDF. Please check the console for details.");
        }
        return;
      }

      console.log("Setting image URI, type:", isPdf ? "PDF (converted to image)" : "Image", "URI length:", uri.length);
      console.log("URI starts with data:", uri.startsWith("data:"));
      console.log("URI starts with blob:", uri.startsWith("blob:"));

      // Verify URI is valid before setting
      if (uri && (uri.startsWith("data:") || uri.startsWith("blob:") || uri.startsWith("http"))) {
        setImage(uri);
        setSelectedPdfImageForCrop(uri);
        setCurrentImageId(decodedFileName);
        console.log("Image state set successfully, currentImageId:", decodedFileName);
        restoreLayout(decodedFileName);
      } else {
        console.error("Invalid URI format:", uri ? uri.substring(0, 50) : "null");
        setError("Invalid image URI format");
      }
      // saveLayout();
    } catch (error) {
      console.error("Error fetching file:", error);
      console.error("Error stack:", error.stack);
      setError("Failed to load file: " + error.message);
    }
  };

  // Update lights positions
  const updateLights = (newPositions, newProducts) => {
    setLightPlacementPositions(newPositions);
    setselectedProductComp(newProducts);
    saveLayout(); // Save immediately
  };

  const updateCombo = (key, updates) => {
    const updated = savedCombos.map((c) => {
      if (c.comboKey === key) {
        const newCombo = { ...c, ...updates };

        // Calculate the last dot position (bottom-right dot)
        const offsets = predefinedCombos[c.baseKey] || [];
        if (offsets.length) {
          const lastOffset = offsets[offsets.length - 1];
          const lastX =
            (lastOffset.fixedX
              ? 0
              : (30 + newCombo.stretch.x) * lastOffset.col) + newCombo.center.x;
          const lastY =
            (lastOffset.fixedY
              ? 0
              : (30 + newCombo.stretch.y) * lastOffset.row) + newCombo.center.y;
          newCombo.absoluteLastDot = { x: lastX, y: lastY };
        }

        return newCombo;
      }
      return c;
    });

    setSavedCombos(updated);
    saveLayout(updated);
  };

  const rotateCombo = (comboKey, angle) => {
    setSavedCombos((prev) =>
      prev.map((combo) => {
        if (combo.comboKey === comboKey) {
          const currentRotation = combo.rotation || 0;
          const newRotation = (currentRotation + angle) % 360;
          return { ...combo, rotation: newRotation };
        }
        return combo;
      })
    );
  };

  // Add combo — return the generated comboKey so callers can tag products
  const addCombo = (key, { silent = false, productData = null } = {}) => {
    if (!predefinedCombos[key]) return null;

    const uniqueKey = `${key}-${Date.now()}`;
    const productColor = getProductColor(productData);

    // Debug logging
    console.log("Adding combo with productData:", productData);
    console.log("Generated color:", productColor, key);

    const newCombo = {
      comboKey: uniqueKey,
      baseKey: key,
      center: { x: 80, y: 80 },
      spacing: 10,
      anchor: { x: 5, y: 5 },
      stretch: { x: 5, y: 5 },
      color: productColor, // Add unique color
      productData: productData, // Store product data
      rotation: 0, // Initialize rotation
    };

    if (!newCombo.center || typeof newCombo.center.x !== "number") return null;

    const updated = [
      ...(Array.isArray(savedCombos) ? savedCombos : []),
      newCombo,
    ];
    setSavedCombos(updated);
    if (!silent) saveLayout(updated, selectedProductcomp);
    setActiveKey(uniqueKey);

    return uniqueKey;
  };

  const removeCombo = (comboKey) => {
    if (!currentImageId) return;

    // Remove combo from savedCombos
    const updatedCombos = (savedCombos || []).filter(
      (c) => c.comboKey !== comboKey
    );

    // Remove products that match either comboKey or comboParentKey
    // This ensures all related products are removed when a combo is deleted
    const updatedProducts = (selectedProductcomp || []).filter(
      (p) => p.comboKey !== comboKey && p.comboParentKey !== comboKey
    );

    // Update state
    setSavedCombos(updatedCombos);
    setselectedProductComp(updatedProducts);

    // Clear active key if the deleted combo was active
    if (activeKey === comboKey) {
      setActiveKey("");
    }

    // Recalculate estimate
    const newEstimate = updatedProducts.reduce(
      (total, p) =>
        total + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 1),
      0
    );
    setEstimateValue(newEstimate);

    // Save layout with updated data
    saveLayout(updatedCombos, updatedProducts);

    console.log(
      "After delete - Combos:",
      updatedCombos.length,
      "Products:",
      updatedProducts.length
    );

    // Dispatch event to update estimate
    window.dispatchEvent(
      new CustomEvent("estimateUpdated", {
        detail: { updatedProducts, newEstimate },
      })
    );
  };

  const copyCombo = (comboKey) => {
    if (!currentImageId) return;

    const comboToCopy = savedCombos.find((c) => c.comboKey === comboKey);
    if (!comboToCopy) return;

    // Find associated product
    const productToCopy = selectedProductcomp.find(
      (p) => p.comboKey === comboKey || p.comboParentKey === comboKey
    );

    // Create new combo with offset position
    const uniqueKey = `${comboToCopy.baseKey}-${Date.now()}`;
    const newCombo = {
      ...comboToCopy,
      comboKey: uniqueKey,
      center: {
        x: comboToCopy.center.x + 50,
        y: comboToCopy.center.y + 50,
      },
    };

    // Add new combo
    const updatedCombos = [...(Array.isArray(savedCombos) ? savedCombos : []), newCombo];
    setSavedCombos(updatedCombos);

    // Add new product if exists
    if (productToCopy) {
      const dotCount = predefinedCombos[comboToCopy.baseKey]?.length || 1;
      const newProduct = {
        ...productToCopy,
        comboKey: uniqueKey,
        comboParentKey: uniqueKey,
        unitQuantity: dotCount,
        quantity: dotCount,
      };

      const updatedProducts = [
        ...(Array.isArray(selectedProductcomp) ? selectedProductcomp : []),
        newProduct,
      ];
      setselectedProductComp(updatedProducts);

      // Update estimate
      const newEstimate = updatedProducts.reduce(
        (total, p) =>
          total + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 1),
        0
      );
      setEstimateValue(newEstimate);

      // Save layout
      saveLayout(updatedCombos, updatedProducts);

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("estimateUpdated", {
          detail: { updatedProducts, newEstimate },
        })
      );
    } else {
      saveLayout(updatedCombos, selectedProductcomp);
    }

    setActiveKey(uniqueKey);

    console.log("Combo copied with new key:", uniqueKey);
    console.log("Adding to active combo keys #########:", uniqueKey, comboKey);

    if (showActionButtons === false) {

      setActiveComboKeys((prev) => {
        const newSet = new Set(prev);
        newSet.delete(comboKey);
        return newSet;
      });

      setActiveComboKeys(prev => {
        const newSet = new Set(prev);
        newSet.add(uniqueKey);
        return newSet;
      });
    }
  };

  const handleBackToHome = async () => {
    saveLayout();
    await new Promise((r) => setTimeout(r, 300));

    navigate("/");
  };

  useEffect(() => {
    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
    const current = layouts[currentImageId];
    if (current) {
      setselectedProductComp(current.lights?.selectedProduct || []);
      setSavedCombos(current.combos || []);
      setEstimateValue(current.estimate || 0);
    }
  }, [currentImageId]);

  const onUpdateEstimateName = (fileName, newEstimate) => {
    const cleanName = fileName.replaceAll(" ", "");
    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
    layouts[cleanName] = {
      ...layouts[cleanName],
      estimate: newEstimate,
    };
    localStorage.setItem("layouts", JSON.stringify(layouts));

    setSelectedFiles((prevFiles) =>
      prevFiles.map((f) =>
        (f.name || f.file?.name) === fileName ? { ...f, ...newEstimate } : f
      )
    );
  };

  useEffect(() => {
    if (!currentImageId) return;

    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
    const savedLayout = layouts[currentImageId];

    if (!savedLayout) return;

    const productsArray = savedLayout.lights?.selectedProduct || [];
    let combosArray = savedLayout.combos || [];

    // Ensure combos have colors from their associated products
    combosArray = combosArray.map((combo) => {
      if (!combo.color) {
        // Find the associated product for this combo
        const associatedProduct = productsArray.find(
          (p) => p.comboKey === combo.comboKey || p.comboParentKey === combo.comboKey
        );
        if (associatedProduct && associatedProduct.color) {
          combo.color = associatedProduct.color;
        } else if (associatedProduct) {
          // Use getProductColor to get color from product data
          combo.color = getProductColor(associatedProduct);
        }
      }
      return combo;
    });

    setLightPlacementPositions(
      savedLayout.lights?.lightPlacementPositions || []
    );
    setselectedProductComp(productsArray);
    setSavedCombos(combosArray);

    setEstimateValue(savedLayout.estimate || 0);

    console.log(
      "Restored layout for image:",
      currentImageId,
      "with estimate:",
      savedLayout.estimate
    );
  }, [currentImageId]);

  useEffect(() => {
    if (savedCombos && savedCombos.length > 0) {
      localStorage.setItem("savedCombos", JSON.stringify(savedCombos));
    }
  }, [savedCombos]);

  // Assign colors to existing combos that don't have them
  useEffect(() => {
    if (savedCombos && savedCombos.length > 0) {
      const combosWithColors = assignColorsToExistingCombos(savedCombos);
      const hasUncoloredCombos = combosWithColors.some(combo => !combo.color);

      if (hasUncoloredCombos) {
        console.log("Found uncolored combos, assigning colors...");
        setSavedCombos(combosWithColors);
      }
    }
  }, [savedCombos.length]); // Only run when the number of combos changes

  useEffect(() => {
    const preventScrollAndZoom = (e) => {
      if (e.target.closest(".sidebar-block-content") || e.target.closest(".orientation-popup-overlay")) {
        return;
      }

      if (!isPanningEnabled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (!isPanningEnabled) {
      document.documentElement.style.overflow = "hidden"; // html
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";

      // Capture phase = runs BEFORE your TransformComponent gets it
      window.addEventListener("wheel", preventScrollAndZoom, { passive: false, capture: true });
      window.addEventListener("touchmove", preventScrollAndZoom, { passive: false, capture: true });
    } else {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "auto";

      window.removeEventListener("wheel", preventScrollAndZoom, { capture: true });
      window.removeEventListener("touchmove", preventScrollAndZoom, { capture: true });
    }

    return () => {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "auto";

      window.removeEventListener("wheel", preventScrollAndZoom, { capture: true });
      window.removeEventListener("touchmove", preventScrollAndZoom, { capture: true });
    };
  }, [isPanningEnabled]);


  const actionRef = useRef(null);
  const [isShown, setIsShown] = useState(true);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [actualBox, setActualBox] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);

  const [finalSelection, setFinalSelection] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const calculateLights = (box) => {
    if (!box) return {};

    const area = box.width * box.height;

    //Simple logic (can upgrade later)
    const lightsCount = Math.ceil(area / 4000); // density rule
    const suggestedSpacing = Math.sqrt(area / lightsCount);
    const lightSize = Math.round(suggestedSpacing * 0.6);

    return {
      area,
      lightsCount,
      suggestedSpacing: Math.round(suggestedSpacing),
      lightWidth: lightSize,
      lightHeight: lightSize,
    };
  };

  const placeLightsInSelection = () => {
    //previous
    // if (!currentKey) {
    //   toast.error("Please Select the Lighting First!");
    //   setShowPopup(false);
    //   return;
    // }

    //previous
    // if (!actualBox) return;

    // const { x, y, width, height } = actualBox;

    // const finalBox = {
    //   x: Math.min(x, x + width),
    //   y: Math.min(y, y + height),
    //   width: Math.abs(width),
    //   height: Math.abs(height),
    // };
    // const data = calculateLights(finalBox);

    // console.log("**********", x, y, width, height, data);

    const products = JSON.parse(localStorage.getItem("savedCombos")) || [];

    //previous
    // const centerX = x + width / 2;
    // const centerY = y + height / 2;

    // const updatedProducts = products.map((item) => {
    //   if (item?.comboKey === currentKey) {
    //     console.log("particualr ****", item);
    //     return {
    //       ...item,

    //       center: { x: centerX, y: centerY, },

    //       absoluteLastDot: { x: centerX, y: centerY, },

    //       anchor: { x: 0.5, y: 0.5, },

    //       stretch: { x: width, y: height, },

    //       productData: {
    //         ...item.productData,
    //         width: (item?.productData?.imageUrl === null || item?.productData?.imageUrl === undefined) ? Number((data?.lightWidth) / 2) : data?.lightWidth,
    //         height: (item?.productData?.imageUrl === null || item?.productData?.imageUrl === undefined) ? Number((data?.lightHeight) / 2) : data?.lightHeight,
    //         isApplied: true,
    //       },
    //     };
    //   }
    //   return item;
    // });

    // console.log("^^^^^^^ -------", updatedProducts, currentKey);

    localStorage.setItem("savedCombos", JSON.stringify(products));

    setSavedCombos(products);

    // previous
    // setShowPopup(false);
    // setFinalSelection(null);
    // setSelectionBox(null);
  };

  //previous
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     // ✅ Also ignore clicks inside the selection popup
  //     const isInsideActionContainer = event.target.closest(".action-container");
  //     const isInsidePopup = event.target.closest(".selection-popup");

  //     if (isInsideActionContainer) {
  //       setIsShown(false);
  //     } else if (!isInsidePopup) {
  //       setIsShown(true);
  //     }
  //     // If inside popup, do nothing — don't touch isShown
  //   };

  //   window.addEventListener("pointerdown", handleClickOutside);
  //   return () => window.removeEventListener("pointerdown", handleClickOutside);
  // }, []);

  // console.log("________________", isShown);

  return (
    <div style={{ overflow: "hidden" }}>

      {/* <Toaster
        position="top-center"
        toastOptions={{  duration: 3000, }}
      /> */}

      <div className="greenhsce-content-block">
        <div className="page-content-custom-block">
          {/* <div className="back-button">
          <button onClick={handleBackToHome}>
            <img src={backArraow} alt="Back" />
            Back
          </button>
        </div> */}
          <Header
            headerText={headerText}
            headerSaveText={headerSaveText}
            onUpdateEstimateName={onUpdateEstimateName}
            showEstimateName={true}
            showEditIcon={true}
            mode="editview"
            containerRef={containerRef}
            selectedProductcomp={selectedProductcomp}
            lightPlacementPositions={lightPlacementPositions}
            onBackToHome={handleBackToHome}
          />
        </div>
      </div>

      <div className={analyzedCriteria?.isAnalyzed ? "row" : "d-flex justify-content-center align-items-center"}>
        {analyzedCriteria?.isAnalyzed && (
          <div className="col-md-4"></div>
        )}

        <div className="col-md-6">
          <div className="controls-container">
            {/* Grid Toggle Button */}
            <div>
              <button
                onClick={() => setIsGridBlockClicked(!isGridBlockClicked)}
                className={`btn btn-sm grid-toggle-btn ${isGridBlockClicked ? "btn-primary" : "btn-outline-primary"
                  }`}
                title={isGridBlockClicked ? "Hide Grid" : "Show Grid"}
              >
                <img src={grids} alt="Grid" />
                {isGridBlockClicked ? "Hide Grid" : "Show Grid"}
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="zoom-controls">
              <button
                onClick={() => {
                  if (zoomRef.current) {
                    zoomRef.current.zoomIn();
                  }
                }}
                className="zoom-btn"
                title="Zoom In"
              >
                +
              </button>

              <button
                onClick={() => {
                  if (zoomRef.current) {
                    zoomRef.current.zoomOut();
                  }
                }}
                className="zoom-btn"
                title="Zoom Out"
              >
                −
              </button>

              <button
                onClick={() => {
                  if (zoomRef.current) {
                    zoomRef.current.resetTransform();
                  }
                }}
                className="zoom-btn zoom-reset-btn"
                title="Reset Zoom"
              >
                ⌂
              </button>
            </div>

            <button
              onClick={() => setIsPanningEnabled((prev) => !prev)}
              className="btn btn-sm btn-outline-secondary"
            >
              {isPanningEnabled ? "Fix Main (Lock)" : "Enable Move"}
            </button>
          </div>

          <div className="">
            <div className="steps-content">
              <div className="placement-steps-note">
                <div className="steps-wrap">
                  <div className="step-item">
                    <div className="step-badge">1.</div>
                    <span className="step-label">Mark two reference points on the floor plan to define a known distance</span>
                  </div>
                  <div className="step-item">
                    <div className="step-badge">2.</div>
                    <span className="step-label">Enter the real-world distance (in cm) between the selected points to let the <strong>AI analyze</strong> the scale</span>
                  </div>
                  <div className="step-item">
                    <div className="step-badge">3.</div>
                    <span className="step-label">Choose a light from the panel and place it accurately on the analyzed floor plan</span>
                  </div>
                </div>
              </div>
              {/* <div class="greenhse-logo">
                <img src="/static/media/greenhse-logo.113ecfa0fb3dfd19fc6b.png" alt="right-icon" />
              </div> */}
            </div>
          </div>

          <div
            className="canvas"
            ref={containerRef}
          // style={{
          //   overflow: isPanningEnabled ? "hidden" : "auto",
          //   pointerEvents: isPanningEnabled ? "none" : "auto"
          // }}
          >
            <TransformWrapper
              ref={zoomRef}
              minScale={0.5}
              maxScale={4}
              initialScale={1}
              initialPositionX={0}
              initialPositionY={0}
              doubleClick={{ disabled: true }}
              panning={{ disabled: !isPanningEnabled, velocityDisabled: true }}
              centerOnInit={false}
              centerZoomedOut={false}
              limitToBounds={false}
              alignmentAnimation={{ disabled: true }}
              wheel={{ step: 0.01, smoothStep: 0.005, wheelEnabled: true }}
            >
              <TransformComponent
                wrapperStyle={{
                  // border: isSelect ? "2px solid red" : "",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  touchAction: "none",
                  cursor: isPanningEnabled
                    ? isPanning
                      ? "grabbing"
                      : "grab"
                    : "default",
                  // overflow: !isPanningEnabled ? "hidden" : "auto",
                  // pointerEvents: !isPanningEnabled ? "none" : "auto",
                }}
                contentStyle={{
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  position: "relative",
                  transformOrigin: "top left",
                  transition: "transform 0.2s ease-out",
                  touchAction: "none",
                  cursor: isPanningEnabled ? isPanning ? "grabbing" : "grab" : "default",
                  // overflow: !isPanningEnabled ? "hidden" : "auto",
                  // pointerEvents: !isPanningEnabled ? "none" : "auto",
                }}
              >
                {error && (
                  <div style={{
                    padding: "20px",
                    background: "#ffebee",
                    color: "#c62828",
                    margin: "20px",
                    borderRadius: "4px",
                    border: "1px solid #ef5350"
                  }}>
                    <strong>Error:</strong> {error}
                  </div>
                )}
                {image && (
                  <div
                    className="image-wrapper"
                    style={{
                      position: "relative",
                      // overflow: !isPanningEnabled ? "hidden" : "auto",
                      // pointerEvents: !isPanningEnabled ? "none" : "auto"
                    }}

                    onMouseDown={(e) => {
                      if (isPanningEnabled) {

                        if (activeImageId !== currentImageId) {
                          setActiveImageId(currentImageId);
                          return;
                        }
                        startPan(e.clientX, e.clientY);
                      }

                      // previous
                      // else {
                      //   if (isSelecting) return;

                      //   const rect = imageRef.current.getBoundingClientRect();
                      //   const x = e.clientX - rect.left;
                      //   const y = e.clientY - rect.top;

                      //   // setFinalSelection(null);
                      //   // setSelectionBox(null);
                      //   // setShowPopup(false);

                      //   setSelectionStart({ x, y });
                      //   setSelectionBox({ x, y, width: 0, height: 0 });
                      //   setIsSelecting(true);
                      // }
                    }}

                    // onMouseDown={
                    //   !isPanningEnabled
                    //     ? undefined
                    //     : (e) => {
                    //       if (activeImageId !== currentImageId) {
                    //         setActiveImageId(currentImageId);
                    //         return;
                    //       }
                    //       startPan(e.clientX, e.clientY);
                    //     }
                    // }

                    onMouseMove={(e) => {
                      if (isPanningEnabled) {
                        movePan(e.clientX, e.clientY);
                      }

                      //previous
                      // else if (isSelecting) {
                      //   const rect = imageRef.current.getBoundingClientRect();
                      //   const currentX = e.clientX - rect.left;
                      //   const currentY = e.clientY - rect.top;

                      //   setSelectionBox({
                      //     x: selectionStart.x,
                      //     y: selectionStart.y,
                      //     width: currentX - selectionStart.x,
                      //     height: currentY - selectionStart.y,
                      //   });

                      //   // previous
                      //   // setActualBox({
                      //   //   x: selectionStart.x,
                      //   //   y: selectionStart.y,
                      //   //   width: currentX - selectionStart.x,
                      //   //   height: currentY - selectionStart.y,
                      //   // });
                      // }

                    }}

                    // onMouseMove={
                    //   !isPanningEnabled
                    //     ? undefined
                    //     : (e) => movePan(e.clientX, e.clientY)
                    // }

                    onMouseUp={() => {
                      if (isPanningEnabled) {
                        endPan();
                      }

                      // previous
                      // else {
                      //   setIsSelecting(false);

                      //   if (selectionBox) {
                      //     const finalBox = {
                      //       x: Math.min(selectionBox.x, selectionBox.x + selectionBox.width),
                      //       y: Math.min(selectionBox.y, selectionBox.y + selectionBox.height),
                      //       width: Math.abs(selectionBox.width),
                      //       height: Math.abs(selectionBox.height),
                      //     };

                      //     const MIN_SIZE = 10;
                      //     if (finalBox.width > MIN_SIZE && finalBox.height > MIN_SIZE) {
                      //       setFinalSelection(finalBox);
                      //       setShowPopup(true);
                      //     }

                      //   }
                      // }

                    }}

                    // onMouseUp={!isPanningEnabled ? undefined : endPan}

                    onMouseLeave={() => {
                      if (isPanningEnabled) {
                        endPan();
                      }

                      // previous
                      // else {
                      //   setIsSelecting(false);
                      //   setSelectionBox(null);
                      // }
                    }}

                    // onMouseLeave={!isPanningEnabled ? undefined : endPan}

                    onTouchStart={
                      !isPanningEnabled
                        ? undefined
                        : (e) => {
                          const t = e.touches[0];
                          if (activeImageId !== currentImageId) {
                            setActiveImageId(currentImageId);
                            return;
                          }
                          startPan(t.clientX, t.clientY);
                        }
                    }
                    onTouchMove={
                      !isPanningEnabled
                        ? undefined
                        : (e) => {
                          const t = e.touches[0];
                          movePan(t.clientX, t.clientY);
                        }
                    }
                    onTouchEnd={!isPanningEnabled ? undefined : endPan}
                  >
                    <img
                      ref={imageRef}
                      src={image}
                      alt="Uploaded"
                      className="floor-image"
                      draggable={false}
                      style={{
                        display: "block",
                        // width: `630px`,
                        // height: `450px`,
                        // objectFit: "fill",
                        overflow: isPanningEnabled ? "hidden" : "auto",
                        pointerEvents: isPanningEnabled ? "none" : "auto"
                      }}
                      onLoad={() => {
                        console.log("Image loaded successfully");
                        if (imageRef.current) {
                          drawOverlay();
                          // Image dimensions are handled by the useEffect hook
                        }
                      }}
                      onError={(e) => {
                        console.error("Image failed to load:", e);
                        console.error("Image src:", image);
                        console.error("Image src type:", image ? (image.startsWith("data:") ? "data URL" : image.startsWith("blob:") ? "blob URL" : "other") : "null");
                        setError("Failed to load image. Please check the console for details.");
                      }}
                      onClick={(e) => {
                        if (isPanningEnabled || analyzedCriteria?.isAnalyzed) return
                        handleImgClick(e);
                      }}
                    />

                    <canvas ref={canvasRef} style={s.overlay} />

                    {/* {console.log("^^^^^%%%", finalSelection, selectionBox, finalSelection)} */}

                    {/* previous */}
                    {/* {(selectionBox || finalSelection) && !isPanningEnabled && isShown && currentKey !== null && (actualBox !== null && actualBox?.height > 0 && actualBox?.width > 0) && (
                      <div
                        style={{
                          position: "absolute",
                          left: (isSelecting ? (selectionBox?.x ?? 0) : (finalSelection?.x ?? 0)),
                          top: (isSelecting ? (selectionBox?.y ?? 0) : (finalSelection?.y ?? 0)),
                          width: Math.abs(isSelecting ? (selectionBox?.width ?? 0) : (finalSelection?.width ?? 0)),
                          height: Math.abs(isSelecting ? (selectionBox?.height ?? 0) : (finalSelection?.height ?? 0)),
                          border: "2px dashed #2196f3",
                          background: "rgba(33,150,243,0.1)",
                          zIndex: 50,
                          pointerEvents: "none",
                        }}
                      />
                    )} */}

                    {/* Render lights only if positions exist */}
                    {lightPlacementPositions.map((light, index) => (
                      <div
                        key={`light-${index}-${light.x}-${light.y}`}
                        style={{
                          position: "absolute",
                          left: `${light.x}px`,
                          top: `${light.y}px`,
                          width: "20px",
                          height: "20px",
                          backgroundColor: light.color || "yellow",
                          borderRadius: "50%",
                          zIndex: 2,
                          border: "2px solid orange",
                          transform: "translate(-50%, -50%)",
                        }}
                      ></div>
                    ))}

                    {/* Grid Overlay */}
                    {isGridBlockClicked && <div className="grid-overlay"></div>}

                    {Array.isArray(savedCombos) &&
                      savedCombos
                        // .filter(
                        //   (c) => c && c.center && typeof c.center.x === "number" && c.productData.isApplied === true
                        // )
                        .map((combo, i) => {
                          const offsets = predefinedCombos[combo.baseKey] || [];

                          // Calculate action buttons position
                          let actionX = combo.center.x + combo.stretch.x + 50;
                          let actionY = combo.center.y + combo.stretch.y + 50;

                          // Get image dimensions to check boundaries
                          if (imageRef.current) {
                            const imgWidth = imageRef.current.offsetWidth || imageRef.current.naturalWidth;
                            const imgHeight = imageRef.current.offsetHeight || imageRef.current.naturalHeight;

                            // Action buttons container: 6 buttons (24px each) + 5 gaps (6px each) = 174px width, 24px height
                            const buttonsWidth = 174;
                            const buttonsHeight = 24;
                            const padding = 10; // Padding from edges

                            // Check right boundary
                            if (actionX + buttonsWidth > imgWidth - padding) {
                              actionX = imgWidth - buttonsWidth - padding;
                            }

                            // Check left boundary
                            if (actionX < padding) {
                              actionX = padding;
                            }

                            // Check bottom boundary
                            if (actionY + buttonsHeight > imgHeight - padding) {
                              actionY = imgHeight - buttonsHeight - padding;
                            }

                            // Check top boundary
                            if (actionY < padding) {
                              actionY = padding;
                            }
                          }

                          return (
                            <React.Fragment key={combo.comboKey}>
                              {offsets.map((offset, index) => {
                                const offsetX = offset.fixedX
                                  ? 0
                                  : (30 + combo.stretch.x) * offset.col;
                                const offsetY = offset.fixedY
                                  ? 0
                                  : (30 + combo.stretch.y) * offset.row;

                                const dotX = combo.center.x + offsetX;
                                const dotY = combo.center.y + offsetY;

                                // Apply rotation to dot positions
                                const rotation = combo.rotation || 0;
                                const radians = (rotation * Math.PI) / 180;
                                const centerX = combo.center.x;
                                const centerY = combo.center.y;

                                // Rotate the offset around the center
                                const rotatedX =
                                  centerX +
                                  (offsetX * Math.cos(radians) -
                                    offsetY * Math.sin(radians));
                                const rotatedY =
                                  centerY +
                                  (offsetX * Math.sin(radians) +
                                    offsetY * Math.cos(radians));

                                // Ensure combo has a color, assign one if it doesn't
                                let dotColor = combo.color;
                                if (!dotColor) {
                                  const colors = [
                                    "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6",
                                    "#06B6D4", "#84CC16", "#F97316", "#3B82F6", "#FF6B6B",
                                    "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#8856f5"
                                  ];
                                  const colorIndex = (i + index) % colors.length;
                                  dotColor = colors[colorIndex];
                                  console.log(`Assigned fallback color ${dotColor} to combo ${combo.comboKey}`);
                                }

                                // console.log(`Rendering combo dot ${index} for combo ${combo.comboKey}, color:`, dotColor);

                                // Get dot size based on product mm size
                                const dotSize = getDotSize(combo.productData);

                                // Check if this is the first dot (index 0) to add four-directional lines
                                const isFirstDot = index === 0;
                                const lineLength = 15; // Length of lines
                                const lineWidth = 2; // Width of lines

                                // Calculate center point for first dot to center it in the cross
                                const dotCenterX = rotatedX + dotSize / 2;
                                const dotCenterY = rotatedY + dotSize / 2;

                                // console.log("********======>",combo?.productData);

                                const height = combo?.productData?.height !== null ? combo?.productData?.height : (combo?.productData?.flag !== undefined && combo?.productData?.flag !== null) ? 25 : dotSize;
                                const width = combo?.productData?.width !== null ? combo?.productData?.width : (combo?.productData?.flag !== undefined && combo?.productData?.flag !== null) ? 29 : dotSize;

                                const checkSingle = combo?.productData?.isSingle !== null && combo?.productData?.isSingle !== undefined && combo?.productData?.isSingle === true ? true : false;
                                const checkHorizontal = combo?.productData?.horizontal !== null && combo?.productData?.horizontal !== undefined && combo?.productData?.horizontal === true ? true : false;
                                const checkVeritical = combo?.productData?.vertical !== null && combo?.productData?.vertical !== undefined && combo?.productData?.vertical === true ? true : false;

                                const rotateAngel = checkHorizontal ? "rotate(0deg)" : checkVeritical ? "rotate(90deg)" : "rotate(0deg)"
                                // console.log(height,width);

                                return (
                                  <React.Fragment key={`${combo.comboKey}-${index}`}>
                                    {/* Dot - centered at intersection of lines for first dot */}

                                    {(combo?.productData?.imageUrl !== undefined && combo?.productData?.imageUrl !== null) ?
                                      (<img
                                        // src={AirFlowIconLogo}
                                        // src={singleLightsflagMap[combo?.productData?.flag]}
                                        src={combo?.productData?.imageUrl}
                                        alt="Light"
                                        className="combo-dot-image"
                                        style={{
                                          position: "absolute",
                                          left: isFirstDot ? `${dotCenterX}px` : `${rotatedX}px`,
                                          top: isFirstDot ? `${dotCenterY}px` : `${rotatedY}px`,
                                          // width: (combo?.productData?.flag !== undefined && combo?.productData?.flag !== null) ? `29px` : '15px',
                                          // height: (combo?.productData?.flag !== undefined && combo?.productData?.flag !== null) ? `25px` : '15px',
                                          width: `${width}px`,
                                          height: height !== null && height === 0 ? 'auto' : `${height}px`,
                                          transform: isFirstDot ? `translate(-50%, -50%) ${checkSingle && rotateAngel}` : "none",
                                          pointerEvents: "auto",
                                          cursor: index === 0 ? "pointer" : "default",
                                          zIndex: 2,
                                          display: "inline-block"
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();

                                          if (hiddenComboKeys.has(combo.comboKey) && index === 0) {
                                            setHiddenComboKeys((prev) => {
                                              const newSet = new Set(prev);
                                              newSet.delete(combo.comboKey);
                                              return newSet;
                                            });
                                          }

                                          setActiveKey(combo.comboKey);

                                          if (showActionButtons === false && index === 0) {
                                            setActiveComboKeys(prev => {
                                              const newSet = new Set(prev);
                                              newSet.add(combo.comboKey);
                                              return newSet;
                                            });
                                          }

                                        }}
                                      />) :
                                      (<div
                                        className="combo-dot"
                                        style={{
                                          left: isFirstDot ? `${dotCenterX}px` : `${rotatedX}px`,
                                          top: isFirstDot ? `${dotCenterY}px` : `${rotatedY}px`,
                                          position: "absolute",
                                          backgroundColor: dotColor,
                                          // width: `${dotSize}px`,
                                          // height: `${dotSize}px`,
                                          width: `${width}px`,
                                          height: height !== null && height === 0 ? 'auto' : `${height}px`,
                                          transform: isFirstDot ? "translate(-50%, -50%)" : "none",
                                          cursor: index === 0 ? "pointer" : "default",
                                          pointerEvents: "auto",
                                          display: "inline-block"
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // If toolbar is hidden, show it again
                                          if (hiddenComboKeys.has(combo.comboKey) && index === 0) {
                                            setHiddenComboKeys((prev) => {
                                              const newSet = new Set(prev);
                                              newSet.delete(combo.comboKey);
                                              return newSet;
                                            });
                                          }
                                          // Set as active combo
                                          setActiveKey(combo.comboKey);
                                          setActiveKey(combo.comboKey);

                                          if (showActionButtons === false && index === 0) {
                                            setActiveComboKeys(prev => {
                                              const newSet = new Set(prev);
                                              newSet.add(combo.comboKey);
                                              return newSet;
                                            });
                                          }

                                        }}
                                      />)
                                    }

                                    {/* <div
                                      className="combo-dot"
                                      style={{
                                        left: isFirstDot ? `${dotCenterX}px` : `${rotatedX}px`,
                                        top: isFirstDot ? `${dotCenterY}px` : `${rotatedY}px`,
                                        position: "absolute",
                                        backgroundColor: dotColor,
                                        width: `${dotSize}px`,
                                        height: `${dotSize}px`,
                                        transform: isFirstDot ? "translate(-50%, -50%)" : "none",
                                        cursor: "pointer",
                                        pointerEvents: "auto",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // If toolbar is hidden, show it again
                                        if (hiddenComboKeys.has(combo.comboKey)) {
                                          setHiddenComboKeys((prev) => {
                                            const newSet = new Set(prev);
                                            newSet.delete(combo.comboKey);
                                            return newSet;
                                          });
                                        }
                                        // Set as active combo
                                        setActiveKey(combo.comboKey);
                                      }}
                                    /> */}

                                    {/* <img
                                      src={AirFlowIconLogo}
                                      alt="Light"
                                      className="combo-dot-image"
                                      style={{
                                        position: "absolute",
                                        left: isFirstDot ? `${dotCenterX}px` : `${rotatedX}px`,
                                        top: isFirstDot ? `${dotCenterY}px` : `${rotatedY}px`,
                                        // width: `${dotSize}px`,
                                        // height: `${dotSize}px`,
                                        width: `24px`,
                                        height: `24px`,
                                        transform: isFirstDot ? "translate(-50%, -50%)" : "none",
                                        pointerEvents: "auto",
                                        cursor: "pointer",
                                        zIndex: 2,
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveKey(combo.comboKey);
                                      }}
                                    /> */}

                                    {/* Add 4 directional lines for the first dot - dot centered in cross */}
                                    {isFirstDot && combo?.productData?.quantity > 1 && (combo?.productData?.isSingle === undefined || combo?.productData?.isSingle === null) && (
                                      <>
                                        {/* Up line - 2px wide, 10px tall, positioned above center */}
                                        <div
                                          style={{
                                            position: "absolute",
                                            left: `${dotCenterX}px`,
                                            top: `${dotCenterY - lineLength}px`,
                                            width: `${lineWidth}px`,
                                            height: `${lineLength}px`,
                                            backgroundColor: "black",
                                            transform: "translateX(-50%)",
                                            zIndex: 1,
                                            borderRadius: "1px",
                                          }}
                                        />
                                        {/* Down line - 2px wide, 10px tall, positioned below center */}
                                        <div
                                          style={{
                                            position: "absolute",
                                            left: `${dotCenterX}px`,
                                            top: `${dotCenterY}px`,
                                            width: `${lineWidth}px`,
                                            height: `${lineLength}px`,
                                            backgroundColor: "black",
                                            transform: "translateX(-50%)",
                                            zIndex: 1,
                                            borderRadius: "1px",
                                          }}
                                        />
                                        {/* Left line - 10px wide, 2px tall, positioned to left of center */}
                                        <div
                                          style={{
                                            position: "absolute",
                                            left: `${dotCenterX - lineLength}px`,
                                            top: `${dotCenterY}px`,
                                            width: `${lineLength}px`,
                                            height: `${lineWidth}px`,
                                            backgroundColor: "black",
                                            transform: "translateY(-50%)",
                                            zIndex: 1,
                                            borderRadius: "1px",
                                          }}
                                        />
                                        {/* Right line - 10px wide, 2px tall, positioned to right of center */}
                                        <div
                                          style={{
                                            position: "absolute",
                                            left: `${dotCenterX}px`,
                                            top: `${dotCenterY}px`,
                                            width: `${lineLength}px`,
                                            height: `${lineWidth}px`,
                                            backgroundColor: "black",
                                            transform: "translateY(-50%)",
                                            zIndex: 1,
                                            borderRadius: "1px",
                                          }}
                                        />
                                      </>
                                    )}
                                  </React.Fragment>
                                );
                              })}

                              {/* {console.log(showActionButtons && !hiddenComboKeys.has(combo.comboKey), !showActionButtons && activeComboKeys.has(combo.comboKey), activeComboKeys, combo.comboKey)} */}

                              {(showActionButtons && !hiddenComboKeys.has(combo.comboKey) || (!showActionButtons && activeComboKeys.has(combo.comboKey))) && (
                                <div
                                  ref={actionRef}
                                  className="action-container"
                                  style={{
                                    position: "absolute",
                                    left: `${actionX}px`,
                                    top: `${actionY}px`,
                                    display: "flex",
                                    gap: "6px",
                                  }}
                                >
                                  <div
                                    className="drag-handle"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setIsPanningEnabled(false); // Lock canvas when dragging
                                      const rect =
                                        imageRef.current.getBoundingClientRect();
                                      const startOffsetX =
                                        e.clientX - rect.left - combo.center.x;
                                      const startOffsetY =
                                        e.clientY - rect.top - combo.center.y;

                                      setIsDraggingGroup(true);

                                      const onMove = (ev) => {
                                        const newX =
                                          ev.clientX - rect.left - startOffsetX;
                                        const newY =
                                          ev.clientY - rect.top - startOffsetY;
                                        updateCombo(combo.comboKey, {
                                          center: { x: newX, y: newY },
                                        });
                                      };

                                      const onUp = () => {
                                        window.removeEventListener(
                                          "mousemove",
                                          onMove
                                        );
                                        window.removeEventListener(
                                          "mouseup",
                                          onUp
                                        );
                                        setIsDraggingGroup(false);
                                      };

                                      window.addEventListener(
                                        "mousemove",
                                        onMove
                                      );
                                      window.addEventListener("mouseup", onUp);
                                    }}
                                    title="Move"
                                  >
                                    <PanToolIcon style={{ fontSize: 16, color: 'white' }} />
                                  </div>

                                  <div
                                    className="stretch-handle"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      setIsPanningEnabled(false); // Lock canvas when stretching
                                      const rect =
                                        imageRef.current.getBoundingClientRect();
                                      const startOffsetX =
                                        e.clientX -
                                        rect.left -
                                        (combo.center.x + combo.stretch.x);
                                      const startOffsetY =
                                        e.clientY -
                                        rect.top -
                                        (combo.center.y + combo.stretch.y);

                                      setIsDraggingGroup(true);

                                      const onMove = (ev) => {
                                        const mouseX =
                                          ev.clientX -
                                          rect.left -
                                          combo.center.x -
                                          startOffsetX;
                                        const mouseY =
                                          ev.clientY -
                                          rect.top -
                                          combo.center.y -
                                          startOffsetY;

                                        const newStretch = {
                                          x: Math.max(2, mouseX),
                                          y: Math.max(2, mouseY),
                                        };
                                        updateCombo(combo.comboKey, {
                                          stretch: newStretch,
                                        });
                                      };

                                      const onUp = () => {
                                        window.removeEventListener(
                                          "mousemove",
                                          onMove
                                        );
                                        window.removeEventListener(
                                          "mouseup",
                                          onUp
                                        );
                                        setIsDraggingGroup(false);
                                      };

                                      window.addEventListener(
                                        "mousemove",
                                        onMove
                                      );
                                      window.addEventListener("mouseup", onUp);
                                    }}
                                    title="Stretch"
                                  >
                                    <svg
                                      className="four-direction-arrow"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                      fill="white"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      {/* Central circle */}
                                      <circle cx="8" cy="8" r="1.5" fill="white" />
                                      {/* Horizontal line - left to right */}
                                      <line x1="2" y1="8" x2="14" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                      {/* Vertical line - top to bottom */}
                                      <line x1="8" y1="2" x2="8" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                      {/* Up arrow - larger triangle */}
                                      <path d="M 8 0.5 L 5 4.5 L 11 4.5 Z" fill="white" />
                                      {/* Down arrow - larger triangle */}
                                      <path d="M 8 15.5 L 5 11.5 L 11 11.5 Z" fill="white" />
                                      {/* Left arrow - larger triangle */}
                                      <path d="M 0.5 8 L 4.5 5 L 4.5 11 Z" fill="white" />
                                      {/* Right arrow - larger triangle */}
                                      <path d="M 15.5 8 L 11.5 5 L 11.5 11 Z" fill="white" />
                                    </svg>
                                  </div>

                                  <button
                                    className="copy-button"
                                    onClick={() => {
                                      setIsPanningEnabled(false); // Lock canvas when copying
                                      copyCombo(combo.comboKey);

                                      // if (showActionButtons === false) {
                                      //   console.log("Adding to active combo keys:", combo.comboKey);
                                      //   setActiveComboKeys(prev => {
                                      //     const newSet = new Set(prev);
                                      //     newSet.add(combo.comboKey);
                                      //     return newSet;
                                      //   });
                                      // }
                                    }}
                                    title="Copy"
                                  >
                                    <ContentCopyIcon style={{ fontSize: 16, color: 'white' }} />
                                  </button>

                                  <button
                                    className="change-product-button"
                                    onClick={() => {
                                      setIsPanningEnabled(false); // Lock canvas when changing product
                                      handleProductChange(combo.comboKey);
                                    }}
                                    title="Edit"
                                  >
                                    <EditIcon style={{ fontSize: 16, color: 'white' }} />
                                  </button>

                                  <button
                                    className="delete-button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsPanningEnabled(false); // Lock canvas when deleting
                                      removeCombo(combo.comboKey);
                                    }}
                                    title="Delete"
                                  >
                                    ✕
                                  </button>

                                  <button
                                    className="hide-actions-button"
                                    onClick={() => {
                                      setHiddenComboKeys((prev) => {
                                        const newSet = new Set(prev);
                                        newSet.add(combo.comboKey);
                                        return newSet;
                                      });

                                      if (showActionButtons === false) {
                                        setActiveComboKeys((prev) => {
                                          const newSet = new Set(prev);
                                          newSet.delete(combo.comboKey);
                                          return newSet;
                                        });
                                      }

                                    }}
                                    title="Hide"
                                  >
                                    <VisibilityOffIcon style={{ fontSize: 16, color: 'white' }} />
                                  </button>
                                </div>
                              )}
                            </React.Fragment>
                          );
                        })}
                  </div>
                )}
              </TransformComponent>
            </TransformWrapper>
            {/* Right-side vertical tools */}
            <div className="right-tools">
              <div className="tool-btn-wrapper">
                <button
                  className="tool-btn"
                  title={isGridBlockClicked ? "Hide Grid Overlay" : "Show Grid Overlay"}
                  onClick={handleLightbulbClick}
                >
                  {isGridBlockClicked ? <GridOnIcon /> : <GridOffIcon />}
                </button>
                <span className="tool-btn-label">Grid</span>
              </div>
              {/* <div className="tool-btn-wrapper">
                <button
                  className="tool-btn"
                  title="Zoom In"
                  onClick={() => {
                    if (zoomRef.current) {
                      zoomRef.current.zoomIn();
                    }
                  }}
                >
                  +
                </button>
                <span className="tool-btn-label">Enlarge</span>
              </div>
              <div className="tool-btn-wrapper">
                <button
                  className="tool-btn"
                  title="Zoom Out"
                  onClick={() => {
                    if (zoomRef.current) {
                      zoomRef.current.zoomOut();
                    }
                  }}
                >
                  −
                </button>
                <span className="tool-btn-label">Reduce</span>
              </div> */}
              <div className="tool-btn-wrapper">
                <button
                  className="tool-btn"
                  title="Reset Zoom"
                  onClick={() => {
                    if (zoomRef.current) {
                      zoomRef.current.resetTransform();
                    }
                  }}
                >
                  ⌂
                </button>
                <span className="tool-btn-label">Fit page</span>
              </div>
              <div className="tool-btn-wrapper">
                <button
                  className="tool-btn"
                  title={isPanningEnabled ? "Fix Main (Lock)" : "Enable Move"}
                  onClick={() => setIsPanningEnabled((prev) => !prev)}
                >
                  {!isPanningEnabled ? "🔒" : "🔓"}
                </button>
                <span className="tool-btn-label">
                  {/* Enable Move */}
                  {isPanningEnabled ? "Fix Main (Lock)" : "Enable Move"}
                </span>
              </div>
              <div className="tool-btn-wrapper">
                <button
                  className="tool-btn"
                  title={showActionButtons ? "Hide Action Buttons" : "Show Action Buttons"}
                  onClick={() => {
                    // console.log("Toggling action buttons. Current state:", layo);
                    const allProducts = JSON.parse(localStorage.getItem("savedCombos")) || [];

                    if (allProducts?.length === 0) return;

                    const newValue = !showActionButtons;
                    setShowActionButtons(newValue);
                    // When showing action buttons, clear all individually hidden toolbars
                    if (newValue) {
                      setHiddenComboKeys(new Set());
                    }

                    const latestProduct = allProducts?.reduce((latest, item) =>
                      item?.productData?.createdAt > latest?.productData?.createdAt ? item : latest
                    );

                    // console.log("LATEST", latestProduct);

                    setActiveComboKeys(prev => {
                      const newSet = new Set();
                      newSet.add(latestProduct?.comboKey);
                      return newSet;
                    });

                  }}
                >
                  {showActionButtons ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </button>
                <span className="tool-btn-label">Hide/View all icons</span>
              </div>
            </div>
          </div>

          {/* previous */}
          {/* {showPopup && finalSelection && isShown && currentKey !== null && (actualBox !== null && actualBox?.height > 0 && actualBox?.width > 0) && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 999,
                overflowY: "auto",
                padding: "20px",
              }}
              className="selection-popup"
            >
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  width: "360px",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  padding: "16px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                  animation: "fadeIn 0.25s ease",
                }}
              >
                <div style={{ marginBottom: "15px" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                    💡 Light Planning
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#666" }}>
                    Auto-calculated based on selected area
                  </p>
                </div>

                {(() => {
                  const data = calculateLights(finalSelection);

                  const cardStyle = {
                    background: "#f8fafc",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    marginBottom: "8px",
                  };

                  return (
                    <div>
                      <div style={cardStyle}>
                        <span>Area</span>
                        <strong>{data.area}px²</strong>
                      </div>

                      <div style={cardStyle}>
                        <span>Light Size</span>
                        <strong>
                          {data.lightWidth}px × {data.lightHeight}px
                        </strong>
                      </div>
                    </div>
                  );
                })()}

                <div
                  style={{
                    height: "1px",
                    background: "#eee",
                    margin: "15px 0",
                  }}
                />

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => {
                      placeLightsInSelection();
                    }}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#2563eb",
                      color: "#fff",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Apply
                  </button>

                  <button
                    onClick={() => {
                      setShowPopup(false);
                      setFinalSelection(null);
                      setSelectionBox(null);
                    }}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )} */}
        </div>
        <>
          <div style={{ display: !analyzedCriteria?.isAnalyzed ? "none" : "" }} className="col-md-4 sidebar-open sidebar-block-area">
            <Sidebar
              contentClassName="contentClassName11"
              overlayClassName="overlayClassName11"
              rootClassName="rootClassName11"
              sidebarClassName={`sidebarClassName11 sidebar-with-zoomIn`}
              rootId="root-id11"
              sidebarId="sidebarId11"
              contentId="contentId11"
              // children="lights"
              sidebar={
                <div className="sidebar-block-content">
                  {/* <div style={{ padding: "15px", borderBottom: "1px solid #e0e0e0" }}>
                    <button
                      onClick={handleBackToHome}
                      style={{
                        background: "transparent",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        fontSize: "16px",
                        color: "#5cb226",
                        fontWeight: "500"
                      }}
                    >
                      <img src={backArraow} alt="Back" style={{ width: "16px", height: "16px" }} />
                      Back to Home
                    </button>
                  </div> */}
                  <LightPlacementComponent
                    onUpdateLights={updateLights}
                    categoryId={null}
                    nodeId={null}
                    selectedLight={null}
                    onSendMessage={handleMessage}
                    setShowLightPlacementComp={setShowLightPlacementComp}
                    setIsSelect={setIsSelect}
                    isReduce={false}
                    aiData={analyzedCriteria?.analyzedData}
                  />
                </div>
              }
              open={true}
              onSetOpen={() => { }}
              styles={{
                sidebar: {
                  background: "white",
                  width: "443px",
                  zIndex: 100,
                  position: "fixed",
                  left: 0,
                  top: "95px",
                  bottom: "0",
                  height: "calc(100vh - 95px)",
                  overflowY: "auto",
                },
                overlay: {
                  backgroundColor: "transparent",
                },
              }}
              pullRight={false}
            >
              <div />
            </Sidebar>
          </div>
        </>
      </div>

      {/* AI Analyse Popup */}
      {showPointsPopup && (
        <div className="orientation-popup-overlay">
          <div style={s.popupContainer} onClick={(e) => e.stopPropagation()}>

            <div style={s.popupHeader}>
              <h3 style={{ margin: 0 }}>Enter real-world distance</h3>
              <button
                onClick={() => { resetPoints(); setShowPointsPopup(false); }}
                style={{ background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            {/* SCROLLABLE CONTENT */}
            <div style={s.popupContent}>
              <h5 className="mb-4">
                What is the actual distance between the two points you clicked?
              </h5>

              <input
                style={s.input}
                type="number"
                min="0.1"
                step="0.1"
                placeholder="Distance in cm (e.g. 300)"
                value={cmInput}
                onChange={(e) => { setCmInput(e.target.value); setAiError(null); }}
                disabled={result != null}
                onWheel={(e) => e.target.blur()}
                onKeyDown={(e) => e.key === " " && e.preventDefault()}
                autoFocus
              />

              {aiError && <p style={s.error}>{aiError}</p>}

              {result && (
                <div style={s.resultCard}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#1e40af", marginBottom: 12 }}>
                    Scale analysis results
                  </div>

                  <div style={s.metricGrid}>
                    {[
                      ["Pixels / cm", parseFloat(result.pixelsPerCm).toFixed(1)],
                      ["Pixel distance", `${result.pixelDist} px`],
                      ["Real distance", `${result.cm} cm`],
                    ].map(([label, val]) => (
                      <div key={label} style={s.metricCard}>
                        <div style={s.metricLabel}>{label}</div>
                        <div style={s.metricValue()}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {result.floor_area_m2 != null && (
                    <>
                      <div style={s.sectionLabel}>Floor plan area & light coverage</div>

                      <div style={s.metricGrid}>
                        {[
                          ["Floor width", `${(result.floor_width_cm / 100).toFixed(2)} m`],
                          ["Floor height", `${(result.floor_height_cm / 100).toFixed(2)} m`],
                          ["Total floor area", `${result.floor_area_m2.toFixed(2)} m²`],
                        ].map(([label, val]) => (
                          <div key={label} style={s.metricCard}>
                            <div style={s.metricLabel}>{label}</div>
                            <div style={s.metricValue(18)}>{val}</div>
                          </div>
                        ))}
                      </div>

                      {/* <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>
                        Coverage of 1 light fixture on this floor plan
                      </div>

                      <div style={s.coverageBarWrap}>
                        <div style={s.coverageBarFill(result.coverage_percent)} />
                      </div> */}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* FOOTER (fixed) */}
            <div style={s.popupFooter}>

              {!result && (
                <div style={s.btnRow}>
                  <button style={s.btnSecondary} onClick={() => { resetPoints(); setShowPointsPopup(false); }}>
                    Cancel
                  </button>
                  <button style={s.btnPrimary} onClick={analyzeWithClaude}>
                    {aiLoader ? "Analyzing..." : "Analyze"}
                  </button>
                </div>
              )}

              {/* {result ?
                <div style={s.btnRow}>
                  <button style={s.btnPrimary} onClick={completeAI}>
                    Move to Light Placements
                  </button>
                </div>
                :
                <div style={s.btnRow}>
                  <button style={s.btnSecondary} onClick={() => { resetPoints(); setShowPointsPopup(false); }}>
                    Cancel
                  </button>
                  <button style={s.btnPrimary} onClick={analyzeWithClaude}>
                    {aiLoader ? "Analyzing..." : "Analyze"}
                  </button>
                </div>
              } */}

            </div>

          </div>
        </div>
      )}

      {/* Orientation Selection Popup */}
      {showOrientationPopup && (
        <div
          className="orientation-popup-overlay"
          onClick={() => {
            setShowOrientationPopup(false);
            setPendingProductData(null);
          }}
        >
          <div className="orientation-popup" onClick={(e) => e.stopPropagation()}>
            <div className="orientation-popup-header">
              <h3>Choose Light Orientation</h3>
              <button
                className="orientation-popup-close"
                onClick={() => {
                  setShowOrientationPopup(false);
                  setPendingProductData(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="orientation-popup-content">
              <p>Select the orientation for {pendingProductData?.quantity || ''} lights:</p>
              <div className="orientation-buttons">
                <button
                  className="orientation-btn vertical-btn"
                  onClick={() => handleOrientationSelection("vertical")}
                >
                  <div className="orientation-icon-container">
                    <div className="orientation-icon vertical-icon"></div>
                  </div>
                  <span>Vertical</span>
                </button>
                <button
                  className="orientation-btn horizontal-btn"
                  onClick={() => handleOrientationSelection("horizontal")}
                >
                  <div className="orientation-icon-container">
                    <div className="orientation-icon horizontal-icon"></div>
                  </div>
                  <span>Horizontal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Product Popup */}
      {showChangeProductPopup && (
        <div
          className="orientation-popup-overlay"
          onClick={() => {
            setShowChangeProductPopup(false);
            setComboToChangeProduct(null);
          }}
        >
          <div className="change-product-popup" onClick={(e) => e.stopPropagation()}>
            <div className="orientation-popup-header">
              <h3>Change Product</h3>
              <button
                className="orientation-popup-close"
                onClick={() => {
                  setShowChangeProductPopup(false);
                  setComboToChangeProduct(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="change-product-popup-content sidebar-block-content">
              <LightPlacementComponent
                key={`change-product-${comboToChangeProduct}-${changeProductPopupKey}`}
                onUpdateLights={updateLights}
                categoryId={null}
                nodeId={null}
                selectedLight={null}
                onSendMessage={handleMessage}
                setShowLightPlacementComp={setShowLightPlacementComp}
                isEditMode={true}
                setIsSelect={setIsSelect}
                isReduce={false}
                aiData={analyzedCriteria?.analyzedData}
              />
            </div>
          </div>
        </div>
      )}

      {/* <div className="greenhse-logo-estimate">
        <img src={greenhscLogo} alt="greenhse-logo" />
      </div> */}
    </div>
  );
}
