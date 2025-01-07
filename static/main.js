import init from "./wasm/pkg/wasm.js"

const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');

const wasm = await init();


let xCenter = 0;
let yCenter = 0;

let scale = 0.001;

const itMax = 300;

document.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "ArrowUp":
            yCenter -= 100 * scale;
            break;
        case "ArrowDown":
            yCenter += 100 * scale;
            break;
        case "ArrowRight":
            xCenter += 100 * scale;
            break;
        case "ArrowLeft":
            xCenter -= 100 * scale;
            break;
    }
    handleDraw();
});

document.addEventListener("wheel", (event) => {
    if (event.deltaY > 0) {
        scale *= 0.9;
    } else if (event.deltaY < 0) {
        scale /= 0.9;
    }
    handleDraw();
});

function handleDraw() {
    const useWasm = document.getElementById("wasm-checkbox").checked;

    const start = performance.now();

    if (useWasm) {
        wasm.mandelbrot(ctx, cvs.width, cvs.height, scale, xCenter, yCenter, itMax);
    } else {
        mandelbrot(ctx, cvs.width, cvs.height, scale, xCenter, yCenter, itMax);
    }

    const end = performance.now()
    const elapsed = end - start;
    document.getElementById('elapsed-label').innerHTML = elapsed.toFixed(2);
}

window.handleDraw = handleDraw;

function mandelbrot(ctx, width, height, scale, xCenter, yCenter, itMax) {
    const xMin = xCenter - 0.5 * width * scale;
    const yMin = yCenter - 0.5 * height * scale;

    const imageData = new ImageData(width, height);

    let x0, y0, x, y;
    for (let xPx = 0; xPx < width; xPx++) {
        for (let yPx = 0; yPx < height; yPx++) {
            x0 = xPx * scale + xMin;
            y0 = yPx * scale + yMin;
            
            let x2 = 0;
            let y2 = 0;
            
            let it = 0;
            
            x = 0;
            y = 0;

            while (x2 + y2 <= 4 && it < itMax) {
                y = 2 * x * y + y0;
                x = x2 - y2 + x0;
                x2 = x * x;
                y2 = y * y;
                it++;
            }

            const px = (yPx * width + xPx) * 4;
            const color = it == itMax ? 0 : 255;
            imageData.data[px] = color;
            imageData.data[px + 1] = color;
            imageData.data[px + 2] = color;
            imageData.data[px + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

handleDraw();