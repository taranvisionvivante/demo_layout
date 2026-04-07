import React, { useEffect, useRef, useState } from "react";
import "./Index.css";
import db, { exportFile, getFilesStored } from "../../../IndexedDB";
import { pdfjs } from "react-pdf";
import * as pdfjsLib from "pdfjs-dist";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DataLoading } from "../../../loader/Index";
// import Pagination from "../../Pagination/Index";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { greenhseBaseUrl } from "../../config/config";

// Configure PDF.js worker - use local worker file
// if (typeof window !== 'undefined') {
//     pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
//     pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
// }

export default function SaveData() {
    const { user } = useSelector((state) => state.auth);
    const [lists, setLists] = useState([]);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [isPop, setIsPop] = useState(false);
    const [detail, setDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tableData, setTableData] = useState(null);
    const [page, setPage] = useState(1);

    const navigate = useNavigate();
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

    const isSame = (a, b) => {
        return JSON.stringify(a) === JSON.stringify(b);
    };

    const normalizeFileUrl = (url) => {
        try {
            const u = new URL(url);

            if (!u.pathname.startsWith("/api/")) {
                u.pathname = `/api${u.pathname}`;
            }

            return u.toString();
        } catch {
            return url;
        }
    };


    const handleFetch = async (page) => {
        try {
            const apiUrl = greenhseBaseUrl + `index.php?type=getAlldata&page=${page}&limit=10`;
            const res = await fetch(apiUrl,
                {
                    method: "GET",
                    headers: { Accept: "application/json" },
                }
            );

            const result = await res.json();
            if (!result?.data?.length) return;

            setTableData(result?.meta);

            let layouts = JSON.parse(localStorage.getItem("layouts")) || {};
            let isUpdated = false;

            for (const item of result.data) {
                // console.log("result ===>", item);
                const uid = item?.data?.id;
                const fileUrl = item?.data?.file;
                const layout = item?.data?.layout;

                const fileRes = await fetch(fileUrl);
                const blob = await fileRes.blob();

                const ext = blob.type.split("/")[1] || "file";
                const file = new File([blob], `${uid}.${ext}`, {
                    type: blob.type,
                });

                if (!uid || !fileUrl || !layout) continue;

                const apiLayout = {
                    lightPlacementPositions: layout.lightPlacementPositions || [],
                    estimate: layout.estimate || 0,
                    editedImage: layout.editedImage || [],
                    lights: layout.lights || {},
                    combos: layout.combos || [],
                    status: item?.status
                };

                if (layouts[file.name]) {
                    if (!isSame(layouts[file.name], apiLayout)) {
                        layouts[file.name] = apiLayout; // replace
                        isUpdated = true;
                    }
                }

                else {
                    layouts[file.name] = apiLayout;
                    isUpdated = true;
                }


                const fileExists = await db.files.where("uid").equals(uid).first();
                if (fileExists) continue;

                // const fileRes = await fetch(fileUrl);
                // const blob = await fileRes.blob();

                // const ext = blob.type.split("/")[1] || "file";
                // const file = new File([blob], `${uid}.${ext}`, {
                //     type: blob.type,
                // });

                await exportFile(file.name, file, uid, item?.email, item?.first_name, item?.last_name);

                if (!file.type.includes("pdf")) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        setLists((prev) => [
                            ...prev,
                            {
                                uid,
                                name: file.name,
                                file,
                                editedImage: reader.result,
                                lightsCombo: apiLayout.lightPlacementPositions,
                                estimate: apiLayout.estimate,
                            },
                        ]);
                    };
                    reader.readAsDataURL(file);
                }
            }

            if (isUpdated) {
                localStorage.setItem("layouts", JSON.stringify(layouts));
            }
        } catch (err) {
            console.error("handleFetch error:", err);
        }
    };


    // useEffect(() => {
    //     handleFetch();
    // }, []);


    const imgRefs = useRef({});
    //render file
    const renderFilePreview = (file, fileName, index) => {
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
                style={{
                    display: "flex",
                    justifyContent: "center",
                    border: "none",
                }}
            >
                {displayImg ? (
                    <div
                        style={{
                            position: "relative",
                            width: "300px",
                            height: "150px",
                        }}
                    >
                        <img
                            ref={(el) => (imgRefs.current[fileName] = el)}
                            src={displayImg}
                            alt={`selected-file-${index}`}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                display: "block",
                            }}
                            onLoad={() => setImgLoaded(true)}
                            onError={() => setImgLoaded(false)}
                        />

                        {file.combos?.map((combo, idx) => {
                            const offsets = predefinedCombos[combo.baseKey] || [];
                            const imgEl = imgRefs.current[fileName];

                            if (!imgEl) return null;

                            const scaleX = imgEl.clientWidth / imgEl.naturalWidth;
                            const scaleY = imgEl.clientHeight / imgEl.naturalHeight;

                            return (
                                <React.Fragment key={`combo-${idx}`}>
                                    {offsets.map((offset) => {
                                        const stretchX = combo.stretch?.x || 0;
                                        const stretchY = combo.stretch?.y || 0;

                                        const x =
                                            combo.center.x +
                                            (offset.fixedX ? 0 : offset.col * (30 + stretchX));

                                        const y =
                                            combo.center.y +
                                            (offset.fixedY ? 0 : offset.row * (30 + stretchY));

                                        return (
                                            <div
                                                key={offset.id}
                                                className="combo-dot"
                                                style={{
                                                    position: "absolute",
                                                    left: `${x * scaleX}px`,
                                                    top: `${y * scaleY}px`,
                                                    width: "10px",
                                                    height: "10px",
                                                    borderRadius: "50%",
                                                    backgroundColor: "purple",
                                                    transform: "translate(-50%, -50%)",
                                                    pointerEvents: "none",
                                                }}
                                            />
                                        );
                                    })}
                                </React.Fragment>
                            );
                        })}
                    </div>
                ) : (
                    <div
                        style={{
                            width: "300px",
                            height: "150px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f0f0f0",
                            color: "#666",
                        }}
                    >
                        {isPdf ? "Converting PDF..." : "Loading image..."}
                    </div>
                )}
            </div>

        );
    };

    const getFileName = (item) => {
        if (item?.data?.file instanceof File) {
            return item.data.file.name;
        }

        if (typeof item?.data?.file === "string") {
            return item.data.file.split("/").pop();
        }

        return "";
    };

    const convertPdfToImage = async (pdfFile) => {
        try {
            // ✅ Strict validation
            if (!(pdfFile instanceof File)) {
                console.error("Invalid PDF input");
                return null;
            }

            if (pdfFile.type !== "application/pdf") {
                console.error("Not a PDF file");
                return null;
            }

            // ✅ File → ArrayBuffer (fastest path)
            const arrayBuffer = await pdfFile.arrayBuffer();
            if (!arrayBuffer.byteLength) return null;

            // ✅ Load PDF (worker already configured globally)
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            if (!pdf || pdf.numPages === 0) return null;

            // ✅ First page only (performance)
            const page = await pdf.getPage(1);

            // ✅ High-quality render (retina aware)
            const scale = Math.max(window.devicePixelRatio || 1, 2);
            const viewport = page.getViewport({ scale });

            // ✅ Canvas render
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d", { alpha: false });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport
            }).promise;

            // ✅ Canvas → Base64 image
            const imageBase64 = canvas.toDataURL("image/jpeg", 0.9);

            // ✅ Cleanup (important for large PDFs)
            canvas.width = 0;
            canvas.height = 0;

            return imageBase64;
        } catch (err) {
            console.error("PDF → Image conversion failed:", err);
            return null;
        }
    };


    // const convertPdfToImage = async (pdfFile) => {
    //     try {
    //         if (!pdfjsLib || !pdfjsLib.getDocument) {
    //             console.error("PDF.js library not available");
    //             return null;
    //         }

    //         // Convert file to array buffer
    //         let arrayBuffer;
    //         if (pdfFile instanceof Blob || pdfFile instanceof File) {
    //             arrayBuffer = await pdfFile.arrayBuffer();
    //         } else {
    //             const blob = pdfFile instanceof Blob ? pdfFile : new Blob([pdfFile]);
    //             arrayBuffer = await blob.arrayBuffer();
    //         }

    //         if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    //             console.error("ArrayBuffer is empty or invalid");
    //             return null;
    //         }

    //         // Load PDF document
    //         const loadingTask = pdfjsLib.getDocument({
    //             data: arrayBuffer,
    //             verbosity: 0
    //         });
    //         const pdf = await loadingTask.promise;

    //         if (pdf.numPages === 0) {
    //             console.error("PDF has no pages");
    //             return null;
    //         }

    //         // Get first page
    //         const page = await pdf.getPage(1);
    //         const scale = 1.0;
    //         const viewport = page.getViewport({ scale: scale });

    //         // Render to canvas
    //         const canvas = document.createElement("canvas");
    //         const context = canvas.getContext("2d");

    //         if (!context) {
    //             console.error("Could not get 2D context from canvas");
    //             return null;
    //         }

    //         canvas.height = viewport.height;
    //         canvas.width = viewport.width;

    //         const renderContext = {
    //             canvasContext: context,
    //             viewport: viewport
    //         };

    //         await page.render(renderContext).promise;

    //         // Convert canvas to data URL
    //         const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    //         return dataUrl;
    //     } catch (error) {
    //         console.error("Error converting PDF to image:", error);
    //         return null;
    //     }
    // };

    const mergeLayouts = async (files) => {
        const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");

        // Process files and convert PDFs to images
        const processedFiles = await Promise.all(
            files.map(async (file) => {
                const cleanName = (file.name || file.file?.name || "").replaceAll(
                    " ",
                    ""
                );
                const layout = layouts[cleanName] || {};

                let editedImage =
                    layout.editedImage ||
                    file.editedImage ||
                    (file.file instanceof Blob ? URL.createObjectURL(file.file) : null);

                // console.log("hirtuirty4854567565");

                // Check if file is a PDF and needs conversion
                const isPdf = file.file && (
                    file.file.type === "application/pdf" ||
                    (file.name && file.name.toLowerCase().endsWith(".pdf"))
                );

                // console.log("pdf checkinghgfhgfhgfghfghg", isPdf, editedImage);

                // If it's a PDF and we don't have a converted image, convert it
                if (isPdf) {
                    // console.log("Converting PDF to image for:", file.name);
                    const pdfImage = await convertPdfToImage(file.file);
                    // console.log("pdfImage ===>", pdfImage);
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

        // console.log("processsiibgbgbfgf", processedFiles);

        return processedFiles;
    };

    const fetchStorage = async () => {
        try {
            const files = await getFilesStored();
            console.log("fielsssss ===>", files);
            if (!files || files.length === 0) {
                setLists([]);
                return;
            }

            const allfiles = files.slice((page - 1) * 10, page * 10);

            // console.log("filttttt", allfiles);

            const mergedFiles = await mergeLayouts(allfiles);
            setLists(mergedFiles);
        } catch (error) {
            console.log("Failed to load files from storage");
        }
    };

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            await handleFetch(page);
            await fetchStorage();
            setIsLoading(false);
        })();
    }, [page]);

    // Display the edit view
    const displayEditView = async (file, fileId, croppedFileName) => {
        const fileData = await getFilesStored().then((files) =>
            files.find((f) => f.uid === fileId)
        );

        if (!fileData) return;

        const imageToUse = fileData.editedImage || fileData.file;
        const lightData = fileData.lightsCombo || [];

        const layouts = JSON.parse(localStorage.getItem("layouts") || "{}");
        layouts[fileId] = {
            ...layouts[fileId],
            lightPlacementPositions: lightData,
            editedImage: imageToUse,
            estimate: layouts[fileId]?.estimate || 0.0,
        };
        localStorage.setItem("layouts", JSON.stringify(layouts));

        navigate(`/editview?file=${file?.name}${croppedFileName ? "&croppedFile=" + croppedFileName : ""}`,
            { state: { imageToUse, lightData } }
        );
    };


    const checkStatus = (filename) => {
        if (!filename) return false;

        const layouts = JSON.parse(localStorage.getItem("layouts"));

        if (!layouts || !layouts[filename]) return false;

        const data = layouts[filename];

        if (!data) return false;

        return data?.status === 1 ? false : true
    };

    const handleApprove = async () => {
        const apiUrl = greenhseBaseUrl + `index.php?type=approve`;
        setIsLoading(true);
        try {
            const res = await fetch(apiUrl,
                {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user?.token}`,
                    },
                    body: JSON.stringify({
                        uuid: detail?.uid, status: 2
                    })
                }
            );

            const result = await res.json();
            if (result?.success === true) {
                const layouts = JSON.parse(localStorage.getItem("layouts"));
                const data = layouts[detail?.name];
                if (data) {
                    layouts[detail?.name] = { ...data, status: 2 };
                    localStorage.setItem("layouts", JSON.stringify(layouts));
                    await handleFetch();
                    await fetchStorage();
                    setIsLoading(false);
                    setDetail(null);
                    setIsPop(false);
                }
            }
        } catch (error) {
            console.log("Approval error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    console.log("listinssssss", lists);

    return (
        <>
            <div style={{ padding: "20px" }}>
                <h3 className="plans-title">Plans</h3>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Sr No.</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Design</th>
                            <th>Status</th>
                            <th style={{ textAlign: "center" }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {lists?.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                                    <div className="no-data">
                                        <p>No requests found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            lists.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}.</td>
                                    <td>{item?.first_name !== "" ? item?.first_name : "N/A"}</td>
                                    <td>{item?.email !== "" ? item?.email : "N/A"}</td>
                                    <td>
                                        {item &&
                                            renderFilePreview(
                                                item,
                                                getFileName(item),
                                                index
                                            )}
                                    </td>
                                    <td>
                                        <span className={`status ${checkStatus(item?.name) ? "approved" : "pending"}`}>
                                            {checkStatus(item?.name) ? "Approved" : "Pending"}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button className="btn edit" onClick={() => { displayEditView(item, item?.uid, ""); }}>
                                            Edit
                                        </button>

                                        {!checkStatus(item?.name) && <button className="btn approve" onClick={() => { setDetail(item); setIsPop(true); }}>
                                            Approve
                                        </button>}
                                    </td>
                                </tr>
                            )
                            ))}
                    </tbody>
                </table>

                {tableData && (
                    <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
                        <Pagination
                            count={tableData.total_pages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            renderItem={(item) => (
                                <PaginationItem
                                    slots={{
                                        previous: ArrowBackIcon,
                                        next: ArrowForwardIcon,
                                    }}
                                    {...item}
                                />
                            )}
                        />
                    </Stack>
                )}

            </div>

            {isPop && (
                <div className="logout-overlay">
                    <div className="logout-modal">
                        <h4>Confirm Approve</h4>
                        <p>Are you sure you want to Approve this Design?</p>
                        <div className="logout-actions">
                            <button className="btn cancel" onClick={() => setIsPop(false)}>
                                Cancel
                            </button>
                            <button className="btn confirm" onClick={handleApprove}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLoading && <DataLoading />}

        </>
    );
}