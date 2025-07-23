import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Eye, RotateCcw, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface Question {
  number: string;
  question: string;
  answer: string;
}

interface QuizCardProps {
  questions: Question[];
  episodeName: string;
  onBack: () => void;
  onNewEpisode: () => void;
}

export const QuizCard = ({ questions, episodeName, onBack, onNewEpisode }: QuizCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userRating, setUserRating] = useState<'correct' | 'incorrect' | null>(null);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  useEffect(() => {
    setShowAnswer(false);
    setUserRating(null);
  }, [currentIndex]);

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleRating = (rating: 'correct' | 'incorrect') => {
    setUserRating(rating);
    setStats(prev => ({
      ...prev,
      [rating]: prev[rating] + 1
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserRating(null);
    setStats({ correct: 0, incorrect: 0 });
  };

  const isCompleted = currentIndex === questions.length - 1 && userRating !== null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="text-center">
          <h2 className="font-semibold text-lg">
            {episodeName.replace('.mp4', '')}
          </h2>
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        <Button
          variant="ghost"
          onClick={resetQuiz}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Progress */}
      <Progress value={progress} className="w-full" />

      {/* Stats */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-1 text-success">
          <CheckCircle className="w-4 h-4" />
          <span>{stats.correct} correct</span>
        </div>
        <div className="flex items-center space-x-1 text-destructive">
          <XCircle className="w-4 h-4" />
          <span>{stats.incorrect} incorrect</span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="text-center">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Question #{currentQuestion.number}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Question */}
          <div className="bg-gradient-to-r from-primary to-primary-glow p-6 rounded-lg text-white text-center">
            <p className="text-lg font-medium leading-relaxed">
              {currentQuestion.question}
            </p>
          </div>

          {/* Answer Section */}
          {!showAnswer ? (
            <div className="text-center py-8">
              <Button
                onClick={handleShowAnswer}
                size="lg"
                variant="outline"
                className="px-8"
              >
                <Eye className="w-5 h-5 mr-2" />
                Show Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Answer */}
              <div className="bg-gradient-to-r from-success to-green-600 p-6 rounded-lg text-white text-center">
                <p className="text-lg font-medium leading-relaxed">
                  {currentQuestion.answer}
                </p>
              </div>

              {/* Rating Buttons */}
              {userRating === null && (
                <div className="flex space-x-4 justify-center">
                  <Button
                    onClick={() => handleRating('incorrect')}
                    variant="outline"
                    className="flex-1 max-w-32 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Incorrect
                  </Button>
                  <Button
                    onClick={() => handleRating('correct')}
                    variant="outline"
                    className="flex-1 max-w-32 border-success text-success hover:bg-success hover:text-success-foreground"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Correct
                  </Button>
                </div>
              )}

              {/* User Rating Display */}
              {userRating && (
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                    userRating === 'correct' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {userRating === 'correct' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span className="font-medium capitalize">{userRating}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!userRating}
                className="bg-gradient-to-r from-primary to-primary-glow"
              >
                Next Question
              </Button>
            ) : (
              isCompleted && (
                <Button
                  onClick={onNewEpisode}
                  className="bg-gradient-to-r from-primary to-primary-glow"
                >
                  New Episode
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};