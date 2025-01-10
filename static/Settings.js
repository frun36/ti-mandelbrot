export default class Settings {
    constructor(width, height, itMax) {
        this.width = width;
        this.height = height;

        this.prescale = 0.005;
        this.xCenter = -0.5;
        this.yCenter = 0;
        this.zoom = 1;

        this.itMax = itMax;
        this.useWasm = true;
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
        return this.prescale / this.zoom;
    }

    zoomInOn(x, y, ratio = 1.5) {
        this.xCenter = x;
        this.yCenter = y;

        this.zoom = (this.zoom * ratio);
    }

    zoomOutOn(x, y, ratio = 1.5) {
        this.xCenter = x;
        this.yCenter = y;

        this.zoom = (this.zoom / ratio);
    }

    show() {
        $("#itmax-input").val(this.itMax);
        $("#zoom-input").val(this.zoom);
        $("#xcenter-input").val(this.xCenter);
        $("#ycenter-input").val(this.yCenter);
        $("#wasm-checkbox").prop("checked", this.useWasm);
    }
}