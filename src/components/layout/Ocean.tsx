import {useEffect, useRef} from "react";
import {renderOcean, resize} from "../../workers/renderer.worker.code";
import {CanvasMessage} from "../../core/CanvasMessage";
import "../../scss/ocean.scss";

const worker = new Worker(new URL("../../workers/renderer.worker.ts", import.meta.url));
const supportsOffscreen = typeof HTMLCanvasElement.prototype.transferControlToOffscreen === 'function';

export function Ocean() {
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const currentCanvas = canvas.current;
        if(!currentCanvas)
            return;
        if(supportsOffscreen) {
            const offscreen = currentCanvas.transferControlToOffscreen();
            const msg: Partial<CanvasMessage> = {
                dpr: window.devicePixelRatio,
                width: window.innerWidth,
                height: window.innerHeight,
                canvas: offscreen
            }
            worker.postMessage(msg, [offscreen]);
        }
        else {
            return (() => renderOcean(currentCanvas, window.innerWidth, window.innerHeight, window.devicePixelRatio))
        }
    }, [canvas]);

    return (
        <canvas ref={canvas} id="ocean">This browser doesn't support canvases</canvas>
    )
}
