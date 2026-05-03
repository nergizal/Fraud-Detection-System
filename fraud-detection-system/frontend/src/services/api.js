const API_URL = "http://localhost:8000";

export const getTransactions = async () => {
  try {
    const response = await fetch(`${API_URL}/transactions`);
    if (!response.ok) {
      throw new Error("Data could not be retrieved.");
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("API Error:", error);
    return { data: [] };
  }
};

export const getUserStatus = async (id) => {
  try {
    const response = await fetch(`${API_URL}/user-status/${id}`);
    if (!response.ok) {
      throw new Error("User data could not be retrieved.");
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error("API Error:", error);
    return {
      data: {
        total_transactions: 0,
        fraud_count: 0,
        transactions: []
      }
    };
  }
};