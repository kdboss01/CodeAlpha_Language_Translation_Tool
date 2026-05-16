from flask import Flask, request, jsonify, render_template
import requests
import whisper
import os
import uuid

app = Flask(__name__)

# -------------------------------------------
# Load Whisper model once at startup
# Using "base" model — good balance of speed and accuracy
# Options: "tiny", "base", "small", "medium"
# -------------------------------------------
print("Loading Whisper model... (this may take a few seconds on first run)")
whisper_model = whisper.load_model("base")
print("Whisper model loaded successfully.")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# -------------------------------------------
# Route 1: Serve the main HTML page
# -------------------------------------------
@app.route("/")
def index():
    return render_template("index.html")


# -------------------------------------------
# Route 2: Translation endpoint
# Accepts: { "text": str, "source": str, "target": str }
# Returns: { "translated_text": str } or { "error": str }
# -------------------------------------------
@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json()

    text = data.get("text", "").strip()
    source_lang = data.get("source", "en")
    target_lang = data.get("target", "hi")

    if not text:
        return jsonify({"error": "Input text is empty."}), 400

    if source_lang == target_lang or source_lang == "auto":
        source_lang = "en"

    try:
        response = requests.get(
            "https://api.mymemory.translated.net/get",
            params={
                "q": text,
                "langpair": f"{source_lang}|{target_lang}"
            },
            timeout=10
        )

        if response.status_code == 200:
            result = response.json()
            translated = result["responseData"]["translatedText"]
            return jsonify({"translated_text": translated})
        else:
            return jsonify({"error": f"Translation API error: {response.status_code}"}), 500

    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out. Check your internet."}), 504

    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Cannot reach translation server. Check your internet."}), 503

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


# -------------------------------------------
# Route 3: Whisper transcription endpoint
# Accepts: audio file (multipart/form-data)
# Returns: { "transcribed_text": str } or { "error": str }
# -------------------------------------------
@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file received."}), 400

    audio_file = request.files["audio"]

    if audio_file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    # Save audio file temporarily with a unique name to avoid conflicts
    unique_name = f"{uuid.uuid4().hex}.webm"
    save_path = os.path.join(UPLOAD_FOLDER, unique_name)
    audio_file.save(save_path)

    try:
        # Whisper transcription
        result = whisper_model.transcribe(save_path)
        transcribed = result.get("text", "").strip()

        if not transcribed:
            return jsonify({"error": "Whisper could not detect any speech."}), 422

        return jsonify({"transcribed_text": transcribed})

    except Exception as e:
        return jsonify({"error": f"Transcription failed: {str(e)}"}), 500

    finally:
        # Always clean up the temp file
        if os.path.exists(save_path):
            os.remove(save_path)


if __name__ == "__main__":
    app.run(debug=True, port=5000)