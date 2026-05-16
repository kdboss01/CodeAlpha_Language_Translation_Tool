// ─── Element References ──────────────────────────────────────────
const sourceText   = document.getElementById("sourceText");
const outputBox    = document.getElementById("outputBox");
const sourceLang   = document.getElementById("sourceLang");
const targetLang   = document.getElementById("targetLang");
const translateBtn = document.getElementById("translateBtn");
const swapBtn      = document.getElementById("swapBtn");
const copyBtn      = document.getElementById("copyBtn");
const ttsBtn       = document.getElementById("ttsBtn");
const micBtn       = document.getElementById("micBtn");
const charCount    = document.getElementById("charCount");
const statusBar    = document.getElementById("statusBar");
const recordingStatus = document.getElementById("recordingStatus");

let mediaRecorder = null;
let audioChunks   = [];
let isRecording   = false;
let isSpeaking    = false;

const ttsLangMap = {
    "en": "en-US",
    "hi": "hi-IN",
    "fr": "fr-FR",
    "de": "de-DE",
    "es": "es-ES",
    "it": "it-IT",
    "pt": "pt-PT",
    "ru": "ru-RU",
    "zh": "zh-CN",
    "ja": "ja-JP",
    "ko": "ko-KR",
    "ar": "ar-SA"
};

// ─── Character Counter ────────────────────────────────────────────
sourceText.addEventListener("input", () => {
    charCount.textContent = sourceText.value.length;
});


// ─── Show Status Bar ─────────────────────────────────────────────
function showStatus(message, type = "loading") {
    statusBar.textContent = message;
    statusBar.className = `status-bar ${type}`;
}

function hideStatus() {
    statusBar.className = "status-bar hidden";
}


// ─── Translate Button ─────────────────────────────────────────────
translateBtn.addEventListener("click", async () => {
    const text = sourceText.value.trim();

    if (!text) {
        showStatus("⚠️ Please enter some text to translate.", "error");
        return;
    }

    if (sourceLang.value === targetLang.value) {
        showStatus("⚠️ Source and target languages must be different.", "error");
        return;
    }

    translateBtn.disabled = true;
    showStatus("⏳ Translating...", "loading");
    outputBox.innerHTML = '<span class="placeholder">Translating...</span>';

    try {
        const response = await fetch("/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: text,
                source: sourceLang.value,
                target: targetLang.value
            })
        });

        const data = await response.json();

        if (response.ok) {
            outputBox.textContent = data.translated_text;
            hideStatus();
        } else {
            outputBox.innerHTML = '<span class="placeholder">Translation failed.</span>';
            showStatus(`❌ ${data.error}`, "error");
        }

    } catch (err) {
        outputBox.innerHTML = '<span class="placeholder">Translation failed.</span>';
        showStatus("❌ Network error. Make sure the Flask server is running.", "error");
    } finally {
        translateBtn.disabled = false;
    }
});


// ─── Swap Languages Button ────────────────────────────────────────
swapBtn.addEventListener("click", () => {
    // Don't swap if source is "auto" (can't translate from a detected language into source)
    if (sourceLang.value === "auto") {
        showStatus("⚠️ Cannot swap when source is set to Auto Detect.", "error");
        return;
    }

    // Swap dropdown values
    const tempLang = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = tempLang;

    // Swap text content
    const currentOutput = outputBox.textContent;
    const isPlaceholder = outputBox.querySelector(".placeholder");

    if (!isPlaceholder && currentOutput) {
        sourceText.value = currentOutput;
        charCount.textContent = currentOutput.length;
        outputBox.innerHTML = '<span class="placeholder">Translation will appear here...</span>';
    }

    hideStatus();
});


// ─── Copy Button ──────────────────────────────────────────────────
copyBtn.addEventListener("click", async () => {
    const text = outputBox.textContent;
    const isPlaceholder = outputBox.querySelector(".placeholder");

    if (isPlaceholder || !text.trim()) {
        showStatus("⚠️ Nothing to copy yet.", "error");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "✅ Copied!";
        setTimeout(() => { copyBtn.textContent = "📋 Copy"; }, 2000);
    } catch {
        showStatus("❌ Could not copy to clipboard.", "error");
    }
});


// ─── Text-to-Speech (TTS) Button ──────────────────────────────────
ttsBtn.addEventListener("click", () => {
    const text = outputBox.textContent;
    const isPlaceholder = outputBox.querySelector(".placeholder");

    if (!window.speechSynthesis) {
        showStatus("❌ Your browser does not support Text-to-Speech.", "error");
        return;
    }

    if (isPlaceholder || !text.trim()) {
        showStatus("⚠️ No text to read aloud.", "error");
        return;
    }

    if (isSpeaking) {
        // Stop speaking
        speechSynthesis.cancel();
        isSpeaking = false;
        ttsBtn.textContent = "🔊 Listen";
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ttsLangMap[targetLang.value] || targetLang.value;
    utterance.rate = 0.95;

    utterance.onstart = () => {
        isSpeaking = true;
        ttsBtn.textContent = "⏹ Stop";
    };

    utterance.onend = () => {
        isSpeaking = false;
        ttsBtn.textContent = "🔊 Listen";
    };

    utterance.onerror = () => {
        isSpeaking = false;
        ttsBtn.textContent = "🔊 Listen";
        showStatus("❌ TTS error. Your browser may not support this language.", "error");
    };

    speechSynthesis.speak(utterance);
});


// ─── Mic Button (Whisper Voice Input) ────────────────────────────
micBtn.addEventListener("click", async () => {

    if (isRecording) {
        // Stop recording
        mediaRecorder.stop();
        return;
    }

    // Request mic access
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
        showStatus("❌ Microphone access denied. Please allow microphone in browser settings.", "error");
        return;
    }

    // Start recording
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstart = () => {
        isRecording = true;
        micBtn.textContent = "⏹ Stop";
        micBtn.classList.add("recording");
        recordingStatus.textContent = "● Recording...";
    };

    mediaRecorder.onstop = async () => {
        isRecording = false;
        micBtn.textContent = "🎤 Record";
        micBtn.classList.remove("recording");
        recordingStatus.textContent = "";

        // Stop all mic tracks
        stream.getTracks().forEach(track => track.stop());

        // Build audio blob
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        showStatus("⏳ Transcribing audio with Whisper...", "loading");
        micBtn.disabled = true;

        try {
            const res = await fetch("/transcribe", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                sourceText.value = data.transcribed_text;
                charCount.textContent = data.transcribed_text.length;
                hideStatus();
                showStatus("✅ Voice transcribed! Click Translate to proceed.", "success");
            } else {
                showStatus(`❌ ${data.error}`, "error");
            }

        } catch {
            showStatus("❌ Transcription request failed. Make sure Flask is running.", "error");
        } finally {
            micBtn.disabled = false;
        }
    };

    mediaRecorder.start();
});