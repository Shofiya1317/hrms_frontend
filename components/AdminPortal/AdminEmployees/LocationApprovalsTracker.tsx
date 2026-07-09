'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  User,
} from 'lucide-react';
import {
  getPendingLocations,
  approveLocation,
  rejectLocation,
} from '@/lib/service/employee';
import toast from 'react-hot-toast';
import { useApprovalCounts } from '@/lib/context/ApprovalCountsContext';

interface PendingLocationRequest {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  employee_code: string;
  home_latitude: number | null;
  home_longitude: number | null;
  pending_latitude: number | null;
  pending_longitude: number | null;
  location_status: string;
}

export default function LocationApprovalsTracker() {
  const params = useParams();
  const slug = params?.subdomain as string;

  const [requests, setRequests] = useState<PendingLocationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const { refreshCounts } = useApprovalCounts();

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPendingLocations(slug);
      setRequests(res?.data?.data ?? res?.data ?? []);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to fetch pending location requests');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (employeeId: string) => {
    setActioningId(employeeId);
    try {
      await approveLocation(employeeId, slug);
      toast.success('Location update request approved successfully');
      refreshCounts();
      fetchRequests();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to approve request');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (employeeId: string) => {
    setActioningId(employeeId);
    try {
      await rejectLocation(employeeId, slug);
      toast.success('Location update request rejected successfully');
      refreshCounts();
      fetchRequests();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to reject request');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
        <p className="text-sm text-gray-500">Loading location approval requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100">
        <div>
          <h2 className="text-sm font-bold text-gray-800">Pending Location Updates</h2>
          <p className="text-xs text-gray-500">Employees requesting to update their primary geofenced home location coordinates</p>
        </div>
        <button
          onClick={fetchRequests}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
          title="Refresh list"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-150 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-800">All caught up!</h3>
          <p className="text-xs text-gray-500 max-w-xs mt-1">There are no pending employee location approvals at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => {
            const empName = `${req.first_name || ''} ${req.last_name || ''}`.trim();
            const currentCoordinates = req.home_latitude && req.home_longitude
              ? `${Number(req.home_latitude).toFixed(6)}, ${Number(req.home_longitude).toFixed(6)}`
              : 'Not Set';
            
            const requestedCoordinates = req.pending_latitude && req.pending_longitude
              ? `${Number(req.pending_latitude).toFixed(6)}, ${Number(req.pending_longitude).toFixed(6)}`
              : 'N/A';

            const isActioning = actioningId === req.id;

            return (
              <div key={req.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-semibold text-sm">
                        <User size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{empName}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">{req.employee_code || 'N/A'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                      Pending Approval
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 mb-4 bg-gray-50/30 rounded-lg px-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Current Coordinates</span>
                      <span className="text-xs font-semibold text-gray-700 mt-1 flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        {currentCoordinates}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 block uppercase tracking-wider">Requested Coordinates</span>
                      <span className="text-xs font-bold text-teal-600 mt-1 flex items-center gap-1">
                        <MapPin size={12} className="text-teal-600" />
                        {requestedCoordinates}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={isActioning}
                    className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={13} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={isActioning}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#0f766e] text-white rounded-lg text-xs font-bold hover:bg-[#0d635c] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isActioning ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={13} />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
