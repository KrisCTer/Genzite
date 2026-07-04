import apiClient from './client';

export interface OrderPayload {
  items: Array<{ id: string; quantity: number }>;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  paymentMethod?: string;
}

export const createOrderApi = async (siteId: string, payload: OrderPayload) => {
  const response = await apiClient.post('/commerce/orders', payload, {
    headers: {
      'x-site-id': siteId
    }
  });
  return response.data;
};

export const createPaymentSessionApi = async (siteId: string, orderId: string) => {
  const response = await apiClient.post(`/commerce/payments/${orderId}/session`, {}, {
    headers: {
      'x-site-id': siteId
    }
  });
  return response.data;
};
