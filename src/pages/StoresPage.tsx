
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const storeSchema = z.object({
  store_name: z.string().min(1, 'Store name is required'),
  store_id_external: z.string().min(1, 'External ID is required'),
  platform_id: z.string().min(1, 'Platform is required'),
  pic_name: z.string().optional(),
});

type StoreForm = z.infer<typeof storeSchema>;

interface StoreWithPlatform {
  id: string;
  store_name: string;
  store_id_external: string;
  pic_name: string | null;
  is_active: boolean;
  created_at: string;
  platforms: {
    platform_name: string;
  } | null;
}

export const StoresPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreWithPlatform | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StoreForm>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      store_name: '',
      store_id_external: '',
      platform_id: '',
      pic_name: '',
    },
  });

  // Fetch stores
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          platforms(platform_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StoreWithPlatform[];
    },
  });

  // Fetch platforms for dropdown
  const { data: platforms = [] } = useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('is_active', true)
        .order('platform_name');

      if (error) throw error;
      return data;
    },
  });

  // Create/Update store mutation
  const storeMutation = useMutation({
    mutationFn: async (data: StoreForm) => {
      if (editingStore) {
        const { error } = await supabase
          .from('stores')
          .update({
            store_name: data.store_name,
            store_id_external: data.store_id_external,
            platform_id: data.platform_id,
            pic_name: data.pic_name || null,
          })
          .eq('id', editingStore.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('stores')
          .insert({
            store_name: data.store_name,
            store_id_external: data.store_id_external,
            platform_id: data.platform_id,
            pic_name: data.pic_name || null,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setDialogOpen(false);
      setEditingStore(null);
      form.reset();
      toast({
        title: "Success",
        description: `Store ${editingStore ? 'updated' : 'created'} successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete store mutation
  const deleteMutation = useMutation({
    mutationFn: async (storeId: string) => {
      const { error } = await supabase
        .from('stores')
        .update({ is_active: false })
        .eq('id', storeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast({
        title: "Success",
        description: "Store deactivated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredStores = stores.filter(store =>
    store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.store_id_external.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (store: StoreWithPlatform) => {
    setEditingStore(store);
    form.reset({
      store_name: store.store_name,
      store_id_external: store.store_id_external,
      platform_id: store.platforms ? 
        platforms.find(p => p.platform_name === store.platforms?.platform_name)?.id || '' : '',
      pic_name: store.pic_name || '',
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingStore(null);
    form.reset();
    setDialogOpen(true);
  };

  const onSubmit = (data: StoreForm) => {
    storeMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your marketplace stores and platforms
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingStore ? 'Edit Store' : 'Add New Store'}
              </DialogTitle>
              <DialogDescription>
                {editingStore ? 'Update store information' : 'Create a new store entry'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="store_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter store name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="store_id_external"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>External Store ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter external store ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="platform_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform.id} value={platform.id}>
                              {platform.platform_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pic_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIC Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter PIC name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={storeMutation.isPending}
                  >
                    {storeMutation.isPending ? 'Saving...' : (editingStore ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Stores ({filteredStores.length})
              </CardTitle>
              <CardDescription>
                Manage all your marketplace stores
              </CardDescription>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading stores...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>External ID</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>PIC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.store_name}</TableCell>
                    <TableCell>{store.store_id_external}</TableCell>
                    <TableCell>{store.platforms?.platform_name || 'N/A'}</TableCell>
                    <TableCell>{store.pic_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={store.is_active ? 'default' : 'secondary'}>
                        {store.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(store.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(store)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(store.id)}
                          disabled={!store.is_active}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
