const cvs = document.getElementById('canvas');
const ctx = cvs.getContext('2d');

let xCenter = 0;
let yCenter = 0;

let scale = 0.001;

const itMax = 300;

const imageData = ctx.createImageData(cvs.width, cvs.height);

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
        case "I":
        case "i":
            scale *= 0.9;
            break;
        case "O":
        case "o":
            scale /= 0.9;
            break;
    }
    draw();
});

function draw() {
    const start = performance.now();
    drawJS(ctx, cvs.width, cvs.height, scale, xCenter, yCenter);
    const end = performance.now()
    const elapsed = end - start;
    document.getElementById('elapsed-label').innerHTML = elapsed.toFixed(2);
}

function colormap(value) {
    const r = value * 255;
    const g = value * 255;
    const b = value * 255;
    return [r, g, b];
}

function drawJS(ctx, width, height, scale, xCenter, yCenter) {
    const xMin = xCenter - 0.5 * cvs.width * scale;
    const yMin = yCenter - 0.5 * cvs.height * scale;

    
    for (let xPx = 0; xPx < width; xPx++) {
        for (let yPx = 0; yPx < height; yPx++) {
            const x0 = xPx * scale + xMin;
            const y0 = yPx * scale + yMin;
            
            let x2 = 0;
            let y2 = 0;
            
            let it = 0;
            
            let x = 0, y = 0;

            while (x2 + y2 <= 4 && it < itMax) {
                y = 2 * x * y + y0;
                x = x2 - y2 + x0;
                x2 = x * x;
                y2 = y * y;
                it++;
            }

            const ratio = it / itMax;
            const [r, g, b] = colormap(ratio);
            const px = (yPx * width + xPx) * 4;
            imageData.data[px] = r;
            imageData.data[px + 1] = g;
            imageData.data[px + 2] = b;
            imageData.data[px + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

draw();