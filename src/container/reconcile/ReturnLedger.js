import React from 'react';
import ReturnFilterBar from './component/ReturnFilterBar';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function ReturnLedger() {
  const PageRoutes = [
    {
      path: '',
      breadcrumbName: 'Reconcile',
    },
    {
      path: '',
      breadcrumbName: 'Returns',
    },
    {
      path: '',
      breadcrumbName: 'Returns Tracker',
    },
  ];
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Returns Tracker"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <ReturnFilterBar />
      </main>
    </>
  );
}
