const API_BASE = import.meta.env.VITE_API_BASE || "";
export const AUTH_TOKEN_KEY = "MINDMASTER_TOKEN";
export const AUTH_USER_KEY = "MINDMASTER_USER";

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY) || "";
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

export const setAuthUser = (username) => {
  if (username) {
    localStorage.setItem(AUTH_USER_KEY, username);
  } else {
    localStorage.removeItem(AUTH_USER_KEY);
  }
};

const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body:
      options.body && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });

  let data = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else if (response.status !== 204) {
    data = await response.text();
  }

  if (!response.ok) {
    const message =
      (data && data.detail) || (typeof data === "string" && data) || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export default request;
