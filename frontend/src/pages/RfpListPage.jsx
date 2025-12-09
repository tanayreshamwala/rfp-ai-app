import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Tag, Space, message, Modal } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { getAllRfps, deleteRfp } from "../services/rfpApi";

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

const RfpListPage = () => {
  const navigate = useNavigate();
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isMobile, isTablet } = useBreakpoint();

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
      width: isMobile ? 180 : undefined,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
      ),
      width: isMobile ? 90 : undefined,
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
      width: isMobile ? 120 : undefined,
    },
    {
      title: "Items",
      key: "items",
      render: (record) => record.items?.length || 0,
      width: isMobile ? 70 : undefined,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
      width: isMobile ? 100 : undefined,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="link"
          size={isMobile ? "small" : "small"}
          danger
          icon={<DeleteOutlined />}
          onClick={(e) => handleDelete(record._id, record.title, e)}
          style={{ padding: isMobile ? "4px 8px" : undefined }}
        >
          Delete
        </Button>
      ),
      width: isMobile ? 100 : undefined,
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
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <h1 style={{ margin: 0, fontSize: isMobile ? "20px" : "24px" }}>
          RFPs
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/rfps/create")}
          size={isMobile ? "middle" : "default"}
        >
          {isMobile ? "Create" : "Create RFP"}
        </Button>
      </div>
      <div
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          width: "100%",
        }}
      >
        <Table
          columns={columns}
          dataSource={rfps}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showQuickJumper: !isMobile,
            simple: isMobile,
          }}
          scroll={{ x: isMobile ? "max-content" : undefined }}
          size={isMobile ? "small" : "default"}
          onRow={(record) => ({
            onClick: () => navigate(`/rfps/${record._id}`),
            style: { cursor: "pointer" },
          })}
        />
      </div>
    </div>
  );
};

export default RfpListPage;
