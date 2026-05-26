/**
 * FINANCE API HANDLER
 * Google Finance & Yahoo Finance Integration
 * Free APIs - No API Key Required!
 */

// ==================== YAHOO FINANCE API ====================

/**
 * Get stock data from Yahoo Finance (No API Key needed)
 * @param {string} ticker - Stock symbol (e.g., "BBCA.JK", "^JKSE")
 * @param {string} interval - 1m, 5m, 15m, 30m, 1h, 1d (default: 1d)
 * @param {number} range - 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
 * @returns {Object} Stock data
 */
function getYahooFinanceData(ticker, interval = '1d', range = '1y') {
  try {
    // Yahoo Finance historical data endpoint
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price,summaryDetail,financialData`;
    
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    
    if (response.getResponseCode() !== 200) {
      Logger.log('Yahoo Finance API Error: ' + response.getResponseCode());
      return null;
    }
    
    const data = JSON.parse(response.getContentText());
    
    if (!data.quoteSummary || !data.quoteSummary.result || !data.quoteSummary.result[0]) {
      Logger.log('No data from Yahoo Finance for ' + ticker);
      return null;
    }
    
    const result = data.quoteSummary.result[0];
    const price = result.price;
    const summary = result.summaryDetail;
    
    return {
      ticker: ticker,
      price: price.regularMarketPrice.raw,
      previousClose: price.regularMarketPreviousClose.raw,
      open: price.regularMarketOpen.raw,
      high: summary.fiftyTwoWeekHigh.raw,
      low: summary.fiftyTwoWeekLow.raw,
      volume: summary.volume.raw,
      marketCap: result.financialData.marketCap.raw,
      pe: result.financialData.trailingPE.raw || 0,
      pbRatio: result.financialData.priceToBook.raw || 0,
      change: price.regularMarketPrice.raw - price.regularMarketPreviousClose.raw,
      changePercent: ((price.regularMarketPrice.raw - price.regularMarketPreviousClose.raw) / price.regularMarketPreviousClose.raw * 100).toFixed(2),
      currency: price.currency,
      timestamp: new Date()
    };
  } catch (e) {
    Logger.log('Error fetching Yahoo Finance: ' + e.toString());
    return null;
  }
}

/**
 * Get IHSG (Jakarta Composite Index) data
 * Ticker: ^JKSE
 */
function getIHSGFromYahooFinance() {
  return getYahooFinanceData('^JKSE');
}

/**
 * Get multiple stocks data
 */
function getMultipleStocksYahoo(tickers = []) {
  const defaultTickers = ['BBCA.JK', 'BBRI.JK', 'BNI.JK', 'BMRI.JK', 'UNVR.JK'];
  const tickersToFetch = tickers.length > 0 ? tickers : defaultTickers;
  
  const results = [];
  
  tickersToFetch.forEach(ticker => {
    const data = getYahooFinanceData(ticker);
    if (data) {
      results.push(data);
    }
    Utilities.sleep(500); // Rate limiting
  });
  
  return results;
}

// ==================== ALTERNATIVE: ALPHA VANTAGE (Free) ====================

/**
 * Get stock data from Alpha Vantage
 * Free tier: 5 calls/min, 500 calls/day
 * Get free API key at: https://www.alphavantage.co/
 */
function getAlphaVantageData(symbol, apiKey) {
  try {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(response.getContentText());
    
    if (!data['Global Quote']) {
      Logger.log('No data from Alpha Vantage for ' + symbol);
      return null;
    }
    
    const quote = data['Global Quote'];
    
    return {
      ticker: symbol,
      price: parseFloat(quote['05. price']),
      previousClose: parseFloat(quote['08. previous close']),
      open: parseFloat(quote['02. open']),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'],
      timestamp: new Date()
    };
  } catch (e) {
    Logger.log('Error fetching Alpha Vantage: ' + e.toString());
    return null;
  }
}

// ==================== GOOGLE SHEETS - DIRECT FINANCE DATA ====================

/**
 * Gunakan GOOGLEFINANCE function built-in Google Sheets
 * Contoh penggunaan di Sheets: =GOOGLEFINANCE("NASDAQ:GOOG", "price")
 * 
 * Untuk Indonesia (JSX):
 * =GOOGLEFINANCE("IDX:JKSE") - IHSG
 * =GOOGLEFINANCE("JSE:BBCA") - BCA
 * =GOOGLEFINANCE("JSE:TLKM") - Telkomsel
 */

/**
 * Setup Google Finance data in Sheets
 */
function setupGoogleFinanceInSheets() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
    .getSheetByName('Finance_Data');
  
  if (!sheet) {
    SpreadsheetApp.openById(CONFIG.SHEET_ID)
      .insertSheet('Finance_Data');
  }
  
  const headers = ['Timestamp', 'Ticker', 'Price', 'Change', '% Change', 'Volume', 'Market Cap', 'PE Ratio'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Add formulas for popular Indonesian stocks
  const stocks = [
    ['=NOW()', '=GOOGLEFINANCE("IDX:JKSE")', '=GOOGLEFINANCE("IDX:JKSE","price")', '=GOOGLEFINANCE("IDX:JKSE","change")', '=GOOGLEFINANCE("IDX:JKSE","changepercent")', '=GOOGLEFINANCE("IDX:JKSE","volume")', '-', '-'],
    ['=NOW()', '=GOOGLEFINANCE("JSE:BBCA")', '=GOOGLEFINANCE("JSE:BBCA","price")', '=GOOGLEFINANCE("JSE:BBCA","change")', '=GOOGLEFINANCE("JSE:BBCA","changepercent")', '=GOOGLEFINANCE("JSE:BBCA","volume")', '=GOOGLEFINANCE("JSE:BBCA","marketcap")', '=GOOGLEFINANCE("JSE:BBCA","pe")'],
    ['=NOW()', '=GOOGLEFINANCE("JSE:BBRI")', '=GOOGLEFINANCE("JSE:BBRI","price")', '=GOOGLEFINANCE("JSE:BBRI","change")', '=GOOGLEFINANCE("JSE:BBRI","changepercent")', '=GOOGLEFINANCE("JSE:BBRI","volume")', '=GOOGLEFINANCE("JSE:BBRI","marketcap")', '=GOOGLEFINANCE("JSE:BBRI","pe")'],
    ['=NOW()', '=GOOGLEFINANCE("JSE:BNI")', '=GOOGLEFINANCE("JSE:BNI","price")', '=GOOGLEFINANCE("JSE:BNI","change")', '=GOOGLEFINANCE("JSE:BNI","changepercent")', '=GOOGLEFINANCE("JSE:BNI","volume")', '=GOOGLEFINANCE("JSE:BNI","marketcap")', '=GOOGLEFINANCE("JSE:BNI","pe")'],
    ['=NOW()', '=GOOGLEFINANCE("JSE:BMRI")', '=GOOGLEFINANCE("JSE:BMRI","price")', '=GOOGLEFINANCE("JSE:BMRI","change")', '=GOOGLEFINANCE("JSE:BMRI","changepercent")', '=GOOGLEFINANCE("JSE:BMRI","volume")', '=GOOGLEFINANCE("JSE:BMRI","marketcap")', '=GOOGLEFINANCE("JSE:BMRI","pe")'],
    ['=NOW()', '=GOOGLEFINANCE("JSE:UNVR")', '=GOOGLEFINANCE("JSE:UNVR","price")', '=GOOGLEFINANCE("JSE:UNVR","change")', '=GOOGLEFINANCE("JSE:UNVR","changepercent")', '=GOOGLEFINANCE("JSE:UNVR","volume")', '=GOOGLEFINANCE("JSE:UNVR","marketcap")', '=GOOGLEFINANCE("JSE:UNVR","pe")'],
    ['=NOW()', '=GOOGLEFINANCE("JSE:TLKM")', '=GOOGLEFINANCE("JSE:TLKM","price")', '=GOOGLEFINANCE("JSE:TLKM","change")', '=GOOGLEFINANCE("JSE:TLKM","changepercent")', '=GOOGLEFINANCE("JSE:TLKM","volume")', '=GOOGLEFINANCE("JSE:TLKM","marketcap")', '=GOOGLEFINANCE("JSE:TLKM","pe")'],
    ['=NOW()', '=GOOGLEFINANCE("JSE:ASII")', '=GOOGLEFINANCE("JSE:ASII","price")', '=GOOGLEFINANCE("JSE:ASII","change")', '=GOOGLEFINANCE("JSE:ASII","changepercent")', '=GOOGLEFINANCE("JSE:ASII","volume")', '=GOOGLEFINANCE("JSE:ASII","marketcap")', '=GOOGLEFINANCE("JSE:ASII","pe")'],
  ];
  
  sheet.getRange(2, 1, stocks.length, 8).setFormulas(stocks);
}

// ==================== ALTERNATIVE: FINNHUB API ====================

/**
 * Get stock data from Finnhub
 * Free API Key from: https://finnhub.io/dashboard
 * Limitations: 60 calls/minute on free tier
 */
function getFinnhubData(symbol, finnhubApiKey) {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`;
    
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(response.getContentText());
    
    if (!data.c) {
      Logger.log('No data from Finnhub for ' + symbol);
      return null;
    }
    
    return {
      ticker: symbol,
      price: data.c,
      high: data.h,
      low: data.l,
      open: data.o,
      previousClose: data.pc,
      timestamp: new Date(data.t * 1000),
      change: data.c - data.pc,
      changePercent: ((data.c - data.pc) / data.pc * 100).toFixed(2)
    };
  } catch (e) {
    Logger.log('Error fetching Finnhub: ' + e.toString());
    return null;
  }
}

