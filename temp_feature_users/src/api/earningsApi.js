import { API_BASE_URL } from "./config";
const API_URL = `${API_BASE_URL}/earnings`;

export async function getEarnings() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Unable to load earnings data");
  }

  const data = await response.json();
  
  // Return the first earnings config object
  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }
  
  return null;
}

export async function deleteEarning(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Unable to delete earning');
  }
  return response.json();
}
