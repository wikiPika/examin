export type CanvasMessage = {
    type: "init" | "resize",
    canvas: HTMLCanvasElement | OffscreenCanvas,
    width: number,
    height: number,
    dpr: number
}
