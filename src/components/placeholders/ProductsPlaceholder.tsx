import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Search, Filter, Grid } from 'lucide-react';

export const ProductsPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-2">
            Manage your product catalog and performance
          </p>
        </div>
        <Badge variant="outline">Coming in Phase 3</Badge>
      </div>

      <Card className="border-dashed border-2 border-muted">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Product Management</CardTitle>
          <CardDescription>
            Comprehensive product catalog with performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-4 bg-muted/50 rounded-lg">
              <Package className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Product Catalog</h4>
              <p className="text-sm text-muted-foreground">Complete product inventory management</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Search className="h-6 w-6 text-success mb-2" />
              <h4 className="font-medium">Search & Filter</h4>
              <p className="text-sm text-muted-foreground">Advanced search and filtering options</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Filter className="h-6 w-6 text-warning mb-2" />
              <h4 className="font-medium">Performance Metrics</h4>
              <p className="text-sm text-muted-foreground">Sales performance per product</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Grid className="h-6 w-6 text-info mb-2" />
              <h4 className="font-medium">Category Management</h4>
              <p className="text-sm text-muted-foreground">Organize products by categories</p>
            </div>
          </div>
          <Button disabled className="mt-6">
            <Package className="mr-2 h-4 w-4" />
            Manage Products (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const StoresPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stores</h1>
          <p className="text-muted-foreground mt-2">
            Manage your marketplace stores and platforms
          </p>
        </div>
        <Badge variant="outline">Coming in Phase 3</Badge>
      </div>

      <Card className="border-dashed border-2 border-muted">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Store Management</CardTitle>
          <CardDescription>
            Manage all your marketplace stores and their performance
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button disabled className="mt-6">
            <Package className="mr-2 h-4 w-4" />
            Manage Stores (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const UsersPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage users, roles, and permissions
          </p>
        </div>
        <Badge variant="outline">Coming in Phase 4</Badge>
      </div>

      <Card className="border-dashed border-2 border-muted">
        <CardHeader className="text-center">
          <CardTitle>User Management System</CardTitle>
          <CardDescription>
            Advanced user management with role-based access control
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button disabled className="mt-6">
            Manage Users (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export const SettingsPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your dashboard and preferences
          </p>
        </div>
        <Badge variant="outline">Coming in Phase 4</Badge>
      </div>

      <Card className="border-dashed border-2 border-muted">
        <CardHeader className="text-center">
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Customize your dashboard preferences and system settings
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button disabled className="mt-6">
            Configure Settings (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};