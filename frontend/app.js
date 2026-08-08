let config = loadConfig();

function loadConfig() {
    const storedConfig = localStorage.getItem('postureConfig');

    if (storedConfig) {
        try {
            return JSON.parse(storedConfig);
        } catch (e) {
            console.error('Error loading stored config:', e);
            return null;
        }
    }

    return null;
}

function saveConfigToStorage() {
    try {
        localStorage.setItem('postureConfig', JSON.stringify(config));
        console.log('Configuration saved');
    } catch (e) {
        console.error('Error saving config:', e);
    }
}


// ======================================================
// VARIABLES
// ======================================================

let badPostureStartTime = null;
let lastAlertTime = null;

let alertsEnabled = true;

const cameraOverlay =
    document.querySelector('.camera-overlay');

const toggleAlertBtn =
    document.getElementById('toggleAlert');


// ======================================================
// ALERT SOUND
// ======================================================

// IMPORTANT:
// File must be:
// frontend/sounds/soft-alert.mp3

const SOUND_URL = '/sounds/soft-alert.mp3';


// ======================================================
// TEST / UNLOCK AUDIO
// ======================================================

function unlockAudio() {

    const audio = new Audio(SOUND_URL);

    audio.volume = 0.01;

    audio.muted = true;

    audio.play()
        .then(() => {

            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;

            console.log('Audio unlocked successfully');

        })
        .catch((error) => {

            console.error(
                'Audio unlock failed:',
                error
            );

        });
}


// ======================================================
// PLAY ALERT SOUND
// ======================================================

function playAlert() {

    if (!alertsEnabled) {

        console.log('Alerts are disabled');

        return;
    }


    console.log('Trying to play alert sound...');


    const audio = new Audio(SOUND_URL);

    audio.volume = 1.0;

    audio.preload = 'auto';


    audio.play()
        .then(() => {

            console.log(
                'Alert sound played successfully'
            );

        })
        .catch((error) => {

            console.error(
                'Alert sound error:',
                error
            );

        });
}


// ======================================================
// CAMERA
// ======================================================

async function startWebcam() {

    const video =
        document.getElementById('video');


    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true
            });


        video.srcObject = stream;


        video.onloadedmetadata = () => {

            cameraOverlay.classList.add('hidden');

        };


    } catch (error) {

        console.error(
            'Error accessing webcam:',
            error
        );


        cameraOverlay.textContent =
            'Error accessing camera';

    }
}


// ======================================================
// SEND CAMERA FRAME
// ======================================================

async function sendFrame() {

    const video =
        document.getElementById('video');

    const canvas =
        document.getElementById('canvas');

    const context =
        canvas.getContext('2d');


    if (
        !video.videoWidth ||
        !video.videoHeight
    ) {

        console.log(
            'Camera is not ready yet'
        );

        return;
    }


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
    );


    const frame =
        canvas.toDataURL('image/jpeg');


    const blob =
        await (await fetch(frame)).blob();


    const formData =
        new FormData();


    formData.append(
        'file',
        blob,
        'frame.jpg'
    );


    try {

        const response =
            await fetch(
                '/api/process-image',
                {
                    method: 'POST',
                    body: formData
                }
            );


        const data =
            await response.json();


        updateUI(data);


    } catch (error) {

        console.error(
            'Error sending frame:',
            error
        );

    }
}


// ======================================================
// UPDATE UI
// ======================================================

function updateUI(data) {

    const statusElement =
        document.getElementById('status');

    const angleElement =
        document.getElementById('angle');

    const timerElement =
        document.getElementById('timer');

    const videoContainer =
        document.querySelector('.video-container');


    // ==================================================
    // ERROR
    // ==================================================

    if (data.error) {

        statusElement.textContent =
            `Status: ${data.error}`;

        statusElement.className =
            'status-message';

        videoContainer.className =
            'video-container';

        return;
    }


    // ==================================================
    // STATUS
    // ==================================================

    statusElement.textContent =
        data.status;


    statusElement.className =
        'status-message ' +
        (
            data.is_good
                ? 'good-posture'
                : 'bad-posture'
        );


    videoContainer.className =
        'video-container ' +
        (
            data.is_good
                ? 'good-posture-shadow'
                : 'bad-posture-shadow'
        );


    // ==================================================
    // DISPLAY ANGLES
    // ==================================================

    let angleText =
        'Neck Angles: ';


    if (
        data.angles &&
        data.angles.right !== undefined
    ) {

        angleText +=
            `Right: ${data.angles.right.toFixed(2)}°`;

    }


    if (
        data.angles &&
        data.angles.left !== undefined
    ) {

        if (
            data.angles.right !== undefined
        ) {

            angleText +=
                ' | ';

        }


        angleText +=
            `Left: ${data.angles.left.toFixed(2)}°`;

    }


    angleElement.textContent =
        angleText;


    // ==================================================
    // DRAW POSE
    // ==================================================

    if (data.landmarks) {

        drawPoseMarkers(
            data.landmarks
        );

    }


    // ==================================================
    // BAD POSTURE
    // ==================================================

    if (!data.is_good) {


        // Start bad posture timer

        if (!badPostureStartTime) {

            badPostureStartTime =
                Date.now();

            console.log(
                'Bad posture timer started'
            );

        }


        const duration =
            Math.floor(
                (
                    Date.now() -
                    badPostureStartTime
                ) / 1000
            );


        timerElement.textContent =
            `Bad Posture Time: ${duration}s`;


        timerElement.classList.remove(
            'hidden'
        );


        // ==================================================
        // CHECK ALERT INTERVAL
        // ==================================================

        if (
            config &&
            config.alertInterval > 0
        ) {


            const alertInterval =
                config.alertInterval;


            // First alert

            if (
                !lastAlertTime &&
                (
                    Date.now() -
                    badPostureStartTime
                ) >= alertInterval
            ) {

                console.log(
                    'Alert interval reached'
                );


                playAlert();


                lastAlertTime =
                    Date.now();

            }


            // Next alerts

            else if (
                lastAlertTime &&
                (
                    Date.now() -
                    lastAlertTime
                ) >= alertInterval
            ) {

                console.log(
                    'Next alert interval reached'
                );


                playAlert();


                lastAlertTime =
                    Date.now();

            }

        }


    } else {


        // ==================================================
        // GOOD POSTURE
        // ==================================================

        badPostureStartTime =
            null;

        lastAlertTime =
            null;


        timerElement.classList.add(
            'hidden'
        );

    }
}


