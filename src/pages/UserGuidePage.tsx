
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  BarChart3, 
  Upload, 
  PlusCircle, 
  Package, 
  Store, 
  Users, 
  Settings,
  LayoutDashboard,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Target
} from 'lucide-react';

const UserGuidePage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Panduan Penggunaan</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Pelajari cara menggunakan Hiban Analytics untuk memaksimalkan analisis bisnis Anda
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Pengenalan</TabsTrigger>
          <TabsTrigger value="features">Fitur</TabsTrigger>
          <TabsTrigger value="guides">Panduan</TabsTrigger>
          <TabsTrigger value="data">Data Analytics</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Tentang Hiban Analytics</span>
              </CardTitle>
              <CardDescription>
                Platform analisis bisnis komprehensif untuk monitoring performa penjualan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Hiban Analytics adalah sistem manajemen dan analisis data penjualan yang dirancang 
                untuk membantu bisnis memahami performa mereka melalui visualisasi data yang intuitif 
                dan insights yang actionable.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span>Tujuan Sistem</span>
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                    <li>• Monitoring performa penjualan real-time</li>
                    <li>• Analisis trend dan pola bisnis</li>
                    <li>• Manajemen inventory dan produk</li>
                    <li>• Laporan dan insights otomatis</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span>Manfaat Utama</span>
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground ml-6">
                    <li>• Pengambilan keputusan berbasis data</li>
                    <li>• Efisiensi operasional yang meningkat</li>
                    <li>• Identifikasi peluang bisnis baru</li>
                    <li>• Monitoring KPI secara otomatis</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Roles */}
          <Card>
            <CardHeader>
              <CardTitle>Role dan Akses Pengguna</CardTitle>
              <CardDescription>
                Sistem memiliki 4 level akses dengan kewenangan yang berbeda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Badge variant="destructive">Super Admin</Badge>
                  <p className="text-sm text-muted-foreground">
                    Akses penuh ke semua fitur termasuk manajemen user dan pengaturan sistem.
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="default">Admin</Badge>
                  <p className="text-sm text-muted-foreground">
                    Dapat mengelola data, analytics, produk, dan toko. Tidak bisa mengelola user.
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="secondary">Manager</Badge>
                  <p className="text-sm text-muted-foreground">
                    Akses ke dashboard, analytics, dan manajemen produk untuk monitoring performa.
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge variant="outline">Viewer</Badge>
                  <p className="text-sm text-muted-foreground">
                    Hanya dapat melihat dashboard utama untuk monitoring basic metrics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LayoutDashboard className="h-5 w-5 text-blue-500" />
                  <span>Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Ringkasan performa bisnis dengan KPI utama, grafik trend, dan summary cards.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Total Revenue & Profit</li>
                  <li>• Grafik trend penjualan</li>
                  <li>• Top performing products</li>
                  <li>• Platform performance</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-green-500" />
                  <span>Upload Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Import data penjualan melalui file CSV dengan validasi otomatis.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Drag & drop CSV files</li>
                  <li>• Template download</li>
                  <li>• Data validation</li>
                  <li>• Duplicate handling</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PlusCircle className="h-5 w-5 text-orange-500" />
                  <span>Input Manual</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Input transaksi secara manual untuk data yang tidak bisa diupload.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Form input transaksi</li>
                  <li>• Product selection</li>
                  <li>• Store assignment</li>
                  <li>• Real-time validation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <span>Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Advanced analytics dengan berbagai visualisasi dan insights mendalam.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Revenue analytics</li>
                  <li>• Product performance</li>
                  <li>• Platform comparison</li>
                  <li>• Trend analysis</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-indigo-500" />
                  <span>Products</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Manajemen katalog produk dengan tracking performa individual.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Product catalog</li>
                  <li>• Performance metrics</li>
                  <li>• Category management</li>
                  <li>• Inventory tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Store className="h-5 w-5 text-cyan-500" />
                  <span>Stores</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Manajemen data toko dan monitoring performa per lokasi.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Store management</li>
                  <li>• Location tracking</li>
                  <li>• Performance by store</li>
                  <li>• Regional analysis</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Guides Tab */}
        <TabsContent value="guides" className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="getting-started">
              <AccordionTrigger>Memulai Penggunaan Sistem</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-semibold">Login ke Sistem</h4>
                      <p className="text-sm text-muted-foreground">Gunakan kredensial yang diberikan admin untuk mengakses sistem.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-semibold">Familiarisasi Dashboard</h4>
                      <p className="text-sm text-muted-foreground">Pelajari layout dashboard dan KPI yang tersedia sesuai role Anda.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-semibold">Input Data Pertama</h4>
                      <p className="text-sm text-muted-foreground">Mulai dengan upload data CSV atau input manual untuk melihat sistem bekerja.</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="upload-data">
              <AccordionTrigger>Cara Upload Data CSV</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm"><strong>Tips:</strong> Download template CSV terlebih dahulu untuk memastikan format yang benar.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h4 className="font-semibold">Persiapkan File CSV</h4>
                        <p className="text-sm text-muted-foreground">Pastikan file CSV memiliki kolom: tanggal, produk, platform, quantity, harga, dll.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h4 className="font-semibold">Drag & Drop File</h4>
                        <p className="text-sm text-muted-foreground">Seret file ke area upload atau klik untuk browse file.</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <h4 className="font-semibold">Validasi & Upload</h4>
                        <p className="text-sm text-muted-foreground">System akan memvalidasi data. Periksa error jika ada, lalu klik upload.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="manual-input">
              <AccordionTrigger>Input Data Manual</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-sm">Untuk transaksi yang tidak bisa diupload via CSV, gunakan form input manual:</p>
                <ul className="text-sm space-y-2 ml-4">
                  <li>• Pilih produk dari dropdown yang tersedia</li>
                  <li>• Masukkan tanggal transaksi dengan format yang benar</li>
                  <li>• Isi quantity dan harga per unit</li>
                  <li>• Pilih platform dan toko yang sesuai</li>
                  <li>• Klik submit untuk menyimpan data</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="analytics-usage">
              <AccordionTrigger>Menggunakan Halaman Analytics</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Filter dan Date Range</h4>
                    <p className="text-sm text-muted-foreground">Gunakan filter di bagian atas untuk menyaring data berdasarkan periode, produk, atau platform tertentu.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Export Data</h4>
                    <p className="text-sm text-muted-foreground">Klik tombol export untuk download laporan dalam format CSV, Excel, atau PDF.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Interactive Charts</h4>
                    <p className="text-sm text-muted-foreground">Hover pada chart untuk melihat detail data. Klik legend untuk show/hide data series.</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        {/* Data Analytics Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Memahami Metrics dan KPI</CardTitle>
              <CardDescription>
                Penjelasan tentang cara membaca dan menginterpretasi data analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Key Performance Indicators</h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-blue-600">Total Revenue</h5>
                      <p className="text-sm text-muted-foreground">Total pendapatan dari semua transaksi dalam periode tertentu.</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-green-600">Total Profit</h5>
                      <p className="text-sm text-muted-foreground">Keuntungan bersih setelah dikurangi cost of goods sold (COGS).</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-orange-600">Profit Margin</h5>
                      <p className="text-sm text-muted-foreground">Persentase keuntungan terhadap total revenue (Profit/Revenue × 100%).</p>
                    </div>
                    <div>
                      <h5 className="font-medium text-purple-600">Growth Rate</h5>
                      <p className="text-sm text-muted-foreground">Tingkat pertumbuhan revenue atau profit dibanding periode sebelumnya.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Chart Interpretations</h4>
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium">Revenue Trend Chart</h5>
                      <p className="text-sm text-muted-foreground">Menunjukkan pola penjualan dari waktu ke waktu. Trend naik menandakan pertumbuhan bisnis.</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Platform Performance</h5>
                      <p className="text-sm text-muted-foreground">Membandingkan performa penjualan di berbagai platform (online/offline).</p>
                    </div>
                    <div>
                      <h5 className="font-medium">Product Analysis</h5>
                      <p className="text-sm text-muted-foreground">Mengidentifikasi produk terlaris dan yang kurang perform untuk optimasi inventory.</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Tips Analisis Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                    <h5 className="font-medium">Trend Analysis</h5>
                    <p className="text-sm text-muted-foreground">Perhatikan pola seasonal dan identifikasi peak seasons untuk planning inventory.</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <Target className="h-8 w-8 text-green-500 mb-2" />
                    <h5 className="font-medium">Goal Setting</h5>
                    <p className="text-sm text-muted-foreground">Set target berdasarkan historical data dan monitor progress secara berkala.</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-orange-500 mb-2" />
                    <h5 className="font-medium">Alert Monitoring</h5>
                    <p className="text-sm text-muted-foreground">Perhatikan penurunan performance dan investigasi penyebabnya segera.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>Bagaimana cara mengubah password?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm">Masuk ke halaman Settings, kemudian pilih tab "Profile" dan klik "Change Password". Masukkan password lama dan password baru, lalu klik Save.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2">
                  <AccordionTrigger>Format CSV yang benar seperti apa?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm">Download template CSV dari halaman Upload Data. Pastikan kolom wajib diisi: tanggal (YYYY-MM-DD), nama_produk, platform, quantity (angka), harga_satuan (angka), dan toko.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3">
                  <AccordionTrigger>Mengapa data saya tidak muncul di dashboard?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm">Kemungkinan: 1) Data belum di-upload dengan benar, 2) Filter date range tidak sesuai, 3) Ada error dalam format data. Cek halaman Upload untuk melihat status upload terakhir.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-4">
                  <AccordionTrigger>Bagaimana cara export laporan?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm">Di halaman Analytics, gunakan tombol "Export" di bagian atas. Pilih format (CSV, Excel, PDF) lalu pilih data yang ingin di-export. Laporan akan didownload otomatis.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-5">
                  <AccordionTrigger>Apa perbedaan role Admin dan Manager?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm">Admin dapat upload data dan mengelola stores, sedangkan Manager hanya bisa melihat analytics dan mengelola products. Super Admin memiliki akses penuh termasuk user management.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-6">
                  <AccordionTrigger>Bagaimana mengatasi error saat upload CSV?</AccordionTrigger>
                  <AccordionContent>
                    <div className="text-sm space-y-2">
                      <p>Langkah troubleshooting:</p>
                      <ul className="ml-4 space-y-1">
                        <li>• Pastikan file dalam format .csv</li>
                        <li>• Cek tidak ada cell yang kosong di kolom wajib</li>
                        <li>• Format tanggal harus YYYY-MM-DD</li>
                        <li>• Angka tidak menggunakan separator titik atau koma</li>
                        <li>• Nama produk dan toko harus sudah terdaftar di sistem</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>Best Practices</CardTitle>
              <CardDescription>Tips untuk penggunaan optimal sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">✅ Yang Sebaiknya Dilakukan</h4>
                  <ul className="text-sm space-y-2">
                    <li>• Upload data secara berkala (harian/mingguan)</li>
                    <li>• Gunakan template CSV yang disediakan</li>
                    <li>• Backup data penting secara rutin</li>
                    <li>• Monitor KPI dashboard setiap hari</li>
                    <li>• Set up alerts untuk metrics penting</li>
                    <li>• Review analytics report mingguan</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-600">❌ Yang Sebaiknya Dihindari</h4>
                  <ul className="text-sm space-y-2">
                    <li>• Upload file dengan format yang salah</li>
                    <li>• Mengabaikan validation errors</li>
                    <li>• Tidak melakukan backup data</li>
                    <li>• Menggunakan password yang lemah</li>
                    <li>• Share kredensial login dengan orang lain</li>
                    <li>• Menghapus data tanpa backup</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserGuidePage;
