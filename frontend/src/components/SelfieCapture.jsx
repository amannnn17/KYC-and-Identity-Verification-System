import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';

const SelfieCapture = ({ onCaptureComplete }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleUpload = async () => {
    if (!imgSrc) return;
    setIsUploading(true);

    const file = dataURLtoFile(imgSrc, 'selfie.jpg');
    const formData = new FormData();
    formData.append('selfie', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload/selfie', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        onCaptureComplete(data.selfieUrl);
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

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '32px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '16px' }}>Liveness Verification</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Please look directly at the camera and ensure your face is well-lit.
      </p>

      {!imgSrc ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            borderRadius: 'var(--border-radius-md)', 
            overflow: 'hidden',
            marginBottom: '24px',
            border: '2px solid rgba(102, 252, 241, 0.4)'
          }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={400}
              height={300}
              videoConstraints={{ facingMode: "user" }}
            />
          </div>
          <button className="btn btn-primary" onClick={capture}>
            Capture Selfie
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img 
            src={imgSrc} 
            alt="Selfie Preview" 
            style={{ 
              width: '400px',
              height: '300px',
              objectFit: 'cover',
              borderRadius: 'var(--border-radius-md)', 
              marginBottom: '24px',
              border: '2px solid var(--primary-color)'
            }} 
          />
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn btn-outline" onClick={() => setImgSrc(null)} disabled={isUploading}>
              Retake
            </button>
            <button className="btn btn-primary" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Verifying...' : 'Submit Selfie'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfieCapture;
