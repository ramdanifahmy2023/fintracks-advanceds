
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductList } from '@/components/products/ProductList';
import { ProductForm } from '@/components/products/ProductForm';
import { ProductStats } from '@/components/products/ProductStats';
import { Plus, Search, Filter } from 'lucide-react';

export const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product catalog and performance
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <ProductStats />
        </TabsContent>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
          
          <ProductList searchTerm={searchTerm} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Analytics</CardTitle>
              <CardDescription>
                Track sales performance and profitability by product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Performance analytics will be displayed here based on sales data.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showAddForm && (
        <ProductForm
          onClose={() => setShowAddForm(false)}
          onSave={() => {
            setShowAddForm(false);
            // Refresh product list
          }}
        />
      )}
    </div>
  );
};
