import React, { useState } from 'react';
import { Card, Steps } from 'antd';

import CampaignTypeStep from './steps/CampaignTypeStep';
import CampaignStep from './steps/CampaignStep';
import AdGroupStep from './steps/AdGroupStep';
import ProductStep from './steps/ProductStep';
import TargetingStep from './steps/TargetingStep';
import NegativeStep from './steps/NegativeStep';
import ReviewStep from './steps/ReviewStep';

import { INITIAL_WIZARD_DATA, SP_STEPS } from './constants';

function CreateCampaign() {
  const [campaignType, setCampaignType] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);

  const [wizardData, setWizardData] = useState(INITIAL_WIZARD_DATA);

  if (!campaignType) {
    return (
      <CampaignTypeStep
        onSelect={(type) => {
          setCampaignType(type);

          setWizardData((prev) => ({
            ...prev,
            campaignType: type,
          }));
        }}
      />
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <CampaignStep wizardData={wizardData} setWizardData={setWizardData} onNext={() => setCurrentStep(1)} />;

      case 1:
        return (
          <AdGroupStep
            wizardData={wizardData}
            setWizardData={setWizardData}
            onBack={() => setCurrentStep(0)}
            onNext={() => setCurrentStep(2)}
          />
        );

      case 2:
        return (
          <ProductStep
            wizardData={wizardData}
            setWizardData={setWizardData}
            onBack={() => setCurrentStep(1)}
            onNext={() => setCurrentStep(3)}
          />
        );

      case 3:
        return (
          <TargetingStep
            wizardData={wizardData}
            setWizardData={setWizardData}
            onBack={() => setCurrentStep(2)}
            onNext={() => setCurrentStep(4)}
          />
        );
      case 4:
        return (
          <NegativeStep
            wizardData={wizardData}
            setWizardData={setWizardData}
            onBack={() => setCurrentStep(3)}
            onNext={() => setCurrentStep(5)}
          />
        );

      case 5:
        return <ReviewStep wizardData={wizardData} setWizardData={setWizardData} onBack={() => setCurrentStep(4)} />;

      default:
        return null;
    }
  };

  return (
    <Card>
      <Steps current={currentStep} items={SP_STEPS} />

      <div style={{ marginTop: 32 }}>{renderStep()}</div>
    </Card>
  );
}

export default CreateCampaign;
