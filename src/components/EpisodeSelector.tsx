import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shuffle, Play, ArrowLeft } from 'lucide-react';

interface EpisodeSelectorProps {
  episodes: string[];
  onEpisodeSelected: (episode: string) => void;
  onBack?: () => void;
}

export const EpisodeSelector = ({ episodes, onEpisodeSelected, onBack }: EpisodeSelectorProps) => {
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);

  const selectRandomEpisode = () => {
    const randomIndex = Math.floor(Math.random() * episodes.length);
    const episode = episodes[randomIndex];
    setSelectedEpisode(episode);
  };

  const startQuiz = () => {
    if (selectedEpisode) {
      onEpisodeSelected(selectedEpisode);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center relative">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="absolute left-0 top-0 p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Slagalica Trivia
        </CardTitle>
        <p className="text-muted-foreground">
          {episodes.length} episodes available
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <Button
            onClick={selectRandomEpisode}
            variant="outline"
            size="lg"
            className="w-full"
          >
            <Shuffle className="w-5 h-5 mr-2" />
            Pick Random Episode
          </Button>
        </div>

        {selectedEpisode && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <h3 className="font-semibold text-lg mb-1">Selected Episode</h3>
              <p className="text-primary font-mono text-sm">
                {selectedEpisode.replace('.mp4', '')}
              </p>
            </div>

            <Button
              onClick={startQuiz}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Quiz
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};