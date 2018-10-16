
function readCssVar(varName) {
    varName = varName.startsWith("--") ? varName : "--" + varName;
    return getComputedStyle(document.documentElement).getPropertyValue(varName);
}

function readCssVarAsNumber(varName) {
    return parseInt(readCssVar(varName), 10);
}

// misc constants
const width = readCssVarAsNumber("width");
const height = readCssVarAsNumber("height");
const canvasSizeInPixels = width * height;
const fullHdSizeInPixels = 1920 * 1080;

// canvas objects
const canvas = document.getElementById("canvas");
canvas.setAttribute("width", width);
canvas.setAttribute("height", height);
const ctx = canvas.getContext("2d");
const imageData = ctx.getImageData(0, 0, width, height);
const buffer = imageData.data;
const view = new Uint32Array(buffer.buffer);

// metrics
const fpsElem = document.getElementById("fps");
const timePerPixelElem = document.getElementById("time-per-pixel");
const avgTimePerPixelElem = document.getElementById("avg-time-per-pixel");
const fullHdTimeElem = document.getElementById("full-hd-time");
let elapsedSum = 0;
let elapsedCount = 0;
let accumulatedTimePerPixelSum = 0;
let accumulatedTimePerPixelCount = 0;

function reportMetrics() {
    if (elapsedCount === 0) {
        return;  // browser tab was probably hidden, no refresh callbacks fired
    }

    const elapsed = elapsedSum / elapsedCount;
    const elapsedPerPixelInNanos = 1000000 * elapsed / canvasSizeInPixels;

    accumulatedTimePerPixelSum += elapsedPerPixelInNanos;
    accumulatedTimePerPixelCount++;
    const accumulatedTimePerPixel = accumulatedTimePerPixelSum / accumulatedTimePerPixelCount;

    fpsElem.innerText = elapsedCount;
    timePerPixelElem.innerText = elapsedPerPixelInNanos.toFixed(1);
    avgTimePerPixelElem.innerText = accumulatedTimePerPixel.toFixed(1);
    fullHdTimeElem.innerText = (elapsedPerPixelInNanos * fullHdSizeInPixels / 1000000).toFixed(1);
    elapsedSum = elapsedCount = 0;
}

function update() {
    // I don't want to trust the time informed as param to update(), since it seems to be measured way before this
    // function actually getting called
    const startTime = performance.now();

    for (let i = 0; i < canvasSizeInPixels; i++) {
        view[i] = 0xff000000;
    }

    ctx.putImageData(imageData, 0, 0, 0, 0, width, height);

    elapsedSum += performance.now() - startTime;
    elapsedCount++;

    requestAnimationFrame(update);
}

requestAnimationFrame(update);
setInterval(reportMetrics, 1000);
