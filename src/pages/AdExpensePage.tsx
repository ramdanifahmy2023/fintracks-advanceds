
import { AdExpenseForm } from '@/components/expenses/AdExpenseForm';
import { AppLayout } from '@/components/layout/AppLayout';

const AdExpensePage = () => {
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Biaya Iklan</h1>
          <p className="text-gray-600 mt-2">
            Kelola dan catat biaya iklan untuk setiap platform dan toko
          </p>
        </div>
        
        <AdExpenseForm />
      </div>
    </AppLayout>
  );
};

export default AdExpensePage;
