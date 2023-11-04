import os

from flask import Flask, render_template, request
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)


@app.route('/')
def index():
    return render_template("index.html")


@app.route("/interview.html")
def interview():
    return render_template("interview.html")


@app.route("/tts")
def tts():
    args = request.args
    # `google tts api` 요청 및 응답
    tts_end_point = "https://texttospeech.googleapis.com/v1beta1/text:synthesize";
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": os.environ.get("GOOGLE_API_KEY")
    }
    data = {
        'audioConfig': {
            'audioEncoding': 'LINEAR16',
            'effectsProfileId': [
                'small-bluetooth-speaker-class-device'
            ],
            'pitch': 0,
            'speakingRate': 1
        },
        'input': {
            'text': args.get("question")
        },
        'voice': {
            'languageCode': 'ko-KR',
            'name': 'ko-KR-Wavenet-B'
        }
    }

    response = requests.post(tts_end_point, headers=headers, data=json.dumps(data))

    return response.text


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)
