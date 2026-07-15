const db = require("../config/db");
const { generateAccountNumber } = require("../utils/accountGenerator");

// 1. Open a New Account (Typically performed by Admin/Employee or automated for new customers)
exports.createAccount = async (req, res) => {
  const { user_id, initial_deposit } = req.body;

  if (!user_id) {
    return res
      .status(400)
      .json({ message: "User ID is required to bind the account." });
  }

  const depositAmount = initial_deposit ? parseFloat(initial_deposit) : 0.0;
  if (depositAmount < 0) {
    return res
      .status(400)
      .json({ message: "Initial deposit cannot be negative." });
  }

  try {
    // Verify the target user exists first
    const [userExists] = await db.query("SELECT id FROM users WHERE id = ?", [
      user_id,
    ]);
    if (userExists.length === 0) {
      return res
        .status(404)
        .json({ message: "The specified User ID does not exist." });
    }

    // Generate a random unique account number
    let accountNumber = generateAccountNumber();

    // Safety check loop to ensure absolute uniqueness in database collision instances
    let isUnique = false;
    while (!isUnique) {
      const [duplicate] = await db.query(
        "SELECT id FROM accounts WHERE account_number = ?",
        [accountNumber],
      );
      if (duplicate.length === 0) {
        isUnique = true;
      } else {
        accountNumber = generateAccountNumber();
      }
    }

    // Create the account row
    await db.query(
      'INSERT INTO accounts (user_id, account_number, balance, status) VALUES (?, ?, ?, "Active")',
      [user_id, accountNumber, depositAmount],
    );

    res.status(201).json({
      message: "Bank account opened successfully.",
      account_number: accountNumber,
      initial_balance: depositAmount,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error while creating account." });
  }
};

// 2. Fetch Account Summary (Profile info + balance)
exports.getAccountDetails = async (req, res) => {
  // Customers can only see their own profile, Admins/Employees can see anyone's profile
  const targetUserId =
    req.user.role === "Customer" ? req.user.id : req.params.userId;

  try {
    const [profile] = await db.query(
      `SELECT u.id, u.username, u.role, a.account_number, a.balance, a.status 
             FROM users u 
             LEFT JOIN accounts a ON u.id = a.user_id 
             WHERE u.id = ?`,
      [targetUserId],
    );

    if (profile.length === 0) {
      return res.status(404).json({ message: "User profile data not found." });
    }

    res.status(200).json({ data: profile[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving profile." });
  }
};

// 3. Deactivate/Suspend Account (Admin/Employee only privilege)
exports.deactivateAccount = async (req, res) => {
  const { accountNumber } = req.params;

  try {
    const [account] = await db.query(
      "SELECT id FROM accounts WHERE account_number = ?",
      [accountNumber],
    );
    if (account.length === 0) {
      return res
        .status(404)
        .json({ message: "Target account number not found." });
    }

    await db.query(
      'UPDATE accounts SET status = "Inactive" WHERE account_number = ?',
      [accountNumber],
    );
    res
      .status(200)
      .json({
        message: `Account ${accountNumber} has been successfully deactivated.`,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Database failure during account adjustment." });
  }
};
