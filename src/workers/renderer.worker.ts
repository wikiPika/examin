import {resize, renderOcean} from "./renderer.worker.code";
import {CanvasMessage} from "../core/CanvasMessage";

const ctx: Worker = self as any; //eslint-disable-line

ctx.onmessage = (event: MessageEvent<CanvasMessage>) => {
    switch(event.data.type) {
        case "init":
            renderOcean(event.data.canvas, event.data.width, event.data.height, event.data.dpr)
            break;
        case "resize":
            resize(event.data.width, event.data.height);
    }
}
