import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Spin, Modal, Button, message } from 'antd';
import ProductConfigTab from './ProductConfigurationTabs/ProductConfigTab';
// import InventoryMastertab from './ProductConfigurationTabs/InventoryMastertab';
// import PincodeTab from './ProductConfigurationTabs/PincodeTab';
import {
  getProductConfiguration,
  exportProductConfiguration,
  uploadProductConfiguration,
} from '../../../redux/Settings/actionCreator';
import { PageHeader } from '../../../components/page-headers/page-headers';

export default function ProductConfiguration() {
  const [loading, setLoading] = useState(false);
  const [stdCostModal, setStdCostModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [exportModal, setExportModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const dispatch = useDispatch();
  const { channel: globalChannel } = useSelector((state) => state.dashboard);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSearch = (value) => {
    setSearch(value || '');
  };

  useEffect(() => {
    setLoading(true);

    const payload = {
      search: debouncedSearch,
      channels: globalChannel,
      marketplace_id: '',
      product_type: '',
    };

    dispatch(getProductConfiguration(pagination.current, pagination.pageSize, payload));

    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [dispatch, pagination, globalChannel, debouncedSearch]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'upload') {
        setUploadModal(true);
      }

      if (e.detail === 'stdcost') {
        setStdCostModal(true);
      }
      if (e.detail === 'export') {
        setExportModal(true);
      }
    };

    window.addEventListener('headerAction', handler);

    return () => {
      window.removeEventListener('headerAction', handler);
    };
  }, []);

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Settings' },
    { path: '', breadcrumbName: 'Product Configuration' },
  ];

  const handleExport = () => {
    dispatch(exportProductConfiguration(globalChannel));
    setExportModal(false);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const res = await dispatch(uploadProductConfiguration(selectedFile));
      if (res?.status || res?.success) {
        message.success(res?.message || 'File uploaded successfully');
        setUploadModal(false);
        setSelectedFile(null);
        dispatch(
          getProductConfiguration(pagination.current, pagination.pageSize, {
            search: '',
            channels: globalChannel,
          }),
        );
      } else {
        message.error(res?.message || 'Upload failed');
      }
    } catch (err) {
      message.error(err.message || 'Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Product Configuration"
        className="flex justify-between items-center px-5 pt-2 pb-3 bg-transparent"
      />

      <main className="min-h-[715px] px-5 pb-[30px]">
        <div className="mt-3 bg-white rounded-lg">
          <Spin spinning={loading}>
            <ProductConfigTab
              pagination={pagination}
              setPagination={setPagination}
              search={search}
              onSearch={handleSearch}
            />
          </Spin>
        </div>
      </main>

      <Modal
        open={uploadModal}
        onCancel={() => setUploadModal(false)}
        footer={null}
        centered
        width={500}
        closable={false}
        closeIcon={false}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[18px] font-semibold">Upload File</h2>

          <a href="#" className="text-blue-600 text-sm underline">
            Download Sample File Here
          </a>
        </div>

        <input
          type="file"
          id="fileInput"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            setSelectedFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => document.getElementById('fileInput').click()}
          className="w-full border border-dashed border-blue-400 rounded-md h-[120px] flex items-center justify-center mb-3 bg-gray-50 cursor-pointer hover:bg-blue-50"
        >
          <span className="text-blue-600 font-medium">{selectedFile ? selectedFile.name : 'Upload File'}</span>
        </button>

        <p className="text-xs text-gray-500 mb-4">The upload limit for product configuration is 20,000 line items.</p>

        <div className="flex justify-between">
          <Button onClick={() => setUploadModal(false)}>Cancel</Button>

          <Button type="primary" disabled={!selectedFile} loading={uploading} onClick={handleUploadSubmit}>
            Submit
          </Button>
        </div>
      </Modal>
      <Modal open={stdCostModal} onCancel={() => setStdCostModal(false)} footer={null} centered width={600}>
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[16px] font-semibold">STD Cost Wise Date Upload</h2>
        </div>

        <div className="mb-4">
          <p className="text-sm mb-2">Select CSV File</p>

          <input type="file" accept=".csv" className="border rounded-md px-2 py-1 w-full" />
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Sample Files:</p>

          <ul className="list-disc ml-5 text-sm text-blue-600 space-y-1">
            <li className="cursor-pointer hover:underline">Channel & SKU Wise Sample File</li>
            <li className="cursor-pointer hover:underline">Inventory Master SKU Wise Sample File</li>
          </ul>
        </div>

        <div className="bg-yellow-100 border border-yellow-400 rounded-md p-3 text-sm text-gray-800 mb-5">
          This upload will update the Standard Cost only for past orders. To assign the cost for upcoming orders, please
          update it through the Product Configuration.
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2">
          <Button onClick={() => setStdCostModal(false)}>Cancel</Button>

          <Button type="primary">OK</Button>
        </div>
      </Modal>
      <Modal open={exportModal} onCancel={() => setExportModal(false)} footer={null} centered width={650}>
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[16px] font-semibold">Export</h2>
        </div>

        {/* DATA */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Data</p>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="radio" name="data" defaultChecked />
              Channel, Sku
            </label>

            <label className="flex items-center gap-2">
              <input type="radio" name="data" />
              Inventory Master Sku
            </label>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Data Type</p>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="radio" name="dataType" />
              In R&L
            </label>

            <label className="flex items-center gap-2">
              <input type="radio" name="dataType" />
              With Sales
            </label>
          </div>
        </div>

        {/* SELECT COLUMNS */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Select Columns</p>

          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" defaultChecked />
            Select All
          </label>

          <div className="grid grid-cols-3 gap-2 text-sm">
            {[
              'Channel',
              'Account',
              'Name',
              'Std cost',
              'Inv Master',
              'Height(cm)',
              'Product Id',
              'Display SKU',
              'Parent Id',
              'Std cost tax %',
              'Length(cm)',
              'Weight(kg)',
              'SKU',
              'Status',
              'MRP',
              'Storage Master',
              'Breadth(cm)',
              'Category Ids',
            ].map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                {item}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setExportModal(false)}>Cancel</Button>

          <Button
            type="primary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              handleExport();
            }}
          >
            Export
          </Button>
        </div>
      </Modal>
    </>
  );
}
