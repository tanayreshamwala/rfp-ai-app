import api from "./api";

/**
 * Vendor API service
 */

export const createVendor = async (data) => {
  const response = await api.post("/vendors", data);
  return response.data;
};

export const getAllVendors = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.isActive !== undefined) {
    params.append("isActive", filters.isActive);
  }
  if (filters.category) {
    params.append("category", filters.category);
  }
  const queryString = params.toString();
  const url = `/vendors${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  // API interceptor already returns response.data, so response is { success, count, data }
  return response.data;
};

export const getVendorById = async (id) => {
  const response = await api.get(`/vendors/${id}`);
  return response.data;
};

export const updateVendor = async (id, data) => {
  const response = await api.put(`/vendors/${id}`, data);
  return response.data;
};

export const deleteVendor = async (id) => {
  const response = await api.delete(`/vendors/${id}`);
  return response;
};
