import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileLoaded: (episodes: string[]) => void;
}

export const FileUpload = ({ onFileLoaded }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const parseCSV = (text: string): string[] => {
    const lines = text.split('\n');
    const episodes = new Set<string>();
    
    for (const line of lines) {
      if (line.trim()) {
        const columns = line.split(',');
        const episode = columns[0]?.trim();
        
        // Only add episodes that contain actual episode dates (not empty or just commas)
        if (episode && episode.includes('.') && episode.includes('mp4')) {
          episodes.add(episode);
        }
      }
    }
    
    return Array.from(episodes);
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const text = await file.text();
      const episodes = parseCSV(text);
      
      if (episodes.length === 0) {
        toast({
          title: "No episodes found",
          description: "The file doesn't contain any valid episode data.",
          variant: "destructive"
        });
        return;
      }

      // Store the full file content in sessionStorage for later use
      sessionStorage.setItem('triviaFileContent', text);
      
      toast({
        title: "File loaded successfully",
        description: `Found ${episodes.length} episodes.`,
      });
      
      onFileLoaded(episodes);
    } catch (error) {
      toast({
        title: "Error reading file",
        description: "There was an error processing the file.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            hover:border-primary hover:bg-primary/5 cursor-pointer
          `}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              {isLoading ? (
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <Upload className="w-6 h-6 text-primary" />
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Upload Trivia File</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Drop your CSV file here or click to browse
              </p>
              
              <Button disabled={isLoading} className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                {isLoading ? 'Loading...' : 'Select CSV File'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};