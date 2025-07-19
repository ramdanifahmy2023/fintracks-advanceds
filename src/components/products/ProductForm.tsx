
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
  onClose: () => void;
  onSave: () => void;
  product?: any;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSave, product }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    sku_reference: product?.sku_reference || '',
    product_name: product?.product_name || '',
    category: product?.category || '',
    base_cost: product?.base_cost || 0,
    is_active: product?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (product?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', product.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={true} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update product information below.' : 'Enter the details for the new product.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sku_reference">SKU Reference *</Label>
            <Input
              id="sku_reference"
              value={formData.sku_reference}
              onChange={(e) => handleInputChange('sku_reference', e.target.value)}
              placeholder="Enter SKU reference"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name *</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => handleInputChange('product_name', e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="Enter product category"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_cost">Base Cost</Label>
            <Input
              id="base_cost"
              type="number"
              step="0.01"
              value={formData.base_cost}
              onChange={(e) => handleInputChange('base_cost', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active Product</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? 'Update' : 'Create'} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
