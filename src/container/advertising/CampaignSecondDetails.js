import React, { useEffect, useState } from 'react';
import { Table, Tooltip, Button, Dropdown, message, Switch } from 'antd';
import {
  ArrowLeftOutlined,
  SearchOutlined,
  ExportOutlined,
  DownOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getAdProducts, exportAdProducts } from '../../redux/advertising/actionCreator';

function CampaignSecondDetails() {
  const { id } = useParams();
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const { adsProductsData, loading } = useSelector((state) => ({
    loading: state.advertising.loading,
    adsProductsData: state.advertising.adsProductsData,
  }));

  const adGroupId = location.state?.adGroupId || id;
  const adGroupName = location.state?.adGroupName || '';

  const handleExport = async (format = 'xlsx') => {
    setExportLoading(true);
    try {
      const payload = {
        ad_group_id: adGroupId,
        search: debouncedSearch,
      };
      const res = await dispatch(exportAdProducts(payload, format));
      if (res?.status) {
        message.success('Export report generated successfully!');
      } else {
        message.error(res?.message || 'Failed to export ad products');
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to export ad products');
    } finally {
      setExportLoading(false);
    }
  };

  const exportMenuItems = [
    {
      key: 'xlsx',
      label: 'Excel (.xlsx)',
      icon: <FileExcelOutlined style={{ color: '#10b981' }} />,
      onClick: () => handleExport('xlsx'),
    },
    {
      key: 'csv',
      label: 'CSV (.csv)',
      icon: <FileTextOutlined style={{ color: '#3b82f6' }} />,
      onClick: () => handleExport('csv'),
    },
  ];

  useEffect(() => {
    dispatch(
      getAdProducts(pagination.current, pagination.pageSize, {
        ad_group_id: adGroupId,
        search: debouncedSearch,
      }),
    );
  }, [dispatch, pagination.current, pagination.pageSize, adGroupId, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const dataSource =
    adsProductsData?.results?.map((item, index) => ({
      key: item.id || item.sku || index,
      image: item.image_url,
      sku: item.sku,
      asin: item.asin,
      state: item.state,
      totalads: item.total_ads,
      impressions: item.impressions ?? 0,
      clicks: item.clicks ?? 0,
      cost: item.cost ?? 0,
      sales: item.sales ?? 0,
      orders: item.orders ?? 0,
      acos: item.acos ?? item.metrics?.acos ?? 0,
      roas: item.roas ?? item.metrics?.roas ?? 0,
    })) || [];

  const columns = [
    {
      title: 'State',
      dataIndex: 'state',
      width: 70,
      align: 'center',
      render: (v) => <Switch checked={v === 'ENABLED'} size="small" />,
    },
    {
      title: 'Image',
      dataIndex: 'image',
      width: 70,
      align: 'center',
      render: (image) => (
        <div className="flex justify-center">
          {image ? (
            <img
              src={image}
              alt="product"
              className="w-[35px] h-[35px] rounded-xl object-cover border border-[#e5e7eb] p-[2px] bg-white shadow-sm"
            />
          ) : (
            <div className="w-[35px] h-[35px] rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
              -
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      align: 'center',
      width: 80,
      ellipsis: true,
      sorter: (a, b) => String(a.sku || '').localeCompare(String(b.sku || '')),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="font-medium text-[#2563eb] block truncate cursor-pointer mx-auto"
            style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {v || '-'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'ASIN',
      dataIndex: 'asin',
      align: 'center',
      width: 80,
      ellipsis: true,
      sorter: (a, b) => String(a.asin || '').localeCompare(String(b.asin || '')),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="font-medium text-[#111827] block truncate cursor-pointer mx-auto"
            style={{ maxWidth: '120px' }}
          >
            {v || '-'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Total Ads',
      dataIndex: 'totalads',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.totalads || 0) - Number(b.totalads || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.impressions || 0) - Number(b.impressions || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },
    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.clicks || 0) - Number(b.clicks || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.cost || 0) - Number(b.cost || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#dc2626]">₹{Number(v ?? 0).toFixed(2)}</span>,
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.sales || 0) - Number(b.sales || 0),
      ellipsis: true,
      render: (v) => {
        const formattedValue = Number(v ?? 0).toLocaleString('en-IN');
        return <span className="font-medium text-[#16a34a] block truncate">₹{formattedValue}</span>;
      },
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.orders || 0) - Number(b.orders || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },
    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.acos || 0) - Number(b.acos || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ? `${v.toFixed(2)}%` : '0'}</span>,
    },
    {
      title: 'ROAS',
      dataIndex: 'roas',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.roas || 0) - Number(b.roas || 0),
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ? `${v.toFixed(2)}%` : '0'}</span>,
    },
  ];

  return (
    <>
      <div className="p-2 px-4">
        <div className="mt-2 mb-3 rounded-lg border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#edf0f2] px-4 py-3">
            {/* Top Row */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-[30px] h-[30px] rounded-xl border border-[#dbe1e8] bg-white flex items-center justify-center hover:bg-[#f8fafc] transition-all duration-200 shadow-sm"
              >
                <ArrowLeftOutlined className="text-[#374151]" />
              </button>

              <div className="flex flex-col">
                <h1 className="text-[17px] font-semibold text-[#111827] leading-[30px] mb-0">Ad Products Details</h1>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] text-[#6b7280] font-medium">Ad Group Name:</span>

                  <div className="min-w-[120px] h-[20px] px-2 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-[12px] font-semibold flex items-center justify-center">
                    {adGroupName || 'Campaign Details'}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="mt-5 flex items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-[260px]">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search ad products..."
                  className="w-full h-[30px] rounded-lg border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none shadow-sm focus:border-[#2563eb]"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>

              <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight" trigger={['click']}>
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  loading={exportLoading}
                  className="!h-[30px] text-[13px] !rounded-lg !bg-[#2563eb] !font-semibold !flex !items-center !justify-center"
                >
                  Export <DownOutlined className="text-[10px] ml-1" />
                </Button>
              </Dropdown>
            </div>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            tableLayout="fixed"
            showSorterTooltip={false}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: adsProductsData?.pagination?.total_records || 0,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            }}
            onChange={(pag) => {
              setPagination({
                current: pag.current,
                pageSize: pag.pageSize,
              });
            }}
            scroll={{ x: 900 }}
            size="middle"
            bordered={false}
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-2
  "
          />
        </div>
      </div>
    </>
  );
}

export default CampaignSecondDetails;
