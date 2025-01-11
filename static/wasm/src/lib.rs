use rayon::iter::{IntoParallelIterator, ParallelIterator};
use wasm_bindgen::prelude::*;
use web_sys::js_sys::Uint8ClampedArray;

pub use wasm_bindgen_rayon::init_thread_pool;

#[inline(always)]
fn colormap(ratio: f64) -> [u8; 4] {
    let level = (ratio * 255.) as u8;

    if ratio == 1. {
        [0, 0, 0, 255]
    } else if ratio > 0.5 {
        [level, 255, level, 255]
    } else {
        [0, level, 64, 255]
    }
}

#[wasm_bindgen]
pub fn mandelbrot(
    width: u32,
    height: u32,
    scale: f64,
    x_center: f64,
    y_center: f64,
    it_max: usize,
) -> Uint8ClampedArray {
    let x_min = x_center - 0.5 * width as f64 * scale;
    let y_min = y_center - 0.5 * height as f64 * scale;

    let data: Vec<u8> = (0..height)
        .into_par_iter()
        .flat_map_iter(move |px_y| {
            (0..width).flat_map(move |px_x| {
                let x0 = px_x as f64 * scale + x_min;
                let y0 = px_y as f64 * scale + y_min;

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

                colormap(it as f64 / it_max as f64)
            })
        })
        .collect();

    Uint8ClampedArray::from(data.as_slice())
}
