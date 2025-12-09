import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Table, Button, Spin, message, Tag, Alert } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  getRfpById,
  compareProposals,
  getProposalsForRfp,
} from "../services/rfpApi";

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

const ProposalComparisonPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const { isMobile, isTablet } = useBreakpoint();

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
      width: isMobile ? 150 : undefined,
      ellipsis: true,
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
      width: isMobile ? 130 : undefined,
    },
    {
      title: "Delivery",
      key: "delivery",
      render: (_, record) => {
        const days = record.parsed?.deliveryDays;
        return days ? `${days} days` : "N/A";
      },
      width: isMobile ? 100 : undefined,
    },
    {
      title: "Payment Terms",
      dataIndex: ["parsed", "paymentTerms"],
      key: "paymentTerms",
      render: (terms) => terms || "N/A",
      width: isMobile ? 130 : undefined,
      ellipsis: true,
    },
    {
      title: "Warranty",
      dataIndex: ["parsed", "warranty"],
      key: "warranty",
      render: (warranty) => warranty || "N/A",
      width: isMobile ? 110 : undefined,
      ellipsis: true,
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
      width: isMobile ? 100 : undefined,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/rfps/${id}`)}
          size={isMobile ? "middle" : "default"}
        >
          {isMobile ? "Back" : "Back to RFP"}
        </Button>
      </div>

      <h1 style={{ fontSize: isMobile ? "20px" : "24px", marginBottom: 16 }}>
        Compare Proposals: {rfp?.title}
      </h1>

      {proposals.length < 2 ? (
        <Alert
          message="Insufficient Proposals"
          description={`You need at least 2 proposals to compare. Currently you have ${proposals.length} proposal(s).`}
          type="warning"
          style={{ marginBottom: 16 }}
        />
      ) : (
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={handleCompare}
            loading={comparing}
            size={isMobile ? "middle" : "default"}
            block={isMobile}
          >
            {comparison ? "Refresh Comparison" : "Compare with AI"}
          </Button>
        </div>
      )}

      <Card
        title="Proposals Comparison"
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: isMobile ? 12 : 24 } }}
      >
        <div
          style={{
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            width: "100%",
          }}
        >
          <Table
            columns={comparisonColumns}
            dataSource={proposals}
            rowKey="_id"
            pagination={false}
            scroll={{ x: isMobile ? "max-content" : undefined }}
            size={isMobile ? "small" : "default"}
          />
        </div>
      </Card>

      {comparison && (
        <>
          <Card
            title="AI Evaluation"
            style={{ marginBottom: 16 }}
            styles={{ body: { padding: isMobile ? 12 : 24 } }}
          >
            {comparison.evaluations?.map((eval_, index) => {
              // Backend already matches evaluations correctly by vendorIndex
              // Use vendorName from evaluation which is already correctly set
              return (
                <Card
                  key={eval_.vendorId || index}
                  type="inner"
                  title={eval_.vendorName || `Vendor ${eval_.vendorIndex + 1}`}
                  style={{ marginBottom: 16 }}
                  styles={{ body: { padding: isMobile ? 12 : 24 } }}
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
                  <div style={{ marginBottom: 8, wordWrap: "break-word" }}>
                    <strong>Summary: </strong>
                    {eval_.summary}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <strong>Pros: </strong>
                    <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                      {eval_.pros?.map((pro, i) => (
                        <li key={i} style={{ wordWrap: "break-word" }}>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>Cons: </strong>
                    <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                      {eval_.cons?.map((con, i) => (
                        <li key={i} style={{ wordWrap: "break-word" }}>
                          {con}
                        </li>
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
            styles={{ body: { padding: isMobile ? 12 : 24 } }}
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
                      <p style={{ wordWrap: "break-word" }}>
                        <strong>Score:</strong> {recommendedEval.score}/100
                      </p>
                      <p style={{ wordWrap: "break-word" }}>
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
              <p style={{ marginTop: 8, wordWrap: "break-word" }}>
                {comparison.overallExplanation}
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProposalComparisonPage;
