import React, { useState, useEffect } from 'react';
import { Button, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { PlusOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import { getPrivacyPolicy, createPrivacyPolicy, updatePrivacyPolicy } from '../../redux/admin/actionCreator';

function PrivacyPolicy() {
  const [selectedTab, setSelectedTab] = useState('privacy_policy');
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [editId, setEditId] = useState(null);

  const dispatch = useDispatch();
  const { privacypolicyData, loading } = useSelector((state) => state.AdminDashboard);

  const documents = privacypolicyData?.data || [];

  useEffect(() => {
    dispatch(getPrivacyPolicy(selectedTab));
  }, [dispatch, selectedTab]);

  const menuItems = [
    {
      label: 'Privacy Policy',
      value: 'privacy_policy',
    },
    {
      label: 'About Us',
      value: 'about_us',
    },
    {
      label: 'Third-Party Policies',
      value: 'terms',
    },
    {
      label: 'Platform Privacy',
      value: 'plateform_policy',
    },
  ];

  const handleSave = async () => {
    const payload = {
      title: selectedTab,
      content,
      is_active: true,
    };

    try {
      if (editId) {
        await dispatch(updatePrivacyPolicy(editId, payload));
      } else {
        await dispatch(createPrivacyPolicy(payload));
      }

      await dispatch(getPrivacyPolicy(selectedTab));

      setShowForm(false);
      setContent('');
      setEditId(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-3 px-2 bg-[#f8f9fb] min-h-screen">
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="flex min-h-[600px]">
          {/* Sidebar */}
          <div className="w-[250px] p-3 border-r">
            <div className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setSelectedTab(item.value)}
                  className={`text-left px-4 py-3 rounded-lg text-[15px] transition-all ${
                    selectedTab === item.value
                      ? 'bg-gray-100 font-semibold text-black'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-3">
            {/* Future Content */}
            {loading ? (
              <div className="flex items-center justify-center min-h-[500px]">
                <Spin size="large" />
              </div>
            ) : (
              <div className="mt-6">
                {!showForm ? (
                  documents.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center mb-5">
                        <h2 className="text-[22px] font-bold">
                          {menuItems.find((item) => item.value === selectedTab)?.label}
                        </h2>

                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => {
                            setEditId(null);
                            setContent('');
                            setShowForm(true);
                          }}
                          className="!bg-[#f58d73] !border-[#f58d73] px-2 flex items-center justify-center text-[13px] font-semibold h-[30px]"
                        >
                          Add
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {documents.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white border rounded-xl p-3 shadow-md hover:shadow-lg transition-all"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                  {item.title.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </h3>

                                <div className="flex items-center gap-3 mt-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}
                                  >
                                    {item.is_active ? 'Active' : 'Inactive'}
                                  </span>

                                  <span className="text-xs text-gray-500">
                                    {new Date(item.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <FormOutlined
                                  onClick={() => {
                                    setEditId(item.id);
                                    setContent(item.content);
                                    setShowForm(true);
                                  }}
                                  className="text-[#f58d73] cursor-pointer text-[17px] hover:scale-110 transition-all"
                                />

                                <DeleteOutlined className="text-red-500 cursor-pointer text-[17px] hover:scale-110 transition-all" />
                              </div>
                            </div>

                            <div
                              className="bg-gray-50 rounded-lg p-4 text-gray-700"
                              dangerouslySetInnerHTML={{
                                __html: item.content,
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-[21px] font-bold text-black mb-3">No Data Available</h2>

                        <p className="text-gray-500 text-[15px]">No content available.</p>
                      </div>

                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setEditId(null);
                          setContent('');
                          setShowForm(true);
                        }}
                        className="!bg-[#f58d73] !border-[#f58d73] px-2 flex items-center justify-center text-[13px] font-semibold h-[30px]"
                      >
                        Add
                      </Button>
                    </div>
                  )
                ) : (
                  <div>
                    <h2 className="text-[21px] font-bold text-black mb-6">No Data Available</h2>

                    <div className="mb-5">
                      <label className="block text-[14px] font-medium mb-2">Select Title</label>

                      <select
                        value={selectedTab}
                        onChange={(e) => setSelectedTab(e.target.value)}
                        className="w-[220px] h-[35px] text-[13px] border border-gray-300 rounded-md px-3 outline-none"
                      >
                        <option value="privacy_policy">Privacy Policy</option>
                        <option value="about_us">About Us</option>
                        <option value="terms">Terms and Conditions</option>
                        <option value="plateform_policy">Platform Policy</option>
                      </select>
                    </div>

                    <textarea
                      rows={7}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter content here..."
                      className="w-full border border-gray-300 rounded-md p-3 resize-none outline-none"
                    />

                    <div className="flex gap-3 mt-5">
                      <Button type="primary" onClick={handleSave} className="!bg-[#f58d73] !border-[#f58d73]">
                        Save
                      </Button>

                      <Button
                        onClick={() => {
                          setShowForm(false);
                          setContent('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
