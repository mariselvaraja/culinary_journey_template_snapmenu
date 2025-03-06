/**
 * Updates menu.json when a new menu is uploaded
 * @param {Object} transformedMenu - The transformed menu data
 * @returns {Promise<void>}
 */
export async function updateMenuAndEmbeddings(transformedMenu) {
  try {
    // Save menu data
    const menuResponse = await fetch('/api/menu', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transformedMenu)
    });

    if (!menuResponse.ok) {
      throw new Error('Failed to save menu data');
    }

    return {
      success: true,
      message: 'Menu updated successfully'
    };
  } catch (error) {
    console.error('Error updating menu:', error);
    throw {
      success: false,
      message: 'Failed to update menu',
      error: error.message
    };
  }
}
