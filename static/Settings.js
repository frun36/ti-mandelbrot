export default class Settings {
    constructor(width, height, itMax) {
        this.width = width;
        this.height = height;

        this.prescale = 0.004;
        this.xCenter = -0.5;
        this.yCenter = 0;
        this.zoom = 1;

        this.itMax = itMax;
        this.useWasm = true;
    }

    setUseWasm(b) {
        this.useWasm = b;
    }

    getCoords(x, y) {
        return [this.getXMin() + x * this.prescale / this.zoom,
        this.getYMin() + y * this.prescale / this.zoom,];
    }

    getXMin() {
        return this.xCenter - 0.5 * this.width * this.prescale / this.zoom;
    }

    getYMin() {
        return this.yCenter - 0.5 * this.height * this.prescale / this.zoom;
    }

    getScale() {
        return prescale / zoom;
    }

    zoomInOn(x, y, ratio = 1.5) {
        this.xCenter = x;
        this.yCenter = y;

        this.zoom *= ratio;
    }

    zoomOutOn(x, y, ratio = 1.5) {
        this.xCenter = x;
        this.yCenter = y;

        this.zoom /= ratio;
    }
}