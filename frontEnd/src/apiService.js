// API Service for Family Tree Backend
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const defaultHeaders = {
  "Content-Type": "application/json",
};

// Helper function for API calls
const apiCall = async (endpoint, method = "GET", body = null, token = null) => {
  const headers = { ...defaultHeaders };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    throw error;
  }
};

// User API
export const userAPI = {
  create: async (userData) => {
    const response = await apiCall("/api/users/", "POST", userData);
    return response.data;
  },

  get: async (userId) => {
    const response = await apiCall(`/api/users/${userId}`, "GET");
    return response.data;
  },

  update: async (userId, userData) => {
    const response = await apiCall(`/api/users/${userId}`, "PUT", userData);
    return response.data;
  },

  delete: async (userId) => {
    const response = await apiCall(`/api/users/${userId}`, "DELETE");
    return response;
  },
};

// Relations API
export const relationsAPI = {
  add: async (userId, relationData) => {
    // Filter out empty string values - backend expects null or valid data
    const cleanData = {};
    for (const [key, value] of Object.entries(relationData)) {
      if (value !== "" && value !== null && value !== undefined) {
        cleanData[key] = value;
      }
    }
    const response = await apiCall(
      `/api/relations/${userId}`,
      "POST",
      cleanData,
    );
    return response.data;
  },

  getAll: async (userId) => {
    const response = await apiCall(`/api/relations/${userId}`, "GET");
    return response.data.relations || [];
  },

  get: async (userId, relationId) => {
    const response = await apiCall(
      `/api/relations/${userId}/${relationId}`,
      "GET",
    );
    return response.data;
  },

  update: async (userId, relationId, relationData) => {
    const response = await apiCall(
      `/api/relations/${userId}/${relationId}`,
      "PUT",
      relationData,
    );
    return response.data;
  },

  delete: async (userId, relationId) => {
    const response = await apiCall(
      `/api/relations/${userId}/${relationId}`,
      "DELETE",
    );
    return response;
  },
};

// Health Check
export const healthAPI = {
  check: async () => {
    try {
      const response = await fetch(`${API_URL}/api/health/`, {
        method: "GET",
        headers: defaultHeaders,
      });
      return response.ok;
    } catch (error) {
      console.error("Backend health check failed:", error);
      return false;
    }
  },
};

export default apiCall;
