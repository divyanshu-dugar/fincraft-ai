/**
 * Calculate the amount remaining to reach the goal
 * @param {number} targetAmount - Total goal amount
 * @param {number} savedAmount - Amount already saved
 * @returns {number} Amount remaining
 */
export const calculateAmountRemaining = (targetAmount, savedAmount = 0) => {
  return Math.max(0, targetAmount - (savedAmount || 0));
};

/**
 * Calculate monthly savings needed
 * @param {number} targetAmount - Total goal amount
 * @param {number} daysRemaining - Days until deadline
 * @param {number} savedAmount - Amount already saved
 * @returns {number} Monthly savings needed
 */
export const calculateMonthlySavings = (targetAmount, daysRemaining, savedAmount = 0) => {
  if (daysRemaining <= 0) return 0;
  
  const amountRemaining = calculateAmountRemaining(targetAmount, savedAmount);
  const monthsRemaining = daysRemaining / 30.44; // Average days in a month
  
  return monthsRemaining > 0 ? amountRemaining / monthsRemaining : 0;
};

/**
 * Calculate yearly savings needed
 * @param {number} targetAmount - Total goal amount
 * @param {number} daysRemaining - Days until deadline
 * @param {number} savedAmount - Amount already saved
 * @returns {number} Yearly savings needed
 */
export const calculateYearlySavings = (targetAmount, daysRemaining, savedAmount = 0) => {
  if (daysRemaining <= 0) return 0;
  
  const amountRemaining = calculateAmountRemaining(targetAmount, savedAmount);
  const yearsRemaining = daysRemaining / 365.25; // Average days in a year
  
  return yearsRemaining > 0 ? amountRemaining / yearsRemaining : 0;
};

/**
 * Calculate daily savings needed
 * @param {number} targetAmount - Total goal amount
 * @param {number} daysRemaining - Days until deadline
 * @param {number} savedAmount - Amount already saved
 * @returns {number} Daily savings needed
 */
export const calculateDailySavings = (targetAmount, daysRemaining, savedAmount = 0) => {
  if (daysRemaining <= 0) return 0;
  
  const amountRemaining = calculateAmountRemaining(targetAmount, savedAmount);
  return amountRemaining / daysRemaining;
};

/**
 * Get savings calculation summary
 * @param {object} goal - Goal object with targetAmount, savedAmount, deadline
 * @param {number} daysRemaining - Days remaining
 * @returns {object} Object with all calculations
 */
export const getSavingsCalculations = (goal, daysRemaining) => {
  const targetAmount = goal.amount || 0;
  const savedAmount = goal.savedAmount || 0;
  
  return {
    amountRemaining: calculateAmountRemaining(targetAmount, savedAmount),
    dailySavings: calculateDailySavings(targetAmount, daysRemaining, savedAmount),
    monthlySavings: calculateMonthlySavings(targetAmount, daysRemaining, savedAmount),
    yearlySavings: calculateYearlySavings(targetAmount, daysRemaining, savedAmount),
    daysRemaining,
  };
};
