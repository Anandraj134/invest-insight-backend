const supabase = require('../config/supabaseConfig');
const { encrypt, decrypt } = require('../utils/encryption');

// Function to add a transaction
async function addTransaction(req, res) {
    try {
        const { sensitiveData } = req.body;
        const encryptedData = encrypt(JSON.stringify(sensitiveData));

        const { status, statusText, error } = await supabase
            .from('transactions')
            .insert([{ user_id: req.userId, encrypted_data: encryptedData }]);

        if (error) {
            throw new Error(error.message);
        }

        res.status(201).json({ status, statusText });
    } catch (error) {
        console.error('Error adding transaction:', error.message);
        throw error;
    }
}

async function fetchTransactions(req, res) {

    const { status, data, error } = await supabase
        .from('transactions')
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

module.exports = { addTransaction, fetchTransactions };