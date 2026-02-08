# Sahayak Project - Full Assistive Navigation Suite

**Sahayak** is a comprehensive assistive technology solution designed to help visually impaired users navigate their environment safely and independently. This repository contains the full source code for both the **Frontend** application and the **Backend** server.

## 👥 Team: Bombay.Bytes

**Team Members**:
- **Grishma Thakare** ([@grishma-blip](https://github.com/grishma-blip))
- **Ashutosh Rai** ([@ashurai84](https://github.com/ashurai84))

## 📂 Project Structure

This monorepo is organized into two main parts:

- **project/**: The **Frontend** application built with React, Vite, and TensorFlow.js.
- **hackathon_blindeye_backend/**: The **Backend** server built with Node.js and Express.

---

## 📱 Frontend (`project/`)

The user-facing interface that runs in the browser.

### Features
- **Voice-First Interface**: Complete hands-free navigation.
- **Real-time Object Detection**: Offline neural network (COCO-SSD) for detecting obstacles.
- **Navigation & Maps**: GPS-based outdoor navigation.
- **Emergency SOS**: Simulates sending emergency alerts.

### Setup
1.  Navigate to the frontend folder:
    ```bash
    cd project
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the app:
    ```bash
    npm run dev
    ```

---

## 🖥️ Backend (`hackathon_blindeye_backend/`)

The server-side component handling computer vision proxying and logging.

### Features
- **Google Cloud Vision Integraton**: Secured proxy for image analysis.
- **Event Logging**: Centralized tracking of user actions.
- **Health Checks**: Server status monitoring.

### Setup
1.  Navigate to the backend server folder:
    ```bash
    cd hackathon_blindeye_backend/http-server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```

## 📄 License

This project is licensed under the MIT License.
