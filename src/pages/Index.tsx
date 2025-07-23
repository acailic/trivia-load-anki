import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { EpisodeSelector } from '@/components/EpisodeSelector';
import { QuizCard } from '@/components/QuizCard';
import { useToast } from '@/hooks/use-toast';

interface Question {
  number: string;
  question: string;
  answer: string;
}

type AppState = 'upload' | 'select' | 'quiz';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [episodes, setEpisodes] = useState<string[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const { toast } = useToast();

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Handle escaped quotes ("")
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Split only on commas outside quotes
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const parseEpisodeQuestions = (episode: string): Question[] => {
    const fileContent = sessionStorage.getItem('triviaFileContent');
    if (!fileContent) return [];

    const lines = fileContent.split('\n');
    const episodeQuestions: Question[] = [];
    let isInEpisode = false;

    for (const line of lines) {
      if (line.trim()) {
        const columns = parseCSVLine(line);
        
        // Check if this is the episode header
        if (columns[0]?.trim() === episode) {
          isInEpisode = true;
          continue;
        }
        
        // Check if we've reached a new episode
        if (columns[0]?.trim() && columns[0] !== episode && isInEpisode) {
          break;
        }
        
        // Parse question if we're in the right episode
        if (isInEpisode && columns[1]?.trim()) {
          const question: Question = {
            number: columns[1].trim(),
            question: columns[2]?.trim().replace(/^"|"$/g, '') || '', // Remove surrounding quotes
            answer: columns[3]?.trim().replace(/^"|"$/g, '') || ''     // Remove surrounding quotes
          };
          
          if (question.question && question.answer) {
            episodeQuestions.push(question);
          }
        }
      }
    }

    return episodeQuestions;
  };

  const handleFileLoaded = (episodeList: string[]) => {
    setEpisodes(episodeList);
    setAppState('select');
  };

  const handleEpisodeSelected = (episode: string) => {
    const episodeQuestions = parseEpisodeQuestions(episode);
    
    if (episodeQuestions.length === 0) {
      toast({
        title: "No questions found",
        description: "This episode doesn't contain any valid questions.",
        variant: "destructive"
      });
      return;
    }

    setSelectedEpisode(episode);
    setQuestions(episodeQuestions);
    setAppState('quiz');

    toast({
      title: "Episode loaded",
      description: `${episodeQuestions.length} questions ready!`,
    });
  };

  const handleBackToSelect = () => {
    setAppState('select');
    setSelectedEpisode('');
    setQuestions([]);
  };

  const handleNewEpisode = () => {
    setAppState('select');
    setSelectedEpisode('');
    setQuestions([]);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        {appState === 'upload' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Slagalica Trivia
              </h1>
              <p className="text-xl text-muted-foreground max-w-md">
                Load your trivia CSV file and start learning with flashcards
              </p>
            </div>
            <FileUpload onFileLoaded={handleFileLoaded} />
          </div>
        )}

        {appState === 'select' && (
          <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
            <EpisodeSelector 
              episodes={episodes} 
              onEpisodeSelected={handleEpisodeSelected} 
            />
          </div>
        )}

        {appState === 'quiz' && (
          <div className="py-8">
            <QuizCard
              questions={questions}
              episodeName={selectedEpisode}
              onBack={handleBackToSelect}
              onNewEpisode={handleNewEpisode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
