import React, { useState } from 'react';
import { CheckOutlined } from '@ant-design/icons';

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
    <main className="min-h-[600px] px-4 pb-[30px] py-4">
      {/* Modern Custom Horizontal Stepper */}
      <div className="bg-white dark:bg-[#1b1e2b] rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-5 mb-6">
        <div className="flex items-center justify-between w-full">
          {SP_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;
            const isClickable = idx < currentStep;

            return (
              <React.Fragment key={step.key || idx}>
                {/* Step Item */}
                <button
                  type="button"
                  onClick={() => {
                    if (isClickable) {
                      setCurrentStep(idx);
                    }
                  }}
                  className={`flex items-center gap-3 transition-all duration-200 select-none ${
                    isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                  }`}
                >
                  {/* Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-95'
                        : isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/35 ring-4 ring-emerald-500/20 scale-105'
                        : 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-white/10'
                    }`}
                  >
                    {isCompleted ? <CheckOutlined className="text-xs stroke-[3]" /> : idx + 1}
                  </div>

                  {/* Title */}
                  <div className="hidden sm:flex flex-col">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-wider ${
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isCompleted
                          ? 'text-gray-500 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      Step {idx + 1}
                    </span>
                    <span
                      className={`text-sm whitespace-nowrap transition-colors ${
                        isActive
                          ? 'font-bold text-gray-900 dark:text-white'
                          : isCompleted
                          ? 'font-semibold text-gray-700 dark:text-gray-300'
                          : 'font-medium text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                </button>

                {/* Connecting Line between steps */}
                {idx < SP_STEPS.length - 1 && (
                  <div className="flex-1 mx-3 sm:mx-4 h-[2px] rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        idx < currentStep ? 'w-full bg-emerald-500' : 'w-0 bg-transparent'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div>{renderStep()}</div>
    </main>
  );
}

export default CreateCampaign;
