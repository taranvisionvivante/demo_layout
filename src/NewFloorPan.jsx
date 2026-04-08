import React, { useState, useRef, useEffect } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import PanToolIcon from "@mui/icons-material/PanTool";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

import battenImg from "./assets/Batten_uk5xod.png";
import amariImg from "./assets/Amari_4_light_qsp4eu.png";
import slimImg from "./assets/slim_floodlight_runedf.png";
import supernovaImg from "./assets/Supernova_onix7z.png";
import { Button } from "react-bootstrap";

const GEMINI_KEY = import.meta.env.VITE_REACT_APP_GEMINI_KEY;
const CLAUDE_API_KEY = import.meta.env.VITE_REACT_APP_CLAUDE_API_KEY;

const LIGHTS = [
    { id: "batten", label: "Batten UK", src: battenImg },
    { id: "amari", label: "Amari 4 Light", src: amariImg },
    { id: "slim", label: "Slim Floodlight", src: slimImg },
    { id: "supernova", label: "Supernova Onix", src: supernovaImg },
];

const makeKey = () => `light-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const NewFloorPlan = () => {
    // ── image / scale state ──
    const imageRef = useRef(null);
    const [image, setImage] = useState(null);
    const [points, setPoints] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [cmInput, setCmInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const [showLightPicker, setShowLightPicker] = useState(false);

    const [placedLights, setPlacedLights] = useState([]);
    const [activeKey, setActiveKey] = useState(null);
    const [hiddenKeys, setHiddenKeys] = useState(new Set());
    const [isDragging, setIsDragging] = useState(false);

    const zoomRef = useRef(null);
    const [isPanningEnabled, setIsPanningEnabled] = useState(true);
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef({ x: 0, y: 0 });
    const panBaseRef = useRef({ x: 0, y: 0 });

    // ── refs ──
    const imgRef = useRef();
    const canvasRef = useRef();
    const containerRef = useRef();


    const handleImageClick = () => {
        imageRef.current?.click();
    };

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
            setPoints([]);
            setResult(null);
            setError("");
            setPlacedLights([]);
            setActiveKey(null);
            setHiddenKeys(new Set());
        };
        reader.readAsDataURL(file);
    };

    const drawOverlay = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
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

    const handleImgClick = (e) => {
        // Only allow point placement when panning is OFF
        if (isPanningEnabled) return;
        if (points.length >= 2) return;

        const rect = imgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newPoints = [...points, { x, y }];
        setPoints(newPoints);
        if (newPoints.length === 2) setTimeout(() => setShowPopup(true), 150);
    };

    const resetPoints = () => {
        setPoints([]);
        setShowPopup(false);
        setCmInput("");
        setResult(null);
        setError("");
        const canvas = canvasRef.current;
        if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    };

    const startPan = (clientX, clientY) => {
        if (!zoomRef.current) return;
        const state = zoomRef.current.instance?.transformState || { positionX: 0, positionY: 0 };
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

    const endPan = () => setIsPanning(false);

    useEffect(() => {
        const prevent = (e) => {
            if (!isPanningEnabled) { e.preventDefault(); e.stopPropagation(); }
        };
        if (!isPanningEnabled) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
            window.addEventListener("wheel", prevent, { passive: false, capture: true });
            window.addEventListener("touchmove", prevent, { passive: false, capture: true });
        } else {
            document.body.style.overflow = "auto";
            document.body.style.touchAction = "auto";
            window.removeEventListener("wheel", prevent, { capture: true });
            window.removeEventListener("touchmove", prevent, { capture: true });
        }
        return () => {
            document.body.style.overflow = "auto";
            document.body.style.touchAction = "auto";
            window.removeEventListener("wheel", prevent, { capture: true });
            window.removeEventListener("touchmove", prevent, { capture: true });
        };
    }, [isPanningEnabled]);

    const buildAnnotatedBase64 = () =>
        new Promise((resolve) => {
            const img = imgRef.current;
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

    const analyzeWithGemini = async () => {
        const cm = parseFloat(cmInput);
        if (!cm || cm <= 0) { setError("Please enter a valid distance in cm."); return; }
        setError(""); setLoading(true); setShowPopup(false);
        try {
            const dx = points[0].x - points[1].x;
            const dy = points[0].y - points[1].y;
            const pixelDist = Math.sqrt(dx * dx + dy * dy);
            const pixelsPerCm = pixelDist / cm;
            const annotatedBase64 = await buildAnnotatedBase64();

            const imgWidth = imgRef.current.offsetWidth;
            const imgHeight = imgRef.current.offsetHeight;

            const prompt =
               `This is a floor plan image. I have marked two points (labeled 1 and 2) connected by a blue dashed line.
                The real-world distance between point 1 and point 2 is ${cm} cm.
                The pixel distance is ${pixelDist.toFixed(2)} pixels.
                The displayed image size is ${imgWidth}px wide and ${imgHeight}px tall.
                IMPORTANT SCALE RULE: 1 grid box = 10px (fixed).
                Using that rule:
                1. Count how many grid squares span between point 1 and point 2.
                2. Compute cm_per_grid = ${cm} / grids_between_points
                3. pixels_per_cm = 10 / cm_per_grid   (since 1 grid = 10px)
                4. floor_plan_width_cm  = ${imgWidth}  / pixels_per_cm
                5. floor_plan_height_cm = ${imgHeight} / pixels_per_cm
                6. floor_plan_area_cm2  = floor_plan_width_cm * floor_plan_height_cm
                7. floor_plan_area_m2   = floor_plan_area_cm2 / 10000
                8. A standard light fixture covers roughly a circular area of radius 200cm (r=200cm).
                   light_coverage_area_cm2 = Math.PI * 200 * 200
                   light_coverage_area_m2  = light_coverage_area_cm2 / 10000
                9. coverage_percent = (light_coverage_area_cm2 / floor_plan_area_cm2) * 100
                Use THIS computed pixels_per_cm for all further calculations, NOT the raw pixel/cm ratio.
                Respond ONLY as JSON, no markdown:
                {
                  "grids_between_points":<number|null>,
                  "cm_per_grid":<number|null>,
                  "pixels_per_grid":10,
                  "pixels_per_cm":<computed from 10px/grid rule>,
                  "light_fixture_size_px":<pixels_per_cm * 30>,
                  "floor_plan_width_cm":<number>,
                  "floor_plan_height_cm":<number>,
                  "floor_plan_area_cm2":<number>,
                  "floor_plan_area_m2":<number>,
                  "light_coverage_area_cm2":<number>,
                  "light_coverage_area_m2":<number>,
                  "coverage_percent":<number>,
                  "explanation":"<brief>"
                }`;

            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": CLAUDE_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "anthropic-dangerous-direct-browser-access": "true",
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-5",
                    max_tokens: 1000,
                    messages: [{
                        role: "user",
                        content: [
                            { type: "image", source: { type: "base64", media_type: "image/png", data: annotatedBase64 } },
                            { type: "text", text: prompt },
                        ],
                    }],
                }),
            });

            const data = await res.json();
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
            setShowLightPicker(true);

        } catch (err) { setError("Claude API error: " + err.message); }
        setLoading(false);
    };

    const placeLight = (light) => {
        if (!result || !points[0] || !points[1]) return;
        const midX = (points[0].x + points[1].x) / 2;
        const midY = (points[0].y + points[1].y) / 2;
        const sizePx = result.light_fixture_size_px
            ? Math.max(20, Math.round(parseFloat(result.light_fixture_size_px)))
            : Math.max(20, Math.round(parseFloat(result.pixelsPerCm) * 30));

        const key = makeKey();
        setPlacedLights((prev) => [...prev, { key, src: light.src, label: light.label, x: midX, y: midY, sizePx, hidden: false }]);
        setActiveKey(key);
        setShowLightPicker(false);
    };

    const updateLight = (key, updates) => {
        setPlacedLights((prev) => prev.map((l) => l.key === key ? { ...l, ...updates } : l));
    };

    const copyLight = (key) => {
        const src = placedLights.find((l) => l.key === key);
        if (!src) return;
        const newKey = makeKey();
        setPlacedLights((prev) => [...prev, { ...src, key: newKey, x: src.x + 40, y: src.y + 40 }]);
        setActiveKey(newKey);
    };

    const deleteLight = (key) => {
        setPlacedLights((prev) => prev.filter((l) => l.key !== key));
        if (activeKey === key) setActiveKey(null);
    };

    const toggleHide = (key) => {
        setHiddenKeys((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const getActionPos = (light) => {
        let ax = light.x + light.sizePx / 2 + 10;
        let ay = light.y - 32;
        if (imgRef.current) {
            const W = imgRef.current.offsetWidth;
            const H = imgRef.current.offsetHeight;
            const btnW = 170;
            const pad = 10;
            ax = clamp(ax, pad, W - btnW - pad);
            ay = clamp(ay, pad, H - 32 - pad);
        }
        return { ax, ay };
    };

    const downloadAnnotatedImage = async () => {
        const base64 = await buildAnnotatedBase64();
        const link = document.createElement("a");
        link.href = "data:image/png;base64," + base64;
        link.download = "annotated_floorplan.png";
        link.click();
    };

    const s = {
        wrap: { fontFamily: "sans-serif", padding: "20px", maxWidth: 960, margin: "0 auto" },
        h2: { fontSize: 20, fontWeight: 500, marginBottom: 16 },
        toolbar: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" },
        toolBtn: (active) => ({
            padding: "6px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13,
            cursor: "pointer", fontWeight: 500,
            background: active ? "#2563EB" : "#fff",
            color: active ? "#fff" : "#555",
        }),
        zoomBtn: { padding: "5px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, cursor: "pointer", background: "green" },
        zoomoutBtn: { padding: "5px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, cursor: "pointer", background: "red" },
        resetZoomBtn: { padding: "5px 12px", borderRadius: 6, border: "1px solid #ddd", fontSize: 14, cursor: "pointer", background: "grey" },
        canvasWrap: { position: "relative", display: "inline-block", userSelect: "none" },
        overlay: { position: "absolute", top: 0, left: 0, pointerEvents: "none" },
        actionBar: { position: "absolute", display: "flex", gap: 4, zIndex: 30 },
        actionBtn: (color = "#374151") => ({
            width: 26, height: 26, borderRadius: 6, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: color, color: "#fff", fontSize: 12,
        }),
        dragHandle: {
            width: 26, height: 26, borderRadius: 6, border: "none", cursor: "grab",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#6B7280", color: "#fff",
        },
        popupOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
        popup: { background: "#fff", borderRadius: 12, padding: "28px 32px", minWidth: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.18)" },
        popupTitle: { fontSize: 16, fontWeight: 500, marginBottom: 8 },
        popupSub: { fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 1.5 },
        input: { width: "100%", boxSizing: "border-box", padding: "9px 12px", fontSize: 15, border: "1px solid #ddd", borderRadius: 8, marginBottom: 16 },
        btnRow: { display: "flex", gap: 10 },
        btnPrimary: { flex: 1, padding: "9px 0", background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", fontWeight: 500 },
        btnSecondary: { flex: 1, padding: "9px 0", background: "transparent", color: "#555", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, cursor: "pointer" },
        lightGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginTop: 16 },
        lightCard: (active) => ({
            border: active ? "2px solid #2563EB" : "1.5px solid #e5e7eb",
            borderRadius: 10, padding: "14px 10px", cursor: "pointer",
            textAlign: "center", background: active ? "#EFF6FF" : "#fff",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }),
        lightImg: { width: 72, height: 72, objectFit: "contain" },
        lightLabel: { fontSize: 12, color: "#444", fontWeight: 500 },
        resultCard: { marginTop: 20, background: "#f8f9ff", border: "1px solid #dbeafe", borderRadius: 10, padding: "16px 20px" },
        hint: { fontSize: 13, color: "#666", marginTop: 8 },
        error: { color: "#dc2626", fontSize: 13, marginTop: 8 },
        loading: { marginTop: 16, fontSize: 14, color: "#555" },
        resetBtn: { marginTop: 8, fontSize: 13, color: "#2563EB", background: "none", border: "none", cursor: "pointer", padding: 0, display: "block" },
        sectionLabel: { fontSize: 13, fontWeight: 500, color: "#1e40af", margin: "12px 0 8px" },
        metricGrid: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 12 },
        metricCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" },
        metricLabel: { fontSize: 11, color: "#888", marginBottom: 3 },
        metricValue: (size = 20) => ({ fontSize: size, fontWeight: 500 }),
        coverageBarWrap: { background: "#e5e7eb", borderRadius: 6, height: 10, overflow: "hidden", marginTop: 4 },
        coverageBarFill: (pct) => ({
            width: `${Math.min(100, parseFloat(pct)).toFixed(1)}%`,
            background: "#2563EB", height: "100%", borderRadius: 6,
            transition: "width 0.4s ease",
        }),
    };

    return (
        <div style={s.wrap}>
            <h2 style={s.h2}>Floor plan scale detector</h2>

            <Button variant="secondary" onClick={handleImageClick}>
                Upload Floor Plan
            </Button>

            <input className="d-none" type="file" accept="image/*" onChange={handleImage} ref={imageRef} />

            {image && (
                <div className="mt-3">
                    {/* ── Toolbar ── */}
                    <div style={s.toolbar}>
                        <button style={s.toolBtn(isPanningEnabled)} onClick={() => setIsPanningEnabled(true)}>
                            🖐 Pan mode
                        </button>
                        <button style={s.toolBtn(!isPanningEnabled)} onClick={() => setIsPanningEnabled(false)}>
                            📍 Place points
                        </button>
                        <button style={s.zoomBtn} title="Zoom In" onClick={() => zoomRef.current?.zoomIn()}>
                            <i className="bi bi-zoom-in"></i>
                        </button>
                        <button style={s.zoomoutBtn} title="Zoom Out" onClick={() => zoomRef.current?.zoomOut()}>
                            <i className="bi bi-zoom-out"></i>
                        </button>
                        <button style={s.resetZoomBtn} title="Reset zoom" onClick={() => zoomRef.current?.resetTransform()}>
                            <i className="bi bi-arrow-clockwise"></i>
                        </button>
                        {result && (
                            <button style={s.toolBtn(false)} onClick={() => setShowLightPicker(true)}>
                                + Add light fixture
                            </button>
                        )}
                    </div>

                    <p style={s.hint}>
                        {!isPanningEnabled && points.length === 0 && "Click point 1 on the image for scale calibration."}
                        {!isPanningEnabled && points.length === 1 && "Now click point 2."}
                        {!isPanningEnabled && points.length === 2 && (loading ? "Analyzing…" : "Two scale points set.")}
                        {isPanningEnabled && "Pan mode active — use scroll or drag to navigate."}
                    </p>

                    <div style={{ border: "2px solid black", overflow: "hidden", padding: 5 }}>
                        <TransformWrapper
                            ref={zoomRef}
                            minScale={0.5}
                            maxScale={4}
                            initialScale={1}
                            doubleClick={{ disabled: true }}
                            panning={{ disabled: !isPanningEnabled, velocityDisabled: true }}
                            centerOnInit={false}
                            limitToBounds={false}
                            wheel={{ step: 0.01, smoothStep: 0.005 }}
                        >
                            <TransformComponent
                                wrapperStyle={{
                                    justifyContent: "flex-start",
                                    alignItems: "flex-start",
                                    touchAction: "none",
                                    cursor: isPanningEnabled ? (isPanning ? "grabbing" : "grab") : "crosshair",
                                }}
                                contentStyle={{
                                    justifyContent: "flex-start",
                                    alignItems: "flex-start",
                                    position: "relative",
                                    transformOrigin: "top left",
                                    touchAction: "none",
                                }}
                            >
                                <div
                                    ref={containerRef}
                                    style={s.canvasWrap}
                                    onMouseDown={(e) => { if (isPanningEnabled) startPan(e.clientX, e.clientY); }}
                                    onMouseMove={(e) => { if (isPanningEnabled) movePan(e.clientX, e.clientY); }}
                                    onMouseUp={() => { if (isPanningEnabled) endPan(); }}
                                    onMouseLeave={() => { if (isPanningEnabled) endPan(); }}
                                    onTouchStart={(e) => { if (isPanningEnabled) { const t = e.touches[0]; startPan(t.clientX, t.clientY); } }}
                                    onTouchMove={(e) => { if (isPanningEnabled) { const t = e.touches[0]; movePan(t.clientX, t.clientY); } }}
                                    onTouchEnd={() => { if (isPanningEnabled) endPan(); }}
                                >
                                    <img
                                        ref={imgRef}
                                        src={image}
                                        alt="floor plan"
                                        draggable={false}
                                        style={{ maxWidth: "100%", display: "block", pointerEvents: isPanningEnabled ? "none" : "auto" }}
                                        onClick={handleImgClick}
                                        onLoad={drawOverlay}
                                    />

                                    <canvas ref={canvasRef} style={s.overlay} />

                                    {placedLights.map((light) => {
                                        console.log("Rendering light", light);
                                        const isHidden = hiddenKeys.has(light.key);
                                        const { ax, ay } = getActionPos(light);

                                        return (
                                            <React.Fragment key={light.key}>
                                                {!isHidden && (
                                                    <img
                                                        src={light.src}
                                                        alt={light.label}
                                                        style={{
                                                            position: "absolute",
                                                            left: light.x - light.sizePx / 2,
                                                            top: light.y - light.sizePx / 2,
                                                            width: light.sizePx,
                                                            height: light.sizePx,
                                                            objectFit: "contain",
                                                            cursor: "pointer",
                                                            zIndex: 10,
                                                            pointerEvents: "auto",
                                                            outline: activeKey === light.key ? "2px solid #2563EB" : "none",
                                                            borderRadius: 4,
                                                        }}
                                                        onClick={(e) => { e.stopPropagation(); setActiveKey(light.key); }}
                                                    />
                                                )}

                                                {isHidden && (
                                                    <div
                                                        style={{
                                                            position: "absolute",
                                                            left: light.x - 6, top: light.y - 6,
                                                            width: 12, height: 12,
                                                            borderRadius: "50%", background: "#2563EB",
                                                            border: "2px solid #fff", zIndex: 10,
                                                            cursor: "pointer", pointerEvents: "auto",
                                                        }}
                                                        onClick={(e) => { e.stopPropagation(); toggleHide(light.key); setActiveKey(light.key); }}
                                                    />
                                                )}

                                                <div
                                                    style={{ ...s.actionBar, left: ax, top: ay }}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                >
                                                    <div
                                                        style={s.dragHandle}
                                                        title="Move"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setIsDragging(true);
                                                            setIsPanningEnabled(false);
                                                            const rect = imgRef.current.getBoundingClientRect();
                                                            const startOffX = e.clientX - rect.left - light.x;
                                                            const startOffY = e.clientY - rect.top - light.y;

                                                            const onMove = (ev) => {
                                                                updateLight(light.key, {
                                                                    x: ev.clientX - rect.left - startOffX,
                                                                    y: ev.clientY - rect.top - startOffY,
                                                                });
                                                            };
                                                            const onUp = () => {
                                                                window.removeEventListener("mousemove", onMove);
                                                                window.removeEventListener("mouseup", onUp);
                                                                setIsDragging(false);
                                                            };
                                                            window.addEventListener("mousemove", onMove);
                                                            window.addEventListener("mouseup", onUp);
                                                        }}
                                                    >
                                                        <PanToolIcon style={{ fontSize: 14 }} />
                                                    </div>

                                                    <button
                                                        style={s.actionBtn("#4B5563")}
                                                        title="Grow"
                                                        onClick={() => updateLight(light.key, { sizePx: light.sizePx + 8 })}
                                                    >+</button>

                                                    <button
                                                        style={s.actionBtn("#4B5563")}
                                                        title="Shrink"
                                                        onClick={() => updateLight(light.key, { sizePx: Math.max(12, light.sizePx - 8) })}
                                                    >−</button>

                                                    <button
                                                        style={s.actionBtn("#2563EB")}
                                                        title="Copy"
                                                        onClick={() => copyLight(light.key)}
                                                    >
                                                        <ContentCopyIcon style={{ fontSize: 13 }} />
                                                    </button>

                                                    <button
                                                        style={s.actionBtn("#DC2626")}
                                                        title="Delete"
                                                        onClick={() => deleteLight(light.key)}
                                                    >✕</button>

                                                    <button
                                                        style={s.actionBtn("#6B7280")}
                                                        title={isHidden ? "Show" : "Hide"}
                                                        onClick={() => toggleHide(light.key)}
                                                    >
                                                        {isHidden
                                                            ? <VisibilityIcon style={{ fontSize: 13 }} />
                                                            : <VisibilityOffIcon style={{ fontSize: 13 }} />
                                                        }
                                                    </button>
                                                </div>
                                            </React.Fragment>
                                        );
                                    })}
                                </div>
                            </TransformComponent>
                        </TransformWrapper>
                    </div>

                    {points.length > 0 && (
                        <button style={s.resetBtn} onClick={resetPoints}>↺ Reset scale points</button>
                    )}

                    {points.length === 2 && (
                        <button
                            onClick={downloadAnnotatedImage}
                            style={{ marginTop: 8, display: "block", padding: "7px 16px", background: "transparent", border: "1px solid #2563EB", color: "#2563EB", borderRadius: 8, fontSize: 13, cursor: "pointer" }}
                        >
                            ↓ Download annotated image
                        </button>
                    )}
                </div>
            )}

            {loading && <p style={s.loading}>⏳ Analyzing with Claude…</p>}
            {error && <p style={s.error}>{error}</p>}

            {/* ── Scale result card ── */}
            {result && (
                <div style={s.resultCard}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#1e40af", marginBottom: 12 }}>Scale analysis results</div>

                    {/* Scale metrics */}
                    <div style={s.metricGrid}>
                        {[
                            ["Pixels / cm", parseFloat(result.pixelsPerCm).toFixed(1)],
                            ["Pixel distance", `${result.pixelDist} px`],
                            ["Real distance", `${result.cm} cm`],
                            result.pixels_per_grid != null && ["Pixels / grid", parseFloat(result.pixels_per_grid).toFixed(1)],
                            result.cm_per_grid != null && ["cm / grid", parseFloat(result.cm_per_grid).toFixed(2)],
                            result.light_fixture_size_px != null && ["Light icon size (AI)", `${Math.round(result.light_fixture_size_px)} px`],
                        ].filter(Boolean).map(([label, val]) => (
                            <div key={label} style={s.metricCard}>
                                <div style={s.metricLabel}>{label}</div>
                                <div style={s.metricValue(20)}>{val}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Floor plan area + light coverage section ── */}
                    {result.floor_plan_area_m2 != null && (
                        <>
                            <div style={s.sectionLabel}>Floor plan area &amp; light coverage</div>
                            <div style={s.metricGrid}>
                                {[
                                    ["Floor width", `${(parseFloat(result.floor_plan_width_cm) / 100).toFixed(2)} m`],
                                    ["Floor height", `${(parseFloat(result.floor_plan_height_cm) / 100).toFixed(2)} m`],
                                    ["Total floor area", `${parseFloat(result.floor_plan_area_m2).toFixed(2)} m²`],
                                    ["1 light covers", `${parseFloat(result.light_coverage_area_m2).toFixed(2)} m²`],
                                    ["Coverage %", `${parseFloat(result.coverage_percent).toFixed(1)}%`],
                                    ["Lights needed (full)", `${Math.ceil(result.floor_plan_area_m2 / result.light_coverage_area_m2)}`],
                                ].map(([label, val]) => (
                                    <div key={label} style={s.metricCard}>
                                        <div style={s.metricLabel}>{label}</div>
                                        <div style={s.metricValue(18)}>{val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Coverage progress bar */}
                            <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>
                                Coverage of 1 light fixture on this floor plan
                            </div>
                            <div style={s.coverageBarWrap}>
                                <div style={s.coverageBarFill(result.coverage_percent)} />
                            </div>
                            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                                {parseFloat(result.coverage_percent).toFixed(1)}% of total floor area per light
                            </div>
                        </>
                    )}

                    {result.explanation && (
                        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginTop: 12 }}>
                            {result.explanation}
                        </div>
                    )}
                </div>
            )}

            {/* ── Distance input popup ── */}
            {showPopup && (
                <div style={s.popupOverlay}>
                    <div style={s.popup}>
                        <div style={s.popupTitle}>Enter real-world distance</div>
                        <div style={s.popupSub}>What is the actual distance between the two points you clicked?</div>
                        <input
                            style={s.input} type="number" min="0.1" step="0.1"
                            placeholder="Distance in cm (e.g. 300)"
                            value={cmInput} onChange={(e) => setCmInput(e.target.value)} autoFocus
                            onKeyDown={(e) => e.key === "Enter" && analyzeWithGemini()}
                        />
                        {error && <p style={{ ...s.error, marginTop: -8, marginBottom: 10 }}>{error}</p>}
                        <div style={s.btnRow}>
                            <button style={s.btnSecondary} onClick={() => { setShowPopup(false); resetPoints(); }}>Cancel</button>
                            <button style={s.btnPrimary} onClick={analyzeWithGemini}>Analyze</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Light fixture picker popup ── */}
            {showLightPicker && (
                <div style={s.popupOverlay}>
                    <div style={{ ...s.popup, minWidth: 400 }}>
                        <div style={s.popupTitle}>Choose a light fixture</div>
                        <div style={s.popupSub}>
                            It will be placed at the midpoint of your scale line.
                            {result?.light_fixture_size_px && (
                                <> AI-recommended size: <strong>{Math.round(result.light_fixture_size_px)}px</strong> (≈ 30 cm at floor plan scale).</>
                            )}
                            {result?.light_coverage_area_m2 != null && (
                                <> Each fixture covers approximately <strong>{parseFloat(result.light_coverage_area_m2).toFixed(2)} m²</strong>.</>
                            )}
                        </div>
                        <div style={s.lightGrid}>
                            {LIGHTS.map((light) => (
                                <div key={light.id} style={s.lightCard(false)} onClick={() => placeLight(light)}>
                                    <img src={light.src} alt={light.label} style={s.lightImg} />
                                    <div style={s.lightLabel}>{light.label}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ ...s.btnRow, marginTop: 18 }}>
                            <button style={s.btnSecondary} onClick={() => setShowLightPicker(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewFloorPlan;