import init, { initThreadPool } from "./wasm/pkg/wasm.js"
import Settings from "./Settings.js";

const cvs = $("#canvas").get(0);
const ctx = cvs.getContext('2d');

const thumbCvs = $("#thumb-canvas").get(0);
const thumbCtx = thumbCvs.getContext("2d");

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

const s = new Settings(cvs.width, cvs.height, 500);
s.show();

$("#settings-form input").on("change", (e) => {
    const id = e.target.id;
    if (id === "itmax-input") {
        const newItMax = parseInt(e.target.value, 10);
        if (newItMax <= 0) {
            alert("Max iterations must be larger than 0");
            $("#itmax-input").val(s.itMax);
        } else {
            s.itMax = newItMax;
        }
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

$("#reset-settings-button").on("click", (e) => {
    s.reset();
    s.show();
    draw();
})

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
        return [0, level, 64, 255];
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
    console.debug("Drawing with", s.useWasm ? "WASM" : "JS");

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

    console.debug("Done");
}

function getThumbBase64() {
    thumbCtx.drawImage(cvs, 0, 0, thumbCvs.width, thumbCvs.height);

    return thumbCvs.toDataURL("image/webp", 0.5);
}

$("#save-snapshot-button").on("click", () => {
    const data = {
        name: $("#snapshot-name-input").val(),
        zoom: s.zoom,
        x: s.xCenter,
        y: s.yCenter,
        thumb: getThumbBase64()
    }

    $.ajax({
        url: "/api/snapshots",
        type: "POST",
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (response) => {
            alert(response["msg"]);
        },
        error: (xhr, status, error) => alert(`Error: ${xhr.responseJSON['msg']}`),
        statusCode: {
            401: () => {
                alert("Your credentials have expired. Log in and try again");
                displayLoggedOut();
            }
        }
    })
})

export { s, draw };
draw();

// Animation

let prevTimestamp = null;
let animId = null;
let isRunning = false;
let zoomSpeed = 2.;

$("#zoom-speed-input").val(zoomSpeed);

$("#zoom-speed-input").on("change", (e) => {
    const newZoomSpeed = parseFloat(e.target.value);

    if (newZoomSpeed <= 0) {
        alert("Zoom speed must be larger than 0");
        $("#zoom-speed-input").val(zoomSpeed);
    } else {
        zoomSpeed = newZoomSpeed;
    }
})

function animate(timestamp) {
    if (prevTimestamp) {
        const elapsed = timestamp - prevTimestamp;
        s.zoom *= Math.pow(zoomSpeed, elapsed / 1000);
        $("#zoom-input").val(s.zoom.toPrecision(5));
        draw();
    }

    prevTimestamp = timestamp;
    animId = requestAnimationFrame(animate);
}

$("#animate-button").on("click", function () {
    if (!isRunning) {
        isRunning = true;
        $(this).css({ "background-color": "#b35e5e" });
        $(this).hover(function () { $(this).css({ "background-color": "#b35e5e" }) },
            function () { $(this).css({ "background-color": "#9c4d4d" }) });
        $(this).html("Stop")
        requestAnimationFrame(animate);
    } else {
        isRunning = false;
        prevTimestamp = null;
        $(this).css({ "background-color": "#478d73" });
        $(this).hover(function () { $(this).css({ "background-color": "#5ba95d" }) },
            function () { $(this).css({ "background-color": "#478d73" }) })
        $(this).html("Animate")
        cancelAnimationFrame(animId);
        s.show();
    }
})