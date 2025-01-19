'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DocumentScanner } from './document-scanner';

export default function DocumentScannerComponent() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<HTMLCanvasElement | null>(null);
  const [opencvLoaded, setOpencvLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Load OpenCV.js dynamically
  useEffect(() => {
    const loadOpencv = async () => {
      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.5.1/opencv.js'; // Ensure OpenCV.js is available
      script.async = true;
      script.onload = () => setOpencvLoaded(true);
      document.body.appendChild(script);
    };
    loadOpencv();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string); // Update the original image
        setCroppedImage(null); // Reset the cropped image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetectAndCrop = () => {
    if (!opencvLoaded || !originalImage || !imageRef.current) {
      alert('Make sure OpenCV is loaded and an image is uploaded or captured!');
      return;
    }

    try {
      const scanner = new DocumentScanner();
      const points = scanner.detect(imageRef.current); // Detect corners
      const croppedCanvas = scanner.crop(imageRef.current, points); // Crop the image
      setCroppedImage(croppedCanvas); // Update the cropped image
    } catch (error) {
      console.error('Error during detection or cropping:', error);
      alert('Error processing the image. Please try again.');
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing the camera:', error);
      alert('Unable to access the camera. Please check your permissions.');
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setOriginalImage(dataUrl); // Update the original image
        setCroppedImage(null); // Reset the cropped image
        stopCamera(); // Turn off the camera after capture
      }
    }
  };

  const stopCamera = () => {
    setIsCameraActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-xl font-bold">Document Scanner</h1>

      {!isCameraActive && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          capture="environment"
          className="mb-4"
        />
      )}

      {isCameraActive && (
        <div className="relative">
          <video ref={videoRef} className="border max-w-xs" />
          <button
            onClick={captureImage}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Capture Image
          </button>
        </div>
      )}

      <div className="flex space-x-4">
        {originalImage && (
          <div>
            <h2 className="text-lg font-semibold">Original Image</h2>
            <img
              ref={imageRef}
              src={originalImage}
              alt="Uploaded"
              className="max-w-xs border"
            />
          </div>
        )}

        {croppedImage && (
          <div>
            <h2 className="text-lg font-semibold">Cropped Image</h2>
            <canvas
              ref={(el) => {
                if (el && croppedImage) {
                  el.replaceWith(croppedImage); // Replace with the cropped canvas
                }
              }}
              className="border"
            />
          </div>
        )}
      </div>

      <div className="space-x-4">
        <button
          onClick={handleDetectAndCrop}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={!opencvLoaded || !originalImage}
        >
          Detect and Crop
        </button>

        {!isCameraActive && (
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Use Camera
          </button>
        )}

        {isCameraActive && (
          <button
            onClick={stopCamera}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
}
