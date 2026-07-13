const db = require('../config/db');

// 1. Process Deposit
exports.deposit = async (req, res) => {
    const { account_number, amount } = req.body;
    const depositAmount = parseFloat(amount);

    if (!account_number || isNaN(depositAmount) || depositAmount <= 0) {
        return res.status(400).json({ message: 'Invalid account number or deposit amount.' });
    }

    // Obtain a dedicated database connection client for the transaction lifecycle
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction(); // Start ACID Transaction

        // Verify account exists and lock row for update to prevent concurrent race conditions
        const [accounts] = await connection.query(
            'SELECT id, balance, status FROM accounts WHERE account_number = ? FOR UPDATE', 
            [account_number]
        );

        if (accounts.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Account not found.' });
        }

        if (accounts[0].status !== 'Active') {
            await connection.rollback();
            return res.status(400).json({ message: 'Cannot deposit into an inactive account.' });
        }

        const accountId = accounts[0].id;
        const newBalance = parseFloat(accounts[0].balance) + depositAmount;

        // Update Account Balance
        await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);

        // Log Transaction History
        await connection.query(
            'INSERT INTO transactions (account_id, type, amount) VALUES (?, "Deposit", ?)',
            [accountId, depositAmount]
        );

        await connection.commit(); // Save changes permanently
        res.status(200).json({ message: 'Deposit successful.', new_balance: newBalance });
    } catch (error) {
        await connection.rollback(); // Undo everything if an error occurs
        console.error(error);
        res.status(500).json({ message: 'Transaction failed. Rollback executed.' });
    } finally {
        connection.release(); // Return connection back to the pool
    }
};

// 2. Process Withdrawal
exports.withdraw = async (req, res) => {
    const { account_number, amount } = req.body;
    const withdrawAmount = parseFloat(amount);

    if (!account_number || isNaN(withdrawAmount) || withdrawAmount <= 0) {
        return res.status(400).json({ message: 'Invalid account number or withdrawal amount.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [accounts] = await connection.query(
            'SELECT id, balance, status FROM accounts WHERE account_number = ? FOR UPDATE', 
            [account_number]
        );

        if (accounts.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Account not found.' });
        }

        if (accounts[0].status !== 'Active') {
            await connection.rollback();
            return res.status(400).json({ message: 'Account is inactive.' });
        }

        if (parseFloat(accounts[0].balance) < withdrawAmount) {
            await connection.rollback();
            return res.status(400).json({ message: 'Insufficient funds for this withdrawal.' });
        }

        const accountId = accounts[0].id;
        const newBalance = parseFloat(accounts[0].balance) - withdrawAmount;

        // Update Account Balance
        await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [newBalance, accountId]);

        // Log Transaction History
        await connection.query(
            'INSERT INTO transactions (account_id, type, amount) VALUES (?, "Withdrawal", ?)',
            [accountId, withdrawAmount]
        );

        await connection.commit();
        res.status(200).json({ message: 'Withdrawal successful.', new_balance: newBalance });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Transaction failed. Rollback executed.' });
    } finally {
        connection.release();
    }
};

// 3. Process Fund Transfer Between Two Accounts
exports.transfer = async (req, res) => {
    const { source_account_number, target_account_number, amount } = req.body;
    const transferAmount = parseFloat(amount);

    if (!source_account_number || !target_account_number || isNaN(transferAmount) || transferAmount <= 0) {
        return res.status(400).json({ message: 'Invalid account references or transfer amount.' });
    }

    if (source_account_number === target_account_number) {
        return res.status(400).json({ message: 'Source and target accounts cannot be identical.' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Lock and retrieve Source Account
        const [sourceAccounts] = await connection.query(
            'SELECT id, balance, status FROM accounts WHERE account_number = ? FOR UPDATE', 
            [source_account_number]
        );
        // 2. Lock and retrieve Target Account
        const [targetAccounts] = await connection.query(
            'SELECT id, balance, status FROM accounts WHERE account_number = ? FOR UPDATE', 
            [target_account_number]
        );

        if (sourceAccounts.length === 0 || targetAccounts.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'One or both bank accounts were not found.' });
        }

        if (sourceAccounts[0].status !== 'Active' || targetAccounts[0].status !== 'Active') {
            await connection.rollback();
            return res.status(400).json({ message: 'Both accounts must be active to complete a transfer.' });
        }

        if (parseFloat(sourceAccounts[0].balance) < transferAmount) {
            await connection.rollback();
            return res.status(400).json({ message: 'Insufficient funds to execute transfer.' });
        }

        const srcId = sourceAccounts[0].id;
        const destId = targetAccounts[0].id;

        const newSrcBalance = parseFloat(sourceAccounts[0].balance) - transferAmount;
        const newDestBalance = parseFloat(targetAccounts[0].balance) + transferAmount;

        // Apply changes: Deduct from source, add to target
        await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [newSrcBalance, srcId]);
        await connection.query('UPDATE accounts SET balance = ? WHERE id = ?', [newDestBalance, destId]);

        // Log the structural Transfer interaction
        await connection.query(
            'INSERT INTO transactions (account_id, type, amount, target_account_id) VALUES (?, "Transfer", ?, ?)',
            [srcId, transferAmount, destId]
        );

        await connection.commit();
        res.status(200).json({ message: 'Fund transfer processed successfully.' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Transfer runtime failure. Rollback complete.' });
    } finally {
        connection.release();
    }
};