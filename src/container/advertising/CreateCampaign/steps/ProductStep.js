import { useEffect, useMemo, useState } from 'react';
import { Button, Input, Table, Typography, Empty, Tag, Tooltip, Drawer } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const handleRemoveProduct = (asin) => {
    setSelectedProductsMap((prev) => {
      const updated = { ...prev };
      delete updated[asin];
      return updated;
    });
  };

  // ============================================================================================================
  // TABLE COLUMNS
  // ============================================================================================================
  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 75,
      align: 'center',
      render: (image) => (
        <img
          src={image || '/icons/default-product.png'}
          alt=""
          className="w-12 h-12 object-cover rounded-md border border-gray-100 dark:border-white/10 mx-auto"
        />
      ),
    },
    {
      title: 'Product',
      key: 'product',
      width: 320,
      render: (_, record) => (
        <div className="space-y-1">
          <Tooltip title={record.item_name} placement="topLeft">
            <Text
              strong
              className="text-xs text-gray-800 dark:text-white/90 line-clamp-2 block font-medium"
              ellipsis={{ rows: 2 }}
            >
              {record.item_name}
            </Text>
          </Tooltip>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 dark:text-white/60">
            <Tooltip title={`ASIN: ${record.asin}`} placement="topLeft">
              <span className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono">
                {record.asin}
              </span>
            </Tooltip>

            {record.sku && (
              <Tooltip title={`SKU: ${record.sku}`} placement="topLeft">
                <span className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono truncate max-w-[140px]">
                  {record.sku}
                </span>
              </Tooltip>
            )}

            {!record.isAdvertised && (
              <Tag color="orange" className="mr-0 text-[10px] leading-4 px-1.5 py-0">
                No Ad History
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Ad Spend',
      key: 'adSpend',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.performance?.adSpend || 0) - (b.performance?.adSpend || 0),
      render: (_, record) => (
        <span className="font-medium text-gray-700 dark:text-white/80">
          {record.performance?.adSpend ? `₹${record.performance.adSpend.toFixed(2)}` : '—'}
        </span>
      ),
    },
    {
      title: 'Ad Sales',
      key: 'adSales',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.performance?.adSales || 0) - (b.performance?.adSales || 0),
      render: (_, record) => (
        <span className="font-medium text-gray-700 dark:text-white/80">
          {record.performance?.adSales ? `₹${record.performance.adSales.toFixed(2)}` : '—'}
        </span>
      ),
    },
    {
      title: 'Orders',
      key: 'orders',
      width: 100,
      align: 'right',
      sorter: (a, b) => (a.performance?.orders || 0) - (b.performance?.orders || 0),
      render: (_, record) => (
        <span className="text-gray-700 dark:text-white/80">
          {record.performance?.orders ? record.performance.orders : '—'}
        </span>
      ),
    },
    {
      title: 'Impressions',
      key: 'impressions',
      width: 120,
      align: 'right',
      sorter: (a, b) => (a.performance?.impressions || 0) - (b.performance?.impressions || 0),
      render: (_, record) => (
        <span className="text-gray-700 dark:text-white/80">
          {record.performance?.impressions ? record.performance.impressions.toLocaleString() : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50/60 dark:bg-white/5 p-3 rounded-lg border border-gray-100 dark:border-white/10">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search products by SKU, ASIN, or Title..."
            prefix={<SearchOutlined className="text-gray-400" />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type={selectedProducts.length > 0 ? 'primary' : 'default'}
            icon={<ShoppingCartOutlined />}
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1.5"
          >
            <span>Selected Products</span>
            <span
              className={`flex items-center justify-center px-1.5 py-0.2 rounded-full text-xs font-semibold ${
                selectedProducts.length > 0 ? 'bg-white text-primary' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {selectedProducts.length}
            </span>
          </Button>

          {selectedProducts.length > 0 && (
            <Button type="text" danger size="small" onClick={() => setSelectedProductsMap({})} className="text-xs">
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Full-Width Table */}
      <div className="border border-gray-200/80 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-transparent p-2">
        <Table
          rowKey="asin"
          size="small"
          showSorterTooltip={false}
          loading={loading}
          columns={columns}
          dataSource={products}
          scroll={{ y: 500 }}
          rowSelection={{
            selectedRowKeys,
            preserveSelectedRowKeys: true,
            onSelect: (record, selected) => {
              setSelectedProductsMap((prev) => {
                const updated = { ...prev };
                if (selected) {
                  updated[record.asin] = record;
                } else {
                  delete updated[record.asin];
                }
                return updated;
              });
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
              setSelectedProductsMap((prev) => {
                const updated = { ...prev };
                changeRows.forEach((row) => {
                  if (selected) {
                    updated[row.asin] = row;
                  } else {
                    delete updated[row.asin];
                  }
                });
                return updated;
              });
            },
          }}
          pagination={{
            ...pagination,
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
          }}
          onChange={(pag) => {
            setPagination((prev) => ({
              ...prev,
              current: pag.current,
              pageSize: pag.pageSize,
            }));
          }}
          className="
            [&_.ant-table-thead>tr>th]:!text-[12px]
            [&_.ant-table-thead>tr>th]:!font-semibold
            [&_.ant-table-tbody>tr>td]:!text-[12px]
            [&_.ant-table-cell]:!px-3
            [&_.ant-table-cell]:!py-2.5
          "
        />
      </div>

      {/* Selected Products Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">Selected Products ({selectedProducts.length})</span>
            {selectedProducts.length > 0 && (
              <Button
                type="link"
                danger
                size="small"
                className="p-0 text-xs"
                onClick={() => setSelectedProductsMap({})}
              >
                Clear All
              </Button>
            )}
          </div>
        }
        placement="right"
        width={420}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        footer={
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-gray-500">
              Total Selected: <strong className="text-gray-800 dark:text-white">{selectedProducts.length}</strong>
            </span>
            <Button type="primary" size="small" onClick={() => setDrawerOpen(false)}>
              Done
            </Button>
          </div>
        }
      >
        {selectedProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-xs text-gray-400">
                  No products selected yet. Check items in the table to add them here.
                </span>
              }
            />
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedProducts.map((product) => (
              <div
                key={product.asin}
                className="p-2.5 rounded-lg border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between gap-3 hover:border-gray-200 transition-all"
              >
                <img
                  src={product.image_url || '/icons/default-product.png'}
                  alt=""
                  className="w-11 h-11 object-cover rounded-md border border-gray-200 dark:border-white/10 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <Tooltip title={product.item_name}>
                    <Text strong className="text-xs line-clamp-1 block text-gray-800 dark:text-white/90">
                      {product.item_name}
                    </Text>
                  </Tooltip>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                    <span className="font-mono bg-white dark:bg-white/10 px-1 rounded border border-gray-200/60 dark:border-white/10">
                      {product.asin}
                    </span>
                    {product.sku && <span className="truncate max-w-[120px] font-mono">{product.sku}</span>}
                  </div>
                </div>

                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<CloseCircleOutlined className="text-gray-400 hover:text-red-500 text-sm" />}
                  onClick={() => handleRemoveProduct(product.asin)}
                  className="shrink-0 p-1 h-auto"
                />
              </div>
            ))}
          </div>
        )}
      </Drawer>

      {/* Bottom Step Actions */}
      <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
        <Button onClick={onBack}>Back</Button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {selectedProducts.length > 0 ? (
              <span className="text-green-600 font-medium">✓ {selectedProducts.length} product(s) selected</span>
            ) : (
              <span className="text-gray-400">Select at least 1 product</span>
            )}
          </span>

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
      </div>
    </div>
  );
}

export default ProductStep;
