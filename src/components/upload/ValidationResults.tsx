import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface ValidationResults {
  totalRecords: number;
  validRecords: any[];
  errors: Array<{
    row: number;
    errors: string[];
    data: any;
  }>;
  duplicates: any[];
  uniqueRecords: any[];
  processedCount: number;
}

interface ValidationResultsProps {
  results: ValidationResults;
}

export const ValidationResultsDisplay = ({ results }: ValidationResultsProps) => {
  return (
    <div className="space-y-4 mt-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{results.totalRecords}</p>
                <p className="text-xs text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">{results.validRecords.length}</p>
                <p className="text-xs text-muted-foreground">Valid Records</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{results.duplicates.length}</p>
                <p className="text-xs text-muted-foreground">Duplicates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{results.errors.length}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Summary */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Validation Complete:</strong> {results.validRecords.length} valid records found out of {results.totalRecords} total. 
          {results.duplicates.length > 0 && ` ${results.duplicates.length} duplicates detected.`}
          {results.errors.length > 0 && ` ${results.errors.length} records have validation errors.`}
        </AlertDescription>
      </Alert>

      {/* Errors Display */}
      {results.errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              Validation Errors ({results.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {results.errors.map((error, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-destructive/5">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="destructive" className="text-xs">
                        Row {error.row}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {error.errors.map((err, i) => (
                        <p key={i} className="text-sm text-destructive">• {err}</p>
                      ))}
                    </div>
                    <div className="mt-2 p-2 bg-muted rounded text-xs">
                      <strong>Data:</strong> {JSON.stringify(error.data, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Duplicates Display */}
      {results.duplicates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Duplicate Records ({results.duplicates.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {results.duplicates.map((duplicate, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-yellow-50">
                    <Badge variant="outline" className="text-xs mb-2">
                      Duplicate {index + 1}
                    </Badge>
                    <p className="text-sm">
                      <strong>Order:</strong> {duplicate.order_number} | 
                      <strong> Product:</strong> {duplicate.product_name}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Success Summary */}
      {results.processedCount > 0 && (
        <Alert className="border-success">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            <strong>Processing Complete:</strong> {results.processedCount} records have been successfully processed and saved to the database.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};