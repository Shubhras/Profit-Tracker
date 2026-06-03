import React, { useEffect } from 'react';
import { Button, Table, Tooltip } from 'antd';
import { ArrowLeftOutlined, FilterOutlined, ExportOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getSearchTerms } from '../../redux/advertising/actionCreator';

function CampaignSecondDetails() {
  const { id } = useParams();
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const { searchTerms, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(
      getSearchTerms(pagination.current, pagination.pageSize, {
        filters: {
          // search: 'headphones',
          campaign_id: Number(id),
          // match_types: ['BROAD', 'PHRASE', 'EXACT'],
          // from_date: '2026-05-01',
          // to_date: '2026-05-31',
          // min_acos: 10,
          // max_acos: 50,
          // min_roas: 1,
          // max_roas: 10,
          // sort_by: 'sales',
          // sort_order: 'desc',
        },
        pagination: {
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
        },
      }),
    );
    // }, [dispatch, pagination, id]);
  }, [dispatch, pagination.current, pagination.pageSize, id]);

  const dataSource =
    searchTerms?.results?.map((item, index) => ({
      key: index,

      sku: item.sku,
      asin: item.asin,
      itemName: item.item_name,
      image: item.image_url,

      totalAds: item.total_ads,

      impressions: item.impressions,
      clicks: item.clicks,
      cost: item.cost,
      sales: item.sales,
      orders: item.orders,
    })) || [];

  const adGroupName = location?.state?.adGroupName || '-';

  const columns = [
    {
      title: '',
      dataIndex: 'image',
      align: 'center',
      width: 50,
      fixed: 'left',

      render: (_, record) => (
        <div className="flex justify-center">
          <img
            src={record.image}
            alt="product"
            className="w-[35px] h-[35px] rounded-xl object-cover border border-[#e5e7eb]"
          />
        </div>
      ),
    },

    {
      title: 'SKU',
      dataIndex: 'sku',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.sku || '').localeCompare(String(b.sku || '')),
      ellipsis: true,

      render: (v) => (
        <div className="flex justify-center">
          <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <span
              className="text-[#2563eb] block truncate cursor-pointer text-center font-medium"
              style={{ maxWidth: '70px' }}
            >
              {v || '-'}
            </span>
          </Tooltip>
        </div>
      ),
    },

    {
      title: 'Item Name',
      dataIndex: 'itemName',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.itemName || '').localeCompare(String(b.itemName || '')),
      ellipsis: true,

      render: (v) => (
        <div className="flex justify-center">
          <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <span className="text-[#111827] block truncate cursor-pointer text-center" style={{ maxWidth: '70px' }}>
              {v || '-'}
            </span>
          </Tooltip>
        </div>
      ),
    },

    {
      title: 'Total Ads',
      dataIndex: 'totalAds',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.totalAds || 0) - Number(b.totalAds || 0),

      render: (v) => <span className="font-semibold text-[#2563eb]">{v ?? 0}</span>,
    },

    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.impressions || 0) - Number(b.impressions || 0),

      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.clicks || 0) - Number(b.clicks || 0),

      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.cost || 0) - Number(b.cost || 0),
      render: (v) => <span className="font-medium text-[#dc2626]">₹{Number(v ?? 0).toFixed(2)}</span>,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.sales || 0) - Number(b.sales || 0),

      render: (v) => <span className="font-medium text-[#16a34a]">₹{Number(v ?? 0).toFixed(2)}</span>,
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.orders || 0) - Number(b.orders || 0),
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },
  ];

  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#edf0f2] px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-[35px] h-[35px] rounded-xl border border-[#dbe1e8]
                bg-white flex items-center justify-center hover:bg-[#f8fafc]
                transition-all duration-200 shadow-sm"
              >
                <ArrowLeftOutlined className="text-[#374151]" />
              </button>

              {/* Title */}
              <div className="flex flex-col">
                <h1 className="text-[18px] font-semibold text-[#111827] leading-[30px] mb-1">Ad Products Details</h1>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[14px]
                    text-[#6b7280] font-medium"
                  >
                    Ad Group Name:
                  </span>

                  <div className="min-w-[120px] h-[23px] px-2 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-[12px] font-semibold flex items-center justify-center">
                    {adGroupName || 'Campaign Details'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-3">
              <Button
                icon={<FilterOutlined />}
                className="!h-[30px] text-[13px] !rounded-xl !border-[#dbe1e8] !text-[#374151] !font-medium !flex !items-center !justify-center"
              >
                Filters
              </Button>

              <Button
                type="primary"
                icon={<ExportOutlined />}
                className="!h-[30px] text-[13px] !rounded-xl !bg-[#2563eb] !font-medium !flex !items-center !justify-center"
              >
                Export
              </Button>
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
              total: searchTerms?.pagination?.total_records || 0,
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
