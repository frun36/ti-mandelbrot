# Mandelbrot
## Overview
The code of my final project for an Internet Techniques (Techniki Internetowe) course at AGH - an app allowing browsing and saving snapshots of the [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set).

## Features
- Live Mandelbrot set generation, in any position and magnification - with JS or WASM (using WASM threads)
- Navigation by:
  - Left click - zoom in on point
  - Right click - zoom out on point
- Zooming animations of the set
- Browsing snapshots created by other users
- Account creation + saving snapshots by logged in users

## Implementation overview
The main website logic is implemented with HTML, CSS and JS with JQuery. The user can also optionally use the WASM version of the Mandelbrot set generation algorithm, written in Rust using the [`wasm_bindgen_rayon`](https://docs.rs/wasm-bindgen-rayon/latest/wasm_bindgen_rayon/) crate for easy parallelization with WASM threads. Test have shown that the WASM version can be up to 10 times faster than the JS version.
