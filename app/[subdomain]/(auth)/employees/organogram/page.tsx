'use client';

import Organogram from '@/components/AdminPortal/AdminOrganogram/Organogram';
import PageHeaderWrapper from '@/components/PageHeaderWrapper/PageHeaderWrapper';
import { Users } from 'lucide-react';

export default function page() {
  const breadCrumbs = [
    { title: 'Employees', url: '/employees' },
    { title: 'Organogram', url: '/employees/organogram', tag: true },
  ];

  return (
   
      <Organogram />
   
  );
}
