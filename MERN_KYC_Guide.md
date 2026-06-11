# Comprehensive MERN Stack Guide: KYC & Identity Verification System

Welcome to MERN! Since you are new to the MERN stack (MongoDB, Express.js, React, Node.js), this document explains **exactly what we built**, **how we built it step-by-step**, and **why we made those specific technical decisions**. 

You can read this document directly in VS Code, or you can export it to a PDF using a VS Code extension (like "Markdown PDF").

---

## What is the MERN Stack?
MERN is a popular way to build full-stack web applications using Javascript for everything:
1. **M - MongoDB**: Our Database. This is where we store our `VerificationRequests` permanently.
2. **E - Express.js**: Our Backend Framework. It provides the structure for handling HTTP requests (like when the frontend asks to `/api/verify`).
3. **R - React**: Our Frontend Framework. It runs in the user's browser and displays the UI.
4. **N - Node.js**: The runtime environment that allows JavaScript to run on our backend server, instead of just in a web browser.

---

## Project Structure Overview
We split our project into two main folders so they can run independently:
* `frontend/`: The React code that runs in the browser on port `5173`.
* `backend/`: The Node.js/Express code that runs on our server on port `5000`.

---

## Step-by-Step Breakdown: What We Did & Why

### Step 1: Backend Foundation & Database (Node + Express + MongoDB)
**What we did:**
We created `backend/server.js`. We imported Express, set up middleware (like `cors` and `express.json`), and connected to MongoDB using a library called `mongoose`. We also defined a `VerificationRequest` schema.

**Why we did it:**
- **Express**: To create API "endpoints" (URLs) that our frontend can talk to.
- **CORS (Cross-Origin Resource Sharing)**: Because our frontend runs on port 5173 and our backend on 5000, browsers will block communication between them for security reasons. `cors()` tells the browser "It's okay, let port 5173 talk to port 5000."
- **Mongoose / Schema**: MongoDB is a "NoSQL" database, meaning it doesn't enforce tables or columns by default. Mongoose lets us define a "Schema" (a blueprint) so we enforce rules: every KYC request must have a `documentUrl`, a `status`, etc.

### Step 2: Frontend Foundation & Routing (React + Vite)
**What we did:**
We used Vite to create a React project in the `frontend` folder. We set up `react-router-dom` in `src/app.jsx` to handle different pages (Home, Verify, Admin).

**Why we did it:**
- **Vite**: It's a modern, incredibly fast build tool for React (replacing older tools like Create React App).
- **React-Router**: In standard HTML websites, clicking a link loads a whole new HTML page from the server. React is a "Single Page Application" (SPA). React-Router simply hides and shows different components instantly without reloading the browser page.

### Step 3: Handling File Uploads & Webcams
**What we did:**
On the frontend, we built a Drag & Drop component and used `react-webcam` to capture a selfie. 
On the backend, we used a package called `multer` to receive these files on the `/api/upload` routes.

**Why we did it:**
- **react-webcam**: We needed to ensure the selfie was "live" and not just an uploaded photo of a photo. Accessing the user's webcam directly solves this.
- **Multer**: Normally, HTTP requests send text (like JSON). Images are "binary" data. Standard Express cannot read binary file uploads. Multer is a middleware that intercepts multipart/form-data (files), saves them to our `backend/uploads` folder, and gives us the file path to save in our database.

### Step 4: The AI Brain (Gemini Integration for OCR)
**What we did:**
In `backend/server.js`, we built the `/api/verify` route. This route reads the uploaded images from the server's hard drive, converts them into Base64 strings, and sends them to Google's Gemini AI using your API key to extract the Name, DOB, and ID number.

**Why we did it:**
- **Base64**: The Gemini API requires images to be sent as raw text strings. Base64 is a way to convert a binary image into a massive string of text.
- **Data Extraction**: Gemini is a Large Language Model (LLM) and excels at Optical Character Recognition (OCR), meaning it can accurately read the text printed on complex backgrounds like ID cards.

### Step 5: High-Accuracy Machine Learning Biometrics (face-api.js)
**What we did:**
We integrated a specialized TensorFlow machine learning library (`face-api.js`) directly into the React frontend. 
1. When you upload a document, it runs a neural network to detect if a face is present, crops it out, and blocks the upload if the image is invalid.
2. During verification, it computes a 128-dimensional mathematical vector (a "face descriptor") for both the document photo and your live selfie.
3. It calculates the **Euclidean Distance** between these two 128-dimensional vectors to determine exactly how physically similar the two faces are.

**Why we did it:**
- **LLMs vs Specialized ML**: LLMs like Gemini are great at reading text, but they are *terrible* at biometrics. They tend to hallucinate matches based on superficial traits (like skin tone or glasses). By switching to `face-api.js`, we moved to a specialized mathematical model trained *only* to measure facial bone structure, preventing false positives and ensuring true liveness detection.
- **Client-Side ML**: By running this on the frontend (React), we provide instant feedback to the user if their ID photo is blurry, rather than making them wait for a slow backend server request.
- **Threshold Tuning**: We specifically lowered the model's minimum confidence threshold to `0.2` for the ID document because ID cards often have low contrast or holograms that confuse standard ML models. We then built a custom mathematical curve to map the Euclidean Distance metric (where `< 0.4` is a strong match) into a human-readable `0-100%` percentage score.

### Step 6: The Admin Dashboard
**What we did:**
We created the `/admin` routes in React and matching `GET` and `PUT` routes in Express. 

**Why we did it:**
- **GET routes**: The React frontend uses `fetch()` to call our Express server, grabbing all MongoDB records and displaying them in a table.
- **PUT routes**: Sometimes AI gets it wrong. We created a `PUT /api/admin/submissions/:id/status` endpoint. When you click "Approve" or "Reject", it tells MongoDB to update that specific record's status, overriding the AI.

---

## Summary of the Data Flow
If you ever get confused about how it all connects, remember this flow:
1. **User (React)** takes a photo.
2. **React** runs **face-api.js** to detect faces locally.
3. **React** sends an HTTP POST request containing the images and the ML match score to **Express**.
4. **Express** uses **Multer** to save the files to the disk.
5. **Express** sends the document to **Gemini API** for text extraction (OCR).
6. **Express** calculates the final Approve/Reject status based on the ML match score.
7. **Express** sends that JSON back to **React** to display.
8. **Express** saves that JSON into **MongoDB** for history.
9. **Admin (React)** asks **Express** for history, and Express reads it from **MongoDB**.

Congratulations on building your first full-stack AI MERN application!
