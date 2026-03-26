import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { saveLiteracyLevel } from "@/lib/firestoreData";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, ChevronRight, Check } from "lucide-react";

const quizQuestions = [
  {
    question: "\"Take one tablet PO BID\" means:",
    options: ["Take one tablet by mouth twice a day", "Take one tablet by mouth once a day", "Take one tablet as needed", "Take two tablets once a day"],
    correct: 0
  },
  {
    question: "\"Hypertension\" refers to:",
    options: ["High blood sugar", "High blood pressure", "High cholesterol", "Underactive thyroid"],
    correct: 1
  },
  {
    question: "If a prescription says \"Take with meals\", you should:",
    options: ["Take it on an empty stomach", "Take it immediately after waking up", "Take it while eating food", "Wait until 2 hours after food"],
    correct: 2
  },
  {
    question: "A \"myocardial infarction\" is commonly known as a:",
    options: ["Stroke", "Heart attack", "Blood clot", "Seizure"],
    correct: 1
  },
  {
    question: "\"NPO\" before surgery means:",
    options: ["Nothing by mouth", "Need proper oxygen", "Normal pulse expected", "Next possible operation"],
    correct: 0
  },
  {
    question: "\"Hypoglycemia\" means:",
    options: ["Low blood sugar", "High blood pressure", "Low iron levels", "High heart rate"],
    correct: 0
  },
  {
    question: "If a medication causes \"drowsiness,\" you should avoid:",
    options: ["Drinking water", "Eating grapefruit", "Operating heavy machinery", "Sleeping"],
    correct: 2
  },
  {
    question: "\"Edema\" is a medical term for:",
    options: ["Swelling", "Redness", "Bruising", "Bleeding"],
    correct: 0
  },
  {
    question: "\"PRN\" on a prescription means:",
    options: ["Every morning", "Before bed", "As needed", "With food"],
    correct: 2
  },
  {
    question: "A \"benign\" tumor is:",
    options: ["Cancerous and spreading", "Not cancerous", "Contagious", "Life-threatening"],
    correct: 1
  }
];

