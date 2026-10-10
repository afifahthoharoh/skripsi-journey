import { StageInfo } from '../types/skripsi';

export const STAGES_LIST: StageInfo[] = [
  { code: 'TAHAP A', name: 'TAHAP A — PERSIAPAN', description: 'Pedoman, format, diskusi tema besar, dan penjadwalan awal.' },
  { code: 'TAHAP B', name: 'TAHAP B — SURVEI DAN VALIDASI', description: 'Observasi lapangan, wawancara, alur kerja, dan kecukupan data.' },
  { code: 'TAHAP C', name: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', description: 'Perumusan 3 judul, masalah, tujuan, dan pemetaan data bersama.' },
  { code: 'TAHAP D', name: 'TAHAP D — STUDI LITERATUR DAN RESEARCH GAP', description: 'Matriks jurnal 2022-2026, research gap, dan pemilihan metode.' },
  { code: 'TAHAP E', name: 'TAHAP E — BAB I: PENDAHULUAN', description: 'Latar belakang, rumusan masalah, tujuan, batasan, dan kontribusi.' },
  { code: 'TAHAP F', name: 'TAHAP F — BAB II: TINJAUAN PUSTAKA', description: 'Teori dasar, penelitian terdahulu, konsep sistem, dan sitasi.' },
  { code: 'TAHAP G', name: 'TAHAP G — BAB III: METODOLOGI PENELITIAN', description: 'Alur penelitian, pengumpulan data, perancangan sistem, dan evaluasi.' },
  { code: 'TAHAP H', name: 'TAHAP H — BIMBINGAN DAN SEMINAR PROPOSAL', description: 'Draf Bab I-III, pendaftaran sempro, slide, dan revisi pascasempro.' },
  { code: 'TAHAP I', name: 'TAHAP I — PELAKSANAAN PENELITIAN', description: 'Pengumpulan & pembersihan data, implementasi metode/sistem, dan pengujian.' },
  { code: 'TAHAP J', name: 'TAHAP J — BAB IV: HASIL DAN PEMBAHASAN', description: 'Penyajian hasil, grafik, pengujian sistem, dan evaluasi indikator.' },
  { code: 'TAHAP K', name: 'TAHAP K — BAB V: KESIMPULAN DAN SARAN', description: 'Jawaban rumusan masalah, saran realistis, dan keselarasan naskah.' },
  { code: 'TAHAP L', name: 'TAHAP L — PERSIAPAN SIDANG SKRIPSI', description: 'Syarat akademik, pendaftaran sidang, latihan slide, dan demo sistem.' },
  { code: 'TAHAP M', name: 'TAHAP M — SIDANG SKRIPSI', description: 'Pelaksanaan sidang, pencatatan pertanyaan penguji, dan keputusan resmi.' },
  { code: 'TAHAP N', name: 'TAHAP N — REVISI PENGUJI DAN PENYELESAIAN AKHIR', description: 'Perbaikan naskah, persetujuan penguji, pengumpulan naskah final.' },
];

export const INITIAL_CHECKLIST_TEMPLATES = [
  // TAHAP A
  { stage: 'TAHAP A — PERSIAPAN', title: 'Membaca pedoman skripsi UKRI', priority: 'Tinggi' },
  { stage: 'TAHAP A — PERSIAPAN', title: 'Membaca format laporan dan ketentuan seminar', priority: 'Sedang' },
  { stage: 'TAHAP A — PERSIAPAN', title: 'Mendiskusikan tema besar kelompok', priority: 'Tinggi' },
  { stage: 'TAHAP A — PERSIAPAN', title: 'Mengidentifikasi calon lokasi penelitian', priority: 'Tinggi' },
  { stage: 'TAHAP A — PERSIAPAN', title: 'Menghubungi pihak lokasi', priority: 'Sedang' },
  { stage: 'TAHAP A — PERSIAPAN', title: 'Menentukan narasumber', priority: 'Sedang' },
  { stage: 'TAHAP A — PERSIAPAN', title: 'Menyusun pertanyaan survei', priority: 'Sedang' },
  { stage: 'TAHAP A — PERSIAPAN', title: 'Menyepakati jadwal kunjungan', priority: 'Rendah' },
  { stage: 'TAHAP A — PERSIAPAN', title: 'Memeriksa akses dan izin penggunaan data', priority: 'Tinggi' },

  // TAHAP B
  { stage: 'TAHAP B — SURVEI DAN VALIDASI', title: 'Melakukan observasi lapangan', priority: 'Tinggi' },
  { stage: 'TAHAP B — SURVEI DAN VALIDASI', title: 'Melakukan wawancara', priority: 'Tinggi' },
  { stage: 'TAHAP B — SURVEI DAN VALIDASI', title: 'Mendokumentasikan alur kerja yang diamati', priority: 'Sedang' },
  { stage: 'TAHAP B — SURVEI DAN VALIDASI', title: 'Mencatat masalah yang benar-benar ditemukan', priority: 'Tinggi' },
  { stage: 'TAHAP B — SURVEI DAN VALIDASI', title: 'Mencatat bukti dan kebutuhan pengguna', priority: 'Sedang' },
  { stage: 'TAHAP B — SURVEI DAN VALIDASI', title: 'Mencatat jenis data yang tersedia', priority: 'Tinggi' },
  { stage: 'TAHAP B — SURVEI DAN VALIDASI', title: 'Mencatat periode dan kelengkapan data', priority: 'Sedang' },
  { stage: 'TAHAP B — SURVEI DAN VALIDASI', title: 'Memastikan izin penggunaan data', priority: 'Tinggi' },
  { stage: 'TAHAP B — SURVEI DAN VALIDASI', title: 'Memeriksa apakah data cukup untuk penelitian', priority: 'Tinggi' },
  { stage: 'TAHAP B — SURVEI DAN VALIDASI', title: 'Memilih tema berdasarkan hasil survei dan kelayakan', priority: 'Tinggi' },

  // TAHAP C
  { stage: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', title: 'Menentukan masalah penelitian anggota pertama', priority: 'Tinggi' },
  { stage: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', title: 'Menentukan masalah penelitian anggota kedua', priority: 'Tinggi' },
  { stage: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', title: 'Menentukan masalah penelitian anggota ketiga', priority: 'Tinggi' },
  { stage: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', title: 'Membuat judul sementara untuk setiap anggota', priority: 'Tinggi' },
  { stage: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', title: 'Menentukan rumusan masalah masing-masing', priority: 'Tinggi' },
  { stage: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', title: 'Menentukan tujuan dan batasan penelitian', priority: 'Sedang' },
  { stage: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', title: 'Memetakan data yang digunakan bersama', priority: 'Tinggi' },
  { stage: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', title: 'Memetakan data khusus tiap penelitian', priority: 'Sedang' },
  { stage: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', title: 'Memastikan kontribusi tiap mahasiswa berbeda', priority: 'Tinggi' },
  { stage: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', title: 'Memastikan tidak ada duplikasi penelitian yang tidak dapat dibenarkan', priority: 'Tinggi' },
  { stage: 'TAHAP C — PEMBAGIAN TIGA PENELITIAN', title: 'Mengonsultasikan rencana kepada dosen pembimbing', priority: 'Tinggi' },

  // TAHAP D
  { stage: 'TAHAP D — STUDI LITERATUR DAN RESEARCH GAP', title: 'Mencari jurnal dan sumber ilmiah yang relevan', priority: 'Tinggi' },
  { stage: 'TAHAP D — STUDI LITERATUR DAN RESEARCH GAP', title: 'Memprioritaskan publikasi 2022–2026 jika relevan', priority: 'Sedang' },
  { stage: 'TAHAP D — STUDI LITERATUR DAN RESEARCH GAP', title: 'Memeriksa kredibilitas sumber', priority: 'Sedang' },
  { stage: 'TAHAP D — STUDI LITERATUR DAN RESEARCH GAP', title: 'Membuat matriks penelitian terdahulu', priority: 'Tinggi' },
  { stage: 'TAHAP D — STUDI LITERATUR DAN RESEARCH GAP', title: 'Membandingkan objek, data, metode, hasil, dan keterbatasan penelitian', priority: 'Tinggi' },
  { stage: 'TAHAP D — STUDI LITERATUR DAN RESEARCH GAP', title: 'Mengidentifikasi research gap berdasarkan bukti', priority: 'Tinggi' },
  { stage: 'TAHAP D — STUDI LITERATUR DAN RESEARCH GAP', title: 'Menentukan kontribusi penelitian', priority: 'Tinggi' },
  { stage: 'TAHAP D — STUDI LITERATUR DAN RESEARCH GAP', title: 'Memilih metode berdasarkan masalah dan karakteristik data', priority: 'Tinggi' },
  { stage: 'TAHAP D — STUDI LITERATUR DAN RESEARCH GAP', title: 'Memeriksa kelayakan metode', priority: 'Sedang' },
  { stage: 'TAHAP D — STUDI LITERATUR DAN RESEARCH GAP', title: 'Meminta arahan dosen jika diperlukan', priority: 'Sedang' },

  // TAHAP E
  { stage: 'TAHAP E — BAB I: PENDAHULUAN', title: 'Menyusun Latar Belakang Masalah', priority: 'Tinggi' },
  { stage: 'TAHAP E — BAB I: PENDAHULUAN', title: 'Menyusun Identifikasi Masalah & Rumusan Masalah', priority: 'Tinggi' },
  { stage: 'TAHAP E — BAB I: PENDAHULUAN', title: 'Menyusun Batasan Masalah & Tujuan Penelitian', priority: 'Sedang' },
  { stage: 'TAHAP E — BAB I: PENDAHULUAN', title: 'Menyusun Manfaat & Sistematika Penulisan', priority: 'Rendah' },
  { stage: 'TAHAP E — BAB I: PENDAHULUAN', title: 'Memeriksa Kesesuaian Judul, Masalah, Tujuan & Kontribusi', priority: 'Tinggi' },

  // TAHAP F
  { stage: 'TAHAP F — BAB II: TINJAUAN PUSTAKA', title: 'Menyusun Ringkasan Penelitian Terdahulu', priority: 'Tinggi' },
  { stage: 'TAHAP F — BAB II: TINJAUAN PUSTAKA', title: 'Menyusun Landasan Teori Utama & Konsep Teknologi', priority: 'Sedang' },
  { stage: 'TAHAP F — BAB II: TINJAUAN PUSTAKA', title: 'Menjelaskan Metode Penelitian yang Digunakan', priority: 'Tinggi' },
  { stage: 'TAHAP F — BAB II: TINJAUAN PUSTAKA', title: 'Menyusun Kerangka Pemikiran / Konseptual', priority: 'Sedang' },
  { stage: 'TAHAP F — BAB II: TINJAUAN PUSTAKA', title: 'Memeriksa Konsistensi Sitasi dan Daftar Pustaka', priority: 'Tinggi' },

  // TAHAP G
  { stage: 'TAHAP G — BAB III: METODOLOGI PENELITIAN', title: 'Menjelaskan Jenis, Desain, & Lokasi Penelitian', priority: 'Sedang' },
  { stage: 'TAHAP G — BAB III: METODOLOGI PENELITIAN', title: 'Mendeskripsikan Sumber & Teknik Pengumpulan Data', priority: 'Tinggi' },
  { stage: 'TAHAP G — BAB III: METODOLOGI PENELITIAN', title: 'Menyusun Tahapan Penelitian & Perancangan Sistem/Algoritma', priority: 'Tinggi' },
  { stage: 'TAHAP G — BAB III: METODOLOGI PENELITIAN', title: 'Menentukan Alat, Teknologi, & Metode Evaluasi/Pengujian', priority: 'Tinggi' },
  { stage: 'TAHAP G — BAB III: METODOLOGI PENELITIAN', title: 'Menetapakan Indikator Keberhasilan & Jadwal Penelitian', priority: 'Sedang' },

  // TAHAP H
  { stage: 'TAHAP H — BIMBINGAN DAN SEMINAR PROPOSAL', title: 'Menyelesaikan Draf Bab I–III Lengkap', priority: 'Tinggi' },
  { stage: 'TAHAP H — BIMBINGAN DAN SEMINAR PROPOSAL', title: 'Mengirim dokumen kepada Dosen Pembimbing', priority: 'Tinggi' },
  { stage: 'TAHAP H — BIMBINGAN DAN SEMINAR PROPOSAL', title: 'Memeriksa ketentuan pendaftaran seminar proposal', priority: 'Sedang' },
  { stage: 'TAHAP H — BIMBINGAN DAN SEMINAR PROPOSAL', title: 'Menyiapkan slide presentasi Sempro', priority: 'Tinggi' },
  { stage: 'TAHAP H — BIMBINGAN DAN SEMINAR PROPOSAL', title: 'Melakukan latihan presentasi & tanya jawab', priority: 'Sedang' },
  { stage: 'TAHAP H — BIMBINGAN DAN SEMINAR PROPOSAL', title: 'Melaksanakan Seminar Proposal & Mencatat Masukan Dosen', priority: 'Tinggi' },
  { stage: 'TAHAP H — BIMBINGAN DAN SEMINAR PROPOSAL', title: 'Menyelesaikan Revisi Pascasempro & Minta ACC Pembimbing', priority: 'Tinggi' },

  // TAHAP I
  { stage: 'TAHAP I — PELAKSANAAN PENELITIAN', title: 'Memastikan izin penelitian aktif & pengambilan data', priority: 'Tinggi' },
  { stage: 'TAHAP I — PELAKSANAAN PENELITIAN', title: 'Melakukan pembersihan / prapemrosesan data (data preprocessing)', priority: 'Tinggi' },
  { stage: 'TAHAP I — PELAKSANAAN PENELITIAN', title: 'Membangun / menerapkan metode / pengembangan prototipe', priority: 'Tinggi' },
  { stage: 'TAHAP I — PELAKSANAAN PENELITIAN', title: 'Melakukan pengujian sistem & eksperimen', priority: 'Tinggi' },
  { stage: 'TAHAP I — PELAKSANAAN PENELITIAN', title: 'Mencatat hasil evaluasi & bimbingan hasil sementara', priority: 'Sedang' },

  // TAHAP J
  { stage: 'TAHAP J — BAB IV: HASIL DAN PEMBAHASAN', title: 'Menyusun tabel, grafik, & screenshot hasil implementasi', priority: 'Tinggi' },
  { stage: 'TAHAP J — BAB IV: HASIL DAN PEMBAHASAN', title: 'Mengevaluasi hasil berdasarkan indikator keberhasilan', priority: 'Tinggi' },
  { stage: 'TAHAP J — BAB IV: HASIL DAN PEMBAHASAN', title: 'Membandingkan temuan dengan penelitian terdahulu', priority: 'Sedang' },
  { stage: 'TAHAP J — BAB IV: HASIL DAN PEMBAHASAN', title: 'Membahas implikasi, keterbatasan, & kendala pengujian', priority: 'Sedang' },

  // TAHAP K
  { stage: 'TAHAP K — BAB V: KESIMPULAN DAN SARAN', title: 'Menyusun kesimpulan yang menjawab rumusan masalah', priority: 'Tinggi' },
  { stage: 'TAHAP K — BAB V: KESIMPULAN DAN SARAN', title: 'Menuliskan saran yang realistis untuk pengembangan lanjut', priority: 'Sedang' },
  { stage: 'TAHAP K — BAB V: KESIMPULAN DAN SARAN', title: 'Memeriksa cek plagiarisme / kesamaan teks sesuai aturan', priority: 'Tinggi' },

  // TAHAP L
  { stage: 'TAHAP L — PERSIAPAN SIDANG SKRIPSI', title: 'Memeriksa kelengkapan administrasi & akademik sidang', priority: 'Tinggi' },
  { stage: 'TAHAP L — PERSIAPAN SIDANG SKRIPSI', title: 'Menyiapkan slide presentasi sidang & demo sistem', priority: 'Tinggi' },
  { stage: 'TAHAP L — PERSIAPAN SIDANG SKRIPSI', title: 'Berlatih presentasi dengan batas waktu & pertanyaan penguji', priority: 'Sedang' },

  // TAHAP M
  { stage: 'TAHAP M — SIDANG SKRIPSI', title: 'Melaksanakan Sidang Skripsi', priority: 'Tinggi' },
  { stage: 'TAHAP M — SIDANG SKRIPSI', title: 'Mencatat semua masukan & catatan revisi dari Dosen Penguji', priority: 'Tinggi' },
  { stage: 'TAHAP M — SIDANG SKRIPSI', title: 'Mencatat keputusan resmi sidang', priority: 'Tinggi' },

  // TAHAP N
  { stage: 'TAHAP N — REVISI PENGUJI DAN PENYELESAIAN AKHIR', title: 'Memperbaiki naskah sesuai masukan Dosen Penguji', priority: 'Tinggi' },
  { stage: 'TAHAP N — REVISI PENGUJI DAN PENYELESAIAN AKHIR', title: 'Meminta validasi & persetujuan revisi kepada penguji & pembimbing', priority: 'Tinggi' },
  { stage: 'TAHAP N — REVISI PENGUJI DAN PENYELESAIAN AKHIR', title: 'Mengumpulkan naskah final & bukti serah terima skripsi', priority: 'Tinggi' },
];

export const DEFAULT_CHAPTER_SUBSECTIONS = [
  // BAB I
  { chapter: 'Bab I' as const, subChapter: '1.1 Latar Belakang Masalah' },
  { chapter: 'Bab I' as const, subChapter: '1.2 Identifikasi & Rumusan Masalah' },
  { chapter: 'Bab I' as const, subChapter: '1.3 Batasan Masalah' },
  { chapter: 'Bab I' as const, subChapter: '1.4 Tujuan & Manfaat Penelitian' },
  { chapter: 'Bab I' as const, subChapter: '1.5 Kontribusi Penelitian' },
  { chapter: 'Bab I' as const, subChapter: '1.6 Sistematika Penulisan' },

  // BAB II
  { chapter: 'Bab II' as const, subChapter: '2.1 Penelitian Terdahulu & Research Gap' },
  { chapter: 'Bab II' as const, subChapter: '2.2 Landasan Teori Utama' },
  { chapter: 'Bab II' as const, subChapter: '2.3 Algoritma & Metode Terkait' },
  { chapter: 'Bab II' as const, subChapter: '2.4 Kerangka Konseptual / Pemikiran' },

  // BAB III
  { chapter: 'Bab III' as const, subChapter: '3.1 Objek & Lokasi Penelitian' },
  { chapter: 'Bab III' as const, subChapter: '3.2 Sumber & Teknik Pengumpulan Data' },
  { chapter: 'Bab III' as const, subChapter: '3.3 Tahapan Metodologi Penelitian' },
  { chapter: 'Bab III' as const, subChapter: '3.4 Perancangan Sistem / Model' },
  { chapter: 'Bab III' as const, subChapter: '3.5 Metrik Evaluasi & Indikator' },

  // BAB IV
  { chapter: 'Bab IV' as const, subChapter: '4.1 Pengolahan Data & Preprocessing' },
  { chapter: 'Bab IV' as const, subChapter: '4.2 Hasil Implementasi & Pengujian' },
  { chapter: 'Bab IV' as const, subChapter: '4.3 Analisis & Evaluasi Performa' },
  { chapter: 'Bab IV' as const, subChapter: '4.4 Pembahasan & Diskusi Temuan' },

  // BAB V
  { chapter: 'Bab V' as const, subChapter: '5.1 Kesimpulan Utama' },
  { chapter: 'Bab V' as const, subChapter: '5.2 Saran & Pengembangan Mendatang' },
];

export const RECOMMENDED_THEMES = [
  {
    title: 'Sistem Smart Farming & Deteksi Penyakit Tanaman Perkebunan Buah',
    description: 'Penelitian kelompok berbasis IoT & AI untuk pemantauan kesehatan kebun, deteksi penyakit daun buah berbasis Computer Vision, serta sistem rekomendasi pupuk otomatis.',
    suggestedTitles: [
      'Anggota 1: Deteksi Penyakit Daun Tanaman Buah Menggunakan Metode Convolutional Neural Network (CNN)',
      'Anggota 2: System Smart Monitoring Kelembaban & Suhu Lahan Buah Berbasis IoT & Dashboard Real-time',
      'Anggota 3: Sistem Pendukung Keputusan Rekomendasi Pemupukan Lahan Buah Menggunakan Metode SAW / TOPSIS',
    ]
  },
  {
    title: 'Digitalisasi Otomasi Irigasi & Distribusi Air Sawah Pertanian',
    description: 'Sistem terpadu pengontrolan pintu air irigasi sawah berbasis sensor, prediksi kecukupan air dengan Machine Learning, dan aplikasi mobile monitoring petani.',
    suggestedTitles: [
      'Anggota 1: Otomatisasi Pintu Air Irigasi Sawah Berbasis Sensor Kelembaban Tanah dan Mikrokontroler NodeMCU',
      'Anggota 2: Prediksi Kebutuhan Air Irigasi Sawah Menggunakan Algoritma Random Regression / LSTM',
      'Anggota 3: Aplikasi Web & Mobile Monitoring Distribusi Air Sawah Berbasis Progressive Web App (PWA)',
    ]
  },
  {
    title: 'Sistem Informasi Geografis & Analytics Distribusi Hasil Panen Daerah',
    description: 'Pemetaan lahan pertanian, analisis klastering produktivitas lahan, dan optimasi rute distribusi rantai pasok panen.',
    suggestedTitles: [
      'Anggota 1: Pemetaan Geografis Lahan Pertanian Daerah Menggunakan WebGIS & Leaflet Interactive Map',
      'Anggota 2: Pengelompokan (Clustering) Potensi Hasil Panen Wilayah Menggunakan Algoritma K-Means',
      'Anggota 3: Optimasi Rute Distribusi Hasil Panen ke Pasar Menggunakan Algoritma Dijkstra / Genetic Algorithm',
    ]
  }
];
