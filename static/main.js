import init, { initThreadPool } from "./wasm/pkg/wasm.js"
import mandelbrot from "./mandelbrot.js";
import Settings from "./Settings.js";

const cvs = $("#canvas").get(0);
const ctx = cvs.getContext('2d');

const wasm = await init();
await initThreadPool(navigator.hardwareConcurrency);

const s = new Settings(cvs.width, cvs.height, 1000);

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
    draw();
});

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