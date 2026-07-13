const db = require('../config/db');

// 1. Customer: Apply for a Loan
exports.applyForLoan = async (req, res) => {
    const { amount, repayment_details } = req.body;
    const loanAmount = parseFloat(amount);

    if (isNaN(loanAmount) || loanAmount <= 0) {
        return res.status(400).json({ message: 'Invalid loan amount requested.' });
    }

    try {
        await db.query(
            'INSERT INTO loans (user_id, amount, status, repayment_details) VALUES (?, ?, "Pending", ?)',
            [req.user.id, loanAmount, repayment_details || 'Standard terms']
        );
        res.status(201).json({ message: 'Loan application submitted successfully and is pending approval.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing loan application.' });
    }
};

// 2. Admin: Approve or Reject a Loan
exports.updateLoanStatus = async (req, res) => {
    const { loanId } = req.params;
    const { status } = req.body; // Expecting 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status update option.' });
    }

    try {
        const [loan] = await db.query('SELECT * FROM loans WHERE id = ?', [loanId]);
        if (loan.length === 0) {
            return res.status(404).json({ message: 'Loan application record not found.' });
        }

        await db.query('UPDATE loans SET status = ? WHERE id = ?', [status, loanId]);
        res.status(200).json({ message: `Loan status successfully updated to ${status}.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update loan record.' });
    }
};

// 3. System High Performance Analytics Reports (Optimized with structured joins)
exports.getSystemReports = async (req, res) => {
    try {
        // Query 1: Full Transaction History log with Account Numbers and Usernames
        const [transactions] = await db.query(`
            SELECT t.id, t.type, t.amount, t.created_at, a.account_number, u.username
            FROM transactions t
            JOIN accounts a ON t.account_id = a.id
            JOIN users u ON a.user_id = u.id
            ORDER BY t.created_at DESC LIMIT 100
        `);

        // Query 2: Customer Active Account Summaries
        const [accountsSummary] = await db.query(`
            SELECT u.username, a.account_number, a.balance, a.status 
            FROM accounts a
            JOIN users u ON a.user_id = u.id
        `);

        // Query 3: Loan Portfolio Summary
        const [loansSummary] = await db.query(`
            SELECT l.id, u.username, l.amount, l.status, l.created_at 
            FROM loans l
            JOIN users u ON l.user_id = u.id
            ORDER BY l.created_at DESC
        `);

        res.status(200).json({
            transactionReport: transactions,
            accountSummaryReport: accountsSummary,
            loanReport: loansSummary
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error compiling reporting engine datasets.' });
    }
};