import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Table, Row, Col, Card, Typography, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';

import { getListingProducts } from '../../../../redux/advertising/actionCreator';

const { Text } = Typography;

function ProductStep({ wizardData, setWizardData, onBack, onNext }) {
  const dispatch = useDispatch();
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
      map[product.id] = product;
    });

    return map;
  });

  const selectedProducts = useMemo(() => Object.values(selectedProductsMap), [selectedProductsMap]);

  const selectedRowKeys = useMemo(() => selectedProducts.map((product) => product.id), [selectedProducts]);
  // ============================================================================================================
  // SEARCH DEBOUNCE
  // ============================================================================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);
  // ============================================================================================================
  // FETCH PRODUCTS
  // ============================================================================================================
  const fetchProducts = async () => {
    setLoading(true);

    const response = await dispatch(getListingProducts(pagination.current, pagination.pageSize, debouncedSearch));

    if (response?.status) {
      setProducts(response.data || []);

      setPagination((prev) => ({
        ...prev,
        total: response.totalCount || 0,
      }));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, pagination.current, pagination.pageSize]);
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
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 180,
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      key: 'asin',
      width: 140,
    },
    {
      title: 'Product Name',
      dataIndex: 'item_name',
      key: 'item_name',
      ellipsis: true,
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
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={products}
            scroll={{
              y: 500,
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
                    updated[record.id] = record;
                  } else {
                    delete updated[record.id];
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
            bodyStyle={{
              maxHeight: 600,
              overflowY: 'auto',
            }}
          >
            {selectedProducts.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No products selected" />
            ) : (
              selectedProducts.map((product) => (
                <Card
                  key={product.id}
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
