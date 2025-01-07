use wasm_bindgen::{prelude::*, Clamped};
use web_sys::{CanvasRenderingContext2d, ImageData};

#[wasm_bindgen]
pub fn mandelbrot(
    ctx: CanvasRenderingContext2d,
    width: u32,
    height: u32,
    scale: f64,
    x_center: f64,
    y_center: f64,
    it_max: usize,
) -> Result<(), JsValue> {
    let x_min = x_center - 0.5 * width as f64 * scale;
    let y_min = y_center - 0.5 * height as f64 * scale;

    let mut data = vec![0u8; (4 * width * height) as usize];

    for x_px in 0..width {
        for y_px in 0..height {
            let x0 = x_px as f64 * scale + x_min;
            let y0 = y_px as f64 * scale + y_min;

            let mut x2 = 0.;
            let mut y2 = 0.;

            let mut it = 0;

            let mut x = 0.;
            let mut y = 0.;

            while x2 + y2 <= 4. && it < it_max {
                y = 2. * x * y + y0;
                x = x2 - y2 + x0;
                x2 = x * x;
                y2 = y * y;
                it += 1;
            }

            let color = if it == it_max { 0 } else { 255 };
            let px = ((y_px * width + x_px) * 4) as usize;

            data[px] = color;
            data[px + 1] = color;
            data[px + 2] = color;
            data[px + 3] = 255;
        }
    }

    let image_data = ImageData::new_with_u8_clamped_array_and_sh(Clamped(&data), width, height)?;
    ctx.put_image_data(&image_data, 0.0, 0.0)
}
