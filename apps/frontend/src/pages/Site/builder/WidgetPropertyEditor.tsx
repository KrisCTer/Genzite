import React, { useEffect } from 'react';
import { Form, Input, Card, Empty } from 'antd';

const { TextArea } = Input;

interface WidgetPropertyEditorProps {
  widget: any | null;
  onChange: (newConfig: any) => void;
}

const WidgetPropertyEditor: React.FC<WidgetPropertyEditorProps> = ({ widget, onChange }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (widget) {
      form.setFieldsValue({
        contentConfig: JSON.stringify(widget.contentConfig, null, 2),
      });
    }
  }, [widget, form]);

  if (!widget) {
    return (
      <Card title="Properties" bordered={false} style={{ height: '100%' }}>
        <Empty description="Select a widget on the canvas to edit its properties." />
      </Card>
    );
  }

  const handleValuesChange = (changedValues: any) => {
    if (changedValues.contentConfig) {
      try {
        const parsed = JSON.parse(changedValues.contentConfig);
        onChange(parsed);
      } catch (e) {
        // Ignore invalid JSON while typing
      }
    }
  };

  return (
    <Card title={`Edit ${widget.type}`} bordered={false} style={{ height: '100%', overflowY: 'auto' }}>
      <Form form={form} layout="vertical" onValuesChange={handleValuesChange}>
        <Form.Item
          name="contentConfig"
          label="Content Config (JSON)"
          extra="Modify the JSON object below to update the widget in real-time."
        >
          <TextArea rows={20} style={{ fontFamily: 'monospace', fontSize: '12px' }} />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default WidgetPropertyEditor;
