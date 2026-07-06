import { useRef, useEffect, useState } from "react"
import socket from "../socket/socket"

function Canvas({ roomId, amIDrawer }) {
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(false)
    const lastPosRef = useRef({ x: 0, y: 0 })

    const [color, setColor] = useState("#ffffff");
    const [lineWidth, setLineWidth] = useState(4);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Handle incoming draw strokes from other players
        function handleDrawStroke(data) {
            if (amIDrawer) return;

            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.lineWidth;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.beginPath();
            ctx.moveTo(data.from.x, data.from.y);
            ctx.lineTo(data.to.x, data.to.y);
            ctx.stroke();
        }

        function handleClearCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        socket.on("draw_stroke", handleDrawStroke);
        socket.on("clear_canvas", handleClearCanvas);

        return () => {
            socket.off("draw_stroke", handleDrawStroke);
            socket.off("clear_canvas", handleClearCanvas);
        };
    }, [amIDrawer]);

    // get exact mouse coordinates relative to the canvas bounds
    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDrawing = (e) => {
        if (!amIDrawer) return;
        isDrawingRef.current = true;
        lastPosRef.current = getMousePos(e);
    };

    const draw = (e) => {
        if (!isDrawingRef.current || !amIDrawer) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const currentPos = getMousePos(e);

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();

        socket.emit("drawing_data", {
            roomId,
            from: lastPosRef.current,
            to: currentPos,
            color,
            lineWidth,
        });
        lastPosRef.current = currentPos;
    };

    const stopDrawing = () => {
        isDrawingRef.current = false;
    };

    const clearCanvasHandler = () => {
        if (!amIDrawer) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit("clear_drawing", { roomId });
    };

    return (
        <div className="w-full flex flex-col items-center gap-4">
            {amIDrawer && (
                <div className="flex gap-4 items-center bg-slate-900 border border-slate-700 px-4 py-2 rounded-xl">
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                    />
                    <input
                        type="range"
                        min="2"
                        max="20"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="w-24 accent-indigo-500"
                    />
                    <button
                        onClick={clearCanvasHandler}
                        className="bg-rose-600 hover:bg-rose-500 text-xs text-white font-bold px-3 py-1.5 rounded-lg transition-all"
                    >
                        Clear Canvas
                    </button>
                </div>
            )}

            <canvas
                ref={canvasRef}
                width={550}
                height={380}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className={`bg-slate-950 rounded-xl border-2 border-slate-800 shadow-inner ${amIDrawer ? "cursor-crosshair" : "cursor-not-allowed"
                    }`}
            />
        </div>
    );
}

export default Canvas;
