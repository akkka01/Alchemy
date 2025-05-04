import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

type AssessmentData = {
  userId: number;
  experienceLevel: string;
  languages: string[];
  learningGoal: string;
  goalDetails: string;
  learningStyle: string;
  timeCommitment: string;
};

export default function AssessmentPage() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: existingAssessment, isLoading: assessmentLoading } = useQuery({
    queryKey: ['/api/assessment'],
  });
  
  const [assessment, setAssessment] = useState<AssessmentData>({
    userId: user?.id || 0,
    experienceLevel: '',
    languages: [],
    learningGoal: '',
    goalDetails: '',
    learningStyle: '',
    timeCommitment: ''
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const submitAssessmentMutation = useMutation({
    mutationFn: async (data: AssessmentData) => {
      try {
        // Client-side validations
        if (!data.experienceLevel) {
          throw new Error("Please select your experience level");
        }
        if (data.languages.length === 0) {
          throw new Error("Please select at least one programming language");
        }
        if (!data.learningGoal) {
          throw new Error("Please select your learning goal");
        }
        if (!data.learningStyle) {
          throw new Error("Please select your preferred learning style");
        }
        if (!data.timeCommitment) {
          throw new Error("Please select your time commitment");
        }

        const res = await apiRequest("POST", "/api/assessment", data);
        const responseData = await res.json();
        
        if (!res.ok) {
          throw new Error(responseData.error || "Failed to submit assessment");
        }
        
        return responseData;
      } catch (err) {
        if (err instanceof Error) {
          throw err;
        }
        throw new Error("An unexpected error occurred");
      }
    },
    onSuccess: () => {
      toast({
        title: "Assessment completed",
        description: "Your personalized guidance is ready!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assessment'] });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting assessment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Redirect if assessment already complete
  if (existingAssessment && !assessmentLoading) {
    return <Redirect to="/" />;
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitAssessmentMutation.mutate(assessment);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleLanguageToggle = (language: string) => {
    setAssessment(prev => {
      const languages = prev.languages.includes(language)
        ? prev.languages.filter(lang => lang !== language)
        : [...prev.languages, language];

      return { ...prev, languages };
    });
  };

  const experienceOptions = [
    'Beginner (little to no coding experience)',
    'Novice (some basic coding knowledge)',
    'Intermediate (comfortable with basics, learning more complex concepts)',
    'Advanced (proficient in multiple languages/frameworks)',
    'Expert (professional developer)'
  ];

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C#', 'PHP',
    'Ruby', 'Go', 'C/C++', 'TypeScript', 'Swift'
  ];

  const learningGoals = [
    'Build web applications',
    'Develop mobile apps',
    'Master data science/machine learning',
    'Learn game development',
    'Improve coding skills for current job',
    'Career change to software development'
  ];

  const learningStyles = [
    'Video tutorials (visual learning)',
    'Reading documentation and articles',
    'Building projects (hands-on approach)',
    'Interactive coding exercises',
    'Pair programming/mentorship'
  ];

  const timeCommitments = [
    'Less than 5 hours per week',
    '5-10 hours per week',
    '10-15 hours per week',
    '15-20 hours per week',
    'More than 20 hours per week'
  ];

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <i className="ri-code-box-line text-2xl text-primary-500 mr-2"></i>
              <h1 className="text-xl font-semibold text-gray-900">CodeMentor AI</h1>
            </div>
            <button 
              onClick={handleLogout} 
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <i className="ri-logout-box-line mr-1"></i> Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Coding Assessment</h2>
              <p className="mt-1 text-sm text-gray-600">
                Help us understand your coding skills and goals so we can provide personalized guidance.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-100 px-6 py-4">
              <div className="flex items-center">
                <div className="flex-grow">
                  <Progress value={(currentStep / totalSteps) * 100} className="h-2.5" />
                </div>
                <span className="ml-4 text-sm text-gray-600">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>
            </div>

            {/* Assessment Form */}
            <div className="p-6">
              {/* Step 1: Experience Level */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      What is your current coding experience level?
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select the option that best describes your programming journey.
                    </p>
                  </div>
                  <RadioGroup 
                    value={assessment.experienceLevel} 
                    onValueChange={(value) => setAssessment({...assessment, experienceLevel: value})}
                  >
                    {experienceOptions.map((option, index) => (
                      <div className="flex items-center space-x-2" key={index}>
                        <RadioGroupItem value={option} id={`exp-${index}`} />
                        <Label htmlFor={`exp-${index}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Step 2: Programming Languages */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Which programming languages are you familiar with?
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Select all that apply.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {programmingLanguages.map((lang, index) => (
                      <div className="flex items-center space-x-2" key={index}>
                        <Checkbox 
                          id={`lang-${index}`} 
                          checked={assessment.languages.includes(lang)}
                          onCheckedChange={() => handleLanguageToggle(lang)}
                        />
                        <Label htmlFor={`lang-${index}`}>{lang}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Learning Goals */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      What are your primary learning goals?
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This helps us tailor our recommendations to your objectives.
                    </p>
                  </div>
                  <RadioGroup 
                    value={assessment.learningGoal} 
                    onValueChange={(value) => setAssessment({...assessment, learningGoal: value})}
                  >
                    {learningGoals.map((goal, index) => (
                      <div className="flex items-center space-x-2" key={index}>
                        <RadioGroupItem value={goal} id={`goal-${index}`} />
                        <Label htmlFor={`goal-${index}`}>{goal}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div>
                    <Label htmlFor="goalDetails" className="block text-sm font-medium text-gray-700 mb-1">
                      Additional details about your goals (optional)
                    </Label>
                    <Textarea 
                      id="goalDetails" 
                      value={assessment.goalDetails}
                      onChange={(e) => setAssessment({...assessment, goalDetails: e.target.value})}
                      rows={3} 
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Learning Style */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      How do you prefer to learn?
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      We'll adjust our teaching approach based on your preferences.
                    </p>
                  </div>
                  <RadioGroup 
                    value={assessment.learningStyle} 
                    onValueChange={(value) => setAssessment({...assessment, learningStyle: value})}
                  >
                    {learningStyles.map((style, index) => (
                      <div className="flex items-center space-x-2" key={index}>
                        <RadioGroupItem value={style} id={`style-${index}`} />
                        <Label htmlFor={`style-${index}`}>{style}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Step 5: Time Commitment */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      How much time can you dedicate to learning?
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This helps us create a realistic learning plan for you.
                    </p>
                  </div>
                  <RadioGroup 
                    value={assessment.timeCommitment} 
                    onValueChange={(value) => setAssessment({...assessment, timeCommitment: value})}
                  >
                    {timeCommitments.map((time, index) => (
                      <div className="flex items-center space-x-2" key={index}>
                        <RadioGroupItem value={time} id={`time-${index}`} />
                        <Label htmlFor={`time-${index}`}>{time}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>

            {/* Form Navigation */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={prevStep}
                >
                  Previous
                </Button>
              ) : (
                <div></div>
              )}
              <Button 
                onClick={nextStep}
                disabled={submitAssessmentMutation.isPending}
              >
                {submitAssessmentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : currentStep === totalSteps ? (
                  "Submit"
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
