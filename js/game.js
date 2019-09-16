$(document).ready(function () {
    // Create new wheel object specifying the parameters at creation time.
    let theWheel = new Winwheel({
        'numSegments': 8,         // Specify number of segments.
        'outerRadius': 500,       // Set outer radius so wheel fits inside the background.
        'drawMode': 'image',   // drawMode must be set to image.
        'drawText': false,      // Need to set this true if want code-drawn text on image wheels.
        'textFontSize': 45,        // Set text options as desired.
        'textOrientation': 'curved',
        'rotationAngle': -22.5,
        'pointerAngle': 90,
        'textDirection': 'reversed',
        'textAlignment': 'outer',
        'textMargin': 5,
        'textFontFamily': 'monospace',
        'textStrokeStyle': 'black',
        'textLineWidth': 2,
        'textFillStyle': 'white',
        'segments':                // Define segments.
            [
                { 'text': 'steve_madden_hat' },
                { 'text': 'revo_frame' },
                { 'text': 'steve_madden_30' },
                { 'text': 'spin_again' },
                { 'text': 'rx_frame' },
                { 'text': 'steve_madden_bag' },
                { 'text': 'dilli_dalli_bird' },
                { 'text': 'spin_again' }
            ],
        'animation':                   // Specify the animation to use.
        {
            'type': 'spinToStop',
            'duration': 1,     // Duration in seconds.
            'spins': 2,     // Number of complete spins.
            'callbackFinished': alertPrize
        }
    });

    window.addEventListener("keypress", (event) => {
        if (event.key == "Enter") {
            startSpin();
        }
        if (event.key == "r") {
            resetWheel();
        }
    })

    $('.winning').hide();

    // Create new image object in memory.
    let loadedImg = new Image();

    // Create callback to execute once the image has finished loading.
    loadedImg.onload = function () {
        theWheel.wheelImage = loadedImg;    // Make wheelImage equal the loaded image object.
        theWheel.draw();                    // Also call draw function to render the wheel.
    }

    // Set the image source, once complete this will trigger the onLoad callback (above).
    loadedImg.src = "./img/wheel.png";

    // Vars used by the code in this page to do power controls.
    let wheelSpinning = false;

    function calculateStopPoint(numberOfSegments, segmentNumber) {
        let offset = 10;
        let segmentAngle = (360 / numberOfSegments);
        let startAngle = (segmentNumber - 1) * segmentAngle + offset;
        return startAngle + Math.floor((Math.random() * segmentAngle / 2));
    }

    var dataSaved = localStorage.getItem("gameData");
    if ([null, undefined, '', '{}'].includes(dataSaved)) { 
        var frequencyTable = {
            steve_madden_hat: {
                inv: 225,
                order: 0
            },
            revo_frame: {
                inv: 15,
                order: 1
            },
            steve_madden_30: {
                inv: 10,
                order: 2
            },
            spin_again_1: {
                inv: 10000,
                order: 3
            },
            rx_frame_1: {
                inv: 1,
                order: 4
            },
            steve_madden_bag: {
                inv: 100,
                order: 5
            },
            dilli_dalli_bird: {
                inv: 100,
                order: 6
            },
            spin_again_2: {
                inv: 10000,
                order: 7
            }
        }
    } else {
        frequencyTable = JSON.parse(dataSaved);
        frequencyTable.rx_frame_1.inv = 1;
    }

    // -------------------------------------------------------
    // Click handler for spin button.
    // -------------------------------------------------------
    function startSpin() {
        $("#spinning")[0].play();
        if (wheelSpinning == false) {

            let randomNumber = Math.floor((Math.random() * 8));
            let objectPicked = Object.keys(frequencyTable)[randomNumber];

            while (frequencyTable[objectPicked].inv == 0) {
                randomNumber = Math.floor((Math.random() * 8));
                objectPicked = Object.keys(frequencyTable)[randomNumber];
            }

            frequencyTable[objectPicked].inv--;

            theWheel.animation.stopAngle = calculateStopPoint(theWheel.numSegments, frequencyTable[objectPicked].order + 1);
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
        $("#spinning")[0].pause();

        if (['steve_madden_hat', 'steve_madden_bag', 'dilli_dalli_bird'].includes(indicatedSegment.text)) {
            $("#normal_prize")[0].play();
        }

        if (['revo_frame', 'steve_madden_30', 'rx_frame'].includes(indicatedSegment.text)) {
            $("#good_prize")[0].play();
        }

        $('.winning').attr("src", './img/' + indicatedSegment.text + '.png');
        $('.winning').fadeIn(100).delay(200).fadeOut(200);

        window.setTimeout(() => {
            resetWheel();
            localStorage.setItem('gameData', JSON.stringify(frequencyTable));
        }, 1000);

        // Talk to python to light the alarm!
        $.ajax({
            method: 'post',
            url: 'http://127.0.0.1:5000/',
            type: 'json',
            data: JSON.stringify({
                prize: indicatedSegment.text
            }),
            success: function (res) {
                console.log('Data has been logged successfully', res);
            },
            error: function (err) {
                console.error('Data couldnt log');
            }
        });
    }

});    