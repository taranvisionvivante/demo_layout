import React, { useEffect, useState, useRef } from "react";
import Header from "../header/Index";
import "./Index.css";
import { useNavigate, useLocation } from "react-router-dom";
import backArraow from "../../assets/img/back_arrow.svg";
import { getAllEstimates, getFileById, GetScreenShot } from "../../IndexedDB.jsx";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CloseIcon from "@mui/icons-material/Close";
import hamburger from "../../assets/img/hamburgergroup.svg";
import PrintIcon from "@mui/icons-material/Print";
import EmailIcon from "@mui/icons-material/Email";
import html2canvas from "html2canvas";
import {
  Modal,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { SmtpEmailApi } from "../../actions/estimateAction.jsx";
import toast, { Toaster } from "react-hot-toast";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import { jsPDF } from "jspdf";
import { PDFDocument, rgb } from "pdf-lib";
import { DataLoading, OldSpinnerLoader } from "../../loader/Index.jsx";
import greenhscLogo from "../../assets/img/greenhse-logo.png";
import homeLogo from "../../assets/img/homelogo.png"
import { greenhseBaseUrl } from "../config/config.jsx";
import greeHseLogo from "../../assets/img/greenhse-logo.png";
import Tooltip from "@mui/material/Tooltip";
import printJS from "print-js";
// import greeHseSVG from "../../assets/img/greenhse-logo-small.png"
// import { loadLogo, convertSVGToPNG } from "../../utilities/helpers/commonHelper.js"

const EstimateView = () => {
  // State variables to manage the component's state
  const [headerText, setHeaderText] = useState("Price Calculator");
  const [isCleared, setIsCleared] = useState(false);

  const [headerSaveText, setHeaderSaveText] = useState("Done");
  const [estimates, setEstimates] = useState({
    lightPlacement: [],
    documentsForDownload: [],
  });
  const [showHamburgerBlock, setShowHamburgerBlock] = useState(false);
  const [openEmailPopup, setOpenEmailPopup] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [screenShotBase64, setScreenShotBase64] = useState("");
  const [downloadDocument, setDownloadDocument] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageId, setCurrentImageId] = useState(null);
  const [selectedProductcomp, setselectedProductComp] = useState([]);
  const [lightPlacementPositions, setLightPlacementPositions] = useState([]);
  const [savedCombos, setSavedCombos] = useState([]);
  const savedId = JSON.parse(localStorage.getItem("savedDesign"));
  const canvasRef = useRef(null);

  const [emailParams, setEmailParams] = useState({
    submit: "true",
    name: "",
    email: "",
    subject: "",
    message: "",
    file: "",
    // env: true
  });
  const [openSharePopup, setOpenSharePopup] = useState(false);
  const [shareFormData, setShareFormData] = useState({
    submit: "true",
    name: "",
    email: "",
    phoneNumber: "",
    attachment: "",
    subject: "",
    message: "",
    admin: "true",
    env: true,
  });

  // Hooks for location, navigation and references
  const location = useLocation();
  const navigate = useNavigate();
  const ref = useRef();
  const myFileRef = useRef(null);
  const fetchEstimates = async () => {
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file") || localStorage.getItem("currentFileName");


    if (!fileName) return;

    const fileNameAfterURLDecode = decodeURIComponent(fileName);
    console.log("fileNameAfterURLDecode", fileNameAfterURLDecode);

    try {
      const data = await getAllEstimates(fileNameAfterURLDecode);

      // Ensure both properties exist
      setEstimates({
        lightPlacement: data?.lightPlacement || [],
        documentsForDownload: data?.documentsForDownload || [],
      });

      console.log("estimates", data);
    } catch (error) {
      console.error("Failed to fetch estimates:", error);
      setEstimates({
        lightPlacement: [],
        documentsForDownload: [],
      });
    }
  };

  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]); // Extract base64 part only
      };
      reader.onerror = (error) => {
        console.error("Error reading blob:", error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  };
  const fetchBlobFromUrl = async (url) => {
    console.log("Fetching Blob from URL:", url); // Log the URL being fetched
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob from URL: ${url}`);
      }
      return await response.blob();
    } catch (error) {
      console.error("Error fetching blob from URL:", error);
      throw error;
    }
  };

  console.log("downloadDocument", downloadDocument);
  // Initial fetch of estimates when component mounts and cleanup
  useEffect(() => {
    setAttachmentName("Attachment_" + Date.now() + ".pdf");
    fetchEstimates();
    localStorage.removeItem("isGridEnable");
  }, []);

  const selectedProduct = location.state;

  useEffect(() => {
    //  Use navigation state first
    if (location.state) {
      const stateData = location.state;
      const lightsFromState = Array.isArray(stateData.lights?.selectedProduct)
        ? stateData.lights.selectedProduct
        : stateData.lights?.selectedProduct
          ? [stateData.lights.selectedProduct]
          : [];

      setEstimates({
        lightPlacement: lightsFromState.map((light) => ({
          selectedProductList: light,
        })),
        documentsForDownload: stateData.documentsForDownload || [],
      });
      setSelectedFile(stateData); // optional, if you need reference
      return;
    }

    const savedData = localStorage.getItem("savedLightingLayout");
    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");

    if (savedData) {
      const file = JSON.parse(savedData);
      const currentImageId = Object.keys(layouts)[0]; // or get from URL if needed
      const layoutData = layouts[currentImageId];

      const lightsFromLayout = layoutData?.lights?.selectedProduct || [];
      const lightsFromSaved = Array.isArray(file.lights?.selectedProduct)
        ? file.lights.selectedProduct
        : [];

      const mergedLights = lightsFromLayout.length
        ? lightsFromLayout
        : lightsFromSaved;

      setEstimates({
        lightPlacement: mergedLights.map((p) => ({ selectedProductList: p })),
        documentsForDownload: file.documentsForDownload || [],
      });
      setSelectedFile(file);
      return;
    }

    // Fallback: fetch from IndexedDB
    fetchEstimates();
  }, [location.state]);

  const handleBackToHome = () => {
    // Get the file name from state to navigate back to edit view with same state
    const stateData = location.state;
    const fileId = stateData?.currentImageId;

    if (fileId) {
      // Navigate to edit view with the file parameter to show the same state
      navigate(`/editview?file=${encodeURIComponent(fileId)}`);
    } else {
      // Fallback to previous page if no file ID in state
      navigate(-1);
    }
  };

  const backclick = () => {
    if (!isCleared) {
      const savedData = localStorage.getItem("savedLightingLayout");
      if (savedData) {
        const file = JSON.parse(savedData);
        localStorage.setItem("savedLightingLayout", JSON.stringify(file));
      }

      if (screenShotBase64 && currentImageId) {
        const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
        layouts[currentImageId] = { editedImage: screenShotBase64 };
        localStorage.setItem("layouts", JSON.stringify(layouts));
      }
    } else {
      // When cleared — remove all related data
      localStorage.removeItem("savedLightingLayout");
      localStorage.removeItem("layouts");
    }
    navigate(-1);
  };


  const calculateTotal = (products = selectedProductcomp) => {
    if (!products || !products.length) return 0;
    return products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  const calculateDiscount = (totalAmount) => {
    const discountRate = 0.2;
    const discountAmount = totalAmount * discountRate;
    return discountAmount.toFixed(2);
  };

  const calculateNewTotal = (subtotal, discountAmount) => {
    const discountedSubtotal = subtotal - discountAmount;
    return discountedSubtotal.toFixed(2);
  };

  const calculateFinalAmountWithGST = (products = selectedProductcomp, discountRate = 0.2, gstRate) => {
    if (!products || !products.length) return 0;

    const subtotal = products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );

    const discountAmount = subtotal * discountRate;

    const discountedSubtotal = subtotal - discountAmount;

    const gstAmount = discountedSubtotal * gstRate;

    const finalTotal = discountedSubtotal + gstAmount;

    return finalTotal.toFixed(2);
  };


  // Calculate the GST (Goods and Services Tax) for the given total amount
  const calculateGST = (totalAmount = selectedProductcomp) => {
    return (totalAmount * 0.1).toFixed(2); //  GST rate is 10%
  };

  // Get the total amount including GST
  const getTotalWithGST = (totalAmount = selectedProductcomp) => {
    return (totalAmount + parseFloat(calculateGST(totalAmount))).toFixed(2);
  };

  // Toggle the visibility of the hamburger block
  const toggleHamburgerBlock = () => {
    setShowHamburgerBlock(!showHamburgerBlock);
  };

  // Get distinct records based on the SKU of the selected products
  const GetDistinctRecord = (data) => {
    const uniqueTags = [];
    const uniqueResultList = [];
    data.map((light) => {
      if (uniqueTags.indexOf(light.selectedProductList.sku) === -1) {
        uniqueTags.push(light.selectedProductList.sku);
        uniqueResultList.push(light);
      }
    });

    return uniqueResultList;
  };

  // Get the quantity of a product based on its SKU
  const GetProductQTY = (data, sku) => {
    var result = data.filter((x) => x.selectedProductList.sku == sku);
    // console.log("result", result)
    var qty = 0;

    result.forEach((value, idx) => {
      qty += value.selectedProductList.quantity;
    });
    return qty;
  };

  // Flatten the selected product lists from the estimates
  const allProducts = estimates.lightPlacement?.map(light => light.selectedProductList) || [];


  // Update the hidden input with the screenshot's base64 data
  useEffect(() => {
    if (screenShotBase64) {
      const dataUrlInput = document.querySelector("#dataUrlInput");
      if (dataUrlInput) {
        dataUrlInput.value = screenShotBase64;
      }
    }
  }, [screenShotBase64]);

  // Capture a screenshot of the estimate content block
  const estimateScreenshot = () => {
    return new Promise((resolve, reject) => {
      const element = document.querySelector("#estimate-content-block");

      if (!element) {
        console.error(
          'Element with class "estimate-content-block" not found or is invalid.'
        );
        return;
      }

      html2canvas(element)
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          setScreenShotBase64(imgData);
          resolve(imgData);
        })
        .catch((error) => {
          // console.error('Error capturing screenshot:', error);
          reject(error);
        });
    });
  };

  //handle base url
  const currentHost = window.location.hostname;

  const baseUrl = (currentHost === 'localhost' || currentHost.startsWith('127.')) ? 'https://greenhse.visionvivante.in' : window.location.origin;

  const savedDesign = async (formdata) => {
    const imgUrl = greenhseBaseUrl + `index.php?type=updatesaved`;
    try {
      const data = {
        uuid: savedId,
        first_name: formdata?.name,
        last_name: formdata?.name,
        email: formdata?.email,
      };

      const response = await fetch(imgUrl, {
        method: 'POST',
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();

      if (result?.error) {
        setIsLoading(false);
      }
    } catch (error) {
      console.log("log", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sending an email with the estimate screenshot attached
  const handleSendEmail = async () => {
    const { name, email, subject, message } = emailParams;
    if (!email) {
      toast.error("Please provide an email address");
      return;
    }

    setIsLoading(true); // Show the loader

    const fileData = await getFileById(savedId);

    const ext = fileData?.file?.type?.split("/")[1] || "file";
    const url = `${baseUrl}/editview?file=${fileData?.uid}.${ext}`;

    const clientMessage = `Dear ${email},

        <div style="margin-top: 15px; padding: 0;">
           <p style="margin-top: 15px; margin-bottom: 0px;">Thank you for considering Greenhse for your lighting needs.</p>
  
           <p style="margin-top: 0; margin-bottom: 0px; ">If you require a quote, please send a quote request to sales@greenhse.com. Please include your
             lighting layout - this can also be done on the GH Lighting layout app.</p>
  
           <p style="margin-top: 0; margin-bottom: 0px; font-weight:bold">50% DEPOSIT IS REQUIRED TO SECURE ORDER. PAYMENT IS REQUIRED BEFORE DELIVERY/COLLECTION.</p>
        
           <span style="margin-top: 20px;">
             <p style="font-weight:bold;">Best regards,</p>
             <p style="margin: 0;">The Greenhse Team</p>
             <p style="margin: 0;">www.greenhse.com</p>
             <p style="margin: 0;">Sales@greenhse.com</p>
             <p style="margin: 0;">08929729696</p>
           </span>
           <div style="margin-top: 20px;">
             <a href=${url}
              style="
               display: inline-block;
               padding: 12px 12px;
               background-color: #00bd00;
               color: #ffffff;
               text-decoration: none;
               border-radius: 4px;
               font-size: 14px;
               font-weight: 600;
               "
              >
              View Detail
             </a>
           </div>
        </div>`;

    try {
      const screenshot = await estimateScreenshot();
      const formdata = new FormData();
      formdata.append("submit", "true");
      formdata.append("name", email);
      formdata.append("email", email);
      formdata.append("subject", "Greenhse Estimate Document Notification");
      formdata.append("message", clientMessage);
      formdata.append("file", screenShotBase64);

      const requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
      };

      const response = await SmtpEmailApi(requestOptions);
      // console.log("apiresponse", response)
      if (response.status === true) {
        await savedDesign({ name: name ?? email, email: email });
        toast.success("Email sent successfully!");
        setTimeout(() => {
          handleEmailPopupClose();
        }, 2000);
      } else {
        toast.error("Failed to send email");
      }
    } catch (error) {
      // toast.error('Failed to capture screenshot.');
      // console.error('Failed to capture screenshot:', error);
    } finally {
      setIsLoading(false); // Hide the loader
    }
  };

  // Handle input changes in the email requesting Quote form
  const handleShareInputChange = (e, field) => {
    if (field === "attachment") {
      setShareFormData({
        ...shareFormData,
        [field]: e.target.files[0],
      });
    } else {
      setShareFormData({
        ...shareFormData,
        [field]: e.target.value,
      });
    }
  };

  // Combines an array of base64-encoded images into a single PDF document.
  const combineBase64DocumentsToPdf = async (base64Documents) => {
    const pdfDoc = await PDFDocument.create();
    // const logoDataUrl = await convertSVGToPNG(greeHseSVG);

    for (const base64 of base64Documents) {
      try {
        // Decode base64 to binary data
        const imageBytes = Uint8Array.from(atob(base64), (c) =>
          c.charCodeAt(0)
        );

        // Embed the image
        const image = await pdfDoc.embedPng(imageBytes); // Use embedJpg if working with JPGs
        const { width: imgWidth, height: imgHeight } = image.size();

        // Create a page with the same aspect ratio as the image
        const page = pdfDoc.addPage();
        const { width: pageWidth, height: pageHeight } = page.getSize();

        const scaleX = pageWidth / imgWidth;
        const scaleY = pageHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY);

        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        const xOffset = (pageWidth - scaledWidth) / 2;
        const yOffset = (pageHeight - scaledHeight) / 2;
        // Draw the image on the page centered
        page.drawImage(image, {
          x: xOffset,
          y: yOffset,
          width: scaledWidth,
          height: scaledHeight,
        });
      } catch (error) {
        console.error("Error processing image for PDF:", error);
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  };

  const pdfBlobToFile = (blob, fileName) => {
    return new File([blob], fileName, { type: "application/pdf" });
  };

  const handleSendShareEmail = async () => {
    setIsLoading(true); // Show the loader
    const { name, email, phoneNumber, message, env } = shareFormData;
    const { documentsForDownload } = estimates;

    const base64Documents = [];

    for (const doc of documentsForDownload) {
      if (typeof doc.finalImage === "string") {
        if (doc.finalImage.startsWith("data:")) {
          const base64 = doc.finalImage.split(",")[1];
          base64Documents.push(base64);
        } else if (doc.finalImage.startsWith("blob:")) {
          try {
            const blob = await fetchBlobFromUrl(doc.finalImage);
            const base64 = await convertBlobToBase64(blob);
            console.log("check blob!!!!", base64);
            base64Documents.push(base64);
          } catch (error) {
            console.error("Error processing Blob URL:", error);
          }
        } else {
          console.warn("Unsupported format or type:", doc.finalImage);
        }
      } else {
        console.warn("Unsupported format or type:", doc.finalImage);
      }
    }

    let pdfBlob;
    try {
      pdfBlob = await combineBase64DocumentsToPdf(base64Documents);
      console.log("pdfBlob", pdfBlob);
    } catch (error) {
      toast.error("Failed to create PDF Blob");
      return;
    }

    const pdfFile = pdfBlobToFile(pdfBlob, "File.pdf");

    const fileData = await getFileById(savedId);

    const ext = fileData?.file?.type?.split("/")[1] || "file";
    const url = `${baseUrl}/editview?file=${fileData?.uid}.${ext}`;

    // Create client message
    //   const clientMessage = `
    //   <p>Name: ${name}</p>
    //   <p>Email: ${email}</p>
    //   <p>Phone Number: ${phoneNumber}</p>
    //   <p>Message: ${message}</p>
    // `;

    const clientMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone Number:</strong> ${phoneNumber}</p>
        <p><strong>Message:</strong> ${message}</p>

       <div style="margin-top: 20px;">
         <a href=${url}
          style="
           display: inline-block;
           padding: 12px 12px;
           background-color: #00bd00;
           color: #ffffff;
           text-decoration: none;
           border-radius: 4px;
           font-size: 14px;
           font-weight: 600;
          "
         >
         View Detail
        </a>
       </div>
      </div>
    `;


    try {
      const formData = new FormData();
      formData.append("submit", "true");
      formData.append("admin", "true");
      formData.append("name", name);
      formData.append("email", email);
      formData.append("subject", "Greenhse Lighting Quote Request");
      formData.append("message", clientMessage);
      formData.append("file", screenShotBase64);
      // formData.append("file1", pdfFile);
      formData.append("env", true);

      if (Array.isArray(documentsForDownload) && documentsForDownload?.length > 0) {
        formData.append("file1", pdfFile);
      }

      const requestOptions = {
        method: "POST",
        body: formData,
        redirect: "follow",
      };

      const response = await SmtpEmailApi(requestOptions);

      if (response.status === true) {
        await savedDesign({ name: name, email: email });
        toast.success("Email sent successfully!");
        setTimeout(() => {
          handleSharePopupClose();
        }, 2000);
      } else {
        toast.error("Failed to send email");
      }
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setIsLoading(false); // Hide the loader
    }
  };


  useEffect(() => {
    const handleEstimateUpdate = (event) => {
      const { updatedProducts, newEstimate, } = event.detail || {};
      if (!updatedProducts) return;

      setEstimates(prev => ({
        ...prev,
        lightPlacement: updatedProducts.map(p => ({ selectedProductList: p })),
        estimate: newEstimate,
      }));
    };

    window.addEventListener("estimateUpdated", handleEstimateUpdate);
    return () => window.removeEventListener("estimateUpdated", handleEstimateUpdate);
  }, []);



  useEffect(() => {
    const handleComboRemoved = (event) => {
      const { updatedProducts, newEstimate } = event.detail || {};
      if (!updatedProducts) return;

      // Update selected products
      setselectedProductComp(updatedProducts);

      // Update estimates state so UI re-renders
      setEstimates(prev => ({
        ...prev,
        lightPlacement: updatedProducts.map(p => ({ selectedProductList: p })),
        estimate: newEstimate,
      }));

      // Update saved combos safely
      setSavedCombos(prev => prev.filter(c => updatedProducts.some(p => p.comboParentKey === c.comboKey)));

      // Save updated layout to localStorage
      const updatedLayout = {
        lightPlacement: updatedProducts.map(p => ({ selectedProductList: p })),
        documentsForDownload: estimates.documentsForDownload,
        estimate: newEstimate,
      };
      localStorage.setItem("savedLightingLayout", JSON.stringify(updatedLayout));
    };

    window.addEventListener("comboRemoved", handleComboRemoved);
    return () => window.removeEventListener("comboRemoved", handleComboRemoved);
  }, [estimates.documentsForDownload]);



  const handleEmailPopupOpen = async () => {
    setOpenEmailPopup(true);
    try {
      const file = await estimateScreenshot();
      setScreenshot(file);
    } catch (error) {
      // console.error('Failed to capture screenshot:', error);
    }
  };

  // Open the email popup and capture a screenshot
  const handleSharePopupOpen = async () => {
    // handleDownload()
    setOpenSharePopup(true);
    try {
      const file = await estimateScreenshot();
      setScreenshot(file);
    } catch (error) { }
  };

  // Close the email popup and reset email parameters
  const handleSharePopupClose = () => {
    setShareFormData({
      name: "",
      email: "",
      phoneNumber: "",
      message: "",
    });
    setScreenShotBase64("");
    setOpenSharePopup(false);
  };

  // Close the email popup and reset email parameters
  const handleEmailPopupClose = () => {
    setEmailParams({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setScreenShotBase64("");
    setOpenEmailPopup(false);
  };

  // Fetch and set the selected file from localStorage
  useEffect(() => {
    getFileAndSet();
  }, []);

  // Retrieve the file from localStorage
  const getFileAndSet = () => {
    const savedData = localStorage.getItem("savedLightingLayout");
    if (savedData) {
      const file = JSON.parse(savedData);
      setSelectedFile(file);
      console.log("Fetched saved layout:", file);
    }
  };
  // Handle input changes in the email form
  const handleInputChange = (e, field) => {
    setEmailParams({
      ...emailParams,
      [field]: e.target.value,
    });
  };

  //print handler
  const handlePrint = async () => {
    const container = canvasRef.current;
    if (!container) {
      console.error("Canvas not found");
      return;
    }

    // Hide editor controls WITHOUT breaking layout
    const hiddenElements = document.querySelectorAll(
      ".drag-handle, .stretch-handle, .delete-button, .rotate-handle"
    );
    hiddenElements.forEach(el => el.style.visibility = "hidden");

    const lightDots = document.querySelectorAll(
      ".canvas div[style*='border: 2px solid orange']"
    );
    lightDots.forEach(el => el.style.visibility = "hidden");

    try {
      // Capture canvas safely
      const renderedCanvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: false,
        scale: 0.8,                 // prevents memory & blank page issues
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
      });

      // Convert to compressed image (prevents browser crash)
      const dataURL = renderedCanvas.toDataURL("image/jpeg", 0.8);

      // Open native print window (MOST STABLE)
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        alert("Popup blocked. Please allow popups to print.");
        return;
      }

      printWindow.document.open();
      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GreenHse</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: #fff;
            }
            .print-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px 20px;
              border-bottom: 1px solid #ddd;
            }
            .print-header img {
              height: 55px;
            }
            .print-content {
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 10px;
            }
            .print-content img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <img src="${greeHseLogo}" />
            <div style="font-size:12px;text-align:right;">
              info@greenhse.com<br/>
              www.greenhse.com
            </div>
          </div>

          <div class="print-content">
            <img src="${dataURL}" />
          </div>
        </body>
      </html>
    `);

      printWindow.document.close();
      printWindow.focus();

      // Native browser print (most reliable)
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 600);

    } catch (err) {
      console.error("Print failed:", err);
    } finally {
      // Restore UI
      hiddenElements.forEach(el => el.style.visibility = "");
      lightDots.forEach(el => el.style.visibility = "");
    }
  };

  const getGroupedLightPlacements = (lightPlacements) => {
    const map = {};

    lightPlacements.forEach((item) => {
      const product = item.selectedProductList;
      const key = product.sku; // GROUP BY SKU

      if (!map[key]) {
        map[key] = {
          ...item,
          selectedProductList: {
            ...product,
            quantity: 0,
          },
        };
      }

      map[key].selectedProductList.quantity += Number(product.quantity || 0);
    });

    return Object.values(map);
  };




  return (
    <div className="canvas" ref={canvasRef}>
      <div className="estimate-page-block">
        {/* <div className="back-button">
        <button onClick={backclick}>
          Back
        </button>
      </div>
      <div className="estimate-block">
        <button onClick={backclick}>{headerSaveText}</button>
      </div>

      <Header
        headerText={headerText}
        headerSaveText={headerSaveText}
        showEstimateName={false}
        showEditIcon={false}
        onBackToHome={handleBackToHome}
      /> */}


        <div className="greenhsce-content-block">
          <div className="estimate-header">
            <h2 className="header-title">Price Calculator</h2>
            <div className="back-done">
              <div className="home-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                <img src={homeLogo} alt="home" />
              </div>

              <div className="back-button">
                <button onClick={backclick}> <img src={backArraow} />
                  Back </button>
              </div>


              <div className="estimate-block">
                <button>{headerSaveText}</button>
              </div>
            </div>
          </div>



          <div className="greenhse-logo-estimate">
            <img src={greenhscLogo} alt="greenhse-logo" />
          </div>
        </div>

        <div id="estimate-content-block">
          <div className="estimate-button-row">
            <div className="estimate-button-title">
              <span className="product-name">PRODUCT</span>
            </div>
            <div className="product-details-summary">
              <span className="product-type-info">RATE(AUD)</span>
              <span className="product-type-info">QUANTITY</span>
              <span className="product-type-info">AMOUNT(AUD)</span>
            </div>
          </div>
          {console.log("estimates.lightPlacement", estimates.lightPlacement)}
          {getGroupedLightPlacements(estimates.lightPlacement).map((light, idx) => (
            <>
              <div className="estimate-button-row active-estimate">
                <div className="estimate-button-title estimate-active-title">
                  <span className="product-name active-product">
                    <LightbulbIcon
                      className="light-icon"
                      style={{ color: light.selectedProductList.color }}
                    />
                    <span className="active-name">
                      {light.selectedProductList.sku}
                    </span>
                  </span>
                </div>
                <div className="product-details-summary active-summary">
                  <span className="product-type-info">
                    {light.selectedProductList.price}
                  </span>
                  <span className="product-type-info">
                    {light.selectedProductList.quantity}
                  </span>
                  <span className="product-type-info">
                    {light.selectedProductList.price *
                      light.selectedProductList.quantity}
                  </span>

                </div>
              </div>
            </>
          ))}
          <div className="total-info-area">
            <div className="total-info-block">
              <div className="terms-text-info">
                <p>
                  <i>
                    Terms & Conditions: All transactions are subject to Greenhouse
                    Terms and Conditions and Privacy Policy as detailed on the
                    Greenhouse website www.greenhse.com
                  </i>
                </p>

                <p>
                  <i>
                    DISCLAIMER: All measurements and lighting positions will still need to be verified by your installer. Greenhouse is not responsible for any errors or inaccuracies
                  </i>
                </p>
              </div>
              <div className="total-info-inner-block">
                <div className="total-info-inner">
                  <span className="product-type-info">SUB TOTAL</span>
                  <span className="product-type-info empty-type-info"></span>
                  <span className="product-type-info">
                    {calculateTotal(allProducts)}
                  </span>
                </div>
                <div className="total-info-inner">
                  <span className="product-type-info">20% OFF</span>
                  <span className="product-type-info empty-type-info"></span>
                  <span className="product-type-info">
                    {calculateDiscount(calculateTotal(allProducts))}
                  </span>
                </div>
                <div className="total-info-inner">
                  <span className="product-type-info">NEW SUB TOTAL</span>
                  <span className="product-type-info empty-type-info"></span>
                  <span className="product-type-info">
                    {calculateNewTotal(calculateTotal(allProducts), calculateDiscount(calculateTotal(allProducts)))}
                  </span>
                </div>
                <div className="total-info-inner">
                  <span className="product-type-info">10% GST</span>
                  <span className="product-type-info empty-type-info"></span>
                  <span className="product-type-info">
                    {/* {calculateGST(calculateTotal(allProducts))} */}
                    {calculateGST(calculateNewTotal(calculateTotal(allProducts), calculateDiscount(calculateTotal(allProducts))))}
                  </span>
                </div>
                <div className="total-info-inner">
                  <span className="product-type-info">TOTAL</span>
                  <span className="product-type-info empty-type-info"></span>
                  <span className="product-type-info">
                    {/* {getTotalWithGST(calculateTotal(allProducts))} */}
                    {calculateFinalAmountWithGST(allProducts, 0.2, 0.1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="estimate-action-buttons">
              <div id="print-area" style={{ display: "none" }}></div>
              <div className="estimate-contact-button">
                  <PrintIcon
                    style={{ fontSize: 30, cursor: "pointer" }}
                    onClick={handlePrint}
                  />
              </div>
              <div className="estimate-contact-button" onClick={handleSharePopupOpen}>
                <ContactMailIcon />
              </div>
              <div className="estimate-email-button" onClick={handleEmailPopupOpen}>
                <EmailIcon />
              </div>
            </div>
          </div>
        </div>


        <Dialog
          className="email-estimate-popup"
          open={openEmailPopup}
          // onClose={handleEmailPopupClose}
          onClose={(event, reason) => {
            if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
              handleEmailPopupClose();
            }
          }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title" className="estimate-title">
            Email Estimate
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              id="email"
              label="Email Address"
              placeholder="Email"
              type="email"
              fullWidth
              value={emailParams.email}
              onChange={(e) => handleInputChange(e, "email")}
              className="email-estimate-input"
            />

            <p className="attechment-text">Attachment:</p>
            {screenShotBase64 && (
              <img
                id="screenshotImage"
                src={screenShotBase64}
                alt="Screenshot"
                style={{ maxWidth: "100%" }}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button
              className="cancelEstimate"
              onClick={handleEmailPopupClose}
              color="primary"
            >
              Cancel
            </Button>
            {isLoading && <OldSpinnerLoader />}
            <Button
              className="saveEstimate"
              onClick={handleSendEmail}
              color="primary"
            >
              Send
            </Button>
          </DialogActions>
          <Toaster position="top-right" reverseOrder={false} />
        </Dialog>

        <Dialog
          className="share-popup"
          open={openSharePopup}
          // onClose={handleSharePopupClose}
          onClose={(event, reason) => {
            if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
              handleSharePopupClose();
            }
          }}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title" className="share-title">
            Request a Quote
          </DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              id="share-name"
              label="Name"
              placeholder="Name"
              type="text"
              fullWidth
              value={shareFormData.name}
              onChange={(e) => handleShareInputChange(e, "name")}
              className="share-input"
            />
            <TextField
              margin="dense"
              id="share-email"
              label="Email Address"
              placeholder="Email"
              type="email"
              fullWidth
              value={shareFormData.email}
              onChange={(e) => handleShareInputChange(e, "email")}
              className="share-input"
            />
            <TextField
              margin="dense"
              id="share-phone"
              label="Phone Number"
              placeholder="Phone Number"
              type="text"
              fullWidth
              value={shareFormData.phoneNumber}
              onChange={(e) => handleShareInputChange(e, "phoneNumber")}
              className="share-input"
            />
            <TextField
              margin="dense"
              id="message"
              label="Message"
              placeholder="Write your message here..."
              multiline
              minRows={4}
              fullWidth
              value={shareFormData.message}
              onChange={(e) => handleShareInputChange(e, "message")}
              className="message-text-area"
            />

            <p className="attechment-text">Attachment:</p>
            <TextField
              margin="dense"
              id="share-file-name"
              placeholder="Attachment"
              type="text"
              fullWidth
              value={attachmentName}
              readOnly
              className="share-input"
            />
            <p className="attechment-text">Attachment:</p>
            {screenShotBase64 && (
              <img
                id="screenshotImage"
                src={screenShotBase64}
                alt="Screenshot"
                style={{ maxWidth: "100%" }}
              />
            )}
          </DialogContent>
          <DialogActions>
            {isLoading && <OldSpinnerLoader />}
            <Button
              className="cancelShare"
              onClick={handleSharePopupClose}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              className="saveShare"
              onClick={handleSendShareEmail}
              color="primary"
            >
              Send
            </Button>
          </DialogActions>
          <Toaster position="top-right" reverseOrder={false} />
        </Dialog>
      </div>
    </div>
  );
};

export default EstimateView;
