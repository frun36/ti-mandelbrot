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

$("#settings-form input").on("change", (e) => {
    const id = e.target.id;
    if (id === "itmax-input") {
        s.itMax = parseInt(e.target.value, 10);
    } else if (id === "zoom-input") {
        s.zoom = parseFloat(e.target.value);
    } else if (id === "xcenter-input") {
        s.xCenter = parseFloat(e.target.value);
    } else if (id === "ycenter-input") {
        s.yCenter = parseFloat(e.target.value);
    } else if (id === "wasm-checkbox") {
        s.useWasm = e.target.checked;
    }
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

function colormap(ratio) {
    if (ratio == 1) {
        return [0, 0, 0, 255];
    }

    const level = ratio * 255.;

    if (ratio > 0.5) {
        return [level, 255, level, 255];
    } else {
        return [0, level, 128, 255];
    }
}

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
            const color = colormap(it / itMax);
            [data[px], data[px + 1], data[px + 2], data[px + 3]]
                = [color[0], color[1], color[2], color[3]];
        }
    }

    return data;
}

function draw() {
    console.log("Drawing with", s.useWasm ? "WASM" : "JS");
    console.debug(s);

    const start = performance.now();

    let data;

    const { width, height, xCenter, yCenter, itMax } = s;
    const scale = s.getScale();
    if (s.useWasm) {
        data = wasm.mandelbrot(width, height, scale, xCenter, yCenter, itMax);
    } else {
        data = mandelbrot(width, height, scale, xCenter, yCenter, itMax);
    }

    const end = performance.now()
    const elapsed = end - start;
    $("#elapsed-label").html(`${elapsed.toFixed(2)} ms`);

    const imageData = new ImageData(data, cvs.width, cvs.height);
    ctx.putImageData(imageData, 0, 0);

    console.log("Done");
}

draw();