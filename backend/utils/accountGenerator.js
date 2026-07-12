/**
 * Generates a unique 12-digit random account number string
 */
exports.generateAccountNumber = () => {
    const branchCode = "101"; // Standard prefix for your bank
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000).toString(); // 9 random digits
    return branchCode + randomDigits;
};