// ==================== POLYGON.IO API ====================

/**
 * Get stock data from Polygon.io
 * Free API Key from: https://polygon.io/
 */
function getPolygonData(ticker, polygonApiKey) {
  try {
    const url = `https://api.polygon.io/v1/open-close/${ticker}/${new Date().toISOString().split('T')[0]}?apiKey=${polygonApiKey}`;
    
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(response.getContentText());
    
    if (!data.status || data.status !== 'OK') {
      Logger.log('No data from Polygon for ' + ticker);
      return null;
    }
    
    return {
      ticker: ticker,
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      volume: data.volume,
      afterHours: data.afterHours,
      preMarket: data.preMarket,
      timestamp: new Date(data.from)
    };
  } catch (e) {
    Logger.log('Error fetching Polygon: ' + e.toString());
    return null;
  }
}

// ==================== IDX (INDONESIA STOCK EXCHANGE) UNOFFICIAL API ====================

/**
 * Get IHSG data from IDX
 * Note: IDX tidak punya official API publik, gunakan unofficial scraper
 */
function getIHSGFromIDX() {
  try {
    // Alternative: Use web scraping dengan jsoup atau cheerio simulation
    const url = 'https://www.idx.co.id/en/';
    
    const response = UrlFetchApp.fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() !== 200) {
      Logger.log('Cannot fetch IDX website');
      return null;
    }
    
    const content = response.getContentText();
    
    // Extract IHSG value using regex
    const ihsgMatch = content.match(/IHSG[^\d]+([\d,]+)/);
    const changeMatch = content.match(/Change[^\d]+([\d,\-\.]+)/);
    
    if (ihsgMatch && changeMatch) {
      return {
        value: parseFloat(ihsgMatch[1].replace(/,/g, '')),
        change: parseFloat(changeMatch[1].replace(/,/g, '')),
        timestamp: new Date()
      };
    }
    
    return null;
  } catch (e) {
    Logger.log('Error fetching IHSG from IDX: ' + e.toString());
    return null;
  }
}

