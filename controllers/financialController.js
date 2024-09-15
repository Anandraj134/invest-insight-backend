const supabase = require('../config/supabaseConfig');
const axios = require('axios');
const { encrypt, decrypt } = require('../utils/encryption');

async function addFinancialDetail(req, res) {
  const { sensitiveData } = req.body;
  const encryptedData = encrypt(JSON.stringify(sensitiveData));

  const { status, statusText, error } = await supabase
    .from('financial_details')
    .insert([{ user_id: req.userId, encrypted_data: encryptedData }]);

  if (error) {
    return res.status(400).json({ message: error.message });
  }
  res.status(201).json({ status, statusText });
}

async function fetchFinancialDetail(req, res) {
  const { status, data, error } = await supabase
    .from('financial_details')
    .select('*')
    .eq('user_id', req.userId);

  if (error) {
    return res.status(400).json({ message: error.message });
  }

  const decryptedData = data.map(item => {
    try {
      const decryptedJson = decrypt(item.encrypted_data);
      return {
        ...item,
        decrypted_data: JSON.parse(decryptedJson)
      };
    } catch (err) {
      console.error('Error decrypting or parsing data:', err);
      return {
        ...item,
        decrypted_data: 'Error decrypting data'
      };
    }
  });

  console.log(decryptedData);
  res.status(200).json({ data: decryptedData, status });
}

// Function to get real-time stock price from API
async function getStockPrice(symbol) {
  const options = {
    method: 'GET',
    url: 'https://real-time-finance-data.p.rapidapi.com/stock-time-series',
    params: { symbol, period: '1D', language: 'en' },
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY, // Store this in your .env file
      'x-rapidapi-host': 'real-time-finance-data.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    const stockData = response.data.data;
    return stockData.price;
  } catch (error) {
    console.error('Error fetching stock price:', error.message);
    return null;
  }
}

async function getMutualFundPrice(ISIN) {
  const options = {
    method: 'GET',
    url: 'https://latest-mutual-fund-nav.p.rapidapi.com/latest?Scheme_Type=Open',
    params: { ISIN, period: '1D', language: 'en' },
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY, // Store this in your .env file
      'x-rapidapi-host': 'latest-mutual-fund-nav.p.rapidapi.com',
    },
  };

  try {
    const response = await axios.request(options);
    const MFData = response.data[0];
    return MFData.Net_Asset_Value;
  } catch (error) {
    console.error('Error fetching stock price:', error.message);
    return null;
  }
}

async function calculateTotalValue(req, res) {
  try {
    const { data, error } = await supabase
      .from('financial_details')
      .select('encrypted_data')
      .eq('user_id', req.userId);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    let totalFD = 0;
    let totalPPF = 0;
    let totalNSC = 0;
    let totalStocks = 0;
    let totalMF = 0;

    for (const item of data) {
      const decryptedData = JSON.parse(decrypt(item.encrypted_data));

      if (decryptedData) {
        switch (decryptedData.type) {
          case 'FD':
            totalFD += decryptedData.amount;
            break;
          case 'PPF':
            totalPPF += decryptedData.amount;
            break;
          case 'NSC':
            totalNSC += decryptedData.amount;
            break;
          case 'Stocks':
            if (decryptedData.symbol) {
              const currentPrice = await getStockPrice(decryptedData.symbol);
              if (currentPrice) {
                const stockValue = Math.round(decryptedData.purchase_lot * currentPrice);
                totalStocks += stockValue;
              }
            }
            break;
          case 'MF':
            if (decryptedData.ISIN) {
              const currentPrice = await getMutualFundPrice(decryptedData.ISIN);
              if (currentPrice) {
                const MFValue = Math.round(decryptedData.Units * currentPrice);
                totalMF += MFValue;
              }
            }
            break;
          default:
            break;
        }
      }
    }

    const totalValue = {
      FD: totalFD,
      PPF: totalPPF,
      NSC: totalNSC,
      Stocks: totalStocks,
      MF: totalMF,
      total: totalFD + totalPPF + totalNSC + totalStocks + totalMF,
    };

    res.status(200).json({ totalValue });
  } catch (err) {
    console.error('Error calculating total financial value:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { addFinancialDetail, fetchFinancialDetail, calculateTotalValue };
