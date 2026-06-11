import React, { useCallback, useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';

const DocumentUpload = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [croppedFace, setCroppedFace] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const imageRef = useRef();

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setIsModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models", err);
        setValidationError("Failed to load ML models. Please check console.");
      }
    };
    loadModels();
  }, []);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);
    setCroppedFace(null);
    setValidationError(null);
    setIsValidating(true);

    // Create a temporary image object to process with face-api
    const img = new Image();
    img.src = objectUrl;
    img.onload = async () => {
      try {
        if (!isModelsLoaded) {
          setValidationError("Models are still loading... please try again in a moment.");
          setIsValidating(false);
          return;
        }

        // ID cards often have holograms or the face is small, so we lower the minimum confidence threshold to 0.2 (default is 0.5)
        const detectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 });
        const detection = await faceapi.detectSingleFace(img, detectionOptions).withFaceLandmarks().withFaceDescriptor();

        if (!detection) {
          setValidationError("No face detected in the document. Please re-upload a clearer image.");
          setIsValidating(false);
          return;
        }

        // Extract the cropped face
        const canvas = document.createElement('canvas');
        const box = detection.detection.box;
        
        // Add some padding to the crop
        const padding = 20;
        const x = Math.max(0, box.x - padding);
        const y = Math.max(0, box.y - padding);
        const w = Math.min(img.width - x, box.width + padding * 2);
        const h = Math.min(img.height - y, box.height + padding * 2);

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
        
        setCroppedFace(canvas.toDataURL('image/jpeg'));
        
        // Store the descriptor in localStorage or pass it along to use in the verification step
        localStorage.setItem('documentFaceDescriptor', JSON.stringify(Array.from(detection.descriptor)));
        
        setIsValidating(false);
      } catch (err) {
        console.error("Face detection error:", err);
        setValidationError("An error occurred during face detection.");
        setIsValidating(false);
      }
    };
  };

  const handleUpload = async () => {
    if (!file || validationError) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload/document', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        onUploadComplete(data.documentUrl);
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      alert('Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setPreview(null);
    setCroppedFace(null);
    setFile(null);
    setValidationError(null);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '32px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '16px' }}>Upload Government ID</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Please upload a clear picture of your ID. We will instantly scan it to extract your profile photo.
      </p>
      
      {!isModelsLoaded && <div style={{ color: 'var(--primary-color)', marginBottom: '16px' }}>Initializing Machine Learning Models...</div>}

      {!preview ? (
        <div 
          style={{ 
            border: '2px dashed rgba(102, 252, 241, 0.4)', 
            borderRadius: 'var(--border-radius-lg)', 
            padding: '48px', 
            cursor: isModelsLoaded ? 'pointer' : 'not-allowed',
            transition: 'background var(--transition-fast)',
            opacity: isModelsLoaded ? 1 : 0.5
          }}
          onClick={() => isModelsLoaded && document.getElementById('id-upload').click()}
          onMouseOver={(e) => isModelsLoaded && (e.currentTarget.style.background = 'rgba(102, 252, 241, 0.05)')}
          onMouseOut={(e) => isModelsLoaded && (e.currentTarget.style.background = 'transparent')}
        >
          <input 
            type="file" 
            id="id-upload" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleFileChange} 
            disabled={!isModelsLoaded}
          />
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📷</div>
          <p style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Click to browse files</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            {/* Original Document Preview */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Uploaded Document</div>
              <img 
                src={preview} 
                alt="ID Preview" 
                style={{ 
                  maxWidth: '100%', 
                  height: '200px', 
                  borderRadius: 'var(--border-radius-md)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  objectFit: 'contain',
                  background: 'rgba(0,0,0,0.5)'
                }} 
              />
            </div>

            {/* Face Extraction Results */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px' }}>Extracted Profile Photo</div>
              <div style={{ 
                width: '150px', height: '200px', 
                borderRadius: 'var(--border-radius-md)', 
                border: validationError ? '2px solid var(--danger-color)' : '2px solid var(--success-color)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.5)', overflow: 'hidden'
              }}>
                {isValidating ? (
                  <div style={{ animation: 'spin 1s linear infinite' }}>⚙️</div>
                ) : croppedFace ? (
                  <img src={croppedFace} alt="Extracted Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '2rem' }}>❌</div>
                )}
              </div>
            </div>
          </div>

          {validationError && (
            <div style={{ color: 'var(--danger-color)', marginBottom: '24px', fontWeight: 500 }}>
              {validationError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn btn-outline" onClick={handleRetake} disabled={isUploading}>
              Retake
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleUpload} 
              disabled={isUploading || isValidating || !!validationError}
              style={{ opacity: (isValidating || !!validationError) ? 0.5 : 1, cursor: (isValidating || !!validationError) ? 'not-allowed' : 'pointer' }}
            >
              {isUploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
