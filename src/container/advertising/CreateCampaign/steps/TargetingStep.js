import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Radio, Input, Select, InputNumber, Button, Table, Space, Typography, message, Checkbox } from 'antd';
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
      <div className="w-full rounded-2xl bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 md:p-6 shadow-sm space-y-4">
        <Title level={4} className="!mb-2 text-gray-900 dark:text-white">
          Automatic Targeting
        </Title>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Amazon will automatically create targeting for this campaign.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <li>Close Match</li>
          <li>Loose Match</li>
          <li>Substitutes</li>
          <li>Complements</li>
        </ul>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
          <Button className="h-10 px-6 rounded-lg font-medium" onClick={onBack}>
            Back
          </Button>

          <Button type="primary" className="h-10 px-6 rounded-lg font-medium" onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
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
      ellipsis: true,
      width: 120,
    },

    {
      title: 'Match Type',
      dataIndex: 'matchType',
      width: 120,
      ellipsis: true,
    },

    {
      title: 'Bid',
      width: 120,
      ellipsis: true,
      render: (_, record, index) => (
        <InputNumber
          min={0.02}
          className="w-full"
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
      width: 90,
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
      title: 'ASIN / Category',
      ellipsis: true,
      width: 120,
      render: (_, record) => {
        if (record.expression?.[0]?.type === 'ASIN_CATEGORY_SAME_AS') {
          return (
            <>
              <div className="font-medium text-xs text-gray-800 dark:text-white">{record.categoryName}</div>
              <div className="text-[11px] text-gray-400 truncate max-w-[200px]">{record.categoryPath}</div>
            </>
          );
        }

        return <span className="font-mono text-xs">{record.expression?.[0]?.value}</span>;
      },
    },

    {
      title: 'Expression Type',
      dataIndex: 'expressionType',
      width: 140,
      render: (_, record) => (
        <span className="text-xs text-gray-500">{record.expression?.[0]?.type || record.expressionType}</span>
      ),
    },

    {
      title: 'Bid',
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={0.02}
          className="w-full"
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
      width: 90,
      render: (_, record) => (
        <Button danger size="small" onClick={() => removeTarget(record)}>
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="w-full space-y-5">
      {/* Target Method Selector */}
      <div className="rounded-lg bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Manual Targeting Method</h3>
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
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Radio value="KEYWORD" className="text-sm">
              Keyword Targeting
            </Radio>
            <Radio value="PRODUCT" className="text-sm">
              Product Targeting
            </Radio>
          </div>
        </Radio.Group>
      </div>

      {method === 'KEYWORD' && (
        <div className="rounded-2xl bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
            <h3 className="text-base font-bold text-gray-800 dark:text-white m-0">Keywords</h3>
            <div className="flex items-center gap-2">
              <Button
                type={activeKeywordTab === 'MANUAL' ? 'primary' : 'default'}
                className="h-9 px-4 rounded-lg text-xs font-medium"
                onClick={() => setActiveKeywordTab('MANUAL')}
              >
                Manual Keywords
              </Button>

              <Button
                type={activeKeywordTab === 'SUGGESTED' ? 'primary' : 'default'}
                className="h-9 px-4 rounded-lg text-xs font-medium"
                onClick={async () => {
                  setActiveKeywordTab('SUGGESTED');
                  if (recommendations.length === 0) {
                    await fetchRecommendations();
                  }
                }}
              >
                Suggested Keywords
              </Button>
            </div>
          </div>

          {activeKeywordTab === 'MANUAL' && (
            <>
              <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 mb-4">
                <Input
                  placeholder="Keyword"
                  value={keywordText}
                  onChange={(e) => setKeywordText(e.target.value)}
                  className="h-10 rounded-lg flex-1 min-w-[200px]"
                />

                <Select
                  value={matchType}
                  className="w-[140px] sm:w-full h-10"
                  onChange={setMatchType}
                  options={[
                    { label: 'Broad', value: 'BROAD' },
                    { label: 'Phrase', value: 'PHRASE' },
                    { label: 'Exact', value: 'EXACT' },
                  ]}
                />

                <InputNumber
                  min={0.02}
                  value={keywordBid}
                  onChange={setKeywordBid}
                  className="w-[130px] sm:w-full h-10 rounded-lg flex items-center"
                  placeholder="Bid"
                />

                <Button
                  type="primary"
                  className="h-10 px-5 rounded-lg font-medium w-auto sm:w-full shrink-0"
                  onClick={addKeyword}
                >
                  Add Keyword
                </Button>
              </div>

              <div className="mb-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                <span>Total Added Keywords ({keywords.length})</span>
                <Button
                  danger
                  type="link"
                  className="p-0 text-xs"
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

              <div className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
                <Table
                  scroll={{ x: 550, y: 300 }}
                  rowKey={(record) => `${record.keywordText}-${record.matchType}`}
                  columns={keywordColumns}
                  dataSource={keywords}
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
            </>
          )}

          {activeKeywordTab === 'SUGGESTED' && (
            <>
              <div className="flex items-center gap-3 mb-4 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Add as:</span>
                <Checkbox.Group value={selectedMatchTypes} onChange={setSelectedMatchTypes}>
                  <Checkbox value="BROAD">Broad</Checkbox>
                  <Checkbox value="PHRASE">Phrase</Checkbox>
                  <Checkbox value="EXACT">Exact</Checkbox>
                </Checkbox.Group>
              </div>

              <div className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
                <Table
                  scroll={{ x: 650, y: 300 }}
                  loading={loadingRecommendations}
                  rowKey="keyword"
                  dataSource={recommendations}
                  rowSelection={{
                    selectedRowKeys: selectedRecommendationKeys,
                    onChange: setSelectedRecommendationKeys,
                  }}
                  columns={[
                    { title: 'Keyword', dataIndex: 'keyword', ellipsis: true },
                    { title: 'Rank', dataIndex: 'rank', width: 90 },
                    {
                      title: 'Suggested Bid',
                      dataIndex: 'bid',
                      width: 120,
                      render: (value) => `₹${value}`,
                    },
                    {
                      title: 'IS',
                      dataIndex: 'searchTermImpressionShare',
                      width: 90,
                      render: (IS) => `${IS}%`,
                    },
                    { title: 'IR', dataIndex: 'searchTermImpressionRank', width: 90 },
                  ]}
                  pagination={{ pageSize: 10 }}
                  size="middle"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="primary"
                  className="h-10 px-5 rounded-lg font-medium"
                  disabled={!selectedRecommendationKeys.length}
                  onClick={addSelectedRecommendations}
                >
                  Add Selected Keywords
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {method === 'PRODUCT' && (
        <>
          <div className="rounded-lg bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Target Type</h3>
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
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <Radio value="PRODUCTS" className="text-sm">
                  Products
                </Radio>
                <Radio value="CATEGORIES" className="text-sm">
                  Categories
                </Radio>
              </div>
            </Radio.Group>
          </div>

          {productTargetType === 'PRODUCTS' && (
            <div className="rounded-lg bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 md:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-base font-bold text-gray-800 dark:text-white m-0">Products</h3>
                <div className="flex items-center gap-2">
                  <Button
                    type={activeProductTab === 'MANUAL' ? 'primary' : 'default'}
                    className="h-9 px-4 rounded-lg text-xs font-medium"
                    onClick={() => setActiveProductTab('MANUAL')}
                  >
                    Manual Products
                  </Button>

                  <Button
                    type={activeProductTab === 'SUGGESTED' ? 'primary' : 'default'}
                    className="h-9 px-4 rounded-lg text-xs font-medium"
                    onClick={() => setActiveProductTab('SUGGESTED')}
                  >
                    Suggested Products
                  </Button>
                </div>
              </div>

              {activeProductTab === 'MANUAL' && (
                <>
                  <div className="flex flex-row sm:flex-col items-center sm:items-stretch gap-3 mb-4">
                    <Input
                      placeholder="ASIN"
                      value={asin}
                      onChange={(e) => setAsin(e.target.value)}
                      className="h-10 rounded-lg flex-1 min-w-[200px]"
                    />

                    <InputNumber
                      min={0.02}
                      value={targetBid}
                      onChange={setTargetBid}
                      className="w-[130px] sm:w-full h-10 rounded-lg flex items-center"
                      placeholder="Bid"
                    />

                    <Button
                      type="primary"
                      className="h-10 px-5 rounded-lg font-medium w-auto sm:w-full shrink-0"
                      onClick={addTarget}
                    >
                      Add Target
                    </Button>
                  </div>

                  <div className="mb-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span>Total Added Products ({productTargets.length})</span>
                    <Button
                      danger
                      type="link"
                      className="p-0 text-xs"
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

                  <div className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
                    <Table
                      rowKey={(record) => record.expression?.[0]?.value}
                      columns={targetColumns}
                      dataSource={productTargets}
                      pagination={false}
                      scroll={{ x: 550, y: 300 }}
                      size="middle"
                    />
                  </div>
                </>
              )}

              {activeProductTab === 'SUGGESTED' && (
                <>
                  <div className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
                    <Table
                      scroll={{ x: 550, y: 350 }}
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
                          width: 180,
                          render: (val) => <span className="font-mono text-xs">{val}</span>,
                        },
                        {
                          title: 'Themes',
                          render: (_, record) => (
                            <Space direction="vertical" size={2}>
                              {record.themes.map((theme) => (
                                <Typography.Text key={theme} type="secondary" className="text-xs">
                                  • {theme}
                                </Typography.Text>
                              ))}
                            </Space>
                          ),
                        },
                      ]}
                      size="middle"
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      type="primary"
                      className="h-10 px-5 rounded-lg font-medium"
                      disabled={!selectedProductRecommendationKeys.length}
                      onClick={addSelectedProducts}
                    >
                      Add Selected Products
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {productTargetType === 'CATEGORIES' && (
            <div className="rounded-lg bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 md:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
                <h3 className="text-base font-bold text-gray-800 dark:text-white m-0">Suggested Categories</h3>
                <Button
                  type="primary"
                  className="h-9 px-4 rounded-lg text-xs font-medium"
                  disabled={!selectedCategoryKeys.length}
                  onClick={addSelectedCategories}
                >
                  Add Selected Categories
                </Button>
              </div>

              <div className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
                <Table
                  scroll={{ x: 550, y: 250 }}
                  loading={loadingCategoryRecommendations}
                  rowKey="id"
                  dataSource={categoryRecommendations}
                  pagination={{ pageSize: 10 }}
                  rowSelection={{
                    selectedRowKeys: selectedCategoryKeys,
                    onChange: setSelectedCategoryKeys,
                  }}
                  columns={[
                    {
                      title: 'Category',
                      render: (_, record) => (
                        <>
                          <div className="font-medium text-xs text-gray-800 dark:text-white">{record.name}</div>
                          <div className="text-[11px] text-gray-400 truncate max-w-[300px]">{record.path}</div>
                        </>
                      ),
                    },
                  ]}
                  size="middle"
                />
              </div>

              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <span>Added Category Targets ({categoryTargets.length})</span>
                  <Button
                    danger
                    type="link"
                    className="p-0 text-xs"
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

                <div className="border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden">
                  <Table
                    rowKey={(record) => record.expression?.[0]?.value}
                    columns={targetColumns}
                    dataSource={categoryTargets}
                    pagination={false}
                    scroll={{ x: 550, y: 250 }}
                    size="middle"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
        <Button className="h-10 px-6 rounded-lg font-medium" onClick={onBack}>
          Back
        </Button>

        <Button
          type="primary"
          className="h-10 px-6 rounded-lg font-medium"
          disabled={
            (method === 'KEYWORD' && keywords.length === 0) || (method === 'PRODUCT' && targets.length === 0) || !method
          }
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default TargetingStep;
