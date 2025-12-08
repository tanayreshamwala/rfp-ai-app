import { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Card,
  Space,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;

const RfpForm = ({ initialData, onSave, onCancel }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        deliveryDeadline: initialData.deliveryDeadline
          ? dayjs(initialData.deliveryDeadline)
          : null,
      });
    }
  }, [initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        deliveryDeadline: values.deliveryDeadline
          ? values.deliveryDeadline.toISOString()
          : null,
        items: values.items || [],
      };
      onSave(formattedValues);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <Card title="Basic Information" style={{ marginBottom: 16 }}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter a title" }]}
        >
          <Input placeholder="RFP Title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <TextArea rows={4} placeholder="Detailed description" />
        </Form.Item>
      </Card>

      <Card title="Budget & Terms" style={{ marginBottom: 16 }}>
        <Form.Item name="budgetAmount" label="Budget Amount">
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Budget amount"
            min={0}
            formatter={(value) =>
              `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          />
        </Form.Item>

        <Form.Item name="budgetCurrency" label="Currency" initialValue="USD">
          <Input placeholder="USD" />
        </Form.Item>

        <Form.Item name="deliveryDeadline" label="Delivery Deadline">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="paymentTerms" label="Payment Terms">
          <Input placeholder="e.g., Net 30" />
        </Form.Item>

        <Form.Item name="warrantyTerms" label="Warranty Terms">
          <Input placeholder="e.g., 1 year warranty" />
        </Form.Item>
      </Card>

      <Card
        title="Items"
        extra={
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => {
              const items = form.getFieldValue("items") || [];
              form.setFieldsValue({
                items: [...items, { name: "", quantity: 1, specs: "" }],
              });
            }}
          >
            Add Item
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    rules={[{ required: true, message: "Item name required" }]}
                  >
                    <Input placeholder="Item name" style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "quantity"]}
                    rules={[{ required: true, message: "Quantity required" }]}
                  >
                    <InputNumber
                      placeholder="Qty"
                      min={1}
                      style={{ width: 100 }}
                    />
                  </Form.Item>
                  <Form.Item {...restField} name={[name, "specs"]}>
                    <Input
                      placeholder="Specifications"
                      style={{ width: 300 }}
                    />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => remove(name)}
                  />
                </Space>
              ))}
            </>
          )}
        </Form.List>
      </Card>

      <Space>
        <Button type="primary" htmlType="submit">
          Save RFP
        </Button>
        {onCancel && <Button onClick={onCancel}>Back</Button>}
      </Space>
    </Form>
  );
};

export default RfpForm;
