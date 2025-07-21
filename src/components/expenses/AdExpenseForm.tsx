// src/pages/AdExpensePage.tsx

import { AdExpenseForm } from '@/components/expenses/AdExpenseForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

const AdExpensePage = () => {
  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div>
        <h1 className="text-3xl font-bold">Biaya Iklan</h1>
        <p className="text-muted-foreground mt-2">
          Kelola dan catat biaya iklan untuk setiap platform dan toko.
        </p>
      </div>

      {/* Kartu Form Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-primary" />
            Tambah Biaya Iklan
          </CardTitle>
          <CardDescription>
            Masukkan detail biaya iklan untuk melacak pengeluaran operasional Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdExpenseForm />
        </CardContent>
      </Card>
      
      {/* Nanti di sini bisa ditambahkan tabel untuk menampilkan riwayat biaya iklan */}
    </div>
  );
};

export default AdExpensePage;