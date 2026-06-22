import { useState } from 'react';
import { Card, Input, Select, Button, Table, Space, Typography, message } from 'antd';

const { Title } = Typography;

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
    <>
      <Title level={4}>Campaign Negative Targeting</Title>

      <Card title="Negative Keywords (Optional)" style={{ marginBottom: 24 }}>
        <Space
          style={{
            width: '100%',
            marginBottom: 16,
          }}
        >
          <Input placeholder="Keyword" value={keywordText} onChange={(e) => setKeywordText(e.target.value)} />

          <Select
            value={matchType}
            style={{ width: 200 }}
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

          <Button type="primary" onClick={addNegativeKeyword}>
            Add Negative Keyword
          </Button>
        </Space>

        <Table
          rowKey={(record) => `${record.keywordText}-${record.matchType}`}
          columns={keywordColumns}
          dataSource={campaignNegativeKeywords}
          pagination={false}
        />
      </Card>

      <Card title="Negative Product Targets (Optional)">
        <Space
          style={{
            width: '100%',
            marginBottom: 16,
          }}
        >
          <Input placeholder="ASIN" value={asin} onChange={(e) => setAsin(e.target.value)} />

          <Button type="primary" onClick={addNegativeTarget}>
            Add Negative Target
          </Button>
        </Space>

        <Table
          rowKey={(record) => record.expression?.[0]?.value}
          columns={targetColumns}
          dataSource={campaignNegativeTargets}
          pagination={false}
        />
      </Card>

      <div
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={onBack}>Back</Button>

        <Button type="primary" onClick={onNext}>
          Next
        </Button>
      </div>
    </>
  );
}

export default NegativeStep;
