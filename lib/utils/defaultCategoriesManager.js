import { getToken } from '@/lib/authenticate';
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '@/lib/constants/defaultCategories';

/**
 * Create default categories for a newly registered user
 * Called immediately after signup (one-time only)
 */
export async function createDefaultCategories() {
  try {
    const token = getToken();
    if (!token) {
      console.warn('No token found for creating default categories');
      return false;
    }

    // Create expense categories
    const expensePromises = DEFAULT_EXPENSE_CATEGORIES.map((category) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/expense-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `jwt ${token}`,
        },
        body: JSON.stringify(category),
      })
    );

    // Create income categories
    const incomePromises = DEFAULT_INCOME_CATEGORIES.map((category) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `jwt ${token}`,
        },
        body: JSON.stringify(category),
      })
    );

    // Wait for all category creation requests
    const allPromises = [...expensePromises, ...incomePromises];
    const results = await Promise.allSettled(allPromises);

    // Check if at least some categories were created successfully
    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    console.log(
      `Created ${successCount} default categories for new user`
    );

    return successCount > 0;
  } catch (error) {
    console.error('Error creating default categories:', error);
    return false;
  }
}

/**
 * Restore default categories when user wants to
 * Called explicitly by user action only
 */
export async function restoreDefaultCategories(endpoint) {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const isExpense = endpoint.includes('expense');
    const defaults = isExpense
      ? DEFAULT_EXPENSE_CATEGORIES
      : DEFAULT_INCOME_CATEGORIES;

    const promises = defaults.map((category) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `jwt ${token}`,
        },
        body: JSON.stringify(category),
      })
    );

    const results = await Promise.allSettled(promises);
    const successCount = results.filter((r) => r.status === 'fulfilled').length;

    if (successCount === 0) {
      throw new Error('Failed to restore default categories');
    }

    console.log(`Restored ${successCount} default categories`);
    return true;
  } catch (error) {
    console.error('Error restoring default categories:', error);
    throw error;
  }
}
