import api from './api';

export const notificationService = {
  /**
   * Get all notifications for authenticated user
   */
  async getNotifications(params?: { unread_only?: boolean; type?: string; limit?: number }) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    const response = await api.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  /**
   * Clear all notifications
   */
  async clearAll() {
    const response = await api.delete('/notifications');
    return response.data;
  },
};

export default notificationService;
