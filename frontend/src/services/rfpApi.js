import api from "./api";

/**
 * RFP API service
 */

export const createRfpFromText = async (text) => {
  const response = await api.post("/rfps/from-text", { text });
  return response.data;
};

export const getAllRfps = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) {
    params.append("status", filters.status);
  }
  const queryString = params.toString();
  const url = `/rfps${queryString ? `?${queryString}` : ""}`;
  const response = await api.get(url);
  return response.data;
};

export const getRfpById = async (id) => {
  const response = await api.get(`/rfps/${id}`);
  return response.data;
};

export const updateRfp = async (id, data) => {
  const response = await api.put(`/rfps/${id}`, data);
  return response.data;
};

export const deleteRfp = async (id) => {
  const response = await api.delete(`/rfps/${id}`);
  return response;
};

export const sendRfpToVendors = async (id, vendorIds, customMessage = "") => {
  const response = await api.post(`/rfps/${id}/send`, {
    vendorIds,
    customMessage,
  });
  return response.data;
};

export const getProposalsForRfp = async (rfpId) => {
  const response = await api.get(`/rfps/${rfpId}/proposals`);
  return response.data;
};

export const compareProposals = async (rfpId) => {
  const response = await api.post(`/rfps/${rfpId}/compare`);
  return response.data;
};
