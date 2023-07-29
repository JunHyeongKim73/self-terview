const videoElement = document.getElementById('videoElement');
const previewElement = document.getElementById('previewElement');
const startRecordButton = document.getElementById('startRecord');
const stopRecordButton = document.getElementById('stopRecord');
const downloadButton = document.getElementById('downloadRecord');
const questionElement = document.getElementById("question");
const nextQuestionButton = document.getElementById("nextQuestion");

let mediaRecorder;
let recordedChunks = [];

let questions;
let questionIndex = 0;

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    videoElement.srcObject = stream;

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function (event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = function () {
        const blob = new Blob(recordedChunks, {type: 'video/webm'});
        const url = URL.createObjectURL(blob);

        previewElement.src = url;
        downloadButton.addEventListener('click', () => {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'recorded-video.webm';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        });

        downloadButton.disabled = false;
    };
}

startRecordButton.addEventListener('click', () => {
    mediaRecorder.start();
    startRecordButton.disabled = true;
    stopRecordButton.disabled = false;
});

stopRecordButton.addEventListener('click', () => {
    mediaRecorder.stop();
    startRecordButton.disabled = false;
    stopRecordButton.disabled = true;
    recordedChunks = [];
});

nextQuestionButton.addEventListener("click", () => {
    questionIndex++

    if (questionIndex >= questions.length) {
        navigateEnd()
        return
    }

    questionElement.innerHTML = questions[questionIndex]
})

function navigateEnd() {

}

function shuffle(array) {
    let currentIndex = array.length - 1;

    while (currentIndex > 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]

        currentIndex--
    }
}

function convertBase64ToAudio() {

}

function questionHandler() {
    const queryStrings = window.location.search;
    const queryParams = new URLSearchParams(queryStrings);
    const questionStrings = queryParams.get("question");

    questions = questionStrings.split("\r\n");
    shuffle(questions)

    questionElement.innerHTML = questions[questionIndex]


    const audioContentBase64 = "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";
    const audioBinary = atob(audioContentBase64);
    const audioData = new Uint8Array(audioBinary.length);
    for (let i = 0; i < audioBinary.length; i++) {
      audioData[i] = audioBinary.charCodeAt(i);
    }
    const audioBlob = new Blob([audioData], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play().then(() => {
        console.log("played")
    })
}

startCamera().then(questionHandler)
