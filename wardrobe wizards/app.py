from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "static/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ================= SKIN TONE DETECTION (IMPROVED) =================
def detect_skin_tone(image_path):
    img = cv2.imread(image_path)
    img = cv2.resize(img, (300, 300))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    # Skin color range in HSV
    lower_skin = np.array([0, 30, 60], dtype=np.uint8)
    upper_skin = np.array([20, 150, 255], dtype=np.uint8)

    mask = cv2.inRange(hsv, lower_skin, upper_skin)
    skin = cv2.bitwise_and(img, img, mask=mask)

    # Extract brightness (V channel)
    v_channel = hsv[:, :, 2]
    skin_pixels = v_channel[mask > 0]

    if len(skin_pixels) == 0:
        return "Medium"  # fallback

    avg_brightness = np.mean(skin_pixels)

    if avg_brightness > 170:
        return "Light"
    elif avg_brightness > 120:
        return "Medium"
    else:
        return "Dark"

# ================= AI RECOMMENDATION =================
def ai_recommendation(skin, gender):
    prompt = f"""
Skin Tone: {skin}
Gender: {gender}

Return ONLY valid JSON:

{{
  "shirts": "",
  "bottoms": "",
  "footwear": "",
  "accessories": "",
  "hairstyle": ""
}}
"""

    res = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=250,
        temperature=0.4
    )

    return res.choices[0].message.content

# ================= ROUTES =================
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/analyze", methods=["POST"])
def analyze():
    image = request.files["image"]
    gender = request.form["gender"]

    path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(path)

    skin = detect_skin_tone(path)

    try:
        recommendation = json.loads(ai_recommendation(skin, gender))
    except:
        recommendation = {
            "shirts": "Neutral tones, pastels",
            "bottoms": "Dark jeans, chinos",
            "footwear": "White sneakers",
            "accessories": "Minimal jewelry",
            "hairstyle": "Natural or clean fade"
        }

    return jsonify({
        "gender": gender.capitalize(),
        "skin_tone": skin,
        "recommendation": recommendation
    })

if __name__ == "__main__":
    app.run(debug=True)