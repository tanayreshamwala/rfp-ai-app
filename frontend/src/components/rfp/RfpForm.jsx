import { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Card,
  Space,
  Row,
  Col,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;

// Hook to detect screen size
const useBreakpoint = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile, isTablet };
};

const RfpForm = ({ initialData, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const { isMobile, isTablet } = useBreakpoint();

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
      <Card
        title="Basic Information"
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
      >
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
          <TextArea rows={isMobile ? 3 : 4} placeholder="Detailed description" />
        </Form.Item>
      </Card>

      <Card
        title="Budget & Terms"
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
      >
        <Row gutter={isMobile ? 0 : 16}>
          <Col xs={24} sm={12}>
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
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="budgetCurrency" label="Currency" initialValue="USD">
              <Input placeholder="USD" />
            </Form.Item>
          </Col>
        </Row>

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
            size={isMobile ? "small" : "default"}
          >
            {isMobile ? "Add" : "Add Item"}
          </Button>
        }
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
      >
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div
                  key={key}
                  style={{
                    marginBottom: 16,
                    padding: isMobile ? 8 : 12,
                    border: "1px solid #f0f0f0",
                    borderRadius: 4,
                  }}
                >
                  {isMobile ? (
                    // Mobile: Stack vertically
                    <>
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        rules={[
                          { required: true, message: "Item name required" },
                        ]}
                        style={{ marginBottom: 12 }}
                      >
                        <Input placeholder="Item name" />
                      </Form.Item>
                      <Row gutter={8}>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "quantity"]}
                            rules={[
                              { required: true, message: "Quantity required" },
                            ]}
                          >
                            <InputNumber
                              placeholder="Qty"
                              min={1}
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            {...restField}
                            name={[name, "specs"]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Specifications" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        size="small"
                        style={{ marginTop: 8 }}
                      >
                        Remove
                      </Button>
                    </>
                  ) : (
                    // Desktop: Horizontal layout
                    <Space
                      style={{ display: "flex", width: "100%" }}
                      align="baseline"
                    >
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        rules={[
                          { required: true, message: "Item name required" },
                        ]}
                        style={{ flex: 1, minWidth: 200 }}
                      >
                        <Input placeholder="Item name" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "quantity"]}
                        rules={[
                          { required: true, message: "Quantity required" },
                        ]}
                        style={{ width: 100 }}
                      >
                        <InputNumber placeholder="Qty" min={1} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, "specs"]}
                        style={{ flex: 1, minWidth: 200 }}
                      >
                        <Input placeholder="Specifications" />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    </Space>
                  )}
                </div>
              ))}
            </>
          )}
        </Form.List>
      </Card>

      <Space
        direction={isMobile ? "vertical" : "horizontal"}
        style={{ width: isMobile ? "100%" : undefined }}
        size="middle"
      >
        <Button
          type="primary"
          htmlType="submit"
          size={isMobile ? "large" : "default"}
          block={isMobile}
        >
          Save RFP
        </Button>
        {onCancel && (
          <Button
            onClick={onCancel}
            size={isMobile ? "large" : "default"}
            block={isMobile}
          >
            Back
          </Button>
        )}
      </Space>
    </Form>
  );
};

export default RfpForm;
