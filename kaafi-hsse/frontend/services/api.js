const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('kaafi_token');
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const body =
    options.body && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

function saveToken(token) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('kaafi_token', token);
  }
}

function clearToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('kaafi_token');
  }
}

module.exports = {
  API_BASE_URL,
  apiRequest,
  saveToken,
  setToken: saveToken,
  clearToken,
  getToken,
};
