
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Package, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface Product {
  id: string;
  sku_reference: string;
  product_name: string;
  category: string;
  base_cost: number;
  is_active: boolean;
  created_at: string;
}

interface ProductListProps {
  searchTerm: string;
}

export const ProductList: React.FC<ProductListProps> = ({ searchTerm }) => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: async () => {
      console.log('ProductList: Starting query with searchTerm:', searchTerm);
      
      try {
        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (searchTerm) {
          query = query.or(`product_name.ilike.%${searchTerm}%,sku_reference.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('ProductList: Query error:', error);
          throw error;
        }
        
        console.log('ProductList: Query result:', data);
        return data as Product[];
      } catch (error) {
        console.error('ProductList: Query failed:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  console.log('ProductList: Render state:', { isLoading, error, productsCount: products?.length });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error('ProductList: Displaying error state:', error);
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <Package className="mx-auto h-12 w-12 mb-4" />
            <p className="font-medium">Error loading products</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Package className="mx-auto h-12 w-12 mb-4" />
            <p>
              {searchTerm ? 'No products found matching your search.' : 'No products found.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <Card key={product.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg line-clamp-2">
                  {product.product_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  SKU: {product.sku_reference}
                </p>
              </div>
              <div className="flex gap-1 ml-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category:</span>
                <Badge variant="secondary">
                  {product.category || 'Uncategorized'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base Cost:</span>
                <span className="font-medium">
                  {formatCurrency(product.base_cost || 0)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant={product.is_active ? "success" : "secondary"}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
