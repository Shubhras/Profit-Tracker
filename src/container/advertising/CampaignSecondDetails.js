import React, { useEffect } from 'react';
import { Button, Table, Tag, Tooltip } from 'antd';
import { ArrowLeftOutlined, FilterOutlined, ExportOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdProducts } from '../../redux/advertising/actionCreator';

function CampaignSecondDetails() {
  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const { adsProductsData, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(
      getAdProducts(pagination.current, pagination.pageSize, {
        ad_group_id: id,
      }),
    );
  }, [dispatch, pagination, id]);

  const dataSource =
    adsProductsData?.results?.map((item) => ({
      key: item.ad_id,
      adId: item.ad_id,
      asin: item.asin,
      sku: item.sku,
      campaignName: item.campaign_name,
      adGroupName: item.ad_group_name,
      state: item.state,
      servingStatus: item.serving_status,
      creationDate: item.created_at,
    })) || [];

  const adGroupName = adsProductsData?.results?.[0]?.ad_group_name;

  const columns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Campaign Name',
      dataIndex: 'campaignName',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="font-medium text-[#111827]
            block truncate cursor-pointer"
            style={{ maxWidth: '220px' }}
          >
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Ad Group Name',
      dataIndex: 'adGroupName',
      align: 'center',
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span
            className="text-[#111827]
            block truncate cursor-pointer"
            style={{ maxWidth: '220px' }}
          >
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'State',
      dataIndex: 'state',
      align: 'center',
      render: (v) => (
        <Tag color={v === 'ENABLED' ? 'success' : 'error'} className="!px-3 !py-[3px] !rounded-full">
          {v}
        </Tag>
      ),
    },

    {
      title: 'Created At',
      dataIndex: 'creationDate',
      align: 'center',
    },
  ];

  return (
    <>
      <div className="p-2">
        <div
          className="mt-3 mb-3 rounded-2xl
          border border-[#e5e7eb]
          bg-white shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between
            border-b border-[#edf0f2]
            px-6 py-4"
          >
            {/* Left */}
            <div className="flex items-center gap-4">
              {/* Back */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-[42px] h-[42px]
                rounded-xl border border-[#dbe1e8]
                bg-white flex items-center justify-center
                hover:bg-[#f8fafc]
                transition-all duration-200 shadow-sm"
              >
                <ArrowLeftOutlined className="text-[#374151]" />
              </button>

              {/* Title */}
              <div className="flex flex-col">
                <h1
                  className="text-[24px]
                  font-semibold text-[#111827]
                  leading-[30px] mb-1"
                >
                  Ad Products Details
                </h1>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[14px]
                    text-[#6b7280] font-medium"
                  >
                    Ad Group Name:
                  </span>

                  <div className="min-w-[120px] h-[28px] px-3 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] text-[12px] font-semibold flex items-center justify-center">
                    {adGroupName || 'Campaign Details'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-3">
              <Button
                icon={<FilterOutlined />}
                className="!h-[40px]
                !rounded-xl !border-[#dbe1e8]
                !text-[#374151]
                !font-medium !flex
                !items-center !justify-center"
              >
                Filters
              </Button>

              <Button
                type="primary"
                icon={<ExportOutlined />}
                className="!h-[40px]
                !rounded-xl !bg-[#2563eb]
                !font-medium !flex
                !items-center !justify-center"
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
            scroll={{ x: 'max-content' }}
            size="middle"
            bordered={false}
          />
        </div>
      </div>
    </>
  );
}

export default CampaignSecondDetails;
