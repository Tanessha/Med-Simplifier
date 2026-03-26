import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Share2, RotateCcw, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ResultsDisplay = ({ 
  originalContent, 
  simplifiedContent, 
  literacyLevel, 
  sourceType,
  onStartOver 
}) => {
  const { toast } = useToast();

  const fileLabel = sourceType === "url" ? "simplified-medical-summary" : "simplified-content";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(simplifiedContent);
      toast({
        title: "Copied to clipboard",
        description: "Simplified content has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy content. Please select and copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([simplifiedContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileLabel}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: "Your simplified content is being downloaded as a text file.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download the file right now.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Simplified Medical Content",
          text: simplifiedContent,
        });

        toast({
          title: "Shared successfully",
          description: "Your simplified content was shared.",
        });
        return;
      }

      await navigator.clipboard.writeText(simplifiedContent);
      toast({
        title: "Share not supported",
        description: "The content was copied to your clipboard instead.",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share the content right now.",
        variant: "destructive",
      });
    }
  };

  const levelLabels = {
    basic: 'Basic Level (5th-6th Grade)',
    intermediate: 'Intermediate Level (7th-9th Grade)',
    advanced: 'Advanced Level (10th-12th Grade)',
    professional: 'Professional Level (College+)'
  };

  const originalTitle = sourceType === "url" ? "Extracted Medical Content" : "Original Content";
  const simplifiedTitle = sourceType === "url" ? "Simplified Summary" : "Simplified Content";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-slide-up">
      {/* Header with actions */}
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Simplified Content Ready
            </CardTitle>
            <Badge variant="outline" className="bg-accent-light text-accent">
              {levelLabels[literacyLevel]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleCopy} variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy Text
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button 
              onClick={onStartOver} 
              variant="outline" 
              size="sm"
              className="ml-auto"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Content comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Content */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">{originalTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {originalContent}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Simplified Content */}
        <Card className="shadow-card border-primary">
          <CardHeader>
            <CardTitle className="text-lg text-primary">{simplifiedTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto p-4 bg-primary-light rounded-lg">
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {simplifiedContent}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accessibility info */}
      <Card className="shadow-card bg-accent-light">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-accent mb-1">Accessibility Features Applied</h4>
              <ul className="text-sm text-accent/80 space-y-1">
                <li>• Simplified sentence structure and shorter paragraphs</li>
                <li>• Common words used instead of complex medical terms</li>
                <li>• Clear explanations provided for necessary medical terms</li>
                <li>• Easy-to-understand formatting and organization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
