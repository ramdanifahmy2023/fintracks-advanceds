
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Save, Clock } from 'lucide-react';

export const ManualInputPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Input Manual</h1>
          <p className="text-muted-foreground mt-2">
            Tambah dan edit transaksi secara manual
          </p>
        </div>
        <Badge variant="outline">Segera Hadir di Fase 2</Badge>
      </div>

      <Card className="border-dashed border-2 border-muted">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <PlusCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Entry Transaksi Manual</CardTitle>
          <CardDescription>
            Tambahkan transaksi individual atau edit data secara massal
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-muted/50 rounded-lg">
              <PlusCircle className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Tambah Transaksi</h4>
              <p className="text-sm text-muted-foreground">Tambahkan transaksi penjualan secara manual</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Edit className="h-6 w-6 text-warning mb-2" />
              <h4 className="font-medium">Edit Data Existing</h4>
              <p className="text-sm text-muted-foreground">Ubah data transaksi yang sudah ada</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Save className="h-6 w-6 text-success mb-2" />
              <h4 className="font-medium">Simpan Cepat</h4>
              <p className="text-sm text-muted-foreground">Simpan draft dan submit batch</p>
            </div>
          </div>
          <Button disabled className="mt-6">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Transaksi (Segera Hadir)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
