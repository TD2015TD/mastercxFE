# Dashboard Penyelia (Supervisor Dashboard)

## Gambaran Keseluruhan

Dashboard Penyelia ialah antara muka utama bagi penyelia jabatan untuk memantau prestasi pasukan, status tiket, dan pematuhan SLA secara masa nyata. Semua data diambil terus daripada pangkalan data — tiada nilai yang ditentukan secara tetap (hardcoded).

**URL Akses:** `/dashboard/supervisor`

**Peranan Diperlukan:** Penyelia / Supervisor

---

## Kad Statistik Utama

Di bahagian atas dashboard terdapat **4 kad statistik** yang dimuatkan secara automatik dan dikemas kini setiap 30 saat:

| Kad | Penerangan |
|-----|------------|
| **Tiket Terbuka** | Bilangan tiket yang sedang menunggu atau dalam proses untuk jabatan semasa |
| **Ditangguh (On Hold)** | Bilangan tiket yang sedang ditangguhkan |
| **Pematuhan SLA** | Peratusan tiket jabatan yang memenuhi piawaian SLA |
| **Pelanggaran SLA Hari Ini** | Bilangan tiket yang telah melanggar had masa SLA pada hari ini |

> Jika data gagal dimuatkan, kad akan memaparkan mesej ralat dengan latar belakang merah. Tiada data palsu yang ditunjukkan.

---

## Tab Paparan

Dashboard mempunyai **3 tab** untuk navigasi:

### 1. Tab Gambaran Keseluruhan (Overview)
Memaparkan semua widget utama dalam satu pandangan:
- **Panel Prestasi Ejen** — senarai prestasi ejen jabatan
- **Pusat Pematuhan SLA** — analisis pematuhan SLA mengikut keutamaan
- **Tindakan Pantas** — pautan navigasi ke modul utama

### 2. Tab Prestasi Pasukan (Team Performance)
Memaparkan **Panel Prestasi Ejen** secara penuh, dengan butiran prestasi setiap ejen dalam jabatan.

### 3. Tab Pematuhan SLA (SLA Compliance)
Memaparkan **Pusat Pematuhan SLA** secara penuh, dengan analisis terperinci mengikut keutamaan tiket (P1–P4).

---

## Widget: Panel Prestasi Ejen

**Sumber data:** Jadual `tickets` dalam pangkalan data

Memaparkan senarai ejen dalam jabatan berserta metrik prestasi mereka untuk tempoh yang dipilih (Hari Ini, 7 hari, 30 hari):

| Medan | Penerangan |
|-------|------------|
| Nama Ejen | Nama ejen yang mengendalikan tiket |
| Tiket Diselesaikan | Jumlah tiket yang telah ditutup |
| Kadar Penyelesaian | Peratusan tiket yang diselesaikan berbanding yang diterima |
| Masa Maklum Balas Purata | Purata masa (minit) dari tiket diterima hingga dibalas |

Jika tiada data, panel memaparkan: _"No agent performance data available"_

---

## Widget: Pusat Pematuhan SLA

**Sumber data:** Jadual `tickets` dan `sla_configurations`

### Sub-tab: Gambaran Keseluruhan (Overview)

Memaparkan 4 kad ringkasan:
- **Pematuhan Keseluruhan** — peratusan pematuhan SLA keseluruhan jabatan
- **Pelanggaran Aktif** — bilangan tiket yang telah melanggar SLA
- **Amaran** — bilangan tiket yang menghampiri had masa SLA
- **Dalam Landasan** — bilangan tiket yang masih dalam had masa

Bahagian bawah memaparkan pematuhan **mengikut keutamaan (P1 – P4)**:

| Keutamaan | Penerangan |
|-----------|------------|
| P1 | Kritikal — respons terpantas diperlukan |
| P2 | Tinggi |
| P3 | Sederhana |
| P4 | Rendah |

Setiap baris keutamaan menunjukkan:
- Peratusan pematuhan semasa
- Sasaran pematuhan (dikonfigurasi oleh pentadbir — jika tidak ditetapkan, dipaparkan sebagai _"Target: Not set"_)
- Bar kemajuan (hijau = mencapai sasaran, kuning = tidak mencapai sasaran, kelabu = sasaran belum ditetapkan)

### Sub-tab: Pelanggaran Terkini (Recent Breaches)
Senarai tiket yang baru sahaja melanggar SLA, termasuk nombor tiket, keutamaan, dan masa pelanggaran.

### Sub-tab: Amaran (Warnings)
Senarai tiket yang menghampiri had masa SLA dan berisiko melanggar dalam masa terdekat.

> **Nota:** Sasaran SLA ditetapkan oleh pentadbir melalui **Pentadbiran Sistem → Konfigurasi SLA**. Tiada sasaran lalai yang ditentukan secara tetap dalam sistem.

---

## Widget: Tindakan Pantas

Menyediakan pautan navigasi pantas ke modul-modul utama:

| Tindakan | Destinasi |
|----------|-----------|
| **Jana Laporan** | Halaman Analitik & Pelaporan |
| **Urus Tiket** | Halaman Pengurusan Tiket |

---

## Konfigurasi SLA

Sasaran pematuhan SLA untuk setiap keutamaan dan jabatan boleh dikonfigurasi melalui:

**Pentadbiran Sistem → Konfigurasi SLA**

Medan yang tersedia:
- **Jabatan** — jabatan yang tertakluk kepada konfigurasi ini
- **Keutamaan** — P1, P2, P3, atau P4
- **Tempoh (Minit)** — had masa SLA dalam minit
- **Sasaran Pematuhan (%)** — peratusan sasaran pematuhan (contoh: `95.00`). Biarkan kosong jika tiada sasaran ditetapkan.
- **Had Eskalasi (%)** — peratusan ambang untuk mencetuskan amaran
- Pilihan tambahan: Waktu Perniagaan Sahaja, Tangguh Semasa Ditahan, Tangguh Semasa Tertangguh

---

## Kemas Kini Data Automatik

Dashboard mengemas kini semua data secara automatik setiap **30 saat** tanpa perlu memuat semula halaman. Data juga dimuatkan semula secara automatik apabila tempoh masa ejen aktif dilanjutkan.

---
