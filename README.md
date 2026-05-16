# 🌐 Language Translation Tool

> A full-stack web application for real-time text translation with voice input and text-to-speech output — built with Flask, MyMemory API, OpenAI Whisper, and the Web Speech API.

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.x-black?style=flat-square&logo=flask)
![Whisper](https://img.shields.io/badge/OpenAI-Whisper-412991?style=flat-square&logo=openai)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [How It Works](#-how-it-works)
- [API Endpoints](#-api-endpoints)
- [Supported Languages](#-supported-languages)
- [Known Limitations](#-known-limitations)
- [Future Enhancements](#-future-enhancements)
- [Troubleshooting](#-troubleshooting)
- [Author](#-author)

---

## 🧭 Overview

The **Language Translation Tool** is a web-based application developed as part of the AIML Lab curriculum. It enables users to translate text across 12+ languages using the **MyMemory Translation API**, speak into a microphone for hands-free input via **OpenAI Whisper**, and have translated text read aloud using the browser's built-in **Web Speech API**.

The application follows a client-server architecture where a lightweight **Flask** backend handles all API calls and audio processing, while a clean **HTML/CSS/JS** frontend manages the user interface and interactions.

---

## ✨ Features

### Core Features
| Feature | Description |
|---|---|
| **Text Translation** | Translate any text between 12+ supported languages |
| **Language Selection** | Dropdown selectors for both source and target language |
| **Auto-Detect Source** | Automatically detect input language (falls back to English) |
| **Swap Languages** | Instantly swap source/target languages and text content |
| **Copy to Clipboard** | One-click copy of translated output |

### Optional / Enhanced Features
| Feature | Description |
|---|---|
| **Voice Input (Whisper)** | Record speech via microphone → auto-transcribed to text using OpenAI Whisper |
| **Text-to-Speech (TTS)** | Translated text read aloud via Web Speech API in the correct language |
| **Character Counter** | Live counter showing current input length (max 5000 chars) |
| **Error Handling** | User-friendly messages for network issues, empty input, rate limits |
| **Responsive Design** | Works on desktop and mobile viewports |

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Python** | 3.8+ | Core programming language |
| **Flask** | 2.x | Web framework and API server |
| **OpenAI Whisper** | Latest | Speech-to-text transcription (runs locally on GPU) |
| **PyTorch** | 2.x (CUDA) | Deep learning backend for Whisper |
| **Requests** | 2.x | HTTP client for translation API calls |

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5** | Page structure and semantic markup |
| **CSS3** | Styling, layout, animations |
| **Vanilla JavaScript (ES6+)** | UI logic, fetch API calls, DOM manipulation |
| **MediaRecorder API** | Browser-native audio recording for voice input |
| **Web Speech API** | Browser-native text-to-speech playback |

### External APIs
| API | Purpose | Cost |
|---|---|---|
| **MyMemory Translation API** | Core translation engine | Free (5000 chars/day) |

---

## 📁 Project Structure

```
translation-tool/
│
├── app.py                      ← Flask backend — routes, Whisper, API calls
│
├── requirements.txt            ← Python dependencies
│
├── templates/
│   └── index.html              ← Main UI — HTML structure and layout
│
├── static/
│   ├── style.css               ← All styling — layout, colors, animations
│   └── script.js               ← Frontend logic — translate, TTS, mic, copy, swap
│
├── uploads/                    ← Temporary audio file storage (auto-cleaned)
│
└── README.md                   ← This file
```

---

## 📦 Prerequisites

Ensure the following are installed and configured on your system before setup:

### 1. Python 3.8 or Higher
```bash
python --version
# Expected: Python 3.8.x or above
```
Download: [python.org/downloads](https://www.python.org/downloads/)

> ⚠️ On Windows: check **"Add Python to PATH"** during installation.

### 2. pip (Python Package Manager)
```bash
pip --version
```
Comes bundled with Python. If missing: `python -m ensurepip --upgrade`

### 3. FFmpeg (Required by Whisper)
Whisper uses FFmpeg to decode audio files.

**Windows:**
1. Download from [ffmpeg.org/download.html](https://ffmpeg.org/download.html)
2. Extract and add the `bin/` folder to your system **PATH**
3. Verify: `ffmpeg -version`

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# Mac (Homebrew)
brew install ffmpeg
```

### 4. NVIDIA GPU (Recommended)
This project was developed and tested on an **RTX 4050 6GB** with CUDA 12.1.

Verify GPU availability:
```bash
python -c "import torch; print(torch.cuda.is_available())"
# True = GPU will be used by Whisper (fast)
# False = CPU fallback (slower but functional)
```

---

## ⚙️ Installation & Setup

### Step 1 — Clone or Download the Project
```bash
# If using Git
git clone https://github.com/kdboss01/translation-tool.git
cd translation-tool

# Or simply navigate to your project folder
cd translation-tool
```

### Step 2 — Create a Virtual Environment
```bash
python -m venv venv
```

### Step 3 — Activate the Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

> ⚠️ Always activate the virtual environment before running the project. If you open a new terminal window, activate it again.

### Step 4 — Install PyTorch (GPU Build)
Install this **before** the other dependencies to get the CUDA version:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

> This is a ~2GB download. Allow 5–10 minutes depending on connection speed.

### Step 5 — Install Remaining Dependencies
```bash
pip install flask requests openai-whisper
```

### Step 6 — Verify All Installations
```bash
python -c "import flask; print('Flask:', flask.__version__)"
python -c "import whisper; print('Whisper: OK')"
python -c "import requests; print('Requests: OK')"
python -c "import torch; print('CUDA available:', torch.cuda.is_available())"
```

All four should print without errors.

---

## 🚀 Running the Application

### Step 1 — Activate Virtual Environment
```bash
# Windows
venv\Scripts\activate
```

### Step 2 — Start Flask Server
```bash
python app.py
```

Expected output:
```
Loading Whisper model... (this may take a few seconds on first run)
Whisper model loaded successfully.
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

> 📌 On the **very first run**, Whisper will download the `base` model (~74MB). This is a one-time download cached locally.

### Step 3 — Open the App
Open your browser and visit:
```
http://localhost:5000
```

### Step 4 — Stop the Server
Press `Ctrl + C` in the terminal to shut down Flask.

---

## 🔄 How It Works

### Translation Flow
```
User types text in source box
          ↓
Selects source language + target language
          ↓
Clicks "Translate" button
          ↓
JavaScript sends POST request → Flask /translate route
          ↓
Flask calls MyMemory API:
  GET https://api.mymemory.translated.net/get?q=<text>&langpair=<src>|<tgt>
          ↓
Flask extracts translatedText from JSON response
          ↓
Returns JSON to frontend → displays in output box
```

### Voice Input Flow (Whisper)
```
User clicks "🎤 Record" button
          ↓
Browser requests microphone permission
          ↓
MediaRecorder captures audio as WebM blob
          ↓
User clicks "⏹ Stop"
          ↓
Audio blob sent via FormData → Flask /transcribe route
          ↓
Flask saves audio temporarily → Whisper transcribes it
          ↓
Transcribed text returned → auto-filled into source text box
          ↓
Temp audio file deleted from server
```

### Text-to-Speech Flow
```
User clicks "🔊 Listen" button
          ↓
JavaScript reads translated text from output box
          ↓
Maps short language code → BCP-47 code (e.g. "hi" → "hi-IN")
          ↓
Creates SpeechSynthesisUtterance with correct lang
          ↓
Browser's speechSynthesis.speak() reads text aloud
          ↓
Button changes to "⏹ Stop" — click again to cancel
```

---

## 📡 API Endpoints

### `GET /`
Serves the main HTML page.

**Response:** `index.html`

---

### `POST /translate`
Translates input text using MyMemory API.

**Request Body:**
```json
{
  "text": "Hello, how are you?",
  "source": "en",
  "target": "hi"
}
```

**Success Response (`200`):**
```json
{
  "translated_text": "नमस्ते, आप कैसे हैं?"
}
```

**Error Responses:**
| Status | Condition | Response |
|---|---|---|
| `400` | Empty text input | `{"error": "Input text is empty."}` |
| `400` | Same src/tgt language | `{"error": "Languages must be different."}` |
| `429` | Rate limit hit | `{"error": "Rate limit reached..."}` |
| `503` | Cannot reach API | `{"error": "Cannot reach translation server..."}` |
| `504` | Request timeout | `{"error": "Request timed out..."}` |

---

### `POST /transcribe`
Transcribes uploaded audio using OpenAI Whisper.

**Request:** `multipart/form-data` with field `audio` (WebM audio blob)

**Success Response (`200`):**
```json
{
  "transcribed_text": "Hello, this is a test."
}
```

**Error Responses:**
| Status | Condition | Response |
|---|---|---|
| `400` | No audio file sent | `{"error": "No audio file received."}` |
| `422` | No speech detected | `{"error": "Whisper could not detect any speech."}` |
| `500` | Transcription failed | `{"error": "Transcription failed: <reason>"}` |

---

## 🗺 Supported Languages

| Language | Code | TTS Support |
|---|---|---|
| English | `en` | ✅ |
| Hindi | `hi` | ✅ |
| French | `fr` | ✅ |
| German | `de` | ✅ |
| Spanish | `es` | ✅ |
| Italian | `it` | ✅ |
| Portuguese | `pt` | ✅ |
| Russian | `ru` | ✅ |
| Chinese (Simplified) | `zh` | ✅ |
| Japanese | `ja` | ✅ |
| Korean | `ko` | ✅ |
| Arabic | `ar` | ✅ |

> TTS availability depends on the voices installed in your browser/OS. Chrome and Edge have the widest language support for TTS.

---

## ⚠️ Known Limitations

| Limitation | Details |
|---|---|
| **MyMemory daily limit** | Free tier allows 5000 characters/day per IP. Exceeding this returns a rate-limit error. |
| **Auto-detect language** | When source is set to "Auto Detect", the backend defaults to English as a fallback since MyMemory requires an explicit language code. |
| **Whisper on CPU** | Without a compatible NVIDIA GPU, Whisper transcription will be significantly slower (10–30 seconds per recording). |
| **TTS language coverage** | Web Speech API TTS depends on OS-installed voices. Some languages may not have a voice available on all systems. |
| **No persistent history** | Translations are not saved between sessions. Each page refresh clears the output. |
| **Audio format** | The browser records in WebM format. FFmpeg must be installed for Whisper to decode it. |

---

## 🚀 Future Enhancements

- [ ] **Auto-translate on typing** — translate automatically after the user stops typing (debounce timer)
- [ ] **Translation history** — save last 10 translations to `localStorage`
- [ ] **More languages** — expand from 12 to 40+ languages
- [ ] **DeepL integration** — add DeepL as a higher-quality secondary translation engine
- [ ] **Document translation** — upload a `.txt` or `.pdf` file and translate the full content
- [ ] **Whisper language hint** — pass detected language back to the source dropdown automatically
- [ ] **Dark mode toggle** — switch between light and dark themes
- [ ] **Offline mode** — integrate a local LibreTranslate instance for fully offline translation

---

## 🔧 Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `ModuleNotFoundError: flask` | Virtual environment not activated | Run `venv\Scripts\activate` then `pip install flask` |
| `Cannot reach translation server` | MyMemory API unreachable | Check internet connection; try again after a moment |
| `Translation API error: 400` | `auto` passed as source language | Switch source language to a specific language |
| `Whisper: OSError WinError 2` | FFmpeg not installed or not in PATH | Install FFmpeg and add to system PATH |
| `CUDA out of memory` | Whisper model too large for GPU | Switch to `whisper.load_model("tiny")` in `app.py` |
| `Microphone access denied` | Browser blocked mic permission | Go to browser settings → allow mic for `localhost` |
| `Port 5000 in use` | Another process is using the port | Run `netstat -ano \| findstr :5000` and kill the PID |
| TTS makes no sound | Browser/OS missing voice for language | Use Chrome or Edge; check OS language pack settings |

---

## 👤 Author

**Krishna**
Task 1 Language Translation Tool

---

## 📄 License

This project is developed for academic/educational purposes under the MIT license.

---

*Last updated: May 2026*
