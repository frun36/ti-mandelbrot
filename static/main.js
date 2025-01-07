import init, { initThreadPool } from "./wasm/pkg/wasm.js"

const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');

const wasm = await init();
await initThreadPool(navigator.hardwareConcurrency);

const prescale = 0.004;
let xCenter = -0.5;
let yCenter = 0;
let zoom = 1;

const itMax = 1000;

document.getElementById("wasm-checkbox").addEventListener("change", (_) => handleDraw());

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":
            yCenter -= 100 * prescale * zoom;
            break;
        case "ArrowDown":
            yCenter += 100 * prescale * zoom;
            break;
        case "ArrowRight":
            xCenter += 100 * prescale * zoom;
            break;
        case "ArrowLeft":
            xCenter -= 100 * prescale * zoom;
            break;
        case "r":
        case "R":
            break;
        default:
            return;
    }
    handleDraw();
});

document.addEventListener("wheel", (event) => {
    if (event.deltaY > 0) {
        zoom *= 0.9;
    } else if (event.deltaY < 0) {
        zoom /= 0.9;
    }
    handleDraw();
});

function handleDraw() {
    const useWasm = document.getElementById("wasm-checkbox").checked;

    console.log("Drawing with", useWasm ? "WASM" : "JS");

    const start = performance.now();

    const mandelbrotFn = useWasm ? wasm.mandelbrot : mandelbrot;
    const data = mandelbrotFn(cvs.width, cvs.height, prescale * zoom, xCenter, yCenter, itMax);

    const end = performance.now()
    const elapsed = end - start;
    document.getElementById('elapsed-label').innerHTML = elapsed.toFixed(2);
    
    const imageData = new ImageData(data, cvs.width, cvs.height);
    ctx.putImageData(imageData, 0, 0);
}

function mandelbrot(width, height, scale, xCenter, yCenter, itMax) {
    const xMin = xCenter - 0.5 * width * scale;
    const yMin = yCenter - 0.5 * height * scale;

    const data = new Uint8ClampedArray(4 * width * height);

    for (let xPx = 0; xPx < width; xPx++) {
        for (let yPx = 0; yPx < height; yPx++) {
            let x0 = xPx * scale + xMin;
            let y0 = yPx * scale + yMin;

            let x2 = 0;
            let y2 = 0;

            let it = 0;

            let x = 0;
            let y = 0;

            while (x2 + y2 <= 4 && it < itMax) {
                y = 2 * x * y + y0;
                x = x2 - y2 + x0;
                x2 = x * x;
                y2 = y * y;
                it++;
            }

            const px = (yPx * width + xPx) * 4;
            const color = it == itMax ? 0 : 255;
            data[px] = color;
            data[px + 1] = color;
            data[px + 2] = color;
            data[px + 3] = 255;
        }
    }

    return data;
}

handleDraw();