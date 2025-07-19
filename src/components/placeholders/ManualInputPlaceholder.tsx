import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Save, Clock } from 'lucide-react';

export const ManualInputPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manual Input</h1>
          <p className="text-muted-foreground mt-2">
            Add and edit transactions manually
          </p>
        </div>
        <Badge variant="outline">Coming in Phase 2</Badge>
      </div>

      <Card className="border-dashed border-2 border-muted">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Manual Transaction Entry</CardTitle>
          <CardDescription>
            Add individual transactions or bulk edit existing data
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-muted/50 rounded-lg">
              <PlusCircle className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Add Transactions</h4>
              <p className="text-sm text-muted-foreground">Manually add new sales transactions</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Edit className="h-6 w-6 text-warning mb-2" />
              <h4 className="font-medium">Edit Existing</h4>
              <p className="text-sm text-muted-foreground">Modify existing transaction data</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Save className="h-6 w-6 text-success mb-2" />
              <h4 className="font-medium">Quick Save</h4>
              <p className="text-sm text-muted-foreground">Save drafts and batch submissions</p>
            </div>
          </div>
          <Button disabled className="mt-6">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};