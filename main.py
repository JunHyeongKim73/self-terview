from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def index():
    return render_template("index.html")


@app.route("/interview.html")
def interview():
    return render_template("interview.html")


@app.route("/tts", methods=["POST"])
def tts():
    # `google tts api` 요청 및 응답
    return "OK"


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=True)