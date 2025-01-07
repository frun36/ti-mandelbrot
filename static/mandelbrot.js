export default function mandelbrot(width, height, scale, xCenter, yCenter, itMax) {
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