// ======================================================
// POSE MARKERS
// ======================================================

function drawPoseMarkers(landmarks) {

    const canvas =
        document.getElementById('pose-canvas');

    const ctx =
        canvas.getContext('2d');

    const video =
        document.getElementById('video');


    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    landmarks.forEach(
        (landmark) => {

            if (
                landmark.visibility > 0.5
            ) {

                ctx.beginPath();


                ctx.arc(
                    landmark.x * canvas.width,
                    landmark.y * canvas.height,
                    3,
                    0,
                    2 * Math.PI
                );


                ctx.fillStyle =
                    '#00FF00';


                ctx.fill();

            }

        }
    );


    drawConnections(
        ctx,
        landmarks,
        canvas.width,
        canvas.height
    );
}


// ======================================================
// DRAW CONNECTIONS
// ======================================================

function drawConnections(
    ctx,
    landmarks,
    width,
    height
) {

    const connections = [

        [11, 12],

        [11, 13],
        [13, 15],

        [12, 14],
        [14, 16],

        [8, 12],

        [7, 11]

    ];


    ctx.strokeStyle =
        '#00FF00';

    ctx.lineWidth =
        2;


    connections.forEach(
        ([i, j]) => {

            const start =
                landmarks[i];

            const end =
                landmarks[j];


            if (
                start &&
                end &&
                start.visibility > 0.5 &&
                end.visibility > 0.5
            ) {

                ctx.beginPath();


                ctx.moveTo(
                    start.x * width,
                    start.y * height
                );


                ctx.lineTo(
                    end.x * width,
                    end.y * height
                );


                ctx.stroke();

            }

        }
    );
}


// ======================================================
// SAVE CONFIG
// ======================================================

document
    .getElementById('saveConfig')
    .addEventListener(
        'click',
        () => {


            const rightMinAngle =
                parseInt(
                    document.getElementById(
                        'rightMinAngle'
                    ).value
                );


            const rightMaxAngle =
                parseInt(
                    document.getElementById(
                        'rightMaxAngle'
                    ).value
                );


            const leftMinAngle =
                parseInt(
                    document.getElementById(
                        'leftMinAngle'
                    ).value
                );


            const leftMaxAngle =
                parseInt(
                    document.getElementById(
                        'leftMaxAngle'
                    ).value
                );


            const alertInterval =
                parseInt(
                    document.getElementById(
                        'alertInterval'
                    ).value
                ) * 1000;


            // Validate angles

            if (
                rightMinAngle >= rightMaxAngle ||
                leftMinAngle >= leftMaxAngle
            ) {

                alert(
                    'Minimum angles must be less than maximum angles'
                );

                return;
            }


            if (
                rightMinAngle > 0 ||
                rightMaxAngle > 0
            ) {

                alert(
                    'Right side angles must be negative'
                );

                return;
            }


            if (
                leftMinAngle < 0 ||
                leftMaxAngle < 0
            ) {

                alert(
                    'Left side angles must be positive'
                );

                return;
            }


            if (
                !alertInterval ||
                alertInterval <= 0
            ) {

                alert(
                    'Alert interval must be greater than 0'
                );

                return;
            }


            config = {

                rightMinAngle:
                    rightMinAngle,

                rightMaxAngle:
                    rightMaxAngle,

                leftMinAngle:
                    leftMinAngle,

                leftMaxAngle:
                    leftMaxAngle,

                alertInterval:
                    alertInterval

            };


            saveConfigToStorage();


            console.log(
                'Configuration saved:',
                config
            );

        }
    );


