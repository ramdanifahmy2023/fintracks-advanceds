import { useState, useRef, useCallback } from 'react';
import { CloudUpload, FileText, Loader2, Database, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface CSVUploadZoneProps {
  onUpload: (file: File) => void;
  uploadState: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
}

export const CSVUploadZone = ({ onUpload, uploadState, progress }: CSVUploadZoneProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.endsWith('.csv'));
    
    if (csvFile) {
      handleFileSelection(csvFile);
    } else {
      toast.error('Please select a CSV file');
    }
  }, []);

  const handleFileSelection = (file: File) => {
    // Validate file
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : uploadState === 'uploading' || uploadState === 'processing'
            ? 'border-orange-300 bg-orange-50'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploadState === 'idle' && !selectedFile && (
          <>
            <CloudUpload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Drag & drop file CSV atau klik untuk pilih
            </h3>
            <p className="text-muted-foreground mb-4">
              Maksimal 10MB, format .csv dengan encoding UTF-8
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Pilih File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </>
        )}
        
        {uploadState === 'uploading' && (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
            <div>
              <p className="font-medium">Uploading {selectedFile?.name}</p>
              <Progress value={progress} className="w-full mt-2" />
              <p className="text-sm text-muted-foreground mt-1">{progress}% complete</p>
            </div>
          </div>
        )}
        
        {uploadState === 'processing' && (
          <div className="space-y-4">
            <Database className="h-8 w-8 mx-auto animate-pulse text-success" />
            <div>
              <p className="font-medium">Processing data...</p>
              <p className="text-sm text-muted-foreground">Validating and checking for duplicates</p>
              <Progress value={progress} className="w-full mt-2" />
            </div>
          </div>
        )}

        {uploadState === 'completed' && (
          <div className="space-y-4">
            <div className="h-8 w-8 mx-auto bg-success rounded-full flex items-center justify-center">
              <Database className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-success">Upload completed!</p>
              <p className="text-sm text-muted-foreground">Data has been processed successfully</p>
            </div>
          </div>
        )}

        {uploadState === 'error' && (
          <div className="space-y-4">
            <div className="h-8 w-8 mx-auto bg-destructive rounded-full flex items-center justify-center">
              <X className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-destructive">Upload failed</p>
              <p className="text-sm text-muted-foreground">Please check your file and try again</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected File Info */}
      {selectedFile && uploadState === 'idle' && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={removeFile}>
              Remove
            </Button>
            <Button size="sm" onClick={() => onUpload(selectedFile)}>
              Upload
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};