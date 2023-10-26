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
let answers = [];

let audioRecorder;

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

let speechToText = "";

function startAudio() {
    audioRecorder = new webkitSpeechRecognition() || new SpeechRecognition();
    audioRecorder.continuous = true;
    audioRecorder.interimResults = true;  // 중간 결과를 반환
    audioRecorder.lang = "ko-KR";
    audioRecorder.maxAlternatives = 10000;

    audioRecorder.addEventListener("speechstart", () => {
        console.log("시작")
    });

    audioRecorder.addEventListener("speechend", () => {
        console.log("끝")
    });

    audioRecorder.addEventListener("result", (e) => {
        let interimTranscript = "";
        for (let i = e.resultIndex, len = e.results.length; i < len; i++) {
            let transcript = e.results[i][0].transcript;
            if (e.results[i].isFinal) {
                speechToText += "\n" + transcript;
            } else {
                interimTranscript += transcript;
            }
        }
    });
}

startRecordButton.addEventListener('click', () => {
    questionHandler();
    mediaRecorder.start();
    audioRecorder.start();
    startRecordButton.disabled = true;
    stopRecordButton.disabled = false;
});

stopRecordButton.addEventListener('click', () => {
    mediaRecorder.stop();
    audioRecorder.stop();
    startRecordButton.disabled = false;
    stopRecordButton.disabled = true;
    recordedChunks = [];

    addSpeech();
});

nextQuestionButton.addEventListener("click", () => {
    questionIndex++;

    if (questionIndex >= questions.length) {
        navigateEnd()
        return
    }

    playQuestionSoundTTS()
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

function playQuestionSoundTTS() {
    addSpeech();
    const question = questions[questionIndex]
    questionElement.innerHTML = question

    const ttsEndPoint = "http://localhost:8080/tts?question=" + question;

    fetch(ttsEndPoint, {
        method: "GET",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("TTS 오류 발생")
            }
            return response.json()
        })
        .then((data) => {
            playAudioFromBase64(data["audioContent"])
        })
        .catch((error) => {
            console.log(error)
        })
}

function playAudioFromBase64(audioBase64) {
    const audioBinary = atob(audioBase64);
    const audioData = new Uint8Array(audioBinary.length);
    for (let i = 0; i < audioBinary.length; i++) {
        audioData[i] = audioBinary.charCodeAt(i);
    }
    const audioBlob = new Blob([audioData], {type: 'audio/mp3'});
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play().then(() => {
        console.log("Played Audio")
    })
}

function questionHandler() {
    const queryStrings = window.location.search;
    const queryParams = new URLSearchParams(queryStrings);
    const questionStrings = queryParams.get("question");

    questions = questionStrings.split("\r\n");
    shuffle(questions)

    playQuestionSoundTTS()
}

function addSpeech() {
    answers.push(speechToText);
    speechToText = "";
}

startCamera();
startAudio();
