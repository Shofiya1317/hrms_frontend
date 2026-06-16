'use client';

import Organogram from "@/components/AdminPortal/AdminOrganogram/Organogram";
import PageHeaderWrapper from "@/components/PageHeaderWrapper/PageHeaderWrapper";
import { Users } from 'lucide-react';

export default function page(){
    const breadCrumbs = [
        { title: 'Employees', url: '/employees' },
        { title: 'Organogram', url: '/employees/organogram', tag: true }
    ];

    return (
        <PageHeaderWrapper
            title={
                <div className="flex items-center gap-2">
                    <Users size={24} className="text-[#2D7A4F]" />
                    <span>Organization Chart</span>
                </div>
            }
            breadCrumbMenu={breadCrumbs}
        >
            <Organogram />
        </PageHeaderWrapper>
    )
}