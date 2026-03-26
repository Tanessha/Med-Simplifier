import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Camera, Link, Upload, File } from "lucide-react";

export const UploadCard = ({ onUpload }) => {
  const [activeTab, setActiveTab] = useState('url');
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();
  const photoInputRef = useRef();

  const handleUpload = () => {
    if (activeTab === 'url' && urlInput.trim()) {
      onUpload('url', urlInput);
    } else if (activeTab === 'text' && textInput.trim()) {
      onUpload('text', textInput);
    } else if ((activeTab === 'file' || activeTab === 'photo') && selectedFile) {
      onUpload('file', selectedFile);
    }
  };

  const uploadMethods = [
    { id: 'url', label: 'Website Link', icon: Link, desc: 'Paste a medical website URL' },
    { id: 'photo', label: 'Take Photo', icon: Camera, desc: 'Scan medical documents' },
    { id: 'file', label: 'Upload File', icon: FileText, desc: 'PDF or Word documents' },
    { id: 'text', label: 'Paste Text', icon: File, desc: 'Copy and paste content' },
  ];

  return (
    <Card className="glass-panel w-full max-w-lg mx-auto animate-slide-up overflow-hidden border-0! relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
      <CardContent className="p-6 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-primary/20 to-blue-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-primary/30">
            <Upload className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upload Medical Content</h2>
          <p className="text-gray-400 text-sm">Choose how you'd like to add your medical content for simplification</p>
        </div>

        {/* Upload Method Tabs */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {uploadMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setActiveTab(method.id)}
              className={`p-4 rounded-2xl border transition-all duration-300 text-left backdrop-blur-md ${
                activeTab === method.id
                  ? 'border-primary/50 bg-primary/20 text-blue-100 shadow-[inset_0_0_20px_rgba(59,130,246,0.2)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-gray-400'
              }`}
            >
              <method.icon className={`w-6 h-6 mb-3 ${activeTab === method.id ? 'text-blue-400' : 'text-gray-500'}`} />
              <div className="text-sm font-semibold mb-1 text-white">{method.label}</div>
              <div className={`text-xs ${activeTab === method.id ? 'text-blue-200/80' : 'text-gray-500'}`}>
                {method.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Upload Content */}
        <div className="space-y-6">
          {activeTab === 'url' && (
            <div className="space-y-3">
              <Label htmlFor="url-input" className="text-gray-300 ml-1">Medical Website URL</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com/medical-info"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="h-14 bg-black/40 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus-visible:ring-primary backdrop-blur-md"
              />
            </div>
          )}

          {activeTab === 'photo' && (
            <div className="border border-dashed border-white/20 bg-black/20 rounded-2xl p-10 text-center hover:border-primary/50 transition-colors duration-300 group">
              <Camera className="w-14 h-14 text-gray-500 mx-auto mb-4 group-hover:text-primary transition-colors duration-300" />
              <p className="text-gray-400 mb-6">Take a photo of your medical document</p>
              <input
                ref={photoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                capture="environment"
                style={{ display: 'none' }}
                onChange={e => setSelectedFile(e.target.files[0])}
              />
              <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 rounded-xl" onClick={() => photoInputRef.current.click()}>
                <Camera className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.name : 'Open Camera'}
              </Button>
            </div>
          )}

          {activeTab === 'file' && (
            <div className="border border-dashed border-white/20 bg-black/20 rounded-2xl p-10 text-center hover:border-primary/50 transition-colors duration-300 group">
              <FileText className="w-14 h-14 text-gray-500 mx-auto mb-4 group-hover:text-primary transition-colors duration-300" />
              <p className="text-gray-400 mb-6">Upload PDF, Word documents, or photo</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={e => setSelectedFile(e.target.files[0])}
              />
              <Button variant="outline" className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 h-12 rounded-xl" onClick={() => fileInputRef.current.click()}>
                <Upload className="w-4 h-4 mr-2" />
                {selectedFile ? selectedFile.name : 'Choose File'}
              </Button>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-3">
              <Label htmlFor="text-input" className="text-gray-300 ml-1">Medical Text Content</Label>
              <Textarea
                id="text-input"
                placeholder="Paste your medical content here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[140px] resize-none bg-black/40 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus-visible:ring-primary backdrop-blur-md p-4"
              />
            </div>
          )}

          <Button 
            onClick={handleUpload}
            className="w-full h-14 bg-gradient-primary hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 text-lg rounded-xl mt-4"
            disabled={
              (activeTab === 'url' && !urlInput.trim()) ||
              (activeTab === 'text' && !textInput.trim()) ||
              ((activeTab === 'photo' || activeTab === 'file') && !selectedFile)
            }
          >
            Process Content
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};






