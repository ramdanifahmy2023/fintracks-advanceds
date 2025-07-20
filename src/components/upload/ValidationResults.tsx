import React from 'react';
import { ValidatedRow } from './CSVUpload';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface ValidationResultsProps {
  rows: ValidatedRow[];
  setRows: React.Dispatch<React.SetStateAction<ValidatedRow[]>>;
}

export const ValidationResults: React.FC<ValidationResultsProps> = ({ rows }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Hasil Validasi</h3>
      <div className="max-h-96 overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>No. Pesanan</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Keterangan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} className={!row.isValid ? 'bg-destructive/10' : ''}>
                <TableCell>
                  {row.isValid ? (
                    <Badge variant="default" className="bg-success">Valid</Badge>
                  ) : (
                    <Badge variant="destructive">Invalid</Badge>
                  )}
                </TableCell>
                <TableCell>{row.originalRow.order_number}</TableCell>
                <TableCell>{row.originalRow.product_name}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        {row.isDuplicate === 'true' && <Badge variant="secondary">Duplikat</Badge>}
                        {!row.isValid && <span className="text-destructive text-sm">{row.errors.join(', ')}</span>}
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

File: src/components/upload/DuplicateHandling.tsx

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DuplicateHandlingProps {
  value: 'skip' | 'overwrite';
  onChange: (value: 'skip' | 'overwrite') => void;
}

export const DuplicateHandling: React.FC<DuplicateHandlingProps> = ({ value, onChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Penanganan Data Duplikat</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={onChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="skip" id="skip" />
            <Label htmlFor="skip">Lewati (Skip) - Jangan impor baris data yang sudah ada.</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="overwrite" id="overwrite" />
            <Label htmlFor="overwrite">Timpa (Overwrite) - Perbarui baris data yang sudah ada dengan data baru.</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
