import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Plus, SkipForward } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DuplicateHandlingSectionProps {
  duplicates: any[];
  onHandlingChange: (handling: 'skip' | 'update' | 'create') => void;
}

export const DuplicateHandlingSection = ({ duplicates, onHandlingChange }: DuplicateHandlingSectionProps) => {
  const [selectedHandling, setSelectedHandling] = useState<'skip' | 'update' | 'create'>('skip');

  const handleSelectionChange = (value: string) => {
    const handling = value as 'skip' | 'update' | 'create';
    setSelectedHandling(handling);
    onHandlingChange(handling);
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardHeader>
        <CardTitle className="text-yellow-600 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Duplicate Records Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
          <div>
            <p className="font-medium text-yellow-800">
              {duplicates.length} duplicate records found
            </p>
            <p className="text-sm text-yellow-700">
              Choose how to handle these duplicate transactions
            </p>
          </div>
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            {duplicates.length} duplicates
          </Badge>
        </div>

        <RadioGroup value={selectedHandling} onValueChange={handleSelectionChange}>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
              <RadioGroupItem value="skip" id="skip" />
              <Label htmlFor="skip" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <SkipForward className="h-4 w-4 mr-2 text-blue-500" />
                  <div>
                    <p className="font-medium">Skip Duplicates</p>
                    <p className="text-sm text-muted-foreground">
                      Ignore duplicate records and process only unique ones
                    </p>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
              <RadioGroupItem value="update" id="update" />
              <Label htmlFor="update" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2 text-orange-500" />
                  <div>
                    <p className="font-medium">Update Existing</p>
                    <p className="text-sm text-muted-foreground">
                      Update existing records with new data from CSV
                    </p>
                  </div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50">
              <RadioGroupItem value="create" id="create" />
              <Label htmlFor="create" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-2 text-green-500" />
                  <div>
                    <p className="font-medium">Create as New</p>
                    <p className="text-sm text-muted-foreground">
                      Create new records with modified order numbers
                    </p>
                  </div>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>

        <div className="pt-3 border-t">
          <p className="text-sm text-muted-foreground">
            <strong>Recommendation:</strong> If this is a data update, choose "Update Existing". 
            If these are truly new transactions, choose "Create as New".
          </p>
        </div>
      </CardContent>
    </Card>
  );
};