import { useState, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, PlusCircle, CheckCircle, Save, Plus, Loader2, AlertTriangle, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionFormData {
  pic_name: string;
  platform_id: string;
  store_id: string;
  order_number: string;
  manual_order_number: string;
  expedition: string;
  delivery_status: string;
  product_name: string;
  tracking_number: string;
  order_created_at: Date;
  cost_price: number;
  selling_price: number;
  quantity: number;
  sku_reference: string;
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

const FormField = ({ label, required, error, children }: FormFieldProps) => (
  <div className="space-y-2">
    <Label className={cn("text-sm font-medium", required && "after:content-['*'] after:ml-1 after:text-destructive")}>
      {label}
    </Label>
    {children}
    {error && (
      <p className="text-sm text-destructive">{error}</p>
    )}
  </div>
);

const ManualInputPage = () => {
  const { user, userRole } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<TransactionFormData>({
    pic_name: '',
    platform_id: '',
    store_id: '',
    order_number: '',
    manual_order_number: '',
    expedition: '',
    delivery_status: 'Menunggu Konfirmasi',
    product_name: '',
    tracking_number: '',
    order_created_at: new Date(),
    cost_price: 0,
    selling_price: 0,
    quantity: 1,
    sku_reference: ''
  });

  const [calculatedProfit, setCalculatedProfit] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [dailyStats, setDailyStats] = useState({
    manualEntries: 0,
    successfulEntries: 0,
    drafts: 0
  });

  // Real-time profit calculation
  useEffect(() => {
    const profit = (formData.selling_price - formData.cost_price) * formData.quantity;
    setCalculatedProfit(profit);
  }, [formData.selling_price, formData.cost_price, formData.quantity]);

  // Load daily stats
  useEffect(() => {
    loadDailyStats();
  }, [user?.id]);

  // Fetch data for dropdowns
  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('is_active', true)
        .order('platform_name');
      if (error) throw error;
      return data;
    }
  });
  
  const { data: stores } = useQuery({
    queryKey: ['stores', formData.platform_id],
    queryFn: async () => {
      if (!formData.platform_id) return [];
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('platform_id', formData.platform_id)
        .eq('is_active', true)
        .order('store_name');
      if (error) throw error;
      return data;
    },
    enabled: !!formData.platform_id
  });
  
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('product_name');
      if (error) throw error;
      return data;
    }
  });

  const loadDailyStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Count manual entries today
      const { data: manualEntries, error } = await supabase
        .from('sales_transactions')
        .select('id, created_at')
        .gte('created_at', today)
        .is('upload_batch_id', null); // Manual entries don't have batch_id

      if (error) throw error;

      setDailyStats({
        manualEntries: manualEntries?.length || 0,
        successfulEntries: manualEntries?.length || 0,
        drafts: 0 // TODO: Implement draft functionality
      });
    } catch (error) {
      console.error('Error loading daily stats:', error);
    }
  };

  const validateForm = (data: TransactionFormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    // Required field validation
    if (!data.pic_name?.trim()) errors.pic_name = 'PIC Name is required';
    if (!data.platform_id) errors.platform_id = 'Platform is required';
    if (!data.store_id) errors.store_id = 'Store is required';
    if (!data.order_number?.trim()) errors.order_number = 'Order Number is required';
    if (!data.product_name?.trim()) errors.product_name = 'Product Name is required';
    if (!data.delivery_status) errors.delivery_status = 'Delivery Status is required';
    
    // Numeric validation
    if (data.cost_price < 0) errors.cost_price = 'Cost Price must be positive';
    if (data.selling_price < 0) errors.selling_price = 'Selling Price must be positive';
    if (data.quantity < 1) errors.quantity = 'Quantity must be at least 1';
    
    // Business logic validation
    if (data.selling_price < data.cost_price) {
      errors.selling_price = 'Selling Price should be higher than Cost Price';
    }
    
    // Date validation
    if (data.order_created_at > new Date()) {
      errors.order_created_at = 'Order date cannot be in the future';
    }
    
    // Order number format validation
    if (data.order_number && data.order_number.length < 5) {
      errors.order_number = 'Order Number must be at least 5 characters';
    }
    
    return errors;
  };

  const checkTransactionDuplicate = async (
    orderNumber: string,
    manualOrderNumber: string,
    platformId: string
  ) => {
    const { data, error } = await supabase
      .from('sales_transactions')
      .select('id, order_number, manual_order_number')
      .or(`order_number.eq.${orderNumber},manual_order_number.eq.${manualOrderNumber}`)
      .eq('platform_id', platformId)
      .limit(1);
    
    if (error) throw error;
    
    return {
      exists: data.length > 0,
      existingTransaction: data[0]
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Check for duplicates
      const duplicateCheck = await checkTransactionDuplicate(
        formData.order_number,
        formData.manual_order_number,
        formData.platform_id
      );
      
      if (duplicateCheck.exists) {
        toast.error('Transaction with this order number already exists');
        setValidationErrors({ order_number: 'Duplicate order number found' });
        return;
      }
      
      // Insert transaction
      const { data, error } = await supabase
        .from('sales_transactions')
        .insert({
          pic_name: formData.pic_name,
          platform_id: formData.platform_id,
          store_id: formData.store_id,
          order_number: formData.order_number,
          manual_order_number: formData.manual_order_number || null,
          expedition: formData.expedition || null,
          delivery_status: formData.delivery_status,
          product_name: formData.product_name,
          tracking_number: formData.tracking_number || null,
          order_created_at: formData.order_created_at.toISOString(),
          cost_price: formData.cost_price,
          selling_price: formData.selling_price,
          quantity: formData.quantity,
          sku_reference: formData.sku_reference || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Transaction created successfully!');
      
      // Reset form
      setFormData({
        pic_name: '',
        platform_id: '',
        store_id: '',
        order_number: '',
        manual_order_number: '',
        expedition: '',
        delivery_status: 'Menunggu Konfirmasi',
        product_name: '',
        tracking_number: '',
        order_created_at: new Date(),
        cost_price: 0,
        selling_price: 0,
        quantity: 1,
        sku_reference: ''
      });
      
      setValidationErrors({});
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['chart-data'] });
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      loadDailyStats();
      
    } catch (error: any) {
      toast.error(`Error creating transaction: ${error.message}`);
      console.error('Transaction creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      pic_name: '',
      platform_id: '',
      store_id: '',
      order_number: '',
      manual_order_number: '',
      expedition: '',
      delivery_status: 'Menunggu Konfirmasi',
      product_name: '',
      tracking_number: '',
      order_created_at: new Date(),
      cost_price: 0,
      selling_price: 0,
      quantity: 1,
      sku_reference: ''
    });
    setValidationErrors({});
  };

  // Check if user has permission
  const hasPermission = userRole === 'super_admin' || userRole === 'admin' || userRole === 'manager';

  if (!hasPermission) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Anda tidak memiliki akses untuk input manual transaksi. Hubungi administrator untuk mendapatkan izin.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manual Input</h1>
          <p className="text-muted-foreground">Add transactions manually to the system</p>
        </div>
        <Badge variant="secondary">{userRole?.replace('_', ' ').toUpperCase()}</Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <PlusCircle className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Input Hari Ini</p>
                <p className="text-2xl font-bold text-blue-600">{dailyStats.manualEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Berhasil Disimpan</p>
                <p className="text-2xl font-bold text-green-600">{dailyStats.successfulEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-50">
                <Save className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Draft Tersimpan</p>
                <p className="text-2xl font-bold text-orange-600">{dailyStats.drafts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Edit className="h-5 w-5 mr-2 text-primary" />
            Manual Transaction Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Informasi Dasar</h3>
                
                {/* PIC Name */}
                <FormField label="PIC Name" required error={validationErrors.pic_name}>
                  <Input
                    value={formData.pic_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, pic_name: e.target.value }))}
                    placeholder="Admin Store"
                  />
                </FormField>
                
                {/* Platform Selection */}
                <FormField label="Platform" required error={validationErrors.platform_id}>
                  <Select 
                    value={formData.platform_id}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, platform_id: value, store_id: '' }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms?.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.platform_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                
                {/* Store Selection */}
                <FormField label="Store" required error={validationErrors.store_id}>
                  <Select 
                    value={formData.store_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, store_id: value }))}
                    disabled={!formData.platform_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores?.map((store) => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.store_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                
                {/* Order Numbers */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Order Number" required error={validationErrors.order_number}>
                    <Input
                      value={formData.order_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, order_number: e.target.value }))}
                      placeholder="SP2025010001"
                    />
                  </FormField>
                  
                  <FormField label="Manual Order Number" error={validationErrors.manual_order_number}>
                    <Input
                      value={formData.manual_order_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, manual_order_number: e.target.value }))}
                      placeholder="MAN001"
                    />
                  </FormField>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium border-b pb-2">Detail Produk</h3>
                
                {/* Product Name */}
                <FormField label="Product Name" required error={validationErrors.product_name}>
                  <Input
                    value={formData.product_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
                    placeholder="Smartphone Samsung Galaxy A54"
                  />
                </FormField>
                
                {/* SKU Reference */}
                <FormField label="SKU Reference" error={validationErrors.sku_reference}>
                  <Select
                    value={formData.sku_reference}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sku_reference: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih SKU" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem key={product.sku_reference} value={product.sku_reference}>
                          {product.sku_reference} - {product.product_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                
                {/* Pricing */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField label="Cost Price" required error={validationErrors.cost_price}>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                      placeholder="3500000"
                    />
                  </FormField>
                  
                  <FormField label="Selling Price" required error={validationErrors.selling_price}>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.selling_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                      placeholder="4200000"
                    />
                  </FormField>
                  
                  <FormField label="Quantity" required error={validationErrors.quantity}>
                    <Input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      placeholder="1"
                    />
                  </FormField>
                </div>
                
                {/* Calculated Profit Display */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calculator className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">Calculated Profit:</span>
                    </div>
                    <span className={`text-lg font-bold ${calculatedProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(calculatedProfit)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Margin: {formData.selling_price > 0 ? ((calculatedProfit / (formData.selling_price * formData.quantity)) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Shipping & Status Section */}
            <div className="grid md:grid-cols-4 gap-6">
              <FormField label="Expedition" error={validationErrors.expedition}>
                <Select
                  value={formData.expedition}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, expedition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih ekspedisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JNE Express">JNE Express</SelectItem>
                    <SelectItem value="JNT Express">JNT Express</SelectItem>
                    <SelectItem value="Shopee Express">Shopee Express</SelectItem>
                    <SelectItem value="SiCepat">SiCepat</SelectItem>
                    <SelectItem value="AnterAja">AnterAja</SelectItem>
                    <SelectItem value="Grab Express">Grab Express</SelectItem>
                    <SelectItem value="GoSend">GoSend</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              
              <FormField label="Tracking Number" error={validationErrors.tracking_number}>
                <Input
                  value={formData.tracking_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, tracking_number: e.target.value }))}
                  placeholder="JNE1234567890"
                />
              </FormField>
              
              <FormField label="Delivery Status" required error={validationErrors.delivery_status}>
                <Select
                  value={formData.delivery_status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, delivery_status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Menunggu Konfirmasi">Menunggu Konfirmasi</SelectItem>
                    <SelectItem value="Sedang Dikirim">Sedang Dikirim</SelectItem>
                    <SelectItem value="Selesai">Selesai</SelectItem>
                    <SelectItem value="Batal">Batal</SelectItem>
                    <SelectItem value="Return">Return</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Order Created At" required error={validationErrors.order_created_at}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.order_created_at && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.order_created_at ? format(formData.order_created_at, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.order_created_at}
                      onSelect={(date) => date && setFormData(prev => ({ ...prev, order_created_at: date }))}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </FormField>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset Form
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Transaction
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualInputPage;