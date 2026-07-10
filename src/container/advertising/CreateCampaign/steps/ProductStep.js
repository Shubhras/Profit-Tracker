import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Table, Row, Col, Card, Typography, Empty, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { getCampaignProducts } from '../../../../redux/advertising/actionCreator';

const { Text } = Typography;

function ProductStep({ wizardData, setWizardData, onBack, onNext }) {
  const dispatch = useDispatch();
  const dateRange = useSelector((state) => state.dashboard.dateRange);
  // ============================================================================================================
  // LOCAL STATE
  // ============================================================================================================
  const [loading, setLoading] = useState(false);

  const [products, setProducts] = useState([]);

  const [searchText, setSearchText] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [selectedProductsMap, setSelectedProductsMap] = useState(() => {
    const map = {};

    (wizardData.products || []).forEach((product) => {
      map[product.asin] = product;
    });

    return map;
  });

  const selectedProducts = useMemo(() => Object.values(selectedProductsMap), [selectedProductsMap]);

  const selectedRowKeys = useMemo(() => selectedProducts.map((product) => product.asin), [selectedProducts]);
  // ============================================================================================================
  // SEARCH DEBOUNCE
  // ============================================================================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);

      setPagination((prev) => ({
        ...prev,
        current: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);
  // ============================================================================================================
  // FETCH PRODUCTS
  // ============================================================================================================
  const fetchProducts = async () => {
    setLoading(true);

    const response = await dispatch(
      getCampaignProducts(
        debouncedSearch,
        pagination.current,
        pagination.pageSize,
        dateRange?.fromDate,
        dateRange?.endDate,
      ),
    );

    if (response?.status) {
      setProducts(response.data || []);

      setPagination((prev) => ({
        ...prev,
        current: response.pageNo,
        pageSize: response.pageSize,
        total: response.totalCount,
      }));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, pagination.current, pagination.pageSize, dateRange?.fromDate, dateRange?.endDate]);
  // ============================================================================================================
  // TABLE COLUMNS
  // ============================================================================================================
  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 90,
      render: (image) => (
        <img
          src={image}
          alt=""
          style={{
            width: 60,
            height: 60,
            objectFit: 'cover',
            borderRadius: 4,
          }}
        />
      ),
    },
    {
      title: 'Product',
      key: 'product',
      width: 340,

      render: (_, record) => (
        <>
          <Text
            strong
            ellipsis={{
              rows: 2,
              tooltip: record.item_name,
            }}
          >
            {record.item_name}
          </Text>

          <br />

          <Text type="secondary">{record.asin}</Text>

          <br />

          <Text type="secondary">{record.sku.length > 25 ? `${record.sku.slice(0, 25)}...` : record.sku}</Text>

          {!record.isAdvertised && (
            <>
              <br />

              <Tag color="orange">No Ad History</Tag>
            </>
          )}
        </>
      ),
    },
    {
      title: 'Ad Spend',

      sorter: (a, b) => a.performance.adSpend - b.performance.adSpend,

      render: (_, record) => (record.performance.adSpend ? `₹${record.performance.adSpend.toFixed(2)}` : '—'),
    },
    {
      title: 'Ad Sales',

      sorter: (a, b) => a.performance.adSales - b.performance.adSales,

      render: (_, record) => (record.performance.adSales ? `₹${record.performance.adSales.toFixed(2)}` : '—'),
    },
    {
      title: 'Orders',

      dataIndex: ['performance', 'orders'],

      sorter: (a, b) => a.performance.orders - b.performance.orders,
      render: (_, record) => (record.performance.orders ? `${record.performance.orders}` : '—'),
    },
    {
      title: 'Impressions',
      sorter: (a, b) => a.performance.impressions - b.performance.impressions,
      render: (_, record) => (record.performance.impressions ? `${record.performance.impressions}` : '—'),
    },
  ];

  return (
    <>
      <Row gutter={24}>
        <Col span={18}>
          <Input
            placeholder="Search products by SKU, ASIN or Product Name"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              marginBottom: 16,
            }}
          />

          <Table
            rowKey="asin"
            loading={loading}
            columns={columns}
            dataSource={products}
            scroll={{
              y: 550,
            }}
            rowSelection={{
              selectedRowKeys,
              preserveSelectedRowKeys: true,

              onSelect: (record, selected) => {
                setSelectedProductsMap((prev) => {
                  const updated = {
                    ...prev,
                  };

                  if (selected) {
                    updated[record.asin] = record;
                  } else {
                    delete updated[record.asin];
                  }

                  return updated;
                });
              },
            }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            }}
            onChange={(pag) => {
              setPagination((prev) => ({
                ...prev,
                current: pag.current,
                pageSize: pag.pageSize,
              }));
            }}
          />
        </Col>

        <Col span={6}>
          <Card
            title={`Selected Products (${selectedProducts.length})`}
            extra={
              selectedProducts.length > 0 && (
                <Button type="link" danger onClick={() => setSelectedProductsMap({})}>
                  Clear All
                </Button>
              )
            }
          >
            {selectedProducts.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No products selected" />
            ) : (
              selectedProducts.map((product) => (
                <Card
                  key={product.asin}
                  size="small"
                  style={{
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 12,
                    }}
                  >
                    <img
                      src={product.image_url}
                      alt=""
                      style={{
                        width: 50,
                        height: 50,
                        objectFit: 'cover',
                        borderRadius: 4,
                      }}
                    />

                    <div>
                      <Text
                        strong
                        style={{
                          display: 'block',
                        }}
                      >
                        {product.item_name?.length > 50 ? `${product.item_name.slice(0, 50)}...` : product.item_name}
                      </Text>

                      <Text type="secondary">{product.asin}</Text>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </Card>
        </Col>
      </Row>

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
          disabled={selectedProducts.length === 0}
          onClick={() => {
            setWizardData({
              ...wizardData,
              products: selectedProducts,
            });

            onNext();
          }}
        >
          Next
        </Button>
      </div>
    </>
  );
}

export default ProductStep;
