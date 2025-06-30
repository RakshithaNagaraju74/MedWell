from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import os
import cv2
import numpy as np
import uuid
import logging

app = Flask(__name__)

logging.basicConfig(level=logging.INFO)

# Initialize PaddleOCR with enhanced params
ocr_model = PaddleOCR(
    use_angle_cls=True,
    lang='en',
    ocr_version='PP-OCRv4',
    det_db_box_thresh=0.3,
    use_space_char=True,
    rec_char_type='en',
    cls_model_dir=None,
    det_model_dir=None,
    rec_model_dir=None
)

MAX_SIZE_MB = 10

def preprocess_image(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Image not found or unreadable.")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    filtered = cv2.bilateralFilter(enhanced, d=9, sigmaColor=75, sigmaSpace=75)
    binarized = cv2.adaptiveThreshold(filtered, 255,
                                      cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                      cv2.THRESH_BINARY, 31, 15)
    kernel = np.ones((2,2), np.uint8)
    morph = cv2.morphologyEx(binarized, cv2.MORPH_CLOSE, kernel, iterations=1)
    morph = cv2.morphologyEx(morph, cv2.MORPH_OPEN, kernel, iterations=1)

    height, width = morph.shape
    if width < 1200:
        scale = 1200 / width
        morph = cv2.resize(morph, (1200, int(height * scale)), interpolation=cv2.INTER_LINEAR)

    return morph

@app.route('/ocr', methods=['POST'])
def ocr_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']

    # Check file size
    image_stream = image.stream.read()
    if len(image_stream) > MAX_SIZE_MB * 1024 * 1024:
        return jsonify({'error': f'Image too large (max {MAX_SIZE_MB}MB)'}), 413
    image.stream.seek(0)  # Reset stream position after reading size

    os.makedirs('temp', exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}_{image.filename}"
    image_path = os.path.join('temp', unique_filename)
    image.save(image_path)

    temp_path = image_path.replace('.', '_proc.')

    try:
        preprocessed_img = preprocess_image(image_path)
        cv2.imwrite(temp_path, preprocessed_img)

        result = ocr_model.ocr(temp_path, cls=True)

        if not result or result[0] is None:
            return jsonify({'text': []})

        lines = [line[1][0] for line in result[0]]
        return jsonify({'text': lines})

    except Exception as e:
        logging.error(f"OCR processing error: {e}", exc_info=True)
        return jsonify({'error': 'OCR processing failed', 'details': str(e)}), 500

    finally:
        if os.path.exists(image_path):
            os.remove(image_path)
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
