import { API_URL } from './config';

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error('Cannot reach the server. Check your Wi-Fi and the API address.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let message = data.message || 'Something went wrong';
    if (data.errors) {
      message = Object.values(data.errors).flat().join('\n');
    }
    throw new Error(message);
  }

  return data;
}