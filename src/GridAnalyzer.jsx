import { useState, useRef, useEffect, useCallback } from "react";

// ─── CLAUDE API PROMPT ───────────────────────────────────────────────────────
const FLOOR_PLAN_PROMPT = `You are an expert architectural drawing analyzer.

The user has uploaded a floor plan image. Your job is to:

1. Detect the TWO colored marker points (usually colored circles or numbered markers like ① and ②) that indicate a known reference distance.
2. Estimate their pixel X coordinates (left-to-right) in the image.
3. Ask the user what real-world distance (in cm) the two points represent — OR if they've provided it, use that value.
4. Calculate:
   - px_per_cm  = pixel_distance / real_distance_cm
   - grid_50cm_px = px_per_cm * 50
5. Return a JSON response ONLY (no markdown, no explanation outside the JSON) in this exact format:

{
  "marker1_x": <number>,
  "marker2_x": <number>,
  "pixel_distance": <number>,
  "scale_px_per_cm": <number>,
  "grid_50cm_px": <number>,
  "grid_500cm_px": <number>,
  "grid_1000cm_px": <number>,
  "recommended_grid_cm": <number>,
  "image_width_cm": <number>,
  "image_height_cm": <number>,
  "analysis_notes": "<brief string describing what markers were found and confidence level>"
}

Rules:
- If no markers are visible, set marker1_x and marker2_x to -1 and note in analysis_notes.
- recommended_grid_cm should be the smallest grid that results in grid cell >= 8px (minimum visible grid).
- Always respond with ONLY the JSON object, no other text.`;

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a24;
    --border: #2a2a3a;
    --accent: #00e5ff;
    --accent2: #ff6b35;
    --accent3: #a855f7;
    --text: #e8e8f0;
    --muted: #6b6b80;
    --success: #22d3a0;
    --grid-color: rgba(0, 229, 255, 0.35);
    --grid-major: rgba(0, 229, 255, 0.65);
    --marker: #ff6b35;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Mono', monospace; }

  .app {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    flex-direction: column;
  }

  /* ── Header ── */
  .header {
    padding: 20px 32px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--surface);
    position: relative;
    overflow: hidden;
  }
  .header::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent3), var(--accent2));
  }
  .header-icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--accent), var(--accent3));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .header-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.5px;
    color: var(--text);
  }
  .header-sub {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .header-badge {
    margin-left: auto;
    font-size: 10px;
    color: var(--accent);
    border: 1px solid var(--accent);
    padding: 3px 10px;
    border-radius: 20px;
    letter-spacing: 1px;
    text-transform: uppercase;
    opacity: 0.8;
  }

  /* ── Main Layout ── */
  .main {
    display: grid;
    grid-template-columns: 320px 1fr;
    flex: 1;
    overflow: hidden;
    height: calc(100vh - 73px);
  }

  /* ── Sidebar ── */
  .sidebar {
    background: var(--surface);
    border-right: 1px solid var(--border);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .sidebar::-webkit-scrollbar { width: 4px; }
  .sidebar::-webkit-scrollbar-track { background: transparent; }
  .sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .section {
    padding: 20px;
    border-bottom: 1px solid var(--border);
  }
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-title::before {
    content: '';
    width: 12px; height: 2px;
    background: var(--accent);
    border-radius: 1px;
  }

  /* ── Upload Zone ── */
  .upload-zone {
    border: 1.5px dashed var(--border);
    border-radius: 12px;
    padding: 28px 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--surface2);
    position: relative;
    overflow: hidden;
  }
  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--accent);
    background: rgba(0, 229, 255, 0.04);
  }
  .upload-zone input { display: none; }
  .upload-icon { font-size: 28px; margin-bottom: 10px; }
  .upload-text { font-size: 12px; color: var(--muted); line-height: 1.6; }
  .upload-text span { color: var(--accent); cursor: pointer; }
  .upload-filename {
    font-size: 11px;
    color: var(--success);
    margin-top: 8px;
    word-break: break-all;
  }

  /* ── Input Fields ── */
  .field { margin-bottom: 12px; }
  .field label {
    display: block;
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .field input, .field select {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 10px 12px;
    color: var(--text);
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
  }
  .field input:focus, .field select:focus { border-color: var(--accent); }
  .field select option { background: var(--surface2); }

  /* ── Buttons ── */
  .btn {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--accent), #00b4cc);
    color: #000;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,229,255,0.3); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-secondary {
    background: var(--surface2);
    color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Stats ── */
  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px;
  }
  .stat-label { font-size: 9px; color: var(--muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--accent); }
  .stat-unit { font-size: 9px; color: var(--muted); }

  /* ── Grid Controls ── */
  .slider-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .slider-row label { font-size: 10px; color: var(--muted); white-space: nowrap; width: 80px; }
  .slider-row input[type=range] {
    flex: 1;
    accent-color: var(--accent);
    height: 4px;
  }
  .slider-val { font-size: 11px; color: var(--accent); width: 50px; text-align: right; }

  /* ── Toggle ── */
  .toggle-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .toggle-label { font-size: 11px; color: var(--muted); }
  .toggle {
    width: 36px; height: 20px;
    background: var(--border);
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    transition: background 0.2s;
    border: none;
  }
  .toggle.on { background: var(--accent); }
  .toggle::after {
    content: '';
    position: absolute;
    top: 3px; left: 3px;
    width: 14px; height: 14px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
  .toggle.on::after { left: 19px; }

  /* ── Notes ── */
  .analysis-note {
    background: rgba(0,229,255,0.05);
    border: 1px solid rgba(0,229,255,0.2);
    border-radius: 8px;
    padding: 12px;
    font-size: 11px;
    color: var(--muted);
    line-height: 1.6;
    margin-top: 8px;
  }
  .analysis-note span { color: var(--accent); }

  /* ── Loading ── */
  .loading-bar {
    width: 100%;
    height: 3px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 10px;
  }
  .loading-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent3));
    border-radius: 2px;
    animation: load 1.5s ease-in-out infinite;
  }
  @keyframes load {
    0% { width: 0%; margin-left: 0%; }
    50% { width: 60%; margin-left: 20%; }
    100% { width: 0%; margin-left: 100%; }
  }

  /* ── Canvas Area ── */
  .canvas-area {
    flex: 1;
    background: #06060a;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    position: relative;
  }
  .canvas-wrapper {
    position: relative;
    display: inline-block;
    box-shadow: 0 0 60px rgba(0,0,0,0.8);
  }
  .canvas-wrapper canvas { display: block; }

  .empty-state {
    text-align: center;
    color: var(--muted);
    pointer-events: none;
  }
  .empty-state .big-icon { font-size: 64px; margin-bottom: 20px; opacity: 0.3; }
  .empty-state h3 {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 8px;
    opacity: 0.5;
  }
  .empty-state p { font-size: 12px; opacity: 0.4; }

  /* ── Error ── */
  .error-box {
    background: rgba(255,107,53,0.1);
    border: 1px solid rgba(255,107,53,0.3);
    border-radius: 8px;
    padding: 12px;
    font-size: 11px;
    color: var(--accent2);
    margin-top: 10px;
    line-height: 1.5;
  }

  /* ── Zoom Controls ── */
  .zoom-controls {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .zoom-btn {
    width: 36px; height: 36px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }
  .zoom-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Color pickers ── */
  .color-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .color-row label { font-size: 10px; color: var(--muted); flex: 1; }
  .color-row input[type=color] {
    width: 36px; height: 24px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: none;
    cursor: pointer;
    padding: 1px;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .main { grid-template-columns: 1fr; }
    .sidebar { height: auto; max-height: 50vh; }
  }
`;

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function GridAnalyzer() {
  const [image, setImage] = useState(null);       // { src, width, height, base64 }
  const [analysis, setAnalysis] = useState(null); // parsed JSON from Claude
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [realDistance, setRealDistance] = useState(4900);
  const [zoom, setZoom] = useState(1);
  const [dragOver, setDragOver] = useState(false);

  // Grid settings
  const [gridCm, setGridCm] = useState(500);
  const [showGrid, setShowGrid] = useState(true);
  const [showMajor, setShowMajor] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [gridColor, setGridColor] = useState("#00e5ff");
  const [gridOpacity, setGridOpacity] = useState(35);
  const [majorEvery, setMajorEvery] = useState(5);

  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const imgRef = useRef(new Image());

  // ── Inject styles ──
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // ── Draw canvas whenever deps change ──
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    drawCanvas();
  }, [image, analysis, showGrid, showMajor, showMarkers, gridCm, gridColor, gridOpacity, majorEvery, zoom]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = Math.round(image.width * zoom);
    const h = Math.round(image.height * zoom);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);

    // Draw image
    ctx.drawImage(imgRef.current, 0, 0, w, h);

    if (!analysis) return;
    const pxPerCm = analysis.scale_px_per_cm * zoom;
    const cellPx = pxPerCm * gridCm;

    if (showGrid && cellPx >= 2) {
      // Minor grid
      const opacity = gridOpacity / 100;
      const hex = gridColor;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      ctx.strokeStyle = `rgba(${r},${g},${b},${opacity * 0.5})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= w; x += cellPx) {
        ctx.moveTo(x, 0); ctx.lineTo(x, h);
      }
      for (let y = 0; y <= h; y += cellPx) {
        ctx.moveTo(0, y); ctx.lineTo(w, y);
      }
      ctx.stroke();

      // Major grid
      if (showMajor) {
        const majorCell = cellPx * majorEvery;
        ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= w; x += majorCell) {
          ctx.moveTo(x, 0); ctx.lineTo(x, h);
        }
        for (let y = 0; y <= h; y += majorCell) {
          ctx.moveTo(0, y); ctx.lineTo(w, y);
        }
        ctx.stroke();

        // Labels
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity * 0.8})`;
        ctx.font = `${Math.max(9, cellPx * 0.3)}px DM Mono, monospace`;
        for (let i = 1; i * majorCell < w; i++) {
          const dist = i * majorEvery * gridCm;
          const label = dist >= 100 ? `${dist / 100}m` : `${dist}cm`;
          ctx.fillText(label, i * majorCell + 3, 12);
        }
      }
    }

    // Markers
    if (showMarkers && analysis.marker1_x >= 0 && analysis.marker2_x >= 0) {
      const mx1 = analysis.marker1_x * zoom;
      const mx2 = analysis.marker2_x * zoom;
      const my = 57 * zoom;

      // Line between markers
      ctx.strokeStyle = "#ff6b35";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(mx1, my); ctx.lineTo(mx2, my);
      ctx.stroke();
      ctx.setLineDash([]);

      // Circles
      [mx1, mx2].forEach((mx, i) => {
        ctx.fillStyle = "#ff6b35";
        ctx.beginPath();
        ctx.arc(mx, my, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 10px Syne, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(i + 1, mx, my);
        ctx.textAlign = "start";
        ctx.textBaseline = "alphabetic";
      });

      // Distance label
      const midX = (mx1 + mx2) / 2;
      ctx.fillStyle = "rgba(255,107,53,0.9)";
      ctx.font = "bold 11px DM Mono, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${realDistance} cm`, midX, my - 16);
      ctx.textAlign = "start";
    }
  }, [image, analysis, showGrid, showMajor, showMarkers, gridCm, gridColor, gridOpacity, majorEvery, zoom, realDistance]);

  // ── Handle file ──
  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      const base64 = src.split(",")[1];
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImage({ src, width: img.width, height: img.height, base64, name: file.name });
        setAnalysis(null);
        setError("");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // ── Call Claude API ──
  const analyzeWithClaude = async () => {
    if (!image) return;
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: "image/png", data: image.base64 },
                },
                {
                  type: "text",
                  text: `${FLOOR_PLAN_PROMPT}\n\nThe real-world distance between the two marker points is ${realDistance} cm. The image is ${image.width}x${image.height} pixels.`,
                },
              ],
            },
          ],
        }),
      });

      const data = await resp.json();

      if (data.error) throw new Error(data.error.message || "API error");

      const text = data.content?.find((b) => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(clean);
      setAnalysis(parsed);
      setGridCm(parsed.recommended_grid_cm || 500);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const scale = analysis ? analysis.scale_px_per_cm : null;
  const gridPx = scale ? (scale * gridCm * zoom).toFixed(1) : null;

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="header-icon">📐</div>
        <div>
          <div className="header-title">FloorGrid Analyzer</div>
          <div className="header-sub">AI-Powered Floor Plan Scale Detection</div>
        </div>
        <div className="header-badge">Claude Vision</div>
      </div>

      <div className="main">
        {/* ── Sidebar ── */}
        <div className="sidebar">

          {/* Upload */}
          <div className="section">
            <div className="section-title">Floor Plan</div>
            <div
              className={`upload-zone ${dragOver ? "drag-over" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            >
              <input ref={fileRef} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files[0])} />
              <div className="upload-icon">🗺️</div>
              <div className="upload-text">
                <span>Click to upload</span> or drag & drop<br />
                PNG, JPG, WebP supported
              </div>
              {image && <div className="upload-filename">✓ {image.name}</div>}
            </div>
          </div>

          {/* Reference Distance */}
          <div className="section">
            <div className="section-title">Reference Distance</div>
            <div className="field">
              <label>Distance between markers (cm)</label>
              <input
                type="number"
                value={realDistance}
                onChange={(e) => setRealDistance(Number(e.target.value))}
                min={1}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={analyzeWithClaude}
              disabled={!image || loading}
            >
              {loading ? "⟳ Analyzing..." : "⚡ Analyze with Claude"}
            </button>
            {loading && <div className="loading-bar"><div className="loading-bar-fill" /></div>}
            {error && <div className="error-box">{error}</div>}
            {analysis && (
              <div className="analysis-note">
                <span>AI:</span> {analysis.analysis_notes}
              </div>
            )}
          </div>

          {/* Stats */}
          {analysis && (
            <div className="section">
              <div className="section-title">Scale Results</div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">px / cm</div>
                  <div className="stat-value">{analysis.scale_px_per_cm?.toFixed(4)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">cm / px</div>
                  <div className="stat-value">{(1 / analysis.scale_px_per_cm)?.toFixed(2)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">px dist</div>
                  <div className="stat-value">{analysis.pixel_distance}</div>
                  <div className="stat-unit">pixels</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">grid cell</div>
                  <div className="stat-value">{gridPx}</div>
                  <div className="stat-unit">px now</div>
                </div>
              </div>
            </div>
          )}

          {/* Grid Controls */}
          {analysis && (
            <div className="section">
              <div className="section-title">Grid Settings</div>

              <div className="toggle-row">
                <span className="toggle-label">Show Grid</span>
                <button className={`toggle ${showGrid ? "on" : ""}`} onClick={() => setShowGrid(!showGrid)} />
              </div>
              <div className="toggle-row">
                <span className="toggle-label">Major Lines</span>
                <button className={`toggle ${showMajor ? "on" : ""}`} onClick={() => setShowMajor(!showMajor)} />
              </div>
              <div className="toggle-row">
                <span className="toggle-label">Show Markers</span>
                <button className={`toggle ${showMarkers ? "on" : ""}`} onClick={() => setShowMarkers(!showMarkers)} />
              </div>

              <div className="slider-row">
                <label>Grid size</label>
                <input type="range" min={50} max={2000} step={50} value={gridCm}
                  onChange={(e) => setGridCm(Number(e.target.value))} />
                <span className="slider-val">{gridCm}cm</span>
              </div>
              <div className="slider-row">
                <label>Major every</label>
                <input type="range" min={2} max={10} step={1} value={majorEvery}
                  onChange={(e) => setMajorEvery(Number(e.target.value))} />
                <span className="slider-val">×{majorEvery}</span>
              </div>
              <div className="slider-row">
                <label>Opacity</label>
                <input type="range" min={10} max={90} step={5} value={gridOpacity}
                  onChange={(e) => setGridOpacity(Number(e.target.value))} />
                <span className="slider-val">{gridOpacity}%</span>
              </div>

              <div className="color-row">
                <label>Grid color</label>
                <input type="color" value={gridColor} onChange={(e) => setGridColor(e.target.value)} />
              </div>

              {gridPx < 4 && (
                <div className="error-box">
                  ⚠ Grid cell is {gridPx}px — too small to see clearly. Try increasing grid size.
                </div>
              )}
            </div>
          )}

          {/* Zoom */}
          {image && (
            <div className="section">
              <div className="section-title">Zoom</div>
              <div className="slider-row">
                <label>Scale</label>
                <input type="range" min={0.25} max={4} step={0.25} value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))} />
                <span className="slider-val">{zoom}×</span>
              </div>
              <button className="btn btn-secondary" style={{ marginTop: 6 }}
                onClick={() => setZoom(1)}>Reset Zoom</button>
            </div>
          )}

          {/* Quick grid presets */}
          {analysis && (
            <div className="section">
              <div className="section-title">Quick Presets</div>
              {[50, 100, 250, 500, 1000, 2000].map((cm) => {
                const px = (analysis.scale_px_per_cm * cm * zoom).toFixed(1);
                return (
                  <button
                    key={cm}
                    className="btn btn-secondary"
                    style={{ marginBottom: 6, fontSize: 11 }}
                    onClick={() => setGridCm(cm)}
                  >
                    {cm >= 100 ? `${cm / 100}m` : `${cm}cm`} grid — {px}px/cell
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Canvas Area ── */}
        <div className="canvas-area">
          {!image ? (
            <div className="empty-state">
              <div className="big-icon">🏗️</div>
              <h3>No Floor Plan Loaded</h3>
              <p>Upload an image to get started</p>
            </div>
          ) : (
            <div className="canvas-wrapper">
              <canvas ref={canvasRef} />
            </div>
          )}

          {image && (
            <div className="zoom-controls">
              <button className="zoom-btn" onClick={() => setZoom((z) => Math.min(4, z + 0.25))}>+</button>
              <button className="zoom-btn" onClick={() => setZoom(1)} title="Reset">⊙</button>
              <button className="zoom-btn" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}>−</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
