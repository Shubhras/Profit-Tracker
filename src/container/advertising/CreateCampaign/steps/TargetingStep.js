import { useState } from 'react';
import { Card, Radio, Input, Select, InputNumber, Button, Table, Space, Typography, message } from 'antd';

const { Title } = Typography;

function TargetingStep({ wizardData, setWizardData, onBack, onNext }) {
  const { targetingType } = wizardData.campaign;

  const [keywordText, setKeywordText] = useState('');

  const [matchType, setMatchType] = useState('BROAD');

  const [keywordBid, setKeywordBid] = useState(Number(wizardData.adGroup.defaultBid) || 1);

  const [targetBid, setTargetBid] = useState(Number(wizardData.adGroup.defaultBid) || 1);
  const [asin, setAsin] = useState('');

  // AUTO CAMPAIGN

  if (targetingType === 'AUTO') {
    return (
      <>
        <Card>
          <Title level={4}>Automatic Targeting</Title>

          <p>Amazon will automatically create targeting for this campaign.</p>

          <ul>
            <li>Close Match</li>
            <li>Loose Match</li>
            <li>Substitutes</li>
            <li>Complements</li>
          </ul>
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

  const targeting = wizardData.targeting || {};

  const method = targeting.method || '';

  const keywords = targeting.keywords || [];

  const targets = targeting.targets || [];
  // ======================================================
  // ADD KEYWORD
  // ======================================================

  const addKeyword = () => {
    const normalizedKeyword = keywordText.trim().toLowerCase();

    const exists = keywords.some(
      (keyword) => keyword.keywordText.trim().toLowerCase() === normalizedKeyword && keyword.matchType === matchType,
    );

    if (exists) {
      message.error('Keyword already added');
      return;
    }
    if (!keywordBid || keywordBid <= 0) {
      message.error('Bid is required');
      return;
    }
    if (!keywordText.trim()) {
      message.error('Keyword is required');
      return;
    }

    setWizardData({
      ...wizardData,
      targeting: {
        ...targeting,
        method: 'KEYWORD',

        keywords: [
          ...keywords,
          {
            keywordText: keywordText.trim(),
            matchType,
            bid: keywordBid,
            state: 'ENABLED',
          },
        ],
      },
    });

    setKeywordText('');
  };
  // ======================================================
  // ADD PRODUCT TARGET
  // ======================================================

  const addTarget = () => {
    const exists = targets.some((target) => target.expression?.[0]?.value === asin.tirm());

    if (exists) {
      message.error('ASIN already added');
      return;
    }
    if (!targetBid || targetBid <= 0) {
      message.error('Bid is required');
      return;
    }
    if (!asin.trim()) {
      message.error('ASIN is required');
      return;
    }

    setWizardData({
      ...wizardData,
      targeting: {
        ...targeting,
        method: 'PRODUCT',

        targets: [
          ...targets,
          {
            expressionType: 'MANUAL',
            expression: [
              {
                type: 'ASIN_SAME_AS',
                value: asin.tirm(),
              },
            ],
            bid: targetBid,
            state: 'ENABLED',
          },
        ],
      },
    });

    setAsin('');
  };
  // ======================================================
  // KEYWORD TABLE
  // ======================================================

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
      title: 'Bid',
      dataIndex: 'bid',
    },

    {
      title: 'Action',
      render: (_, __, index) => (
        <Button
          danger
          size="small"
          onClick={() => {
            const updated = [...keywords];

            updated.splice(index, 1);

            setWizardData({
              ...wizardData,
              targeting: {
                ...targeting,
                keywords: updated,
              },
            });
          }}
        >
          Delete
        </Button>
      ),
    },
  ];
  // ======================================================
  // PRODUCT TARGET TABLE
  // ======================================================

  const targetColumns = [
    {
      title: 'ASIN',
      render: (_, record) => record.expression?.[0]?.value,
    },

    {
      title: 'Bid',
      dataIndex: 'bid',
    },

    {
      title: 'Action',
      render: (_, __, index) => (
        <Button
          danger
          size="small"
          onClick={() => {
            const updated = [...targets];

            updated.splice(index, 1);

            setWizardData({
              ...wizardData,
              targeting: {
                ...targeting,
                targets: updated,
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
      <Card title="Manual Targeting Method" style={{ marginBottom: 24 }}>
        <Radio.Group
          value={method}
          onChange={(e) =>
            setWizardData({
              ...wizardData,
              targeting: {
                method: e.target.value,

                keywords: e.target.value === 'KEYWORD' ? targeting.keywords || [] : [],

                targets: e.target.value === 'PRODUCT' ? targeting.targets || [] : [],
              },
            })
          }
        >
          <Space direction="vertical">
            <Radio value="KEYWORD">Keyword Targeting</Radio>

            <Radio value="PRODUCT">Product Targeting</Radio>
          </Space>
        </Radio.Group>
      </Card>

      {method === 'KEYWORD' && (
        <Card title="Keywords">
          <Space
            style={{
              width: '100%',
              marginBottom: 16,
            }}
          >
            <Input placeholder="Keyword" value={keywordText} onChange={(e) => setKeywordText(e.target.value)} />

            <Select
              value={matchType}
              style={{ width: 140 }}
              onChange={setMatchType}
              options={[
                {
                  label: 'Broad',
                  value: 'BROAD',
                },
                {
                  label: 'Phrase',
                  value: 'PHRASE',
                },
                {
                  label: 'Exact',
                  value: 'EXACT',
                },
              ]}
            />

            <InputNumber min={0.02} value={keywordBid} onChange={setKeywordBid} />

            <Button type="primary" onClick={addKeyword}>
              Add Keyword
            </Button>
          </Space>

          <Table
            rowKey={(record) => `${record.keywordText}-${record.matchType}`}
            columns={keywordColumns}
            dataSource={keywords}
            pagination={false}
          />
        </Card>
      )}

      {method === 'PRODUCT' && (
        <Card title="Product Targets">
          <Space
            style={{
              width: '100%',
              marginBottom: 16,
            }}
          >
            <Input placeholder="ASIN" value={asin} onChange={(e) => setAsin(e.target.value)} />

            <InputNumber min={0.02} value={targetBid} onChange={setTargetBid} />

            <Button type="primary" onClick={addTarget}>
              Add Target
            </Button>
          </Space>

          <Table
            rowKey={(record) => record.expression?.[0]?.value}
            columns={targetColumns}
            dataSource={targets}
            pagination={false}
          />
        </Card>
      )}

      <div
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={onBack}>Back</Button>

        <Button
          type="primary"
          disabled={
            (method === 'KEYWORD' && keywords.length === 0) || (method === 'PRODUCT' && targets.length === 0) || !method
          }
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </>
  );
}

export default TargetingStep;
