import React, { useState } from 'react';
import { Drawer, Button, List, Typography, Space, Divider, Form, Input, message } from 'antd';
import { ShoppingCartOutlined, DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useCartStore } from '../store/cart';
import { createOrderApi, createPaymentSessionApi } from '../api/commerce';

const { Title, Text } = Typography;

interface CartDrawerProps {
  siteId: string;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ siteId }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore();
  const [messageApi, contextHolder] = message.useMessage();

  const handleCheckout = async (values: any) => {
    if (items.length === 0) {
      messageApi.error('Giỏ hàng trống!');
      return;
    }

    setLoading(true);
    try {
      // 1. Tạo đơn hàng
      const orderPayload = {
        customerName: values.name,
        customerEmail: values.email,
        shippingAddress: values.address,
        paymentMethod: 'PAYOS',
        items: items.map(item => ({ id: item.id, quantity: item.quantity }))
      };
      
      const order = await createOrderApi(siteId, orderPayload);
      
      // 2. Lấy link thanh toán PayOS
      const paymentSession = await createPaymentSessionApi(siteId, order.id);
      
      clearCart();
      messageApi.success('Chuyển hướng đến cổng thanh toán...');
      
      // 3. Chuyển hướng sang trang PayOS giả lập
      window.location.href = paymentSession.qrCodeUrl;
      
    } catch (error: any) {
      console.error(error);
      messageApi.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      
      {/* Nút Floating Action Button (FAB) */}
      <Button 
        type="primary" 
        size="large"
        shape="circle" 
        icon={<ShoppingCartOutlined />} 
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          width: 64,
          height: 64,
          boxShadow: '0 8px 24px rgba(20, 184, 166, 0.4)',
          background: 'var(--color-accent)',
          borderColor: 'var(--color-accent)'
        }}
        onClick={() => setOpen(true)}
      >
        {totalItems > 0 && (
          <div style={{
            position: 'absolute',
            top: -5,
            right: -5,
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '12px'
          }}>
            {totalItems}
          </div>
        )}
      </Button>

      {/* Drawer Giỏ hàng */}
      <Drawer
        title={<Title level={4} style={{ margin: 0 }}>Giỏ hàng của bạn</Title>}
        placement="right"
        width={400}
        onClose={() => setOpen(false)}
        open={open}
        styles={{
          body: { paddingBottom: 80, background: 'var(--gz-dark-1)' },
          header: { background: 'var(--gz-dark-2)', borderBottom: '1px solid var(--color-border)' }
        }}
      >
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 100 }}>
            <ShoppingCartOutlined style={{ fontSize: 64, color: 'var(--color-border)' }} />
            <Title level={5} style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>Giỏ hàng đang trống</Title>
          </div>
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={() => removeItem(item.id)} 
                    />
                  ]}
                  style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                >
                  <List.Item.Meta
                    avatar={item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} /> : <div style={{ width: 64, height: 64, background: 'var(--gz-dark-3)', borderRadius: 8 }} />}
                    title={<Text style={{ color: 'var(--color-text-primary)' }}>{item.name}</Text>}
                    description={
                      <Space direction="vertical" size={4}>
                        <Text style={{ color: 'var(--color-accent)' }}>{item.price.toLocaleString()}đ</Text>
                        <Space.Compact>
                          <Button size="small" icon={<MinusOutlined />} onClick={() => updateQuantity(item.id, item.quantity - 1)} />
                          <Input size="small" style={{ width: 40, textAlign: 'center', background: 'transparent' }} value={item.quantity} readOnly />
                          <Button size="small" icon={<PlusOutlined />} onClick={() => updateQuantity(item.id, item.quantity + 1)} />
                        </Space.Compact>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
            
            <Divider style={{ borderColor: 'var(--color-border)' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <Title level={4} style={{ color: 'var(--color-text-primary)', margin: 0 }}>Tổng cộng:</Title>
              <Title level={4} style={{ color: 'var(--color-accent)', margin: 0 }}>{totalPrice.toLocaleString()}đ</Title>
            </div>

            <Title level={5} style={{ color: 'var(--color-text-primary)' }}>Thông tin giao hàng</Title>
            <Form form={form} layout="vertical" onFinish={handleCheckout}>
              <Form.Item name="name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input placeholder="Họ và tên" size="large" />
              </Form.Item>
              <Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ' }]}>
                <Input placeholder="Email liên hệ" size="large" />
              </Form.Item>
              <Form.Item name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng' }]}>
                <Input.TextArea placeholder="Địa chỉ giao hàng" rows={3} size="large" />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large" 
                  block 
                  loading={loading}
                  style={{ background: 'var(--color-accent)', borderColor: 'var(--color-accent)', marginTop: 16 }}
                >
                  Thanh toán qua PayOS
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Drawer>
    </>
  );
};

export default CartDrawer;
