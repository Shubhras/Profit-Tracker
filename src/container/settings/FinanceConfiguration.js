import React from 'react';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function FinanceConfiguration() {
  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Settings',
    },
    {
      path: 'index',
      breadcrumbName: 'Product Settings',
    },
    {
      path: 'index',
      breadcrumbName: 'Finance Configuration',
    },
  ];
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Finance Configuration"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        Finance Configuration
      </main>
    </>
  );
}
