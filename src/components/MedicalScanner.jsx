import { useState, useEffect } from "react";
import { UploadCard } from "./UploadCard.jsx";
import { ProcessingState } from "./ProcessingState.jsx";
import { ResultsDisplay } from "./ResultsDisplay.jsx";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Users, Zap } from "lucide-react";
import heroImage from "@/assets/medical-scanner-hero.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { addScanHistory } from "@/lib/firestoreData";

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const BACKEND_URL = "http://localhost:8082";

const getFriendlyNetworkError = (err, action) => {
  if (err instanceof TypeError && /fetch/i.test(err.message)) {
    return `${action} failed because the backend is not reachable. Please start the backend on port 8082 and try again.`;
  }

  return `${action} failed: ${err.message}`;
};

const readErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json();
    return data?.error || data?.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

export const MedicalScanner = () => {
  const { user } = useAuth() || {};
  const navigate = useNavigate();
  // If user is logged in, start at 'upload', otherwise 'welcome'
  const [currentState, setCurrentState] = useState(user ? 'upload' : 'welcome');
  const [uploadedContent, setUploadedContent] = useState('');
  const [selectedLiteracy, setSelectedLiteracy] = useState(user?.literacyLevel || 'basic');
  const [processingStep, setProcessingStep] = useState('analyzing');
  const [progress, setProgress] = useState(0);

  const [simplifiedContent, setSimplifiedContent] = useState("");
  const [contentSourceType, setContentSourceType] = useState('text');

  // Keep literacy level updated if user context changes
  useEffect(() => {
    if (user?.literacyLevel) {
      setSelectedLiteracy(user.literacyLevel);
    }
  }, [user]);

  const finalizeResult = async (originalText, rewrittenText) => {
    setProgress(100);
    setProcessingStep('complete');
    setUploadedContent(originalText);
    setSimplifiedContent(rewrittenText || 'No rewritten content returned.');

    if (user && rewrittenText) {
      try {
        await addScanHistory(user.id, {
          originalText,
          simplifiedText: rewrittenText,
          literacyLevel: selectedLiteracy,
        });
      } catch (err) {
        console.error("Failed to save history", err);
      }
    }

    setTimeout(() => setCurrentState('results'), 1000);
  };

  const beginProcessing = (sourceType = 'text') => {
    setContentSourceType(sourceType);
    setCurrentState('processing');
    setProgress(12);
    setProcessingStep('analyzing');
  };

  const executeProcess = async (textToProcess) => {
    setProgress(55);
    setProcessingStep('processing');
    try {
      const response = await fetch(`${BACKEND_URL}/api/rewrite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToProcess, targetLevel: selectedLiteracy })
      });
      if (!response.ok) throw new Error('Rewrite failed');
      const data = await response.json();
      await finalizeResult(textToProcess, data.rewritten);
    } catch (err) {
      alert(getFriendlyNetworkError(err, 'Rewriting'));
      setCurrentState('upload');
      setProgress(0);
      setProcessingStep('analyzing');
    }
  };

  const handleUpload = async (type, content) => {
    if (type === 'file') {
      if (content?.type?.startsWith('image/') && !SUPPORTED_IMAGE_TYPES.includes(content.type)) {
        alert('This image format is not supported yet. Please upload a JPG, JPEG, PNG, or WEBP image.');
        return;
      }
      beginProcessing('file');
      const formData = new FormData();
      formData.append('file', content);
      try {
        setProgress(22);
        const response = await fetch(`${BACKEND_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error(await readErrorMessage(response, 'Upload failed'));
        }
        const data = await response.json();
        setProgress(72);
        setProcessingStep('processing');
        const extractedText = data.notes || data.text || data.processedText || 'File uploaded successfully.';
        if (data.rewritten) {
          await finalizeResult(extractedText, data.rewritten);
        } else {
          setUploadedContent(extractedText);
          executeProcess(extractedText);
        }
      } catch (err) {
        alert(getFriendlyNetworkError(err, 'File upload'));
        setCurrentState('upload');
        setProgress(0);
        setProcessingStep('analyzing');
      }
    } else if (type === 'url') {
      beginProcessing('url');
      try {
        setProgress(18);
        const response = await fetch(`${BACKEND_URL}/api/url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: content, literacyLevel: selectedLiteracy })
        });
        if (!response.ok) {
          throw new Error(await readErrorMessage(response, 'URL processing failed'));
        }
        const data = await response.json();
        setProgress(72);
        setProcessingStep('processing');
        const extractedText = data.notes || data.text || 'No readable text returned from the URL.';
        if (data.rewritten) {
          await finalizeResult(extractedText, data.rewritten);
        } else {
          setUploadedContent(extractedText);
          executeProcess(extractedText);
        }
      } catch (err) {
        alert(getFriendlyNetworkError(err, 'URL processing'));
        setCurrentState('upload');
        setProgress(0);
        setProcessingStep('analyzing');
      }
    } else {
      beginProcessing('text');
      setUploadedContent(content);
      executeProcess(content);
    }
  };

  const handleStartOver = () => {
    setCurrentState('welcome');
    setUploadedContent('');
    setSelectedLiteracy(user?.literacyLevel || 'basic');
    setProgress(0);
    setProcessingStep('analyzing');
  };

  const handleBack = () => {
    switch (currentState) {
      case 'upload':
        setCurrentState('welcome');
        break;
      case 'results':
        setCurrentState('upload');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header with back button */}
      {currentState !== 'welcome' && currentState !== 'processing' && (
        <div className="sticky top-0 z-10 glass-header">
          <div className="container max-w-4xl mx-auto px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="hover:bg-secondary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      )}

      <div className="container max-w-4xl mx-auto px-4 py-8">
        {currentState === 'welcome' && (
          <div className="text-center space-y-8 animate-slide-up">
            <div className="space-y-6">
              <img 
                src={heroImage}
                alt="Medical content scanner interface"
                className="w-full max-w-md mx-auto rounded-xl shadow-hover"
              />
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-sm">
                  Medical Content Simplifier
                </h1>
                <p className="text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
                  Transform complex medical information into clear, easy-to-understand content
                  tailored to your personalized reading profile.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-white">Secure & Private</h3>
                <p className="text-sm text-slate-300">Your medical information stays private and secure</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-white">Auto-Personalized</h3>
                <p className="text-sm text-slate-300">Dynamically matches your assessed literacy level</p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-white">Fast Processing</h3>
                <p className="text-sm text-slate-300">Get simplified content in seconds</p>
              </div>
            </div>

            {!user ? (
              <div className="space-y-3 animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                <Button 
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-primary shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-12 py-6"
                >
                  Login to Get Started
                </Button>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in zoom-in duration-300 flex flex-col items-center">
                <div className="inline-flex bg-green-500/10 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-2">
                  Personalized profile: {user.literacyLevel.charAt(0).toUpperCase() + user.literacyLevel.slice(1)} literacy
                </div>
                <Button 
                  onClick={() => setCurrentState('upload')}
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-primary shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-12 py-6"
                >
                  Enter Scanner
                </Button>
              </div>
            )}
          </div>
        )}

        {currentState === 'upload' && (
          <UploadCard onUpload={handleUpload} />
        )}

        {currentState === 'processing' && (
          <ProcessingState step={processingStep} progress={progress} />
        )}

        {currentState === 'results' && (
          <ResultsDisplay
            originalContent={uploadedContent}
            simplifiedContent={simplifiedContent}
            literacyLevel={selectedLiteracy}
            sourceType={contentSourceType}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
};
