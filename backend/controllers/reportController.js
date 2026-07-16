const db = require("../config/db");

// 1. Customer: Apply for Loan
exports.applyForLoan = async (req, res) => {
  const { amount, reason_for_request } = req.body;

  const loanAmount = parseFloat(amount);

  if (isNaN(loanAmount) || loanAmount <= 0) {
    return res.status(400).json({
      message: "Invalid loan amount.",
    });
  }

  try {
    await db.query(
      `INSERT INTO loans
      (user_id, amount, status, reason_for_request)
      VALUES (?, ?, 'Pending', ?)`,
      [
        req.user.id,
        loanAmount,
        reason_for_request || null,
      ]
    );

    res.status(201).json({
      message: "Loan application submitted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// 2. Customer: View Own Loan Applications
exports.getMyLoans = async (req, res) => {
  try {
    const [loans] = await db.query(
      `SELECT
        id,
        amount,
        status,
        reason_for_request,
        created_at
      FROM loans
      WHERE user_id = ?
      ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.status(200).json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// 3. Admin/Employee: View All Loan Applications
exports.getAllLoans = async (req, res) => {
  try {
    const [loans] = await db.query(
      `SELECT
        l.id,
        u.username,
        u.phone,
        l.amount,
        l.status,
        l.reason_for_request,
        l.created_at
      FROM loans l
      JOIN users u
      ON l.user_id = u.id
      ORDER BY l.created_at DESC`
    );

    res.status(200).json(loans);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// 4. Admin/Employee: Approve or Reject Loan
exports.updateLoanStatus = async (req, res) => {
  const { loanId } = req.params;
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({
      message: "Invalid status.",
    });
  }

  try {
    const [loan] = await db.query(
      "SELECT id FROM loans WHERE id = ?",
      [loanId]
    );

    if (loan.length === 0) {
      return res.status(404).json({
        message: "Loan application not found.",
      });
    }

    await db.query(
      "UPDATE loans SET status = ? WHERE id = ?",
      [status, loanId]
    );

    res.status(200).json({
      message: `Loan ${status.toLowerCase()} successfully.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// 5. Admin Report
exports.getSystemReports = async (req, res) => {
  try {
    const [transactions] = await db.query(`
      SELECT
        t.id,
        t.type,
        t.amount,
        t.created_at,
        a.account_number,
        u.username
      FROM transactions t
      JOIN accounts a
      ON t.account_id = a.id
      JOIN users u
      ON a.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 100
    `);

    const [accountsSummary] = await db.query(`
      SELECT
        u.username,
        u.phone,
        a.account_number,
        a.balance,
        a.status
      FROM accounts a
      JOIN users u
      ON a.user_id = u.id
    `);

    const [loanSummary] = await db.query(`
      SELECT
        l.id,
        u.username,
        u.phone,
        l.amount,
        l.status,
        l.created_at
      FROM loans l
      JOIN users u
      ON l.user_id = u.id
      ORDER BY l.created_at DESC
    `);

    res.status(200).json({
      transactionReport: transactions,
      accountSummaryReport: accountsSummary,
      loanReport: loanSummary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};