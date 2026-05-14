export const apiCall = async (action, payload = {}) => {
  try {
    const response = await fetch('/api/gas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Error (${action}):`, error);
    return {
      success: false,
      message: 'Ralat sambungan ke pelayan: ' + error.message,
    };
  }
};
