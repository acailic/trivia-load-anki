import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileSelectorProps {
  onFileSelected: (episodes: string[], fileName: string) => void;
}

const availableFiles = [
  { name: 'AnansiSlagalicaQuestions.csv', displayName: 'Slagalica Questions (Standard)' },
  { name: 'AnansiSlagalicaQuestions-1080p.csv', displayName: 'Slagalica Questions (1080p)' }
];

export const FileSelector = ({ onFileSelected }: FileSelectorProps) => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
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
          current += '"';
          i += 2;
        } else {
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
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

  const parseCSV = (text: string): string[] => {
    const lines = text.split('\n');
    const episodes = new Set<string>();
    
    for (const line of lines) {
      if (line.trim()) {
        const columns = parseCSVLine(line);
        const episode = columns[0]?.trim();
        
        if (episode && episode.includes('.') && episode.includes('mp4')) {
          episodes.add(episode);
        }
      }
    }
    
    return Array.from(episodes);
  };

  const handleFileLoad = async (fileName: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/${fileName}`);
      if (!response.ok) {
        throw new Error('File not found');
      }
      
      const text = await response.text();
      const episodes = parseCSV(text);
      
      if (episodes.length === 0) {
        toast({
          title: "No episodes found",
          description: "The file doesn't contain any valid episode data.",
          variant: "destructive"
        });
        return;
      }

      // Store the full file content for later use
      sessionStorage.setItem('triviaFileContent', text);
      
      toast({
        title: "File loaded successfully",
        description: `Found ${episodes.length} episodes.`,
      });
      
      onFileSelected(episodes, fileName);
    } catch (error) {
      toast({
        title: "Error loading file",
        description: "Could not load the selected file.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Select Trivia Collection</h2>
        <p className="text-muted-foreground">
          Choose from available Slagalica question collections
        </p>
      </div>

      <div className="grid gap-4">
        {availableFiles.map((file) => (
          <Card 
            key={file.name}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedFile === file.name ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedFile(file.name)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                {file.displayName}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                File: {file.name}
              </p>
              
              {selectedFile === file.name && (
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileLoad(file.name);
                  }}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Loading...' : 'Load Collection'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};