// ==================== MASTER FUNCTION: GET REAL-TIME DATA ====================

/**
 * Master function untuk ambil data dari multiple sources
 * Fallback ke berbagai API jika satu gagal
 */
function getRealTimeMarketData(ticker) {
  Logger.log('🔄 Fetching real-time data for ' + ticker);
  
  let data = null;
  
  // Try Yahoo Finance first (paling reliable)
  Logger.log('Trying Yahoo Finance...');
  data = getYahooFinanceData(ticker);
  if (data) {
    Logger.log('✅ Data dari Yahoo Finance');
    return data;
  }
  
  // Try Alpha Vantage
  if (CONFIG.API_KEYS && CONFIG.API_KEYS.alphaVantage) {
    Logger.log('Trying Alpha Vantage...');
    data = getAlphaVantageData(ticker, CONFIG.API_KEYS.alphaVantage);
    if (data) {
      Logger.log('✅ Data dari Alpha Vantage');
      return data;
    }
  }
  
  // Try Finnhub
  if (CONFIG.API_KEYS && CONFIG.API_KEYS.finnhub) {
    Logger.log('Trying Finnhub...');
    data = getFinnhubData(ticker, CONFIG.API_KEYS.finnhub);
    if (data) {
      Logger.log('✅ Data dari Finnhub');
      return data;
    }
  }
  
  Logger.log('❌ Tidak ada data dari API manapun');
  return null;
}

