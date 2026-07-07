import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Card, Radio, Input, Select, InputNumber, Button, Table, Space, Typography, message, Checkbox } from 'antd';
import {
  getKeywordRecommendations,
  getCategoryRecommendations,
  getProductRecommendations,
} from '../../../../redux/advertising/actionCreator';

const { Title } = Typography;

function TargetingStep({ wizardData, setWizardData, onBack, onNext }) {
  const dispatch = useDispatch();
  const [activeKeywordTab, setActiveKeywordTab] = useState('MANUAL');
  const targeting = wizardData.targeting || {};
  const method = targeting.method || '';
  const keywords = targeting.keywords || [];
  const targets = targeting.targets || [];
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectedRecommendationKeys, setSelectedRecommendationKeys] = useState([]);
  const [productTargetType, setProductTargetType] = useState(wizardData.targeting?.productTargetType || 'PRODUCTS');
  const [activeProductTab, setActiveProductTab] = useState('MANUAL');

  const [productRecommendations, setProductRecommendations] = useState([]);

  const [loadingProductRecommendations, setLoadingProductRecommendations] = useState(false);

  const [selectedProductRecommendationKeys, setSelectedProductRecommendationKeys] = useState([]);
  const [categoryRecommendations, setCategoryRecommendations] = useState([]);

  const [loadingCategoryRecommendations, setLoadingCategoryRecommendations] = useState(false);

  const [selectedCategoryKeys, setSelectedCategoryKeys] = useState([]);
  const productTargets = targets.filter((target) => target.expression?.[0]?.type === 'ASIN_SAME_AS');

  const categoryTargets = targets.filter((target) => target.expression?.[0]?.type === 'ASIN_CATEGORY_SAME_AS');
  const { targetingType } = wizardData.campaign;

  const [keywordText, setKeywordText] = useState('');

  const [matchType, setMatchType] = useState('BROAD');

  const [keywordBid, setKeywordBid] = useState(Number(wizardData.adGroup.defaultBid) || 1);

  const [targetBid, setTargetBid] = useState(Number(wizardData.adGroup.defaultBid) || 1);
  const [asin, setAsin] = useState('');
  const removeTarget = (record) => {
    setWizardData({
      ...wizardData,
      targeting: {
        ...targeting,
        targets: targets.filter((target) => target.expression?.[0]?.value !== record.expression?.[0]?.value),
      },
    });
  };
  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);

      const response = await dispatch(
        getKeywordRecommendations({
          asins: wizardData.products.map((product) => product.asin),
        }),
      );

      if (response?.status) {
        setRecommendations(response.data || []);
      }
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchCategoryRecommendations = async () => {
    if (!wizardData.products?.length) {
      return;
    }

    try {
      setLoadingCategoryRecommendations(true);

      const response = await dispatch(
        getCategoryRecommendations({
          asins: wizardData.products.map((product) => product.asin),
          includeAncestor: true,
        }),
      );

      console.log('Category Recommendations', response);

      if (response?.status) {
        setCategoryRecommendations(response.data || []);
      }
    } finally {
      setLoadingCategoryRecommendations(false);
    }
  };

  const fetchProductRecommendations = async () => {
    if (!wizardData.products?.length) {
      return;
    }

    try {
      setLoadingProductRecommendations(true);

      const response = await dispatch(
        getProductRecommendations({
          adAsins: wizardData.products.map((product) => product.asin),
        }),
      );

      console.log('Product Recommendations', response);

      if (response?.status) {
        setProductRecommendations(response.data || []);
      }
    } finally {
      setLoadingProductRecommendations(false);
    }
  };

  const [selectedMatchTypes, setSelectedMatchTypes] = useState(['BROAD']);

  useEffect(() => {
    if (method === 'PRODUCT' && productTargetType === 'CATEGORIES' && categoryRecommendations.length === 0) {
      fetchCategoryRecommendations();
    }
  }, [method, productTargetType]);

  useEffect(() => {
    if (
      method === 'PRODUCT' &&
      productTargetType === 'PRODUCTS' &&
      activeProductTab === 'SUGGESTED' &&
      productRecommendations.length === 0
    ) {
      fetchProductRecommendations();
    }
  }, [method, productTargetType, activeProductTab]);

  const addSelectedRecommendations = () => {
    const selectedRecommendations = recommendations.filter((item) => selectedRecommendationKeys.includes(item.keyword));

    const existingKeys = new Set(
      keywords.map((keyword) => `${keyword.keywordText.toLowerCase()}-${keyword.matchType}`),
    );

    const newKeywords = [];

    selectedRecommendations.forEach((item) => {
      selectedMatchTypes.forEach((selectedType) => {
        const uniqueKey = `${item.keyword.toLowerCase()}-${selectedType}`;

        if (!existingKeys.has(uniqueKey)) {
          newKeywords.push({
            keywordText: item.keyword,
            matchType: selectedType,
            bid: item.bid,
            state: 'ENABLED',
          });
        }
      });
    });
    if (newKeywords.length === 0) {
      message.info('Selected keywords are already added');
      return;
    }
    setWizardData({
      ...wizardData,
      targeting: {
        ...targeting,
        method: 'KEYWORD',
        keywords: [...keywords, ...newKeywords],
      },
    });

    setSelectedRecommendationKeys([]);
    setActiveKeywordTab('MANUAL');

    message.success(`${newKeywords.length} keywords added`);
  };

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
    const normalizedAsin = asin.trim().toUpperCase();
    const exists = targets.some((target) => target.expression?.[0]?.value === normalizedAsin);

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
                value: normalizedAsin,
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
  const addSelectedCategories = () => {
    const selected = categoryRecommendations.filter((category) => selectedCategoryKeys.includes(category.id));
    const unique = new Map();

    selected.forEach((item) => {
      unique.set(item.id, item);
    });

    const selectedCategories = [...unique.values()];

    const existing = new Set(targets.map((target) => target.expression?.[0]?.value));

    const newTargets = [];

    selectedCategories.forEach((category) => {
      if (!existing.has(category.id)) {
        newTargets.push({
          expressionType: 'MANUAL',

          expression: [
            {
              type: 'ASIN_CATEGORY_SAME_AS',
              value: category.id,
            },
          ],

          bid: targetBid,

          state: 'ENABLED',

          // frontend only
          categoryName: category.name,
          categoryPath: category.path,
        });
      }
    });
    if (newTargets.length === 0) {
      message.info('Selected categories are already added');
      return;
    }
    setWizardData({
      ...wizardData,
      targeting: {
        ...targeting,
        method: 'PRODUCT',
        targets: [...targets, ...newTargets],
      },
    });

    setSelectedCategoryKeys([]);

    message.success(`${newTargets.length} categories added`);
  };

  const addSelectedProducts = () => {
    const selected = productRecommendations.filter((product) =>
      selectedProductRecommendationKeys.includes(product.recommendedAsin),
    );

    const existing = new Set(productTargets.map((target) => target.expression?.[0]?.value));

    const newTargets = [];

    selected.forEach((product) => {
      if (!existing.has(product.recommendedAsin)) {
        newTargets.push({
          expressionType: 'MANUAL',

          expression: [
            {
              type: 'ASIN_SAME_AS',
              value: product.recommendedAsin,
            },
          ],

          bid: targetBid,

          state: 'ENABLED',
        });
      }
    });

    if (newTargets.length === 0) {
      message.info('Selected products are already added');
      return;
    }

    setWizardData({
      ...wizardData,
      targeting: {
        ...targeting,
        targets: [...targets, ...newTargets],
      },
    });

    setSelectedProductRecommendationKeys([]);

    message.success(`${newTargets.length} products added`);

    // Switch back to the Manual Products tab so the user
    // immediately sees the products they just added.
    setActiveProductTab('MANUAL');
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
      render: (_, record, index) => (
        <InputNumber
          min={0.02}
          value={record.bid}
          onChange={(value) => {
            const updated = [...keywords];

            updated[index] = {
              ...updated[index],
              bid: value,
            };

            setWizardData({
              ...wizardData,
              targeting: {
                ...targeting,
                keywords: updated,
              },
            });
          }}
        />
      ),
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
          Remove
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
      render: (_, record) => {
        if (record.expression?.[0]?.type === 'ASIN_CATEGORY_SAME_AS') {
          return (
            <>
              <div>{record.categoryName}</div>

              <div
                style={{
                  color: '#888',
                  fontSize: 12,
                }}
              >
                {record.categoryPath}
              </div>
            </>
          );
        }

        return record.expression?.[0]?.value;
      },
    },

    {
      title: 'Expression Type',
      render: (_, record) => record.expression?.[0]?.type,
    },

    {
      title: 'Bid',
      render: (_, record) => (
        <InputNumber
          min={0.02}
          value={record.bid}
          onChange={(value) => {
            const updated = targets.map((target) => {
              if (
                target.expression?.[0]?.type === record.expression?.[0]?.type &&
                target.expression?.[0]?.value === record.expression?.[0]?.value
              ) {
                return {
                  ...target,
                  bid: value,
                };
              }

              return target;
            });

            setWizardData({
              ...wizardData,
              targeting: {
                ...targeting,
                targets: updated,
              },
            });
          }}
        />
      ),
    },

    {
      title: 'Action',
      render: (_, record) => (
        <Button danger size="small" onClick={() => removeTarget(record)}>
          Remove
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
          <Space direction="horizontal">
            <Radio value="KEYWORD">Keyword Targeting</Radio>

            <Radio value="PRODUCT">Product Targeting</Radio>
          </Space>
        </Radio.Group>
      </Card>

      {method === 'KEYWORD' && (
        <Card
          title="Keywords"
          extra={
            <Space>
              <Button
                type={activeKeywordTab === 'MANUAL' ? 'primary' : 'default'}
                onClick={() => setActiveKeywordTab('MANUAL')}
              >
                Manual Keywords
              </Button>

              <Button
                type={activeKeywordTab === 'SUGGESTED' ? 'primary' : 'default'}
                onClick={async () => {
                  setActiveKeywordTab('SUGGESTED');

                  if (recommendations.length === 0) {
                    await fetchRecommendations();
                  }
                }}
              >
                Suggested Keywords
              </Button>
            </Space>
          }
        >
          {activeKeywordTab === 'MANUAL' && (
            <>
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
              <div
                style={{
                  marginBottom: 12,
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                Total Added Keywords ({keywords.length})
                <Button
                  danger
                  type="link"
                  onClick={() => {
                    setWizardData({
                      ...wizardData,
                      targeting: {
                        ...targeting,
                        keywords: [],
                      },
                    });
                  }}
                >
                  Remove All
                </Button>
              </div>
              <Table
                scroll={{
                  y: 300,
                }}
                rowKey={(record) => `${record.keywordText}-${record.matchType}`}
                columns={keywordColumns}
                dataSource={keywords}
                pagination={false}
              />
            </>
          )}

          {activeKeywordTab === 'SUGGESTED' && (
            <>
              <div
                style={{
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    marginRight: 12,
                    fontWeight: 500,
                  }}
                >
                  Add as:
                </span>

                <Checkbox.Group value={selectedMatchTypes} onChange={setSelectedMatchTypes}>
                  <Checkbox value="BROAD">Broad</Checkbox>

                  <Checkbox value="PHRASE">Phrase</Checkbox>

                  <Checkbox value="EXACT">Exact</Checkbox>
                </Checkbox.Group>
              </div>
              <Table
                scroll={{
                  y: 300,
                }}
                loading={loadingRecommendations}
                rowKey="keyword"
                dataSource={recommendations}
                rowSelection={{
                  selectedRowKeys: selectedRecommendationKeys,
                  onChange: setSelectedRecommendationKeys,
                }}
                columns={[
                  {
                    title: 'Keyword',
                    dataIndex: 'keyword',
                  },
                  {
                    title: 'Rank',
                    dataIndex: 'rank',
                  },
                  {
                    title: 'Suggested Bid',
                    dataIndex: 'bid',
                    render: (value) => `₹${value}`,
                  },
                  {
                    title: 'IS',
                    dataIndex: 'searchTermImpressionShare',
                    render: (IS) => `${IS}%`,
                  },
                  {
                    title: 'IR',
                    dataIndex: 'searchTermImpressionRank',
                  },
                ]}
                pagination={{
                  pageSize: 10,
                }}
              />
              <div
                style={{
                  marginTop: 16,
                  textAlign: 'right',
                }}
              >
                <Button
                  type="primary"
                  disabled={!selectedRecommendationKeys.length}
                  onClick={addSelectedRecommendations}
                >
                  Add Selected Keywords
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {method === 'PRODUCT' && (
        <>
          <Card title="Target Type" style={{ marginBottom: 24 }}>
            <Radio.Group
              value={productTargetType}
              onChange={(e) => {
                setProductTargetType(e.target.value);

                setWizardData({
                  ...wizardData,
                  targeting: {
                    ...targeting,
                    productTargetType: e.target.value,
                  },
                });
              }}
            >
              <Space>
                <Radio value="PRODUCTS">Products</Radio>

                <Radio value="CATEGORIES">Categories</Radio>
              </Space>
            </Radio.Group>
          </Card>
          {productTargetType === 'PRODUCTS' && (
            <Card
              title="Products"
              extra={
                <Space>
                  <Button
                    type={activeProductTab === 'MANUAL' ? 'primary' : 'default'}
                    onClick={() => setActiveProductTab('MANUAL')}
                  >
                    Manual Products
                  </Button>

                  <Button
                    type={activeProductTab === 'SUGGESTED' ? 'primary' : 'default'}
                    onClick={() => setActiveProductTab('SUGGESTED')}
                  >
                    Suggested Products
                  </Button>
                </Space>
              }
            >
              {activeProductTab === 'MANUAL' && (
                <>
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
                  <div
                    style={{
                      marginBottom: 12,
                      fontWeight: 600,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    Total Added Products ({productTargets.length})
                    <Button
                      danger
                      type="link"
                      onClick={() => {
                        setWizardData({
                          ...wizardData,
                          targeting: {
                            ...targeting,
                            targets: targets.filter((target) => target.expression?.[0]?.type !== 'ASIN_SAME_AS'),
                          },
                        });
                      }}
                    >
                      Remove All
                    </Button>
                  </div>
                  <Table
                    rowKey={(record) => record.expression?.[0]?.value}
                    columns={targetColumns}
                    dataSource={productTargets}
                    pagination={false}
                    scroll={{
                      y: 300,
                    }}
                  />
                </>
              )}
              {activeProductTab === 'SUGGESTED' && (
                <>
                  <Table
                    scroll={{ y: 350 }}
                    rowKey="recommendedAsin"
                    loading={loadingProductRecommendations}
                    dataSource={productRecommendations}
                    pagination={{ pageSize: 10 }}
                    rowSelection={{
                      selectedRowKeys: selectedProductRecommendationKeys,
                      onChange: setSelectedProductRecommendationKeys,
                    }}
                    columns={[
                      {
                        title: 'ASIN',
                        dataIndex: 'recommendedAsin',
                      },
                      {
                        title: 'Themes',
                        render: (_, record) => (
                          <Space direction="vertical" size={2}>
                            {record.themes.map((theme) => (
                              <Typography.Text key={theme} type="secondary">
                                • {theme}
                              </Typography.Text>
                            ))}
                          </Space>
                        ),
                      },
                    ]}
                  />

                  <div
                    style={{
                      marginTop: 16,
                      textAlign: 'right',
                    }}
                  >
                    <Button
                      type="primary"
                      disabled={!selectedProductRecommendationKeys.length}
                      onClick={addSelectedProducts}
                    >
                      Add Selected Products
                    </Button>
                  </div>
                </>
              )}
            </Card>
          )}
          {productTargetType === 'CATEGORIES' && (
            <Card
              title="Suggested Categories"
              extra={
                <Button type="primary" disabled={!selectedCategoryKeys.length} onClick={addSelectedCategories}>
                  Add Selected Categories
                </Button>
              }
            >
              <Table
                scroll={{ y: 250 }}
                loading={loadingCategoryRecommendations}
                rowKey="id"
                dataSource={categoryRecommendations}
                pagination={{
                  pageSize: 10,
                }}
                rowSelection={{
                  selectedRowKeys: selectedCategoryKeys,
                  onChange: setSelectedCategoryKeys,
                }}
                columns={[
                  {
                    title: 'Category',
                    render: (_, record) => (
                      <>
                        <div>{record.name}</div>

                        <div
                          style={{
                            color: '#888',
                            fontSize: 12,
                          }}
                        >
                          {record.path}
                        </div>
                      </>
                    ),
                  },
                ]}
              />
              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    marginBottom: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 600,
                  }}
                >
                  <span>Added Category Targets ({categoryTargets.length})</span>

                  <Button
                    danger
                    type="link"
                    onClick={() => {
                      setWizardData({
                        ...wizardData,
                        targeting: {
                          ...targeting,
                          targets: targets.filter((target) => target.expression?.[0]?.type !== 'ASIN_CATEGORY_SAME_AS'),
                        },
                      });
                    }}
                  >
                    Remove All
                  </Button>
                </div>
                <Table
                  rowKey={(record) => record.expression?.[0]?.value}
                  columns={targetColumns}
                  dataSource={categoryTargets}
                  pagination={false}
                  scroll={{ y: 250 }}
                />
              </div>
            </Card>
          )}
        </>
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
