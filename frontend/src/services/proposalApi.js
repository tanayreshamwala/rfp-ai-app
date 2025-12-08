import api from "./api";

/**
 * Proposal API service
 */

export const getProposalById = async (id) => {
  const response = await api.get(`/proposals/${id}`);
  return response.data;
};

export const updateProposalStatus = async (id, status) => {
  const response = await api.put(`/proposals/${id}/status`, { status });
  return response.data;
};
