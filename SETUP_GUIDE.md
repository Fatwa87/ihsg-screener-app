📊 IHSG SCREENER - SETUP GUIDE

## ⚡ Quick Start (5 Menit)

### STEP 1: Persiapkan Google Sheet
1. Buka Google Drive → "Buat baru" → "Google Sheets"
2. Beri nama: "IHSG Screener App"
3. Klik kanan sheet → "Buka di Apps Script"
4. Copy sheet ID dari URL: sheets.googleapis.com/d/{SHEET_ID}

### STEP 2: Setup Google Apps Script

**A. Copy semua code:**
- Copy file: `finance-api.gs` (sumber data Yahoo Finance)
- Copy file: `main-updated.gs` (logic utama)
- Copy file: `dashboard.html` (frontend UI)

**B. Paste ke Apps Script:**
1. Buka Extensions → Apps Script
2. Di editor, paste code dengan struktur:
   ```
   + finance-api.gs
   + main-updated.gs
   + dashboard.html
   ```

### STEP 3: Konfigurasi

Di `main-updated.gs`, edit bagian CONFIG:
```javascript
const CONFIG = {
  SHEET_ID: "PASTE_SHEET_ID_ANDA_DISINI", // Dari step 1
  NEWS_API_KEY: "", // Optional - ambil dari newsapi.org (free)
  // Sisanya biarkan default
};
```

### STEP 4: Deploy sebagai Web App

1. Klik "Deploy" → "New Deployment"
2. Type: "Web app"
3. Execute as: Your Account
4. Who has access: "Anyone"
5. Click "Deploy"
6. Copy URL yang muncul → Buka di browser
7. **SIMPAN URL INI!** ✅

### STEP 5: Setup Auto-Update (Sangat Penting!)

1. Kembali ke Apps Script
2. Klik "Triggers" (jam di sidebar kiri)
3. Klik "Create new trigger"
4. Isi:
   - Function: `scheduleUpdates`
   - Deployment: "Head"
   - Event type: "Time-driven"
   - Type of time interval: "Hour timer"
   - Select hour interval: "Every 1 hour"
5. Click "Save"

Selesai! ✅

---

## 🎯 Data yang Akan Diupdate Otomatis

Setiap 1 jam, aplikasi akan:

✅ **Fetch Market Data** → Yahoo Finance
   - IHSG + 11 saham blue chip
   - Harga, change, volume, market cap, PE ratio

✅ **Fetch Berita** → News API + Google News
   - 8 keyword finansial
   - Update setiap jam

✅ **Sentiment Analysis** → AI text analysis
   - Positive/Negative/Neutral
   - Sentiment score

✅ **IHSG Prediction** → Technical + Sentiment
   - Bullish/Bearish
   - Confidence level

✅ **Stock Recommendations** → Top 20 stocks
   - Berdasarkan berita + technical

---

## 📖 Cara Menggunakan

### 1. Lihat Dashboard
Buka URL Web App yang sudah di-copy → Dashboard muncul dengan:
- ✅ IHSG Prediction (Real-time)
- ✅ News Feed (Update otomatis)
- ✅ Stock Recommendations (Realtime)
- ✅ Sector Analysis
- ✅ IHSG Trend Chart

### 2. Refresh Manual
Klik tombol "🔄 Refresh Now" di dashboard untuk update instant

### 3. Monitor Progress
- Klik "Logs" di Apps Script untuk melihat proses
- Update logs muncul setiap jam

---

## 🔧 Troubleshooting

### ❌ Error: "SHEET_ID not found"
**Solusi:**
1. Pastikan CONFIG.SHEET_ID sudah diisi
2. Pastikan Sheet ID benar (dari URL sheets.google.com/d/{SHEET_ID})
3. Tekan Ctrl+Shift+P → "Recheck Deployment"

### ❌ Error: "getYahooFinanceData is not a function"
**Solusi:**
1. Pastikan `finance-api.gs` sudah di-copy ke Apps Script
2. Refresh page (Ctrl+R)
3. Deploy ulang

### ❌ News tidak muncul
**Solusi:**
1. Kalau NEWS_API_KEY kosong, itu normal (pakai Google News)
2. Tunggu 1 jam untuk update pertama
3. Atau jalankan `testUpdateCycle()` untuk test manual

### ❌ Dashboard muncul blank/loading terus
**Solusi:**
1. Check browser console (F12)
2. Buka "Logs" di Apps Script untuk error details
3. Pastikan `doGet()` function ada
4. Deploy ulang

### ❌ Trigger tidak jalan
**Solusi:**
1. Cek di "Triggers" - pastikan sudah created
2. Lihat notification di Gmail - ada error notification
3. Buat trigger baru (delete lalu create ulang)

---