// ======================================================
// START DETECTION
// ======================================================

document
    .getElementById('startBtn')
    .addEventListener(
        'click',
        async () => {


            const button =
                document.getElementById(
                    'startBtn'
                );


            button.disabled =
                true;


            button.textContent =
                'Starting...';


            // IMPORTANT:
            // This happens directly because of user click.

            unlockAudio();


            await startWebcam();


            setInterval(
                sendFrame,
                1000
            );


            button.textContent =
                'Detection Running';


            console.log(
                'Detection started'
            );

        }
    );


// ======================================================
// GET INITIAL CONFIG
// ======================================================

async function getInitialConfig() {

    try {

        const response =
            await fetch(
                '/api/config'
            );


        const defaultConfig =
            await response.json();


        const storedConfig =
            loadConfig();


        config =
            storedConfig || {

                rightMinAngle:
                    defaultConfig.right_min_angle,

                rightMaxAngle:
                    defaultConfig.right_max_angle,

                leftMinAngle:
                    defaultConfig.left_min_angle,

                leftMaxAngle:
                    defaultConfig.left_max_angle,

                alertInterval:
                    10000

            };


        document.getElementById(
            'rightMinAngle'
        ).value =
            config.rightMinAngle;


        document.getElementById(
            'rightMaxAngle'
        ).value =
            config.rightMaxAngle;


        document.getElementById(
            'leftMinAngle'
        ).value =
            config.leftMinAngle;


        document.getElementById(
            'leftMaxAngle'
        ).value =
            config.leftMaxAngle;


        document.getElementById(
            'alertInterval'
        ).value =
            config.alertInterval / 1000;


        console.log(
            'Initial config:',
            config
        );


    } catch (error) {

        console.error(
            'Error fetching initial config:',
            error
        );

    }
}


document.addEventListener(
    'DOMContentLoaded',
    getInitialConfig
);


// ======================================================
// RESET CONFIG
// ======================================================

document
    .getElementById('resetConfig')
    .addEventListener(
        'click',
        async () => {


            try {

                const response =
                    await fetch(
                        '/api/config'
                    );


                const defaultConfig =
                    await response.json();


                config = {

                    rightMinAngle:
                        defaultConfig.right_min_angle,

                    rightMaxAngle:
                        defaultConfig.right_max_angle,

                    leftMinAngle:
                        defaultConfig.left_min_angle,

                    leftMaxAngle:
                        defaultConfig.left_max_angle,

                    alertInterval:
                        10000

                };


                document.getElementById(
                    'rightMinAngle'
                ).value =
                    config.rightMinAngle;


                document.getElementById(
                    'rightMaxAngle'
                ).value =
                    config.rightMaxAngle;


                document.getElementById(
                    'leftMinAngle'
                ).value =
                    config.leftMinAngle;


                document.getElementById(
                    'leftMaxAngle'
                ).value =
                    config.leftMaxAngle;


                document.getElementById(
                    'alertInterval'
                ).value =
                    10;


                localStorage.removeItem(
                    'postureConfig'
                );


                console.log(
                    'Configuration reset'
                );


            } catch (error) {

                console.error(
                    'Error resetting configuration:',
                    error
                );

            }

        }
    );


// ======================================================
// ALERT ON / OFF
// ======================================================

toggleAlertBtn.addEventListener(
    'click',
    () => {


        alertsEnabled =
            !alertsEnabled;


        toggleAlertBtn.classList.toggle(
            'disabled'
        );


        toggleAlertBtn.innerHTML =
            alertsEnabled

                ? '<span class="alert-icon"></span> Alerts Enabled'

                : '<span class="alert-icon"></span> Alerts Disabled';


        console.log(
            'Alerts:',
            alertsEnabled
        );

    }
);


// ======================================================
// LOGIN
// ======================================================

function login() {

    const email =
        document.getElementById(
            'login-email'
        ).value;


    const password =
        document.getElementById(
            'login-password'
        ).value;


    firebase.auth()
        .signInWithEmailAndPassword(
            email,
            password
        )

        .then(
            () => {

                document.getElementById(
                    'auth-message'
                ).innerText =
                    'Logged in!';

            }
        )

        .catch(
            (error) => {

                document.getElementById(
                    'auth-message'
                ).innerText =
                    error.message;

            }
        );
}


// ======================================================
// SIGNUP
// ======================================================

function signup() {

    const email =
        document.getElementById(
            'signup-email'
        ).value;


    const password =
        document.getElementById(
            'signup-password'
        ).value;


    firebase.auth()
        .createUserWithEmailAndPassword(
            email,
            password
        )

        .then(
            () => {

                document.getElementById(
                    'auth-message'
                ).innerText =
                    'Account created!';

            }
        )

        .catch(
            (error) => {

                document.getElementById(
                    'auth-message'
                ).innerText =
                    error.message;

            }
        );
}
