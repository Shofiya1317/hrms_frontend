'use client';

import React, { ReactElement } from 'react';
import { BreadCrumb } from '../BreadCrumb/BreadCrumb';
import { BreadCrumbProps } from '../types';
import './PageHeaderWrapper.css';

export interface BreadCrumbsItem {
  title: string;
  url: string | undefined;
  tag?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
type PageWrapperProps = React.PropsWithChildren<{
  stackComponent?: ReactElement;
  iswhite?: boolean;
  isDataEntry?: boolean;
  extraClassName?: string;
  breadCrumbMenu?: BreadCrumbProps[];
  title?: string | ReactElement;
}>;

export default function PageHeaderWrapper({
  children,
  stackComponent,
  breadCrumbMenu,
  title,
  iswhite,
  extraClassName,
  isDataEntry,
}: PageWrapperProps) {
  return (
    <div className="w-full min-w-0">
      <div
        className={`w-full min-w-0 pb-4 ${iswhite ? 'page-header-white' : 'page-header-container'} ${extraClassName || ''}`}
      >
        <div className="bread-crumb-wrapper max-w-full overflow-x-auto">
          {breadCrumbMenu && breadCrumbMenu.length > 0 ? (
            <BreadCrumb breadCrumb={breadCrumbMenu} />
          ) : (
            <div className="empty-breadcrumb" />
          )}
        </div>
        {/* {breadCrumbMenu && (
          <BreadCrumb breadCrumb={breadCrumbMenu} />
        )} */}
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {title && (
            <div className="flex min-w-0 items-center">
              <h5
                className={`m-0 break-words font-semibold text-[#0f1f2e] ${isDataEntry ? 'text-sm' : 'text-xl sm:text-[22px]'}`}
              >
                {title}
              </h5>
            </div>
          )}
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            {stackComponent}
          </div>
        </div>
      </div>
      <div className="flex min-w-0 flex-col">{children}</div>
    </div>
  );
}
