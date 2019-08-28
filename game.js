// Create new wheel object specifying the parameters at creation time.
let theWheel = new Winwheel({
    'numSegments': 4,         // Specify number of segments.
    'outerRadius': 150,       // Set outer radius so wheel fits inside the background.
    'drawMode': 'image',   // drawMode must be set to image.
    'drawText': true,      // Need to set this true if want code-drawn text on image wheels.
    'textFontSize': 12,        // Set text options as desired.
    'textOrientation': 'curved',
    'textDirection': 'reversed',
    'textAlignment': 'outer',
    'textMargin': 5,
    'textFontFamily': 'monospace',
    'textStrokeStyle': 'black',
    'textLineWidth': 2,
    'textFillStyle': 'white',
    'segments':                // Define segments.
        [
            { 'text': 'T-55 Vampire' },
            { 'text': 'P-40 Kittyhawk' },
            { 'text': 'North American Harvard' },
            { 'text': 'L-39C Albatross' }
        ],
    'animation':                   // Specify the animation to use.
    {
        'type': 'spinToStop',
        'duration': 2,     // Duration in seconds.
        'spins': 4,     // Number of complete spins.
        'callbackFinished': alertPrize
    }
});

// Create new image object in memory.
let loadedImg = new Image();

// Create callback to execute once the image has finished loading.
loadedImg.onload = function () {
    theWheel.wheelImage = loadedImg;    // Make wheelImage equal the loaded image object.
    theWheel.draw();                    // Also call draw function to render the wheel.
}

// Set the image source, once complete this will trigger the onLoad callback (above).
loadedImg.src = "planes.png";

// Vars used by the code in this page to do power controls.
let wheelSpinning = false;
let isCustomer = true;

function calculateStopPoint(numberOfSegments, segmentNumber) {
    let offset = 5;
    let segmentAngle = 360 / numberOfSegments;
    let startAngle = (segmentNumber - 1) * segmentAngle + offset;
    let endAngle = startAngle + segmentAngle - 3 * offset;
    return (startAngle + Math.floor((Math.random() * segmentAngle)));
}

let frequencyTable = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];
let slotTable = [0, 0, 0, 0];

function test() {
    var freqTable = {};

    for (let i = 0; i < 1000; i++) {
        let numberSelected = frequencyTable[Math.floor((Math.random() * 10))]
        if (freqTable[numberSelected]) {
            freqTable[numberSelected] += 1;
        } else {
            freqTable[numberSelected] = 1;
        }
    }

    console.log(freqTable);
}

// -------------------------------------------------------
// Click handler for spin button.
// -------------------------------------------------------
function startSpin() {
    if (wheelSpinning == false) {
        let numberSelected = frequencyTable[Math.floor((Math.random() * 10))];
        while (slotTable[numberSelected - 1] == 1) {
            numberSelected = frequencyTable[Math.floor((Math.random() * 10))];
        }

        if (numberSelected == 3 || numberSelected == 4) {
            slotTable[numberSelected - 1] = 1;
        }

        theWheel.animation.stopAngle = calculateStopPoint(theWheel.numSegments, numberSelected);
        theWheel.startAnimation();
        wheelSpinning = true;
    }
}

// -------------------------------------------------------
// Function for reset button.
// -------------------------------------------------------
function resetWheel() {
    theWheel.stopAnimation(false);  // Stop the animation, false as param so does not call callback function.
    theWheel.rotationAngle = 0;     // Re-set the wheel angle to 0 degrees.
    theWheel.draw();                // Call draw to render changes to the wheel.
    wheelSpinning = false;          // Reset to false to power buttons and spin can be clicked again.
}

// -------------------------------------------------------
// Called when the spin animation has finished by the callback feature of the wheel because I specified callback in the parameters.
// note the indicated segment is passed in as a parmeter as 99% of the time you will want to know this to inform the user of their prize.
// -------------------------------------------------------
function alertPrize(indicatedSegment) {
    // Do basic alert of the segment text. You would probably want to do something more interesting with this information.
    console.log("The wheel stopped on " + indicatedSegment.text);
    // Talk to python to light the alarm!
    $.ajax({
        method: 'post',
        url: 'http://127.0.0.1:5000/',
        type: 'json',
        data: JSON.stringify({
            prize: indicatedSegment.text,
            customer: isCustomer
        }),
        success: function (res) {
            console.log('Data has been logged successfully', res);
        },
        error: function (err) {
            console.error('Data couldnt log');
        }
    });
}