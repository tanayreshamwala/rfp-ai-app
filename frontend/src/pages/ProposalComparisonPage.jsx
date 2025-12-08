import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Button, Spin, message, Tag, Alert } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  getRfpById,
  compareProposals,
  getProposalsForRfp,
} from "../services/rfpApi";

const ProposalComparisonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rfpResponse, proposalsResponse] = await Promise.all([
        getRfpById(id),
        getProposalsForRfp(id),
      ]);
      // API services already return response.data, so response is the actual data
      setRfp(rfpResponse);
      setProposals(proposalsResponse || []);
    } catch (error) {
      message.error("Failed to fetch data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (proposals.length < 2) {
      message.warning("At least 2 proposals are required for comparison");
      return;
    }

    try {
      setComparing(true);
      const response = await compareProposals(id);
      // compareProposals already returns response.data
      setComparison(response);
      // Refresh proposals to get updated AI scores
      const proposalsResponse = await getProposalsForRfp(id);
      setProposals(proposalsResponse || []);
      message.success("Comparison completed!");
    } catch (error) {
      message.error("Failed to compare proposals: " + error.message);
    } finally {
      setComparing(false);
    }
  };

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ display: "block", textAlign: "center", marginTop: 50 }}
      />
    );
  }

  const comparisonColumns = [
    {
      title: "Vendor",
      dataIndex: "vendorId",
      key: "vendor",
      render: (vendor) => vendor?.name || "Unknown",
    },
    {
      title: "Total Price",
      key: "price",
      render: (_, record) => {
        const parsed = record.parsed;
        return `${parsed?.currency || "USD"} ${
          parsed?.totalPrice?.toLocaleString() || "N/A"
        }`;
      },
    },
    {
      title: "Delivery",
      key: "delivery",
      render: (_, record) => {
        const days = record.parsed?.deliveryDays;
        return days ? `${days} days` : "N/A";
      },
    },
    {
      title: "Payment Terms",
      dataIndex: ["parsed", "paymentTerms"],
      key: "paymentTerms",
      render: (terms) => terms || "N/A",
    },
    {
      title: "Warranty",
      dataIndex: ["parsed", "warranty"],
      key: "warranty",
      render: (warranty) => warranty || "N/A",
    },
    {
      title: "AI Score",
      key: "score",
      render: (_, record) => {
        if (record.aiScore !== undefined) {
          const color =
            record.aiScore >= 80
              ? "green"
              : record.aiScore >= 60
              ? "orange"
              : "red";
          return <Tag color={color}>{record.aiScore}/100</Tag>;
        }
        return "-";
      },
      sorter: (a, b) => (b.aiScore || 0) - (a.aiScore || 0),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/rfps/${id}`)}
        >
          Back to RFP
        </Button>
      </div>

      <h1>Compare Proposals: {rfp?.title}</h1>

      {proposals.length < 2 ? (
        <Alert
          message="Insufficient Proposals"
          description="You need at least 2 proposals to compare. Currently you have {proposals.length} proposal(s)."
          type="warning"
          style={{ marginBottom: 16 }}
        />
      ) : (
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={handleCompare} loading={comparing}>
            {comparison ? "Refresh Comparison" : "Compare with AI"}
          </Button>
        </div>
      )}

      <Card title="Proposals Comparison" style={{ marginBottom: 16 }}>
        <Table
          columns={comparisonColumns}
          dataSource={proposals}
          rowKey="_id"
          pagination={false}
        />
      </Card>

      {comparison && (
        <>
          <Card title="AI Evaluation" style={{ marginBottom: 16 }}>
            {comparison.evaluations?.map((eval_, index) => {
              // Backend already matches evaluations correctly by vendorIndex
              // Use vendorName from evaluation which is already correctly set
              return (
                <Card
                  key={eval_.vendorId || index}
                  type="inner"
                  title={eval_.vendorName || `Vendor ${eval_.vendorIndex + 1}`}
                  style={{ marginBottom: 16 }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <strong>Score: </strong>
                    <Tag
                      color={
                        eval_.score >= 80
                          ? "green"
                          : eval_.score >= 60
                          ? "orange"
                          : "red"
                      }
                    >
                      {eval_.score}/100
                    </Tag>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Summary: </strong>
                    {eval_.summary}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Pros: </strong>
                    <ul>
                      {eval_.pros?.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Cons: </strong>
                    <ul>
                      {eval_.cons?.map((con, i) => (
                        <li key={i}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </Card>

          <Card
            title="AI Recommendation"
            style={{
              border: "2px solid #1890ff",
              backgroundColor: "#e6f7ff",
            }}
          >
            <Alert
              message={`Recommended: ${
                comparison.evaluations?.find(
                  (eval_) =>
                    eval_.vendorIndex === comparison.recommendedVendorIndex
                )?.vendorName ||
                "Vendor " + (comparison.recommendedVendorIndex + 1)
              }`}
              type="success"
              style={{ marginBottom: 16 }}
            />
            <div style={{ marginBottom: 16 }}>
              <strong>Recommended Vendor Details:</strong>
              {(() => {
                const recommendedEval = comparison.evaluations?.find(
                  (eval_) =>
                    eval_.vendorIndex === comparison.recommendedVendorIndex
                );
                if (recommendedEval) {
                  return (
                    <div style={{ marginTop: 8 }}>
                      <p>
                        <strong>Score:</strong> {recommendedEval.score}/100
                      </p>
                      <p>
                        <strong>Summary:</strong> {recommendedEval.summary}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <div>
              <strong>Explanation:</strong>
              <p style={{ marginTop: 8 }}>{comparison.overallExplanation}</p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProposalComparisonPage;
