
# Canvas CPU benchmark

How fast can we write to a canvas, pixel by pixel, using solely the CPU (i.e., no WebGL)?

This benchmark focus on writing to a buffer and handing it to the canvas context. Some variations are attempted and measured to understand how to efficiently paint the canvas for tasks that require pixel manipulation.

## Writing four bytes at once

Instead of writing every pixel one channel at a time:

    for (let i = 0; i < canvasSizeInBytes; i += 4) {
        buffer[i] = 0;
        buffer[i+1] = 255;
        buffer[i+2] = 0;
        buffer[i+3] = 255;
    }

It is more efficient to write once per pixel using `Uint32Array`s:

    const view = new Uint32Array(buffer.buffer);

    for (let i = 0; i < canvasSizeInPixels; i++) {
        view[i] = (255 << 24) & (255 << 8);
    }

This has a huge impact on performance, since gains scale with the number of pixels.

## Avoid calling getImageData()

This is a minor, since it'll only happen once per frame, but anyway. Instead of getting a new buffer for every new frame draw:

    const imageData = ctx.getImageData(0, 0, width, height);
    const buffer = imageData.data;

The best way is to create a single buffer once and reuse it during execution. Just move it outside the frame rendering function - it will work just the same.

## Some results

System:

- OS: `Intel® Core™ i5-4670 CPU @ 3.40GHz × 4`
- CPU: `Intel® Core™ i5-4670 CPU @ 3.40GHz × 4`

Each test ran for 2 minutes. Results:

- canvas size: `500 x 500`
- Uint8ClampedArray: 7.4ns per pixel
- Uint32Array: 4.7ns per pixel

So the speedup was of 1.57.

But time per pixel curiously decreases when the canvas gets bigger:

- canvas size: `1000 x 1000`
- Uint8ClampedArray: 4.5ns per pixel
- Uint32Array: 2.9ns per pixel

Speedup still similar, though: 1.55.
