import api from './api';

export const contactService = {
  getContacts: async (params) => {
    const response = await api.get('/contacts', { params });
    return response.data;
  },

  getCustomerContacts: async (customerId, params) => {
    const response = await api.get(`/customers/${customerId}/contacts`, { params });
    return response.data;
  },

  getContact: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  createContact: async (data) => {
    const response = await api.post('/contacts', data);
    return response.data;
  },

  updateContact: async (id, data) => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },

  deleteContact: async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },

  findByPhone: async (phoneNumber) => {
    const response = await api.get(`/contacts/find-by-phone/${encodeURIComponent(phoneNumber)}`);
    return response.data;
  },

  searchByValue: async (value, contactTypeId) => {
    const params = { search: value };
    if (contactTypeId) params.contact_type_id = contactTypeId;

    const response = await api.get('/contacts', { params });
    return response.data;
  },

  getPrimaryContacts: async (customerId) => {
    const response = await api.get(`/customers/${customerId}/contacts`, {
      params: { is_primary: true },
    });
    return response.data;
  },
};

export default contactService;
