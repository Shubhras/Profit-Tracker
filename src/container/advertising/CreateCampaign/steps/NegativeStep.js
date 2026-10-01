import { useState } from 'react';
import { Input, Select, Button, Table, message } from 'antd';

function NegativeStep({ wizardData, setWizardData, onBack, onNext }) {
  const [keywordText, setKeywordText] = useState('');

  const [matchType, setMatchType] = useState('NEGATIVE_PHRASE');

  const [asin, setAsin] = useState('');

  const negatives = wizardData.negatives || {};

  const campaignNegativeKeywords = negatives.campaignNegativeKeywords || [];

  const campaignNegativeTargets = negatives.campaignNegativeTargets || [];

  // ============================================================================================================
  // ADD NEGATIVE KEYWORD
  // ============================================================================================================

  const addNegativeKeyword = () => {
    const normalizedKeyword = keywordText.trim().toLowerCase();

    const exists = campaignNegativeKeywords.some(
      (keyword) => keyword.keywordText.trim().toLowerCase() === normalizedKeyword && keyword.matchType === matchType,
    );

    if (exists) {
      message.error('Negative keyword already added');
      return;
    }
    if (!keywordText.trim()) {
      message.error('Keyword is required');
      return;
    }

    setWizardData({
      ...wizardData,
      negatives: {
        ...negatives,

        campaignNegativeKeywords: [
          ...campaignNegativeKeywords,

          {
            keywordText: keywordText.trim(),
            matchType,
            state: 'ENABLED',
          },
        ],
      },
    });

    setKeywordText('');
  };

  // ============================================================================================================
  // ADD NEGATIVE TARGET
  // ============================================================================================================

  const addNegativeTarget = () => {
    const exists = campaignNegativeTargets.some((target) => target.expression?.[0]?.value === asin.trim());

    if (exists) {
      message.error('ASIN already added');
      return;
    }
    if (!asin.trim()) {
      message.error('ASIN is required');
      return;
    }

    setWizardData({
      ...wizardData,
      negatives: {
        ...negatives,

        campaignNegativeTargets: [
          ...campaignNegativeTargets,

          {
            expression: [
              {
                type: 'ASIN_SAME_AS',
                value: asin.trim(),
              },
            ],

            state: 'ENABLED',
          },
        ],
      },
    });

    setAsin('');
  };

  // ============================================================================================================
  // NEGATIVE KEYWORD TABLE
  // ============================================================================================================

  const keywordColumns = [
    {
      title: 'Keyword',
      dataIndex: 'keywordText',
    },

    {
      title: 'Match Type',
      dataIndex: 'matchType',
    },

    {
      title: 'Action',

      render: (_, __, index) => (
        <Button
          danger
          size="small"
          onClick={() => {
            const updated = [...campaignNegativeKeywords];

            updated.splice(index, 1);

            setWizardData({
              ...wizardData,

              negatives: {
                ...negatives,

                campaignNegativeKeywords: updated,
              },
            });
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  // ============================================================================================================
  // NEGATIVE TARGET TABLE
  // ============================================================================================================

  const targetColumns = [
    {
      title: 'ASIN',

      render: (_, record) => record.expression?.[0]?.value,
    },

    {
      title: 'Action',

      render: (_, __, index) => (
        <Button
          danger
          size="small"
          onClick={() => {
            const updated = [...campaignNegativeTargets];

            updated.splice(index, 1);

            setWizardData({
              ...wizardData,

              negatives: {
                ...negatives,

                campaignNegativeTargets: updated,
              },
            });
          }}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full space-y-5">
      <div className="rounded-lg bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 md:p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Negative Keywords (Optional)</h3>

        <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 mb-4">
          <Input
            placeholder="Keyword"
            value={keywordText}
            onChange={(e) => setKeywordText(e.target.value)}
            className="h-10 rounded-lg flex-1 min-w-[200px]"
          />

          <Select
            value={matchType}
            className="w-[200px] sm:w-full h-10"
            onChange={setMatchType}
            options={[
              {
                label: 'Negative Broad',
                value: 'NEGATIVE_BROAD',
              },
              {
                label: 'Negative Phrase',
                value: 'NEGATIVE_PHRASE',
              },
              {
                label: 'Negative Exact',
                value: 'NEGATIVE_EXACT',
              },
            ]}
          />

          <Button
            type="primary"
            className="h-10 px-5 rounded-lg font-medium w-auto sm:w-full shrink-0"
            onClick={addNegativeKeyword}
          >
            Add Negative Keyword
          </Button>
        </div>

        <div className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
          <Table
            scroll={{ x: 500, y: 250 }}
            rowKey={(record) => `${record.keywordText}-${record.matchType}`}
            columns={keywordColumns}
            dataSource={campaignNegativeKeywords}
            pagination={false}
            size="small"
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-[6px]
  "
          />
        </div>
      </div>

      <div className="rounded-lg bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 md:p-6 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">Negative Product Targets (Optional)</h3>

        <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 mb-4">
          <Input
            placeholder="ASIN"
            value={asin}
            onChange={(e) => setAsin(e.target.value)}
            className="h-10 rounded-lg flex-1 min-w-[200px]"
          />

          <Button
            type="primary"
            className="h-10 px-5 rounded-lg font-medium w-auto sm:w-full shrink-0"
            onClick={addNegativeTarget}
          >
            Add Negative Target
          </Button>
        </div>

        <div className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
          <Table
            scroll={{ x: 500, y: 250 }}
            rowKey={(record) => record.expression?.[0]?.value}
            columns={targetColumns}
            dataSource={campaignNegativeTargets}
            pagination={false}
            size="small"
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-[6px]
  "
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
        <Button className="h-10 px-6 rounded-lg font-medium w-auto" onClick={onBack}>
          Back
        </Button>

        <Button type="primary" className="h-10 px-6 rounded-lg font-medium w-auto" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default NegativeStep;
