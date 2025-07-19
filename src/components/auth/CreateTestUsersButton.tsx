
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus } from 'lucide-react';

export const CreateTestUsersButton = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createTestUsers = async () => {
    setIsCreating(true);
    
    try {
      console.log('Calling create-test-users function...');
      
      const { data, error } = await supabase.functions.invoke('create-test-users');
      
      if (error) {
        console.error('Error calling function:', error);
        toast({
          title: "Error",
          description: `Failed to create test users: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Function response:', data);

      if (data.success) {
        toast({
          title: "Success!",
          description: `${data.message}. Check console for details.`,
        });
        
        // Log detailed results
        console.log('Test users creation results:', data.results);
        console.log('Summary:', data.summary);
        
        // Show success for each user
        data.results.forEach((result: any) => {
          if (result.success) {
            console.log(`✅ ${result.email} - Role: ${result.role}`);
          } else {
            console.error(`❌ ${result.email} - Error: ${result.error}`);
          }
        });
        
      } else {
        toast({
          title: "Partial Success",
          description: data.message,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating test users.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      onClick={createTestUsers}
      disabled={isCreating}
      variant="outline"
      size="sm"
      className="text-xs"
    >
      {isCreating ? (
        <>
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-3 w-3" />
          Create Test Users
        </>
      )}
    </Button>
  );
};
