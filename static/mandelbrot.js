import init, { initThreadPool } from "./wasm/pkg/wasm.js"
import Settings from "./Settings.js";

const cvs = $("#canvas").get(0);
const ctx = cvs.getContext('2d');

console.log("Initializing WASM...");

const wasm = await init();
console.log("Loaded WASM module");

if (self.crossOriginIsolated) {
    console.log("Page is cross origin isolated - initializing thread pool...");
} else {
    console.error("Page is not cross origin isolated - WASM threads won't be initialized!");
}

await initThreadPool(navigator.hardwareConcurrency);
console.log("Initialized thread pool")

const s = new Settings(cvs.width, cvs.height, 1000);
s.show();

$("#settings-form *").on("change", (e) => {
    s.read();
    draw();
});

$("#wasm-checkbox").on("change", (e) => {
    s.setUseWasm(e.target.checked);
    draw();
});

$("#canvas").on("click", function (event) {
    const rect = this.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const [scaledX, scaledY] = s.getCoords(x, y);

    // console.log(`Canvas clicked at: X=${scaledX}, Y=${scaledY}`);

    s.zoomInOn(scaledX, scaledY);
    s.show();
    draw();
});

$("#canvas").on("contextmenu", function (event) {
    event.preventDefault();
    const rect = this.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const [scaledX, scaledY] = s.getCoords(x, y);

    // console.log(`Right click at: X=${scaledX}, Y=${scaledY}`);

    s.zoomOutOn(scaledX, scaledY);
    s.show();
    draw();
});

function mandelbrot(width, height, scale, xCenter, yCenter, itMax) {
    const xMin = xCenter - 0.5 * width * scale;
    const yMin = yCenter - 0.5 * height * scale;

    const data = new Uint8ClampedArray(4 * width * height);

    for (let pxX = 0; pxX < width; pxX++) {
        for (let pxY = 0; pxY < height; pxY++) {
            let x0 = pxX * scale + xMin;
            let y0 = pxY * scale + yMin;

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

            const px = (pxY * width + pxX) * 4;
            const color = it == itMax ? 0 : 255;
            data[px] = color;
            data[px + 1] = color;
            data[px + 2] = color;
            data[px + 3] = 255;
        }
    }

    return data;
}

function draw() {
    console.log("Drawing with", s.useWasm ? "WASM" : "JS");

    const start = performance.now();

    const mandelbrotFn = s.useWasm ? wasm.mandelbrot : mandelbrot;
    const data = mandelbrotFn(s.width, s.height, s.prescale / s.zoom, s.xCenter, s.yCenter, s.itMax);

    const end = performance.now()
    const elapsed = end - start;
    $("#elapsed-label").html(elapsed.toFixed(2));

    const imageData = new ImageData(data, cvs.width, cvs.height);
    ctx.putImageData(imageData, 0, 0);
}

draw();