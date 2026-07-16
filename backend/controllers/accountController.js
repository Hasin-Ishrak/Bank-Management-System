const db = require("../config/db");
const { generateAccountNumber } = require("../utils/accountGenerator");

// 1. Open a New Account (Admin/Employee Only)
exports.createAccount = async (req, res) => {
  const { user_id, initial_deposit } = req.body;

  if (!user_id) {
    return res
      .status(400)
      .json({ message: "User ID is required." });
  }

  const depositAmount = initial_deposit
    ? parseFloat(initial_deposit)
    : 0;

  if (isNaN(depositAmount) || depositAmount < 0) {
    return res
      .status(400)
      .json({ message: "Invalid initial deposit amount." });
  }

  try {
    const [users] = await db.query(
      "SELECT id FROM users WHERE id = ?",
      [user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    let accountNumber = generateAccountNumber();

    while (true) {
      const [exists] = await db.query(
        "SELECT id FROM accounts WHERE account_number = ?",
        [accountNumber]
      );

      if (exists.length === 0) break;

      accountNumber = generateAccountNumber();
    }

    await db.query(
      `INSERT INTO accounts
      (user_id, account_number, balance, status)
      VALUES (?, ?, ?, 'Active')`,
      [user_id, accountNumber, depositAmount]
    );

    res.status(201).json({
      message: "Account created successfully.",
      account_number: accountNumber,
      balance: depositAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// 2. Get Account Details
exports.getAccountDetails = async (req, res) => {
  const targetUserId =
    req.user.role === "Customer"
      ? req.user.id
      : req.params.userId;

  try {
    const [accounts] = await db.query(
      `SELECT
          u.id,
          u.username,
          u.phone,
          u.role,
          a.account_number,
          a.balance,
          a.status,
          a.created_at
       FROM users u
       LEFT JOIN accounts a
       ON u.id = a.user_id
       WHERE u.id = ?`,
      [targetUserId]
    );

    if (accounts.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json(accounts[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};

// 3. Deactivate Account (Admin/Employee Only)
exports.deactivateAccount = async (req, res) => {
  const { accountNumber } = req.params;

  try {
    const [accounts] = await db.query(
      "SELECT id FROM accounts WHERE account_number = ?",
      [accountNumber]
    );

    if (accounts.length === 0) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    await db.query(
      `UPDATE accounts
       SET status='Inactive'
       WHERE account_number=?`,
      [accountNumber]
    );

    res.status(200).json({
      message: "Account deactivated successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};