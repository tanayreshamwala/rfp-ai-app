import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  message,
  Spin,
  Select,
  Modal,
  Input,
  Popconfirm,
} from "antd";
import { SendOutlined, SwapOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  getRfpById,
  sendRfpToVendors,
  getProposalsForRfp,
  deleteRfp,
} from "../services/rfpApi";
import { getAllVendors } from "../services/vendorApi";
import RfpForm from "../components/rfp/RfpForm";
import { updateRfp } from "../services/rfpApi";
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

const RfpDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [customMessage, setCustomMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rfpResponse, vendorsResponse, proposalsResponse] =
        await Promise.all([
          getRfpById(id),
          getAllVendors({ isActive: true }),
          getProposalsForRfp(id),
        ]);
      // API services already return response.data, so response is the actual data
      setRfp(rfpResponse);
      setVendors(vendorsResponse || []);
      setProposals(proposalsResponse || []);
    } catch (error) {
      message.error("Failed to fetch data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRfp = async () => {
    if (selectedVendors.length === 0) {
      message.warning("Please select at least one vendor");
      return;
    }

    try {
      setSending(true);
      await sendRfpToVendors(id, selectedVendors, customMessage);
      message.success("RFP sent successfully!");
      setSendModalVisible(false);
      setSelectedVendors([]);
      setCustomMessage("");
      fetchData(); // Refresh data
    } catch (error) {
      message.error("Failed to send RFP: " + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleSaveRfp = async (formData) => {
    try {
      setLoading(true);
      await updateRfp(id, formData);
      message.success("RFP updated successfully!");
      setEditing(false);
      fetchData();
    } catch (error) {
      message.error("Failed to update RFP: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteRfp(id);
      message.success("RFP deleted successfully");
      navigate("/rfps"); // Redirect to RFP list after deletion
    } catch (error) {
      message.error("Failed to delete RFP: " + error.message);
    } finally {
      setLoading(false);
    }
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

  if (loading && !rfp) {
    return (
      <Spin
        size="large"
        style={{ display: "block", textAlign: "center", marginTop: 50 }}
      />
    );
  }

  if (!rfp) {
    return <div>RFP not found</div>;
  }

  if (editing) {
    return (
      <div>
        <h1>Edit RFP</h1>
        <RfpForm
          initialData={rfp}
          onSave={handleSaveRfp}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: 12,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: isMobile ? "20px" : "24px",
            wordWrap: "break-word",
          }}
        >
          {rfp.title}
        </h1>
        <Space
          direction={isMobile ? "vertical" : "horizontal"}
          style={{ width: isMobile ? "100%" : undefined }}
          size="small"
          wrap
        >
          <Button
            onClick={() => setEditing(true)}
            size={isMobile ? "middle" : "default"}
            block={isMobile}
          >
            Edit
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setSendModalVisible(true)}
            disabled={rfp.status === "closed"}
            size={isMobile ? "middle" : "default"}
            block={isMobile}
          >
            {isMobile ? "Send" : "Send to Vendors"}
          </Button>
          {proposals.length >= 2 && (
            <Button
              type="default"
              icon={<SwapOutlined />}
              onClick={() => navigate(`/rfps/${id}/compare`)}
              size={isMobile ? "middle" : "default"}
              block={isMobile}
            >
              {isMobile ? "Compare" : "Compare Proposals"}
            </Button>
          )}
          <Popconfirm
            title="Delete RFP"
            description={`Are you sure you want to delete "${rfp.title}"? This action cannot be undone.`}
            onConfirm={handleDelete}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size={isMobile ? "middle" : "default"}
              block={isMobile}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Card
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
      >
        <Descriptions
          column={{ xs: 1, sm: 1, md: 2 }}
          bordered
          size={isMobile ? "small" : "default"}
        >
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(rfp.status)}>
              {rfp.status.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created">
            {new Date(rfp.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Budget" span={2}>
            {rfp.budgetAmount
              ? `${
                  rfp.budgetCurrency || "USD"
                } ${rfp.budgetAmount.toLocaleString()}`
              : "Not specified"}
          </Descriptions.Item>
          <Descriptions.Item label="Delivery Deadline" span={2}>
            {rfp.deliveryDeadline
              ? new Date(rfp.deliveryDeadline).toLocaleDateString()
              : "Not specified"}
          </Descriptions.Item>
          <Descriptions.Item label="Payment Terms" span={2}>
            {rfp.paymentTerms || "Not specified"}
          </Descriptions.Item>
          <Descriptions.Item label="Warranty Terms" span={2}>
            {rfp.warrantyTerms || "Not specified"}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {rfp.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Items"
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
      >
        {rfp.items && rfp.items.length > 0 ? (
          <ul style={{ paddingLeft: isMobile ? 20 : 24 }}>
            {rfp.items.map((item, index) => (
              <li
                key={index}
                style={{
                  marginBottom: 8,
                  wordWrap: "break-word",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                <strong>{item.name}</strong> - Quantity: {item.quantity}
                {item.specs && ` - Specs: ${item.specs}`}
              </li>
            ))}
          </ul>
        ) : (
          <p>No items specified</p>
        )}
      </Card>

      <Card
        title={`Proposals (${proposals.length})`}
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
      >
        {proposals.length > 0 ? (
          <ul style={{ paddingLeft: isMobile ? 20 : 24 }}>
            {proposals.map((proposal) => (
              <li
                key={proposal._id}
                style={{
                  marginBottom: 8,
                  wordWrap: "break-word",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                <strong>{proposal.vendorId?.name || "Unknown Vendor"}</strong> -{" "}
                {proposal.parsed?.currency || "USD"}{" "}
                {proposal.parsed?.totalPrice || "N/A"} -{" "}
                {proposal.parsed?.deliveryDays
                  ? `${proposal.parsed.deliveryDays} days`
                  : "N/A"}
              </li>
            ))}
          </ul>
        ) : (
          <p>No proposals received yet</p>
        )}
      </Card>

      <Modal
        title="Send RFP to Vendors"
        open={sendModalVisible}
        onOk={handleSendRfp}
        onCancel={() => {
          setSendModalVisible(false);
          setSelectedVendors([]);
          setCustomMessage("");
        }}
        confirmLoading={sending}
        okText="Send"
        width={isMobile ? "90%" : 520}
        style={{ top: isMobile ? 20 : undefined }}
      >
        <div style={{ marginBottom: 16 }}>
          <label>Select Vendors:</label>
          <Select
            mode="multiple"
            style={{ width: "100%", marginTop: 8 }}
            placeholder="Select vendors"
            value={selectedVendors}
            onChange={setSelectedVendors}
            options={vendors.map((v) => ({
              label: `${v.name} (${v.email})`,
              value: v._id,
            }))}
          />
        </div>
        <div>
          <label>Custom Message (Optional):</label>
          <TextArea
            rows={4}
            style={{ marginTop: 8 }}
            placeholder="Add any additional notes for vendors..."
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default RfpDetailPage;
