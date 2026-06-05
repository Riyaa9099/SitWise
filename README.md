# SitWise

SitWise is an AI-powered posture monitoring system that helps users maintain healthy sitting habits while working, studying, or gaming. Using real-time computer vision and posture analysis, SitWise detects poor posture, provides instant feedback, and encourages better spinal health.

---

## Features

- Real-time posture detection using webcam
- AI-powered posture analysis
- Neck angle calculation and monitoring
- Instant visual feedback
- Good/Bad posture status display
- Bad posture duration tracking
- Alert system for prolonged poor posture
- Responsive web interface
- Dark mode support

---

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- FastAPI
- Python

### AI & Computer Vision
- MediaPipe
- OpenCV
- TensorFlow Lite

---

## Requirements

- Python 3.8 or higher
- Webcam
- Internet browser
- Audio output device

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/RIYA9099/sitwise.git
cd sitwise
```

### 2. Create Virtual Environment

#### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

#### macOS/Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

Move to backend folder:

```bash
cd backend
```

Install requirements:

```bash
pip install -r requirements.txt
```

---

## Running the Application

From backend folder:

```bash
uvicorn main:app --reload
```

Server will start at:

```text
http://127.0.0.1:8000/
```

Open the URL in your browser.

---

## How It Works

1. Open SitWise in your browser.
2. Click **Start Detection**.
3. Allow webcam permissions.
4. Sit naturally in front of the camera.
5. SitWise analyzes your posture in real time.
6. If poor posture is detected:
   - Posture status changes.
   - Timer starts.
   - Alert is triggered after prolonged bad posture.

---

## Project Structure

```text
SitWise/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── index.html
│   ├── clerk.html
│   ├── assets/
│   │   ├── about-image.png
│   │   ├── boy2.jpg
│   │   ├── girl2.png
│   │   ├── faq-background.png
│   │   └── primary_image-removebg-preview.png
│   │
│   └── sounds/
│       └── soft-alert.mp3
│
└── README.md
```

---

## Posture Guidelines

### Good Posture

- Head aligned with shoulders
- Neck angle within healthy range
- Back supported and upright
- Screen at eye level

### Bad Posture

- Forward head tilt
- Rounded shoulders
- Excessive neck bending
- Slouching while sitting

---

## Benefits of Using SitWise

- Reduces neck strain
- Improves sitting habits
- Prevents back pain
- Increases workplace comfort
- Encourages ergonomic posture
- Supports long study and work sessions

---

## Troubleshooting

### Webcam Not Detected

- Check webcam connection
- Allow browser camera permissions
- Restart browser and application

### Detection Not Working

- Ensure adequate lighting
- Sit clearly within camera frame
- Check webcam quality

### Alerts Not Playing

- Verify audio output is enabled
- Check browser sound permissions
- Ensure alert files exist

### MediaPipe Errors

- Update dependencies
- Restart application
- Verify Python version compatibility

---

## Future Improvements

- User authentication
- Posture history tracking
- Daily posture reports
- Personalized posture recommendations
- Productivity dashboard
- Mobile support

---

SitWise – Sit Smart. Work Better.
