'use client';

import NoDataImg from '@/assests/User.png';
import { IMeta } from '@/lib/interface/IMeta.interface';
import { buildQueryParams } from '@/lib/utils';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Image from 'next/image';
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import DataTable, { TableColumn, TableStyles } from 'react-data-table-component';
import './Table.css';

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  meta?: IMeta;
}

export const handlePageChange = (
  page: number,
  setCurrentPage: (data: number) => void,
  searchParams: ReadonlyURLSearchParams,
  router: AppRouterInstance,
) => {
  setCurrentPage(page);
  const query = buildQueryParams({
    ...Object.fromEntries(
      new URLSearchParams(searchParams?.toString() ?? ''),
    ),
    page: page.toString(),
  }).toString();
  router.push(`?${query}`);
};

export const handleRowsPerPageChange = (
  newLimit: number,
  setRowsPerPage: (data: number) => void,
  setCurrentPage: (data: number) => void,
  searchParams: ReadonlyURLSearchParams,
  router: AppRouterInstance,
) => {
  setRowsPerPage(newLimit);
  setCurrentPage(1);
  const query = buildQueryParams({
    ...Object.fromEntries(
      new URLSearchParams(searchParams?.toString() ?? ''),
    ),
    page: '1',
    limit: newLimit.toString(),
  }).toString();
  router.push(`?${query}`);
};

function Table<T>({ data, columns, meta }: Readonly<TableProps<T>>) {
  const [currentPage, setCurrentPage] = useState(Number(meta?.currentPage) || 1);
  const [rowsPerPage, setRowsPerPage] = useState(Number(meta?.currentLimit) || 10);
  const router = useRouter();
  const searchParams = useSearchParams();

  const tableStyles: TableStyles = {
    table: {
      style: {
        minWidth: '760px',
      },
    },
    headRow: {
      style: {
        minHeight: '52px',
      },
    },
    headCells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
        minHeight: '60px',
      },
    },
    pagination: {
      style: {
        flexWrap: 'wrap',
        gap: '8px',
        minHeight: 'auto',
        padding: '12px 16px',
      },
      pageButtonsStyle: {
        minWidth: '32px',
        height: '32px',
      },
    },
  };

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-lg border border-gray-100 bg-white">
      <DataTable
        columns={columns}
        className="clm-data-table"
        customStyles={tableStyles}
        data={data}
        pagination={!!meta}
        paginationServer
        paginationTotalRows={meta?.totalCount || meta?.totalcount}
        paginationDefaultPage={currentPage}
        paginationPerPage={rowsPerPage}
        paginationRowsPerPageOptions={[10, 15, 20, 25, 30, 50]}
        responsive={false}
        onChangePage={(page: number) => handlePageChange(page, setCurrentPage, searchParams, router)}
        onChangeRowsPerPage={(row: number) => handleRowsPerPageChange(
          row,
          setRowsPerPage,
          setCurrentPage,
          searchParams,
          router,
        )}
        noDataComponent={(
          <div className="my-8 flex flex-col items-center px-4 text-center">
            <Image
              src={NoDataImg}
              alt="No data available"
              className="h-auto w-full max-w-[280px] sm:max-w-[360px]"
            />
            <p className="mt-3 text-sm font-medium text-gray-500">No data available</p>
          </div>
        )}
      />
    </div>
  );
}

export default Table;
