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

function questionHandler() {
    const queryStrings = window.location.search;
    const queryParams = new URLSearchParams(queryStrings);
    const questionStrings = queryParams.get("question");

    questions = questionStrings.split("\r\n");
    questions.forEach((value, index) => {
        questions[index] = "예상 질문: " + questions[index]
    })
    shuffle(questions)

    questionElement.innerHTML = questions[questionIndex]
}

startCamera().then(questionHandler)
