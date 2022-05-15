import {useEffect, useRef, useState} from "react";
import {renderOcean, renderSpace, resize} from "../../core/render";
import "../../scss/ocean.scss";

// Renders three.js background if applicable
export function BackgroundCanvas(props : {bg: number}) {
    const {bg} = props;
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const currentCanvas = canvas.current;
        if(!currentCanvas)
            return;

        switch(bg) {
            case 0:
                return;
            case 1:
                renderOcean(currentCanvas, window.innerWidth, window.innerHeight, window.devicePixelRatio);
                break;
            case 2:
                renderSpace(currentCanvas, window.innerWidth, window.innerHeight, window.devicePixelRatio);
                break;
        }
    }, [bg, canvas]);

    useEffect(() => {
        window.addEventListener("resize", () => resize(window.innerWidth, window.innerHeight));
    }, []);

    return (
        <>
            {
                ( bg &&
                    <canvas ref={canvas} id="bg-canvas">This browser doesn't support canvases</canvas>
                )
                ||
                <></>
            }
        </>

    )
}
