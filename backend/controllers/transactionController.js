const db = require("../config/db");

// 1. Deposit
exports.deposit = async (req, res) => {
  const { account_number, amount } = req.body;
  const depositAmount = parseFloat(amount);

  if (!account_number || isNaN(depositAmount) || depositAmount <= 0) {
    return res
      .status(400)
      .json({ message: "Invalid account number or amount." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [accounts] = await connection.query(
      `SELECT id, user_id, balance, status
       FROM accounts
       WHERE account_number = ?
       FOR UPDATE`,
      [account_number]
    );

    if (accounts.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    const account = accounts[0];

    if (account.status !== "Active") {
      await connection.rollback();
      return res.status(400).json({
        message: "Account is inactive.",
      });
    }

    if (
      req.user.role === "Customer" &&
      account.user_id !== req.user.id
    ) {
      await connection.rollback();
      return res.status(403).json({
        message: "You can only deposit into your own account.",
      });
    }

    const newBalance =
      parseFloat(account.balance) + depositAmount;

    await connection.query(
      "UPDATE accounts SET balance=? WHERE id=?",
      [newBalance, account.id]
    );

    await connection.query(
      `INSERT INTO transactions
      (account_id,type,amount)
      VALUES (?, 'Deposit', ?)`,
      [account.id, depositAmount]
    );

    await connection.commit();

    res.status(200).json({
      message: "Deposit successful.",
      new_balance: newBalance,
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({
      message: "Transaction failed.",
    });
  } finally {
    connection.release();
  }
};

// 2. Withdraw
exports.withdraw = async (req, res) => {
  const { account_number, amount } = req.body;

  const withdrawAmount = parseFloat(amount);

  if (!account_number || isNaN(withdrawAmount) || withdrawAmount <= 0) {
    return res.status(400).json({
      message: "Invalid account number or amount.",
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [accounts] = await connection.query(
      `SELECT id,user_id,balance,status
       FROM accounts
       WHERE account_number=?
       FOR UPDATE`,
      [account_number]
    );

    if (accounts.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    const account = accounts[0];

    if (account.status !== "Active") {
      await connection.rollback();
      return res.status(400).json({
        message: "Account is inactive.",
      });
    }

    if (
      req.user.role === "Customer" &&
      account.user_id !== req.user.id
    ) {
      await connection.rollback();
      return res.status(403).json({
        message: "You can only withdraw from your own account.",
      });
    }

    if (parseFloat(account.balance) < withdrawAmount) {
      await connection.rollback();
      return res.status(400).json({
        message: "Insufficient balance.",
      });
    }

    const newBalance =
      parseFloat(account.balance) - withdrawAmount;

    await connection.query(
      "UPDATE accounts SET balance=? WHERE id=?",
      [newBalance, account.id]
    );

    await connection.query(
      `INSERT INTO transactions
      (account_id,type,amount)
      VALUES (?, 'Withdrawal', ?)`,
      [account.id, withdrawAmount]
    );

    await connection.commit();

    res.status(200).json({
      message: "Withdrawal successful.",
      new_balance: newBalance,
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({
      message: "Transaction failed.",
    });
  } finally {
    connection.release();
  }
};

// 3. Transfer
exports.transfer = async (req, res) => {
  const {
    source_account_number,
    target_account_number,
    amount,
  } = req.body;

  const transferAmount = parseFloat(amount);

  if (
    !source_account_number ||
    !target_account_number ||
    isNaN(transferAmount) ||
    transferAmount <= 0
  ) {
    return res.status(400).json({
      message: "Invalid transfer request.",
    });
  }

  if (source_account_number === target_account_number) {
    return res.status(400).json({
      message: "Cannot transfer to the same account.",
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [sourceAccounts] = await connection.query(
      `SELECT id,user_id,balance,status
       FROM accounts
       WHERE account_number=?
       FOR UPDATE`,
      [source_account_number]
    );

    const [targetAccounts] = await connection.query(
      `SELECT id,balance,status
       FROM accounts
       WHERE account_number=?
       FOR UPDATE`,
      [target_account_number]
    );

    if (
      sourceAccounts.length === 0 ||
      targetAccounts.length === 0
    ) {
      await connection.rollback();
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    const source = sourceAccounts[0];
    const target = targetAccounts[0];

    if (
      source.status !== "Active" ||
      target.status !== "Active"
    ) {
      await connection.rollback();
      return res.status(400).json({
        message: "Both accounts must be active.",
      });
    }

    if (
      req.user.role === "Customer" &&
      source.user_id !== req.user.id
    ) {
      await connection.rollback();
      return res.status(403).json({
        message: "You can only transfer from your own account.",
      });
    }

    if (parseFloat(source.balance) < transferAmount) {
      await connection.rollback();
      return res.status(400).json({
        message: "Insufficient balance.",
      });
    }

    await connection.query(
      "UPDATE accounts SET balance=? WHERE id=?",
      [
        parseFloat(source.balance) - transferAmount,
        source.id,
      ]
    );

    await connection.query(
      "UPDATE accounts SET balance=? WHERE id=?",
      [
        parseFloat(target.balance) + transferAmount,
        target.id,
      ]
    );

    await connection.query(
      `INSERT INTO transactions
      (account_id,type,amount,target_account_id)
      VALUES (?, 'Transfer', ?, ?)`,
      [source.id, transferAmount, target.id]
    );

    await connection.commit();

    res.status(200).json({
      message: "Transfer successful.",
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({
      message: "Transaction failed.",
    });
  } finally {
    connection.release();
  }
};

// 4. Customer: View Own Transaction History
exports.getMyTransactions = async (req, res) => {
  try {
    const [transactions] = await db.query(
      `SELECT
          t.id,
          a.account_number,
          t.type,
          t.amount,
          ta.account_number AS target_account,
          t.created_at
      FROM transactions t
      JOIN accounts a
      ON t.account_id = a.id
      LEFT JOIN accounts ta
      ON t.target_account_id = ta.id
      WHERE a.user_id = ?
      ORDER BY t.created_at DESC`,
      [req.user.id]
    );

    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// 5. Admin/Employee: View All Transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const [transactions] = await db.query(
      `SELECT
          t.id,
          u.username,
          u.phone,
          a.account_number,
          t.type,
          t.amount,
          ta.account_number AS target_account,
          t.created_at
      FROM transactions t
      JOIN accounts a
      ON t.account_id = a.id
      JOIN users u
      ON a.user_id = u.id
      LEFT JOIN accounts ta
      ON t.target_account_id = ta.id
      ORDER BY t.created_at DESC`
    );

    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};