import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button, Steps, message, Spin } from "antd";
import { createRfpFromText, updateRfp } from "../services/rfpApi";
import RfpForm from "../components/rfp/RfpForm";

const { TextArea } = Input;
const { Step } = Steps;

const RfpCreatePage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rfpData, setRfpData] = useState(null);

  const handleGenerateRfp = async () => {
    if (!textInput.trim()) {
      message.warning("Please enter a description");
      return;
    }

    try {
      setLoading(true);
      const response = await createRfpFromText(textInput);
      // createRfpFromText returns response.data which is the RFP object
      setRfpData(response);
      setCurrentStep(1);
      message.success("RFP generated successfully!");
    } catch (error) {
      message.error("Failed to generate RFP: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRfp = async (formData) => {
    try {
      setLoading(true);
      await updateRfp(rfpData._id, formData);
      message.success("RFP saved successfully!");
      navigate(`/rfps/${rfpData._id}`);
    } catch (error) {
      message.error("Failed to save RFP: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create RFP</h1>
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        <Step title="Natural Language Input" />
        <Step title="Review & Edit" />
      </Steps>

      {currentStep === 0 && (
        <Card>
          <div style={{ marginBottom: 16 }}>
            <h3>Describe your procurement needs</h3>
            <p style={{ color: "#666", marginBottom: 16 }}>
              Enter a detailed description of what you want to procure. The AI
              will extract the requirements and create a structured RFP.
            </p>
          </div>
          <TextArea
            rows={8}
            placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <Button
            type="primary"
            size="large"
            onClick={handleGenerateRfp}
            loading={loading}
          >
            Generate RFP
          </Button>
        </Card>
      )}

      {currentStep === 1 && rfpData && (
        <Spin spinning={loading}>
          <RfpForm
            initialData={rfpData}
            onSave={handleSaveRfp}
            onCancel={() => setCurrentStep(0)}
          />
        </Spin>
      )}
    </div>
  );
};

export default RfpCreatePage;
