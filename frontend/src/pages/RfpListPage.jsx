import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Tag, Space, message, Modal } from "antd";
import { PlusOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { getAllRfps, deleteRfp } from "../services/rfpApi";

const RfpListPage = () => {
  const navigate = useNavigate();
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRfps();
  }, []);

  const fetchRfps = async () => {
    try {
      setLoading(true);
      const response = await getAllRfps();
      // getAllRfps returns response.data which is the RFPs array
      setRfps(response || []);
    } catch (error) {
      message.error("Failed to fetch RFPs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rfpId, rfpTitle, e) => {
    // Stop event propagation to prevent row click
    e?.stopPropagation();

    Modal.confirm({
      title: "Delete RFP",
      content: `Are you sure you want to delete "${rfpTitle}"? This action cannot be undone.`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteRfp(rfpId);
          message.success("RFP deleted successfully");
          fetchRfps(); // Refresh the list
        } catch (error) {
          message.error("Failed to delete RFP: " + error.message);
        }
      },
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "default",
      sent: "processing",
      closed: "success",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Budget",
      key: "budget",
      render: (record) => {
        if (record.budgetAmount) {
          return `${
            record.budgetCurrency || "USD"
          } ${record.budgetAmount.toLocaleString()}`;
        }
        return "-";
      },
    },
    {
      title: "Items",
      key: "items",
      render: (record) => record.items?.length || 0,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/rfps/${record._id}`);
            }}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => handleDelete(record._id, record.title, e)}
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
          alignItems: "center",
        }}
      >
        <h1>RFPs</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/rfps/create")}
        >
          Create RFP
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={rfps}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => navigate(`/rfps/${record._id}`),
          style: { cursor: "pointer" },
        })}
      />
    </div>
  );
};

export default RfpListPage;
