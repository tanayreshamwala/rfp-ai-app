import { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getAllVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../services/vendorApi";

const VendorListPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await getAllVendors();
      // getAllVendors returns response.data which is the vendors array
      setVendors(response || []);
    } catch (error) {
      message.error("Failed to fetch vendors: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVendor(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    form.setFieldsValue(vendor);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Delete Vendor",
      content: "Are you sure you want to delete this vendor?",
      onOk: async () => {
        try {
          await deleteVendor(id);
          message.success("Vendor deleted successfully");
          fetchVendors();
        } catch (error) {
          message.error("Failed to delete vendor: " + error.message);
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingVendor) {
        await updateVendor(editingVendor._id, values);
        message.success("Vendor updated successfully");
      } else {
        await createVendor(values);
        message.success("Vendor created successfully");
      }
      setModalVisible(false);
      form.resetFields();
      fetchVendors();
    } catch (error) {
      message.error("Failed to save vendor: " + error.message);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => category || "-",
    },
    {
      title: "Tags",
      dataIndex: "tags",
      key: "tags",
      render: (tags) => (
        <>
          {tags && tags.length > 0
            ? tags.map((tag, i) => <Tag key={i}>{tag}</Tag>)
            : "-"}
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>Vendors</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Add Vendor
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={vendors}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingVendor ? "Edit Vendor" : "Add Vendor"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter vendor name" }]}
          >
            <Input placeholder="Vendor name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="vendor@example.com" />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Input placeholder="e.g., IT, Office Supplies" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Additional notes..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VendorListPage;
