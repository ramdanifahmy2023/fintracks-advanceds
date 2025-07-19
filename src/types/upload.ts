export interface UploadResult {
  success: boolean;
  batchId: string;
  summary: {
    totalRows: number;
    processedRows: number;
    duplicateRows: number;
    errorRows: number;
  };
  errors?: ValidationError[];
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface DuplicateInfo {
  rowIndex: number;
  type: 'DATABASE_DUPLICATE' | 'FILE_DUPLICATE';
  message: string;
  existingRecord?: any;
  conflictFields: string[];
  duplicateOf?: number;
}

export interface DuplicateResult {
  hasDuplicates: boolean;
  duplicates: DuplicateInfo[];
  cleanData: any[];
}

export interface TransactionFormData {
  pic_name: string;
  platform_id: string;
  store_id: string;
  order_number: string;
  manual_order_number: string;
  expedition: string;
  delivery_status: 'Selesai' | 'Sedang Dikirim' | 'Batal' | 'Return' | 'Menunggu Konfirmasi';
  product_name: string;
  tracking_number: string;
  order_created_at: string;
  cost_price: string;
  selling_price: string;
  sku_reference: string;
  quantity: number;
}

export interface DataManagementError {
  type: 'VALIDATION_ERROR' | 'UPLOAD_ERROR' | 'DUPLICATE_ERROR' | 'NETWORK_ERROR' | 'PERMISSION_ERROR';
  message: string;
  details?: any;
  recoverable: boolean;
  suggestions: string[];
}

export interface UploadBatch {
  id: string;
  filename: string;
  status: 'processing' | 'completed' | 'partial' | 'failed';
  total_rows: number;
  processed_rows: number;
  duplicate_rows: number;
  failed_rows: number;
  uploaded_at: string;
  uploaded_by: string;
  processing_time_seconds?: number;
  error_log?: any;
}

export const REQUIRED_COLUMNS = [
  'pic',
  'platform_name',
  'store_id_external',
  'order_number',
  'manual_order_number',
  'store_name',
  'expedition',
  'delivery_status',
  'product_name',
  'tracking_number',
  'order_created_at',
  'cost_price',
  'selling_price',
  'sku_reference',
  'quantity'
] as const;

export const DELIVERY_STATUSES = [
  'Selesai',
  'Sedang Dikirim',
  'Batal',
  'Return',
  'Menunggu Konfirmasi'
] as const;