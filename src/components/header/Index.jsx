import React, { useEffect, useRef, useState } from "react";
import { getEstimateName, getFile, getFileId, updateEstimateName } from "../../IndexedDB";
import "./Index.css";
import Popup from "reactjs-popup";
import alertIcon from "../../assets/img/alert_icon.svg";
import EditIcon from "@mui/icons-material/Edit";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import DescriptionIcon from "@mui/icons-material/Description";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";
import Tooltip from "@mui/material/Tooltip";
import greeHseLogo from "../../assets/img/greenhse-logo.png";
import jsPDF from "jspdf";
import printJS from "print-js";
import backArraow from "../../assets/img/back_arrow.svg";
import { OldSpinnerLoader } from "../../loader/Index";
import greenhscLogo from "../../assets/img/greenhse-logo.png";
import { useSelector } from "react-redux";
import homeLogo from "../../assets/img/homelogo.png"
import { greenhseBaseUrl } from "../config/config";
import toast, { Toaster } from "react-hot-toast";
import { toPng } from "html-to-image";

const Header = (props) => {
  const {
    headerText,
    showEstimateName,
    showEditIcon,
    mode,
    containerRef,
    selectedProductcomp,
    lightPlacementPositions,
    onBackToHome,
  } = props;

  const [estimateName, setEstimateName] = useState("");
  const [newEstimateName, setNewEstimateName] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [openSavePopup, setOpenSavePopup] = useState(false); //for save confirmation popup
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const clickRef = useRef();
  const navigate = useNavigate();

  // Fetch estimate name from IndexedDB
  const fetchEstimateName = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fileName = params.get("file");
      const fetchedFile = await getEstimateName(fileName);
      if (fetchedFile) {
        setEstimateName(fetchedFile);
        setNewEstimateName(fetchedFile);
      } else {
        console.error("File not found in the database:", fileName);
      }
    } catch (error) {
      console.error("Error fetching file:", error);
    }
  };

  const UpdateEstimateName = async () => {
    const params = new URLSearchParams(window.location.search);
    var fileName = params.get("file");
    fileName = decodeURIComponent(fileName);
    await updateEstimateName(fileName, newEstimateName);
    setEstimateName(newEstimateName);
  };

  useEffect(() => {
    fetchEstimateName();
  }, []);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve(reader.result); // this is your base64 string
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const isBase64ImageOrPDF = (value) => {
    if (typeof value !== "string") return false;

    return /^data:(image\/(png|jpg|jpeg|webp)|application\/pdf);base64,/.test(
      value
    );
  };

  // SAVE FUNCTION
  const handleSaveImage = async () => {
    const canvasElement = containerRef?.current;
    if (!canvasElement) return;

    const canvas = await html2canvas(canvasElement, {
      backgroundColor: null,
      scale: 2,
    });
    const imageData = canvas.toDataURL("image/png");

    const lightData = {
      selectedProduct: Array.isArray(selectedProductcomp)
        ? selectedProductcomp
        : selectedProductcomp
          ? [selectedProductcomp]
          : [],
      lightPlacementPositions: Array.isArray(lightPlacementPositions)
        ? lightPlacementPositions
        : [],
    };

    const layoutData = { image: imageData, lights: lightData };
    //localStorage.setItem("savedLightingLayout", JSON.stringify(layoutData));

    const params = new URLSearchParams(window.location.search);
    const fileName = params.get("file");
    if (!fileName) return;

    const decodedFileName = decodeURIComponent(fileName);
    const storedFile = await getFile(decodedFileName);
    const base64String = await fileToBase64(storedFile);
    const fileId = await getFileId(decodedFileName);
    const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
    const savedLayout = layouts[decodedFileName];
    const manageLayout = {
      ...savedLayout,
      editedImage: {},
    };
    const saveData = {
      email: "",
      first_name: "",
      last_name: "",
      mail_sent: "0",
      mail_date: "",
      data: {
        id: fileId,
        file: base64String,
        layout: manageLayout
      }
    };

    setIsLoading(true);
    const imagedata = { image: base64String };
    const imgUrl = greenhseBaseUrl + `index.php?type=imagesaved`;
    try {
      const response = await fetch(imgUrl, {
        method: 'POST',
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(imagedata)
      });
      const result = await response.json();
      console.log("API Response:", result);
      if (result) {
        saveData.data = {
          id: fileId, file: result?.image_url, layout: manageLayout
        };
      }

      if (result?.error) {
        toast.error(result?.error);
        setOpenSavePopup(false);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.log("log", error);
    }

    if (!saveData?.data?.file || isBase64ImageOrPDF(saveData.data.file)) {
      setIsLoading(false);
      return;
    }

    const url = greenhseBaseUrl + `index.php?type=datasaved`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(saveData)
      });
      const result = await response.json();
      // console.log("API Response:", result);
    } catch (err) {
      console.log("Fetch error:", err);
      setIsLoading(false);
      return null;
    }

    setIsLoading(false);


    if (!user) {
      localStorage.setItem("savedDesign", JSON.stringify(fileId));
      setIsSaved(true);
    }
  };

  // PRINT FUNCTION
  // const handlePrint = async () => {
  //   const container = document.querySelector(".canvas");
  //   if (!container) return;

  //   const hiddenElements = document.querySelectorAll(
  //     ".drag-handle, .stretch-handle, .delete-button, .rotate-handle"
  //   );
  //   hiddenElements.forEach((el) => (el.style.display = "none"));

  //   const lightDots = document.querySelectorAll(
  //     ".canvas div[style*='border: 2px solid orange']"
  //   );
  //   lightDots.forEach((el) => (el.style.display = "none"));

  //   try {
  //     const renderedCanvas = await html2canvas(container, {
  //       useCORS: true,
  //       scale: 1,
  //       backgroundColor: "#ffffff",
  //     });

  //     const dataURL = renderedCanvas.toDataURL("image/png");

  //     // Calculate dimensions to fit on one page
  //     // Standard A4 page: 210mm x 297mm (8.27" x 11.69") at 96 DPI
  //     // Accounting for margins and header, usable area is approximately:
  //     const maxWidth = 750; // pixels (about 7.8 inches)
  //     const maxHeight = 950; // pixels (about 9.9 inches)

  //     const canvasWidth = renderedCanvas.width;
  //     const canvasHeight = renderedCanvas.height;

  //     // Calculate scaling to fit within page dimensions
  //     const widthRatio = maxWidth / canvasWidth;
  //     const heightRatio = maxHeight / canvasHeight;
  //     const scale = Math.min(widthRatio, heightRatio, 1); // Don't scale up, only down

  //     const scaledWidth = canvasWidth * scale;
  //     const scaledHeight = canvasHeight * scale;

  //     const printHTML = `
  //     <style>
  //       @media print {
  //         @page {
  //           size: A4;
  //           margin: 10mm;
  //         }
  //         body {
  //           margin: 0;
  //           padding: 0;
  //         }
  //         .print-container {
  //           width: 100%;
  //           height: 100vh;
  //           display: flex;
  //           flex-direction: column;
  //           page-break-inside: avoid;
  //         }
  //         .print-header {
  //           width: 100%;
  //           background: #fff;
  //           padding: 10px 0;
  //           text-align: right;
  //           flex-shrink: 0;
  //         }
  //         .print-content {
  //           flex: 1;
  //           display: flex;
  //           justify-content: center;
  //           align-items: center;
  //           overflow: hidden;
  //         }
  //         .print-image {
  //           max-width: ${scaledWidth}px;
  //           max-height: ${scaledHeight}px;
  //           width: auto;
  //           height: auto;
  //           object-fit: contain;
  //           display: block;
  //         }
  //       }
  //     </style>
  //     <div class="print-container">
  //       <div class="print-header">
  //         <img src="${greeHseLogo}" alt="GreenHse Logo" style="height:60px; width:auto; display:inline-block; margin-right:20px;" />
  //         <div style="font-size:12px; color:#000; margin-top:5px; margin-right:20px;">
  //           info@greenhse.com, 123 Street, City
  //         </div>
  //       </div>
  //       <div class="print-content">
  //         <img src="${dataURL}" class="print-image" />
  //       </div>
  //     </div>
  //   `;

  //     printJS({
  //       printable: printHTML,
  //       documentTitle: "GreenHse",
  //       type: "raw-html",
  //       targetStyles: ["*"],
  //     });
  //   } catch (err) {
  //     console.error("Print failed:", err);
  //   } finally {
  //     // Step 5: Restore elements after printing
  //     hiddenElements.forEach((el) => (el.style.display = ""));
  //     lightDots.forEach((el) => (el.style.display = ""));
  //   }
  // };

  const handlePrint = async () => {
    const container = document.querySelector(".canvas");
    if (!container) {
      console.error("Canvas not found");
      return;
    }

    // Hide editor controls WITHOUT breaking layout
    const hiddenElements = document.querySelectorAll(
      ".drag-handle, .stretch-handle, .copy-button, .change-product-button, .delete-button, .rotate-handle, .hide-actions-button"
    );
    hiddenElements.forEach(el => el.style.visibility = "hidden");

    const lightDots = document.querySelectorAll(
      ".canvas div[style*='border: 2px solid orange']"
    );
    lightDots.forEach(el => el.style.visibility = "hidden");

    try {

      const renderedCanvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: false,
        scale: 0.8,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000
      });

      // const dataURL = renderedCanvas.toDataURL("image/jpeg", 0.85);
      const dataURL = renderedCanvas.toDataURL("image/png");

      // ===== A4 SCALE CALCULATION =====
      const maxWidth = 750;
      const maxHeight = 950;

      const canvasWidth = renderedCanvas.width;
      const canvasHeight = renderedCanvas.height;

      const widthRatio = maxWidth / canvasWidth;
      const heightRatio = maxHeight / canvasHeight;

      const scale = Math.min(widthRatio, heightRatio, 1);

      const scaledWidth = canvasWidth * scale;
      const scaledHeight = canvasHeight * scale;

      // ===== PRINT TEMPLATE =====
      const printHTML = `
      <style>
        @media print {
               @page {
            size: A4;
            margin: 10mm;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print-container {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            page-break-inside: avoid;
          }
          .print-header {
            width: 100%;
            background: #fff;
            padding: 10px 0;
            text-align: right;
            flex-shrink: 0;
          }

         .print-header img{
            height:60px;
          }

         .print-content{
           flex:1;
           display:flex;
           justify-content:center;
           align-items:center;
           padding:10px;
         }

         .print-image{
            width:${scaledWidth}px;
            height:${scaledHeight}px;
            object-fit:contain;
            page-break-inside:avoid;
          }
        }
      </style>
      <div class="print-container">
        <div class="print-header">
          <img src="${greeHseLogo}" alt="GreenHse Logo" style="height:60px; width:auto; display:inline-block; margin-right:20px;" />
          <div style="font-size:12px; color:#000; margin-top:5px; margin-right:20px;">
            info@greenhse.com, 123 Street, City
          </div>
        </div>
        <div class="print-content">
          <img src="${dataURL}" class="print-image" />
        </div>
      </div>
    `;

      // ===== OPEN PRINT DIALOG (NO NEW TAB) =====
      printJS({
        printable: printHTML,
        documentTitle: "GreenHse",
        type: "raw-html",
        targetStyles: ["*"]
      });

    } catch (err) {
      console.error("Print failed:", err);
    } finally {

      // Restore UI
      hiddenElements.forEach(el => el.style.visibility = "");
      lightDots.forEach(el => el.style.visibility = "");

    }
  };

  // DOWNLOAD PDF FUNCTION
  // const handleDownloadPDFs = async () => {
  //   // Select the canvas container
  //   const container = document.querySelector(".canvas");
  //   if (!container) return;

  //   const hiddenElements = document.querySelectorAll(
  //     ".drag-handle, .stretch-handle, .delete-button, .rotate-handle"
  //   );
  //   hiddenElements.forEach((el) => (el.style.display = "none"));

  //   const lightDots = document.querySelectorAll(
  //     ".canvas div[style*='border: 2px solid orange']"
  //   );
  //   lightDots.forEach((el) => (el.style.display = "none"));

  //   try {
  //     const wrapper = document.createElement("div");
  //     wrapper.style.width = "800px";
  //     wrapper.style.padding = "20px";
  //     wrapper.style.background = "#fff";
  //     wrapper.style.position = "absolute";
  //     wrapper.style.left = "-9999px";
  //     wrapper.style.top = "-9999px";

  //     // Header: Logo + Email
  //     const header = document.createElement("div");
  //     header.style.display = "flex";
  //     header.style.flexDirection = "column";
  //     header.style.alignItems = "flex-end";
  //     header.style.marginBottom = "20px";

  //     const logo = document.createElement("img");
  //     logo.src = greeHseLogo;
  //     logo.style.width = "120px";
  //     logo.style.height = "auto";
  //     logo.style.marginBottom = "5px";

  //     const email = document.createElement("div");
  //     email.innerText = "info@greenhse.com, 123 Street, City";
  //     email.style.fontSize = "15px";
  //     email.style.color = "#000";
  //     email.style.textAlign = "right";
  //     email.style.width = "100%";
  //     email.style.marginBottom = "20px";

  //     header.appendChild(logo);
  //     header.appendChild(email);
  //     wrapper.appendChild(header);

  //     const clonedContainer = container.cloneNode(true);
  //     clonedContainer.style.width = "100%";
  //     clonedContainer.style.height = "auto";
  //     wrapper.appendChild(clonedContainer);

  //     // Append wrapper temporarily
  //     document.body.appendChild(wrapper);

  //     const canvas = await html2canvas(wrapper, { scale: 2, useCORS: true });

  //     document.body.removeChild(wrapper);

  //     const pdf = new jsPDF("p", "mm", "a4");
  //     const pageWidth = pdf.internal.pageSize.getWidth();
  //     const imgData = canvas.toDataURL("image/png");
  //     const imgProps = pdf.getImageProperties(imgData);
  //     const pdfWidth = pageWidth - 20;
  //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //     pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
  //     pdf.save(`${estimateName || "Layout"}.pdf`);
  //   } catch (err) {
  //     console.error("PDF generation failed:", err);
  //   } finally {
  //     hiddenElements.forEach((el) => (el.style.display = ""));
  //     lightDots.forEach((el) => (el.style.display = ""));
  //   }
  // };

  // DOWNLOAD NEW PDF FUNCTION
  const handleDownloadPDF = async () => {
    const container = document.querySelector(".canvas");
    if (!container) return;

    const hiddenElements = document.querySelectorAll(
      ".drag-handle, .stretch-handle, .copy-button, .change-product-button, .delete-button, .rotate-handle, .hide-actions-button"
    );
    hiddenElements.forEach((el) => (el.style.display = "none"));

    const lightDots = document.querySelectorAll(
      ".canvas div[style*='border: 2px solid orange']"
    );
    lightDots.forEach((el) => (el.style.display = "none"));

    try {

      const renderedCanvas = await html2canvas(container, {
        useCORS: true,
        scale: 3,
        backgroundColor: "#ffffff",
      });

      const imgData = renderedCanvas.toDataURL("image/png");

      // A4 size in mm
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;

      const canvasWidth = renderedCanvas.width;
      const canvasHeight = renderedCanvas.height;

      // Convert px to mm ratio
      // const ratio = Math.min(
      //   pageWidth / canvasWidth,
      //   pageHeight / canvasHeight
      // );

      const horizontalPadding = 15; // 15mm left + right
      const availableWidth = pageWidth - horizontalPadding * 2;

      const ratio = Math.min(
        availableWidth / canvasWidth,
        (pageHeight - 50) / canvasHeight // space for header
      );

      const imgWidth = canvasWidth * ratio;
      const imgHeight = canvasHeight * ratio;

      const x = (pageWidth - imgWidth) / 2;
      const y = 44; // leave space for header

      const logoWidth = 35;
      const logoHeight = 12;

      pdf.addImage(greeHseLogo, "PNG", pageWidth - logoWidth - 10, 15, logoWidth, logoHeight);

      pdf.setFontSize(10);

      pdf.text("info@greenhse.com, 123 Street, City", pageWidth - 10, 30, {
        align: "right",
      });

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight, "", "FAST");

      // Download
      pdf.save(`${estimateName || "Layout"}.pdf`);

    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      hiddenElements.forEach((el) => (el.style.display = ""));
      lightDots.forEach((el) => (el.style.display = ""));
    }
  };


  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="header" style={{
        display: "flex",
        alignItems: "center",
        padding: " 0px 40px",
        borderRadius: "12px"
      }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            position: "relative",
            width: "100%",
            gap: "12px"
          }}
        >
          <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <img src={homeLogo} alt="" style={{ height: "50px", width: "50px" }} />
          </div>

          {/* LEFT SIDE — Back */}
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              style={{
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                color: "#fff",
                fontSize: "16px",
                cursor: "pointer",
                gap: "10px",
              }}
            >
              <img
                src={backArraow}
                alt="Back"
                style={{ width: "16px", height: "16px" }}
              />
              Back
            </button>
          )}

          {/* RIGHT SIDE — Save / Icons */}
          {mode === "editview" && (
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {!isSaved && (
                <button
                  onClick={() => setOpenSavePopup(true)}
                  style={{
                    background: "transparent",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    color: "#fff",
                    fontSize: "16px",
                    cursor: "pointer",
                    gap: "10px",
                  }}
                >
                  Save
                </button>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Tooltip title="Estimate" arrow>
                  <DescriptionIcon
                    style={{ fontSize: 30, cursor: "pointer" }}
                    onClick={() => {
                      const params = new URLSearchParams(window.location.search);
                      const currentImageId = params.get("file");

                      if (!currentImageId) {
                        console.warn("No image ID found in URL");
                        return;
                      }

                      // Get saved layouts
                      const layouts = JSON.parse(
                        localStorage.getItem("layouts") || "{}"
                      );
                      const prevLayout = layouts[currentImageId] || {};

                      // Ensure selectedProductcomp is always an array
                      const currentProducts = Array.isArray(selectedProductcomp)
                        ? selectedProductcomp
                        : selectedProductcomp
                          ? [selectedProductcomp]
                          : [];

                      const currentPositions = Array.isArray(
                        lightPlacementPositions
                      )
                        ? lightPlacementPositions
                        : [];

                      // ✅ Keep duplicates intact (no filtering)
                      const productsToSave = currentProducts;

                      // 🧮 Calculate total estimate including duplicates
                      const calculateTotal = (products) => {
                        return products.reduce((total, product) => {
                          const price = parseFloat(product.price) || 0;
                          const qty = parseInt(product.quantity) || 0;
                          const gst = parseFloat(product.gst) || 0;
                          return total + price * qty * (1 + gst / 100);
                        }, 0);
                      };

                      // 💾 Save layout with duplicates
                      layouts[currentImageId] = {
                        ...prevLayout,
                        lights: {
                          selectedProduct: productsToSave,
                          lightPlacementPositions: currentPositions,
                        },
                        estimate: calculateTotal(productsToSave),
                        combos: prevLayout.combos || [],
                        image: prevLayout.image || "",
                      };

                      // Save to localStorage
                      localStorage.setItem("layouts", JSON.stringify(layouts));

                      // Navigate to estimate page
                      navigate("/estimate", {
                        state: {
                          ...layouts[currentImageId],
                          currentImageId: currentImageId, // Include file name for navigation back
                        },
                      });
                    }}
                  />
                </Tooltip>
              </div>

              {isSaved && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* <Tooltip title="Estimate" arrow>
                    <DescriptionIcon
                      style={{ fontSize: 30, cursor: "pointer" }}
                      onClick={() => {
                        const params = new URLSearchParams(window.location.search);
                        const currentImageId = params.get("file");

                        if (!currentImageId) {
                          console.warn("No image ID found in URL");
                          return;
                        }

                        // Get saved layouts
                        const layouts = JSON.parse(
                          localStorage.getItem("layouts") || "{}"
                        );
                        const prevLayout = layouts[currentImageId] || {};

                        // Ensure selectedProductcomp is always an array
                        const currentProducts = Array.isArray(selectedProductcomp)
                          ? selectedProductcomp
                          : selectedProductcomp
                            ? [selectedProductcomp]
                            : [];

                        const currentPositions = Array.isArray(
                          lightPlacementPositions
                        )
                          ? lightPlacementPositions
                          : [];

                        // ✅ Keep duplicates intact (no filtering)
                        const productsToSave = currentProducts;

                        // 🧮 Calculate total estimate including duplicates
                        const calculateTotal = (products) => {
                          return products.reduce((total, product) => {
                            const price = parseFloat(product.price) || 0;
                            const qty = parseInt(product.quantity) || 0;
                            const gst = parseFloat(product.gst) || 0;
                            return total + price * qty * (1 + gst / 100);
                          }, 0);
                        };

                        // 💾 Save layout with duplicates
                        layouts[currentImageId] = {
                          ...prevLayout,
                          lights: {
                            selectedProduct: productsToSave,
                            lightPlacementPositions: currentPositions,
                          },
                          estimate: calculateTotal(productsToSave),
                          combos: prevLayout.combos || [],
                          image: prevLayout.image || "",
                        };

                        // Save to localStorage
                        localStorage.setItem("layouts", JSON.stringify(layouts));

                        // Navigate to estimate page
                        navigate("/estimate", {
                          state: {
                            ...layouts[currentImageId],
                            currentImageId: currentImageId, // Include file name for navigation back
                          },
                        });
                      }}
                    />
                  </Tooltip> */}

                  <Tooltip title="Print" arrow>
                    <PrintIcon
                      style={{ fontSize: 30, cursor: "pointer" }}
                      onClick={handlePrint}
                    />
                  </Tooltip>

                  <Tooltip title="Save as PDF" arrow>
                    <SaveIcon
                      style={{ fontSize: 30, cursor: "pointer" }}
                      onClick={handleDownloadPDF}
                    />
                  </Tooltip>
                </div>
              )}
            </div>
          )}
        </div>


        <div className="edit-header">
          {showEditIcon && (
            <Popup
              trigger={<EditIcon />}
              position="right center"
              className="delete-popup-content-content"
            >
              {(close) => (
                <div className="delete-popup-button-block rename-popup">
                  <div className="input-custom-block">
                    <h5>Rename</h5>
                    <input
                      type="text"
                      value={newEstimateName}
                      onChange={(e) => setNewEstimateName(e.target.value)}
                    />
                  </div>
                  <div className="delete-btn-block edit-delete-btn-block">
                    <div className="delete-btn-block-inner">
                      <button onClick={close}>Cancel</button>
                      <button
                        className="delete-block"
                        onClick={() => {
                          clickRef.current.open();
                          close();
                        }}
                      >
                        Rename
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </Popup>
          )}

          <Popup ref={clickRef} position="right center" className="delete-popup">
            {(close) => (
              <div className="delete-popup-button-block">
                <div className="alert-icon-info">
                  <div className="alert-icon">
                    <img src={alertIcon} alt="Alert" />
                  </div>
                  <h5>Confirm!</h5>
                </div>
                <p>Are you sure you want to Rename this estimate?</p>
                <div className="delete-btn-block">
                  <button onClick={close}>Cancel</button>
                  <button
                    className="delete-block button"
                    onClick={() => {
                      UpdateEstimateName();
                      close();
                    }}
                  >
                    Rename
                  </button>
                </div>
              </div>
            )}
          </Popup>

          {/*Changes start*/}
          {/*Add SAVE CONFIRMATION POPUP */}
          <Popup
            open={openSavePopup}
            onClose={() => setOpenSavePopup(false)}
            position="right center"
            className="delete-popup"
          >
            {(close) => (
              <div className="delete-popup-button-block">
                <div className="alert-icon-info">
                  <div className="alert-icon">
                    <img src={alertIcon} alt="Alert" />
                  </div>
                  <h5>Confirm Save</h5>
                </div>
                <p>Do you want to save the current image and lights?</p>
                <div className="delete-btn-block">
                  <button onClick={close}>No</button>
                  <button
                    className="delete-block button"
                    onClick={async () => {
                      const success = await handleSaveImage();
                      if (success !== false) {
                        close();
                      }
                      // await handleSaveImage();
                      // close();
                    }}
                  >
                    Yes
                  </button>
                </div>
              </div>
            )}
          </Popup>

          <div className="header-sub-info-text">
            {showEstimateName && <h6>{estimateName}</h6>}
          </div>
        </div>

        {isLoading && <OldSpinnerLoader />}

        <div className="logo-right">
          <img src={greenhscLogo} style={{ height: "77px", width: "164px" }} alt="logo" />
        </div>

      </div>

    </>
  );
};

export default Header;