## 📊 Sheets yang Dibuat Otomatis

Aplikasi akan membuat sheets:

| Sheet Name | Isi | Update |
|---|---|---|
| Market_Snapshot | IHSG + 11 stocks realtime | Setiap jam |
| IHSG_History | Historical data IHSG | Setiap jam |
| News | Berita dari berbagai sumber | Setiap jam |
| Predictions | Prediksi IHSG + confidence | Setiap jam |
| Stock_Recommendations | Top 20 saham bullish | Setiap jam |

---

## 🚀 API yang Digunakan (SEMUA GRATIS!)

### 1. **Yahoo Finance** ✅ UTAMA
- No API Key needed!
- Free tier: Unlimited calls
- Data: Real-time harga, volume, market cap, PE ratio
- Ticker format Indonesia: `BBCA.JK`, `TLKM.JK`, `^JKSE`

### 2. **Google Finance** ✅ ALTERNATIF
- Builtin di Google Sheets
- Gunakan formula: `=GOOGLEFINANCE("JSE:BBCA","price")`
- Free, unlimited

### 3. **News API** ✅ OPSIONAL
- Free tier: 100 requests/day
- Ambil key: https://newsapi.org/
- Pakai di CONFIG.NEWS_API_KEY
- Kalau kosong, pakai Google News RSS

### 4. **Google News** ✅ BACKUP
- No API Key needed
- Gratis unlimited
- Fallback jika News API habis

---

## 💡 Tips & Tricks

### 1. Customize Stock List
Edit di `main-updated.gs`:
```javascript
INDONESIAN_STOCKS: [
  '^JKSE',    // IHSG
  'BBCA.JK',  // BCA
  'BBRI.JK',  // BRI
  // Tambah lebih banyak dengan format xxx.JK
],
```

### 2. Customize News Keywords
```javascript
NEWS_KEYWORDS: [
  'IHSG', 'pasar modal', 'saham',
  // Tambah keyword sesuai kebutuhan
],
```

### 3. Change Update Interval
```javascript
UPDATE_INTERVAL_MINUTES: 60, // Ubah jadi 30 untuk update 30 menit sekali
```

### 4. Customize Sector Mapping
```javascript
SECTOR_MAPPING: {
  'BBCA': 'Perbankan',
  'UNVR': 'Consumer',
  // Tambah stock mapping
}
```

---

## 📱 Fitur Advanced (Optional)

### Tambah Notifikasi Telegram
Edit `sendErrorNotification()` di main-updated.gs:
```javascript
function sendTelegramNotification(message) {
  const botToken = "YOUR_BOT_TOKEN";
  const chatId = "YOUR_CHAT_ID";
  const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${message}`;
  UrlFetchApp.fetch(url);
}
```

### Tambah WhatsApp Notification
Pakai Twilio API atau WhatsApp Business API (berbayar)

### Export ke CSV
Tambah menu Export di HTML dashboard

---

## 🎯 Expected Output

Setelah 1 jam update pertama, Anda akan melihat:

**Dashboard menampilkan:**
```
📊 IHSG Prediction: 📈 BULLISH (75% confidence)
├─ Technical Signal: +0.45
├─ Sentiment Score: +0.35
└─ Combined: +0.40

📰 Latest News (Update otomatis)
├─ "IHSG Meningkat..." (POSITIVE)
├─ "Rupiah Menguat..." (POSITIVE)
└─ "Inflasi Menurun..." (NEGATIVE)

🎯 Stock Recommendations
├─ BBCA.JK - Perbankan (✅ BUY 85%)
├─ TLKM.JK - Telekomunikasi (✅ BUY 72%)
└─ UNVR.JK - Consumer (❌ SELL -40%)

📊 IHSG Trend Chart
└─ [Chart showing 20 days trend]
```

---

## ❓ FAQ

**Q: Berapa lama update pertama?**
A: ~5 menit setelah trigger pertama jalan

**Q: Biaya berapa?**
A: GRATIS! Semua API gratis, Google Apps Script gratis quota 10M/hari

**Q: Bisa akses dari mobile?**
A: Ya! Dashboard responsive, buka URL Web App di HP

**Q: Data accuracy?**
A: Real-time dari Yahoo Finance yang ter-update setiap menit

**Q: Bisa ubah prediksi frequency?**
A: Ya, ubah trigger dari hourly ke setiap 30 menit atau real-time

---

## 🆘 Support

Jika ada masalah:
1. Check logs di Apps Script (Ctrl+Enter)
2. Cek error di email notification
3. Test manual dengan `testUpdateCycle()`
4. Baca troubleshooting section di atas

---

## 📝 Lisensi

Open source - bebas modify sesuai kebutuhan

---

**Happy trading! 🚀📈**