/**
 * Get IHSG comprehensive data
 */
function getIHSGComprehensive() {
  let ihsgData = null;
  
  // Try Yahoo Finance first
  ihsgData = getIHSGFromYahooFinance();
  if (ihsgData) {
    Logger.log('✅ IHSG data from Yahoo Finance');
    return ihsgData;
  }
  
  // Fallback to IDX scraping
  ihsgData = getIHSGFromIDX();
  if (ihsgData) {
    Logger.log('✅ IHSG data from IDX');
    return ihsgData;
  }
  
  Logger.log('❌ Cannot fetch IHSG data');
  return null;
}

/**
 * Get market snapshot (multiple stocks at once)
 */
function getMarketSnapshot() {
  const snapshot = {
    ihsg: getIHSGComprehensive(),
    topStocks: getMultipleStocksYahoo([
      '^JKSE',    // IHSG
      'BBCA.JK',  // BCA
      'BBRI.JK',  // BRI
      'BNI.JK',   // BNI
      'BMRI.JK',  // Mandiri
      'UNVR.JK',  // Unilever
      'TLKM.JK',  // Telkomsel
      'ASII.JK'   // Astra
    ]),
    timestamp: new Date()
  };
  
  return snapshot;
}

/**
 * Save market snapshot to Sheets
 */
function saveMarketSnapshot() {
  const snapshot = getMarketSnapshot();
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
    .getSheetByName('Market_Snapshot');
  
  if (!snapshot.topStocks || snapshot.topStocks.length === 0) {
    Logger.log('No stocks data to save');
    return;
  }
  
  const rows = snapshot.topStocks.map(stock => [
    new Date(),
    stock.ticker,
    stock.price,
    stock.change,
    stock.changePercent,
    stock.volume,
    stock.marketCap || '-',
    stock.pe || '-'
  ]);
  
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 8).setValues(rows);
}

// ==================== TEST FUNCTIONS ====================

/**
 * Test semua API
 */
function testAllAPIs() {
  Logger.log('=== TESTING ALL FINANCE APIS ===\n');
  
  // Test Yahoo Finance
  Logger.log('1️⃣ Testing Yahoo Finance...');
  const yhData = getYahooFinanceData('BBCA.JK');
  Logger.log('Result: ' + JSON.stringify(yhData, null, 2));
  
  // Test IHSG
  Logger.log('\n2️⃣ Testing IHSG...');
  const ihsg = getIHSGComprehensive();
  Logger.log('Result: ' + JSON.stringify(ihsg, null, 2));
  
  // Test multiple stocks
  Logger.log('\n3️⃣ Testing Multiple Stocks...');
  const multiple = getMultipleStocksYahoo(['BBCA.JK', 'TLKM.JK', 'UNVR.JK']);
  Logger.log('Result: ' + JSON.stringify(multiple, null, 2));
  
  // Test market snapshot
  Logger.log('\n4️⃣ Testing Market Snapshot...');
  const snapshot = getMarketSnapshot();
  Logger.log('Result: ' + JSON.stringify(snapshot, null, 2));
  
  Logger.log('\n✅ All tests completed!');
}

/**
 * Quick test single stock
 */
function quickTest() {
  const data = getYahooFinanceData('BBCA.JK');
  Logger.log(JSON.stringify(data, null, 2));
}