const LiteracyQuiz = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [showTest, setShowTest] = useState(!user?.literacyLevel);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return answer === quizQuestions[index].correct ? score + 1 : score;
    }, 0);
  };

  const getLiteracyLevel = (score) => {
    if (score <= 3) return "basic";
    if (score <= 7) return "intermediate";
    return "advanced";
  };

  const gradeEquivalents = {
    basic: "Grade 6 or below",
    intermediate: "Grade 8-10",
    advanced: "Grade 12+"
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedAnswer;
    setAnswers(newAnswers);
    
    if (currentQuestion < 9) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(newAnswers[currentQuestion + 1]);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setAnalyzing(true);
    
    // Simulate slight delay for effect
    await new Promise(r => setTimeout(r, 1200));
    
    const finalScore = finalAnswers.reduce((score, answer, index) => {
      return answer === quizQuestions[index].correct ? score + 1 : score;
    }, 0);
    
    const level = getLiteracyLevel(finalScore);
    
    setResult({ score: finalScore, level: level, grade: gradeEquivalents[level] });
    
    if (user) {
      try {
        await saveLiteracyLevel(user.id, level);
        await updateUserProfile({ literacyLevel: level });
        toast.success("Profile reading level updated based on your quiz score!");
      } catch (err) {
        toast.error("Failed to update profile level");
      }
    }
    
    setAnalyzing(false);
  };

  const handleStartScanning = () => {
    navigate("/dashboard");
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers(Array(10).fill(null));
    setSelectedAnswer(null);
    setResult(null);
    setShowTest(true);
  };

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-slate-950 font-outfit">
      {/* Dynamic Animated Background Mesh */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-black pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] -z-10 animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[128px] -z-10 animate-pulse-slow pointer-events-none object-right-bottom"></div>
      
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full z-10">
          <Card className="glass-panel border-0! shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            
            <CardHeader className="relative z-10 pb-4 border-b border-white/10">
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-primary">Medical Literacy Assessor</CardTitle>
              <CardDescription className="text-base text-gray-300 mt-2 leading-relaxed">
                We personalize your medical documents based on how you score on this short quiz.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6 relative z-10">
              
              {/* State 1: Current Profile Overview */}
              {!showTest ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-600/20 border border-green-500/30 text-green-400 mb-2 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Your Profile is Active</h3>
                  
                  <div className="p-6 rounded-xl bg-white/5 border border-white/10 max-w-sm mx-auto backdrop-blur-md shadow-inner">
                    <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">Active Reading Level</p>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-500 capitalize">
                      {user?.literacyLevel}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                    <Button onClick={handleStartScanning} size="lg" className="px-8 bg-gradient-primary hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 hover:-translate-y-1 text-white border-0">
                      Go to Scanner
                    </Button>
                    <Button onClick={resetQuiz} variant="outline" size="lg" className="px-8 border-white/20 bg-transparent text-white hover:bg-white/10 backdrop-blur-md transition-all duration-300">
                      Retake Quiz
                    </Button>
                  </div>
                </div>

              ) : analyzing ? (
                
                <div className="py-20 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
                   <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400"></div>
                   <h3 className="text-xl text-white font-medium animate-pulse">Computing your literacy score...</h3>
                </div>

              ) : !result ? (
                
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="flex justify-between items-center text-sm text-blue-300 font-semibold uppercase tracking-wider mb-2">
                    <span>Question {currentQuestion + 1} of 10</span>
                    <span>{Math.round(((currentQuestion) / 10) * 100)}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-primary transition-all duration-500 ease-out"
                      style={{ width: `${((currentQuestion) / 10) * 100}%` }}
                    ></div>
                  </div>

                  <h3 className="text-2xl font-medium text-white mb-6 leading-relaxed">
                    {quizQuestions[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {quizQuestions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAnswer(index)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                          selectedAnswer === index
                            ? 'bg-primary/20 border-primary shadow-[inset_0_0_20px_rgba(59,130,246,0.3)] text-white'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="text-lg">{option}</span>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${selectedAnswer === index ? 'border-primary bg-primary' : 'border-gray-500 group-hover:border-white'}`}>
                          {selectedAnswer === index && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between mt-8 pt-4 border-t border-white/10">
                    <Button 
                      onClick={() => {
                        setShowTest(false);
                      }} 
                      variant="ghost" 
                      className={`text-gray-400 hover:text-white hover:bg-white/10 ${!user?.literacyLevel && 'opacity-0 pointer-events-none'}`}
                    >
                      Cancel
                    </Button>
                    
                    <Button 
                      onClick={handleNext} 
                      disabled={selectedAnswer === null}
                      size="lg"
                      className="bg-gradient-primary hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-300 px-8 text-white border-0"
                    >
                      {currentQuestion === 9 ? "Complete Quiz" : "Next Question"}
                      {currentQuestion !== 9 && <ChevronRight className="w-5 h-5 ml-2" />}
                    </Button>
                  </div>
                </div>

              ) : (

                <div className="space-y-8 animate-in fade-in zoom-in duration-500 text-center py-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow"></div>
                    <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-blue-600/30 border border-primary/40 text-blue-400 mb-2 shadow-[0_0_40px_rgba(59,130,246,0.3)] backdrop-blur-md">
                      <div className="flex flex-col items-center">
                        <span className="text-4xl font-black text-white">{result.score}/10</span>
                        <span className="text-xs uppercase tracking-widest text-blue-300 mt-1">Score</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Assessment Complete!</h3>
                    <p className="text-gray-400">Your results have been securely saved to your profile.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Assigned Mode</p>
                      <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary capitalize">
                        {result.level}
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Target Readability</p>
                      <p className="text-xl font-bold text-white">
                        {result.grade}
                      </p>
                    </div>
                  </div>

                  <Button onClick={handleStartScanning} size="lg" className="w-full sm:w-auto mt-6 px-10 h-14 text-lg bg-gradient-accent hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all duration-300 hover:-translate-y-1 text-white border-0">
                    Enter Scanner Now
                    <ChevronRight className="w-6 h-6 ml-2" />
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiteracyQuiz;
