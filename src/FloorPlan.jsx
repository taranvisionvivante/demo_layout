import React, { useState, useRef, useEffect } from "react";

// Import your light fixture images from assets
import battenImg from "./assets/Batten_uk5xod.png";
import amariImg from "./assets/Amari_4_light_qsp4eu.png";
import slimImg from "./assets/slim_floodlight_runedf.png";
import supernovaImg from "./assets/Supernova_onix7z.png";

const GEMINI_KEY = "AIzaSyDXbw3u9aeREZEBXPUfGh3qj6NT6PX3hd8";

const LIGHTS = [
    { id: "batten", label: "Batten UK", src: battenImg },
    { id: "amari", label: "Amari 4 Light", src: amariImg },
    { id: "slim", label: "Slim Floodlight", src: slimImg },
    { id: "supernova", label: "Supernova Onix", src: supernovaImg },
];

const FloorPlan = () => {
    const [image, setImage] = useState(null);
    const [points, setPoints] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [cmInput, setCmInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    // Light fixture state
    const [showLightPicker, setShowLightPicker] = useState(false);
    const [selectedLight, setSelectedLight] = useState(null);
    const [placedLight, setPlacedLight] = useState(null);

    const imgRef = useRef();
    const canvasRef = useRef();
    const containerRef = useRef();

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
            setPoints([]);
            setResult(null);
            setError("");
            setPlacedLight(null);
            setSelectedLight(null);
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

        // Draw dashed line between points
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

        // Draw numbered blue dot markers
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

        // Draw placed light fixture at midpoint
        if (placedLight) {
            const lightImg = new window.Image();
            lightImg.onload = () => {
                const half = placedLight.sizePx / 2;
                ctx.save();
                ctx.translate(placedLight.x, placedLight.y);
                ctx.drawImage(lightImg, -half, -half, placedLight.sizePx, placedLight.sizePx);
                ctx.restore();
            };
            lightImg.src = placedLight.src;
        }
    };

    useEffect(() => {
        drawOverlay();
    }, [points, placedLight]);

    const handleClick = (e) => {
        if (points.length >= 2) return;
        const rect = imgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newPoints = [...points, { x, y }];
        setPoints(newPoints);
        if (newPoints.length === 2) {
            setTimeout(() => setShowPopup(true), 150);
        }
    };

    const resetPoints = () => {
        setPoints([]);
        setShowPopup(false);
        setCmInput("");
        setResult(null);
        setError("");
        setPlacedLight(null);
        setSelectedLight(null);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const buildAnnotatedBase64 = () => {
        return new Promise((resolve) => {
            const img = imgRef.current;
            const offCanvas = document.createElement("canvas");
            const naturalW = img.naturalWidth;
            const naturalH = img.naturalHeight;
            const dispW = img.offsetWidth;
            const dispH = img.offsetHeight;
            const scaleX = naturalW / dispW;
            const scaleY = naturalH / dispH;

            offCanvas.width = naturalW;
            offCanvas.height = naturalH;
            const ctx = offCanvas.getContext("2d");

            const baseImg = new Image();
            baseImg.onload = () => {
                ctx.drawImage(baseImg, 0, 0, naturalW, naturalH);

                const p1 = { x: points[0].x * scaleX, y: points[0].y * scaleY };
                const p2 = { x: points[1].x * scaleX, y: points[1].y * scaleY };

                const r = Math.max(10, Math.round(naturalW / 80));

                [p1, p2].forEach((p, i) => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                    ctx.fillStyle = "#2563EB";
                    ctx.fill();
                    ctx.strokeStyle = "#fff";
                    ctx.lineWidth = r * 0.3;
                    ctx.stroke();

                    ctx.fillStyle = "#fff";
                    ctx.font = `bold ${r * 1.2}px sans-serif`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(i + 1, p.x, p.y);
                });

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.strokeStyle = "#2563EB";
                ctx.lineWidth = r * 0.4;
                ctx.setLineDash([r * 1.5, r]);
                ctx.stroke();
                ctx.setLineDash([]);

                resolve(offCanvas.toDataURL("image/png").split(",")[1]);
            };
            baseImg.src = image;
        });
    };

    const analyzeWithGemini = async () => {
        const cm = parseFloat(cmInput);
        if (!cm || cm <= 0) {
            setError("Please enter a valid distance in cm.");
            return;
        }
        setError("");
        setLoading(true);
        setShowPopup(false);

        try {
            const dx = points[0].x - points[1].x;
            const dy = points[0].y - points[1].y;
            const pixelDist = Math.sqrt(dx * dx + dy * dy);
            const pixelsPerCm = pixelDist / cm;

            const annotatedBase64 = await buildAnnotatedBase64();

            const prompt = `This is a floor plan image. I have marked two points (labeled 1 and 2) connected by a blue dashed line on the image.
              The real-world distance between point 1 and point 2 is ${cm} cm.
              The pixel distance between point 1 and point 2 is ${pixelDist.toFixed(2)} pixels.

              Based on the scale grid lines visible in this floor plan:
              1. How many grid squares span between point 1 and point 2?
              2. What is the size of one grid square in cm (grids per cm)?
              3. How many pixels are in one grid square (pixels per grid)?

              Please respond ONLY as JSON, no markdown, no extra text:
              {
                "grids_between_points": <number or null>,
                "cm_per_grid": <number or null>,
                "pixels_per_grid": <number or null>,
                "pixels_per_cm": ${pixelsPerCm.toFixed(4)},
                "explanation": "<brief explanation>"
              }`;

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: prompt },
                                    { inline_data: { mime_type: "image/png", data: annotatedBase64 } },
                                ],
                            },
                        ],
                    }),
                }
            );

            const data = await res.json();
            const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const clean = raw.replace(/```json|```/g, "").trim();

            let parsed;
            try {
                parsed = JSON.parse(clean);
            } catch {
                parsed = {
                    pixels_per_cm: pixelsPerCm,
                    light_fixture_size_px: Math.round(pixelsPerCm * 30),
                    explanation: raw,
                };
            }

            setResult({
                pixelDist: pixelDist.toFixed(1),
                cm,
                pixelsPerCm: pixelsPerCm.toFixed(2),
                ...parsed,
            });

            // Auto-show light picker after analysis
            setShowLightPicker(true);
        } catch (err) {
            setError("Gemini API error: " + err.message);
        }

        setLoading(false);
    };

    const downloadAnnotatedImage = async () => {
        const base64 = await buildAnnotatedBase64();
        const link = document.createElement("a");
        link.href = "data:image/png;base64," + base64;
        link.download = "annotated_floorplan.png";
        link.click();
    };

    const placeLight = (light) => {
        if (!result || !points[0] || !points[1]) return;

        const midX = (points[0].x + points[1].x) / 2;
        const midY = (points[0].y + points[1].y) / 2;

        // Use AI-recommended size, fallback to pixelsPerCm * 30
        const sizePx = result.light_fixture_size_px
            ? Math.max(20, Math.round(parseFloat(result.light_fixture_size_px)))
            : Math.max(20, Math.round(parseFloat(result.pixelsPerCm) * 30));

        setPlacedLight({ src: light.src, label: light.label, x: midX, y: midY, sizePx });
        setSelectedLight(light.id);
        setShowLightPicker(false);
    };

    const s = {
        wrap: { fontFamily: "sans-serif", padding: "20px", maxWidth: 900, margin: "0 auto" },
        h2: { fontSize: 20, fontWeight: 500, marginBottom: 16 },
        imgWrap: {
            position: "relative", display: "inline-block", marginTop: 16,
            cursor: points.length < 2 ? "crosshair" : "default",
        },
        canvas: { position: "absolute", top: 0, left: 0, pointerEvents: "none" },
        overlay: {
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
        },
        popup: {
            background: "white", borderRadius: 12, padding: "28px 32px", minWidth: 320,
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
        },
        popupTitle: { fontSize: 16, fontWeight: 500, marginBottom: 8, color: "#111" },
        popupSub: { fontSize: 13, color: "#666", marginBottom: 16, lineHeight: 1.5 },
        input: {
            width: "100%", boxSizing: "border-box", padding: "9px 12px",
            fontSize: 15, border: "1px solid #ddd", borderRadius: 8, marginBottom: 16,
        },
        btnRow: { display: "flex", gap: 10 },
        btnPrimary: {
            flex: 1, padding: "9px 0", background: "#2563EB", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", fontWeight: 500,
        },
        btnSecondary: {
            flex: 1, padding: "9px 0", background: "transparent", color: "#555",
            border: "1px solid #ddd", borderRadius: 8, fontSize: 14, cursor: "pointer",
        },
        resultCard: {
            marginTop: 20, background: "#f8f9ff", border: "1px solid #dbeafe",
            borderRadius: 10, padding: "16px 20px",
        },
        resultTitle: { fontSize: 14, fontWeight: 500, color: "#1e40af", marginBottom: 12 },
        grid4: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 12 },
        metric: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px" },
        metricLabel: { fontSize: 11, color: "#888", marginBottom: 3 },
        metricVal: { fontSize: 20, fontWeight: 500, color: "#111" },
        explanation: { fontSize: 12, color: "#555", lineHeight: 1.6, marginTop: 4 },
        resetBtn: {
            marginTop: 10, fontSize: 13, color: "#2563EB", background: "none",
            border: "none", cursor: "pointer", padding: 0, display: "block",
        },
        hint: { fontSize: 13, color: "#666", marginTop: 10 },
        error: { color: "#dc2626", fontSize: 13, marginTop: 8 },
        loading: { marginTop: 16, fontSize: 14, color: "#555" },
        // Light picker
        lightPickerBox: {
            background: "white", borderRadius: 14, padding: "28px 28px", minWidth: 400,
            maxWidth: 460, boxShadow: "0 4px 32px rgba(0,0,0,0.22)",
        },
        lightGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginTop: 16 },
        lightCard: (active) => ({
            border: active ? "2px solid #2563EB" : "1.5px solid #e5e7eb",
            borderRadius: 10, padding: "14px 10px", cursor: "pointer",
            textAlign: "center", background: active ? "#EFF6FF" : "#fff",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }),
        lightImg: { width: 72, height: 72, objectFit: "contain" },
        lightLabel: { fontSize: 12, color: "#444", fontWeight: 500 },
        placedBadge: {
            marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8,
            background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8,
            padding: "6px 12px", fontSize: 13, color: "#1e40af",
        },
        changeBtn: {
            marginLeft: 6, background: "none", border: "none",
            cursor: "pointer", fontSize: 12, color: "#2563EB",
        },
        placeLightBtn: {
            marginTop: 14, padding: "8px 18px", background: "#2563EB", color: "#fff",
            border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 500,
        },
    };

    return (
        <div style={s.wrap}>
            <h2 style={s.h2}>Floor plan scale detector</h2>

            <input type="file" accept="image/*" onChange={handleImage} />

            {image && (
                <>
                    <p style={s.hint}>
                        {points.length === 0 && "Click point 1 on the image"}
                        {points.length === 1 && "Now click point 2"}
                        {points.length === 2 && (loading ? "Analyzing with Gemini…" : "Two points set.")}
                    </p>

                    <div ref={containerRef} style={s.imgWrap}>
                        <img
                            ref={imgRef}
                            src={image}
                            alt="floor plan"
                            onClick={handleClick}
                            style={{ maxWidth: "100%", display: "block", userSelect: "none" }}
                            draggable={false}
                        />
                        <canvas ref={canvasRef} style={s.canvas} />
                    </div>

                    {placedLight && (
                        <div style={s.placedBadge}>
                            <img src={placedLight.src} alt="" style={{ width: 20, height: 20, objectFit: "contain" }} />
                            <span>{placedLight.label} — {placedLight.sizePx}px at midpoint</span>
                            <button style={s.changeBtn} onClick={() => setShowLightPicker(true)}>Change</button>
                        </div>
                    )}

                    {points.length > 0 && (
                        <button style={s.resetBtn} onClick={resetPoints}>
                            ↺ Reset points &amp; light
                        </button>
                    )}

                    {points.length === 2 && (
                        <button
                            onClick={downloadAnnotatedImage}
                            style={{
                                marginTop: 10, display: "block", padding: "7px 16px",
                                background: "transparent", border: "1px solid #2563EB",
                                color: "#2563EB", borderRadius: 8, fontSize: 13,
                                cursor: "pointer", fontWeight: 500,
                            }}
                        >
                            ↓ Download annotated image
                        </button>
                    )}
                </>
            )}

            {loading && <p style={s.loading}>⏳ Sending to Gemini and analyzing…</p>}
            {error && <p style={s.error}>{error}</p>}

            {result && (
                <div style={s.resultCard}>
                    <div style={s.resultTitle}>Scale analysis results</div>
                    <div style={s.grid4}>
                        <div style={s.metric}>
                            <div style={s.metricLabel}>Pixels / cm</div>
                            <div style={s.metricVal}>{parseFloat(result.pixelsPerCm).toFixed(1)}</div>
                        </div>
                        <div style={s.metric}>
                            <div style={s.metricLabel}>Pixel distance</div>
                            <div style={s.metricVal}>{result.pixelDist} px</div>
                        </div>
                        <div style={s.metric}>
                            <div style={s.metricLabel}>Real distance</div>
                            <div style={s.metricVal}>{result.cm} cm</div>
                        </div>
                        {result.pixels_per_grid != null && (
                            <div style={s.metric}>
                                <div style={s.metricLabel}>Pixels / grid</div>
                                <div style={s.metricVal}>{parseFloat(result.pixels_per_grid).toFixed(1)}</div>
                            </div>
                        )}
                        {result.cm_per_grid != null && (
                            <div style={s.metric}>
                                <div style={s.metricLabel}>cm / grid</div>
                                <div style={s.metricVal}>{parseFloat(result.cm_per_grid).toFixed(2)}</div>
                            </div>
                        )}
                        {result.grids_between_points != null && (
                            <div style={s.metric}>
                                <div style={s.metricLabel}>Grids between points</div>
                                <div style={s.metricVal}>{result.grids_between_points}</div>
                            </div>
                        )}
                        {result.light_fixture_size_px != null && (
                            <div style={s.metric}>
                                <div style={s.metricLabel}>Light icon size (AI)</div>
                                <div style={s.metricVal}>{Math.round(result.light_fixture_size_px)} px</div>
                            </div>
                        )}
                    </div>
                    {result.explanation && (
                        <div style={s.explanation}>{result.explanation}</div>
                    )}
                    {!placedLight && (
                        <button style={s.placeLightBtn} onClick={() => setShowLightPicker(true)}>
                            + Place a light fixture
                        </button>
                    )}
                </div>
            )}

            {/* Distance input popup */}
            {showPopup && (
                <div style={s.overlay}>
                    <div style={s.popup}>
                        <div style={s.popupTitle}>Enter real-world distance</div>
                        <div style={s.popupSub}>
                            What is the actual distance between the two points you clicked?
                        </div>
                        <input
                            style={s.input}
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Distance in cm (e.g. 300)"
                            value={cmInput}
                            onChange={(e) => setCmInput(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => e.key === "Enter" && analyzeWithGemini()}
                        />
                        {error && <p style={{ ...s.error, marginTop: -8, marginBottom: 10 }}>{error}</p>}
                        <div style={s.btnRow}>
                            <button style={s.btnSecondary} onClick={() => { setShowPopup(false); resetPoints(); }}>
                                Cancel
                            </button>
                            <button style={s.btnPrimary} onClick={analyzeWithGemini}>
                                Analyze with Gemini
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Light fixture picker popup */}
            {showLightPicker && (
                <div style={s.overlay}>
                    <div style={s.lightPickerBox}>
                        <div style={s.popupTitle}>Choose a light fixture</div>
                        <div style={s.popupSub}>
                            It will be placed at the midpoint of your line.
                            {result?.light_fixture_size_px && (
                                <> AI-recommended size: <strong>{Math.round(result.light_fixture_size_px)}px</strong> (≈ 30cm at floor plan scale).</>
                            )}
                        </div>
                        <div style={s.lightGrid}>
                            {LIGHTS.map((light) => (
                                <div
                                    key={light.id}
                                    style={s.lightCard(selectedLight === light.id)}
                                    onClick={() => placeLight(light)}
                                >
                                    <img src={light.src} alt={light.label} style={s.lightImg} />
                                    <div style={s.lightLabel}>{light.label}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ ...s.btnRow, marginTop: 18 }}>
                            <button style={s.btnSecondary} onClick={() => setShowLightPicker(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloorPlan;