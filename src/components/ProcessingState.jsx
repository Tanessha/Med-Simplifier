import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Brain, CheckCircle } from "lucide-react";

export const ProcessingState = ({ step, progress }) => {
  const steps = [
    {
      id: 'analyzing',
      title: 'Analyzing Content',
      description: 'Reading and understanding your medical content',
      icon: FileText,
      color: 'text-primary'
    },
    {
      id: 'processing',
      title: 'Simplifying Language',
      description: 'Converting complex medical terms to your selected level',
      icon: Brain,
      color: 'text-accent'
    },
    {
      id: 'complete',
      title: 'Content Ready',
      description: 'Your simplified medical content is ready to view',
      icon: CheckCircle,
      color: 'text-accent'
    }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <Card className="w-full max-w-lg mx-auto shadow-card animate-slide-up">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center animate-scan-pulse">
            {step === 'analyzing' && <FileText className="w-10 h-10 text-primary-foreground" />}
            {step === 'processing' && <Brain className="w-10 h-10 text-primary-foreground" />}
            {step === 'complete' && <CheckCircle className="w-10 h-10 text-primary-foreground" />}
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {steps[currentStepIndex]?.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {steps[currentStepIndex]?.description}
          </p>
        </div>

        <div className="space-y-4">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">{progress}% Complete</p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((stepItem, index) => (
            <div
              key={stepItem.id}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index <= currentStepIndex
                  ? 'bg-primary'
                  : 'bg-border'
              }`}
            />
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            Text is usually fast. Images, prescriptions, and PDFs can take longer because the app first reads the file and then generates the summary.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
