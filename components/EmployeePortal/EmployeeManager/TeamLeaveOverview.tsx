'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { getTeamLeaveStatus, TeamMemberLeaveStatus } from '@/lib/service/employeeLeaveBalance';
import { Modal } from '@/components/Modal/Modal';
import Avatar from '@/components/Avatar/Avatar';

export default function TeamLeaveOverview({ subdomain }: { subdomain: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeamMemberLeaveStatus[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<TeamMemberLeaveStatus | null>(null);

  useEffect(() => {
    if (subdomain) {
      fetchData();
    }
  }, [subdomain]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTeamLeaveStatus(subdomain);
      const resData = res?.data?.data ?? res?.data;
      if (Array.isArray(resData)) {
        setData(resData);
      }
    } catch (error) {
      console.error('Error fetching team leave status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center text-gray-500 text-sm">
        <Loader2 size={16} className="animate-spin mr-2" />
        Loading leaves...
      </div>
    );
  }

  if (data.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
        <div className="text-sm font-semibold text-gray-600 flex items-center">
          <Calendar size={16} className="mr-1 text-teal-600" /> Team Balances:
        </div>
        <div className="flex flex-wrap gap-2">
          {data.map((member) => (
            <button
              key={member.employee.id}
              onClick={() => setSelectedEmployee(member)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium border border-teal-100 transition-colors"
              title={`Click to view balance of ${member.employee.name}`}
            >
              {member.employee.name}
            </button>
          ))}
        </div>
      </div>

      <Modal
        show={!!selectedEmployee}
        onHide={() => setSelectedEmployee(null)}
        title={`${selectedEmployee?.employee.name}'s Leave Balance`}
        size="lg"
        onClose={() => setSelectedEmployee(null)}
      >
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar
                avator={selectedEmployee.employee.avatar_url || ''}
                name={selectedEmployee.employee.name}
                size="48"
              />
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedEmployee.employee.name}</h3>
                <p className="text-sm text-gray-500">{selectedEmployee.employee.designation}</p>
                <p className="text-xs text-gray-400">Emp Code: {selectedEmployee.employee.employee_code}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">Approved Upcoming Leaves</h4>
              {selectedEmployee.approved_upcoming_leaves.length > 0 ? (
                <div className="grid gap-3">
                  {selectedEmployee.approved_upcoming_leaves.map((leave) => (
                    <div key={leave.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{leave.leave_type_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(leave.from_date).toLocaleDateString()} - {new Date(leave.to_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 rounded-md text-xs font-semibold">
                          {leave.total_days} Day{leave.total_days > 1 ? 's' : ''} {leave.half_day ? '(Half Day)' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No upcoming leaves approved.</p>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-sm">Leave Balances</h4>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">Leave Type</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Entitled</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Used</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Pending</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {selectedEmployee.leave_balances.map((balance) => (
                      <tr key={balance.leave_type_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{balance.leave_type_name}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{balance.total_entitled}</td>
                        <td className="px-4 py-3 text-center text-red-600 font-medium">{balance.used}</td>
                        <td className="px-4 py-3 text-center text-orange-500 font-medium">{balance.pending}</td>
                        <td className="px-4 py-3 text-center text-teal-600 font-bold">{balance.available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
