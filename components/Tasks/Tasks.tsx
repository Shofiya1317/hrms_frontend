/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { VendorService, TaskService } from '@/lib/service';
import Icon from '@/components/ui/AppIcon';
import TaskDashboard from './TaskDashboard';
import TaskTableHeader from './TaskTableHeader';
import TaskTableRow from './TaskTableRow';
import TaskAssignForm from './TaskAssignForm';
import ViewTaskPage from './ViewTaskPage';

interface TaskRow {
  id: string;
  vendor: string;
  vendorCategory: string;
  productCategories: string;
  contact: string;
  email: string;
  phone: string;
  dueDate: string;
  tasksSent?: number;
  completed?: number;
  inprogress?: number;
  overdue?: number;
  completionRate?: number;
}

export default function Tasks({
  apiKey,
  token,
}: {
  apiKey: string;
  token?: string;
}) {
  const [vendors, setVendors] = useState<TaskRow[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewTaskOpen, setIsViewTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const [dashboardData, setDashboardData] = useState<any>(null);
  // const [loading, setLoading] = useState(true);
  const [vendorDetails, setVendorDetails] = useState<any>(null);

  // Add this state with your other useState declarations
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const fetchTaskDashboardStats = async () => {
    try {
      // setLoading(true);

      const response = await TaskService.getTaskDashboardStats(apiKey, token);

      // depending on your API wrapper structure
      setDashboardData(response?.data || response);
    } catch (error) {
      // console.error('Dashboard stats error:', error);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchTaskDashboardStats();
    }
  }, [apiKey, token]);

  async function fetchVendors() {
    try {
      const res = await VendorService.getVendors(undefined, apiKey, token);

      if (res?.data?.success && Array.isArray(res.data.vendors)) {
        const mappedVendors: TaskRow[] = res.data.vendors.map((v: any) => {
          // 🔥 Find matching vendor stats
          const vendorStats = dashboardData?.vendor_details?.find(
            (vd: any) => vd.vendor_id === v.id,
          );

          return {
            id: v.id,
            vendor: v.company_name,
            vendorCategory: v.vendor_category?.name || '-',
            productCategories:
              v.product_vendors
                .map((pv: any) => pv.product.product_name)
                .join(', ') || '-',
            contact: v.contact_name,
            email: v.email,
            phone: v.phone,
            dueDate: new Date(v.due_date).toLocaleDateString(),

            // 🔥 Map stats if found
            tasksSent: vendorStats?.total_tasks ?? 0,
            completed: vendorStats?.completed ?? 0,
            inprogress: vendorStats?.in_progress ?? 0,
            overdue: vendorStats?.overdue ?? 0,
            completionRate: vendorStats?.completion_rate ?? 0,
          };
        });

        setVendors(mappedVendors);
      }
    } catch (err) {
      // console.error('Error fetching vendors:', err);
    }
  }

  useEffect(() => {
    if (dashboardData) {
      fetchVendors();
    }
  }, [apiKey, token, dashboardData]); // 🔥 IMPORTANT dependency

  const handleAssignTask = (id: string) => {
    setSelectedTaskId(id);
    setIsAssignModalOpen(true);
  };

  const handleViewTask = async (vendorId: string) => {
    try {
      const res = await VendorService.getVendorById(apiKey, vendorId, token);

      const vendor = (res as any)?.data?.vendor || (res as any)?.vendor;

      setVendorDetails(vendor);
      setIsViewTaskOpen(true);
    } catch (err) {
      // console.error('Vendor fetch failed', err);
    }
  };

  const productOptions = useMemo(() => {
    const tasks = vendorDetails?.task ?? [];

    const map = new Map<string, { value: string; label: string }>();

    tasks.forEach((t: any) => {
      const product = t?.product;
      if (!product?.id) return;

      if (!map.has(product.id)) {
        map.set(product.id, {
          value: product.id,
          label: product.product_name,
        });
      }
    });

    return Array.from(map.values());
  }, [vendorDetails?.task]);

  const standardOptions = useMemo(() => {
    const tasks = vendorDetails?.task ?? [];

    const map = new Map<
      string,
      { value: string; label: string; logo?: string }
    >();

    tasks.forEach((task: any) => {
      const std = task.tenant_standard;
      if (!std) return;

      if (!map.has(std.id)) {
        map.set(std.id, {
          value: std.id,
          label: std.name,
          logo: std.logo_url, // ✅ ADD THIS
        });
      }
    });

    return Array.from(map.values());
  }, [vendorDetails]);

  // const handleAssign = (assignments: any[]) => {
  //   // console.log('Send to API:', assignments);
  //   // call API here
  // };

  // Add this function for sorting
  const getSortedVendors = useMemo(() => {
    if (!sortConfig) return vendors;

    return [...vendors].sort((a, b) => {
      // Get values based on sort key
      let aValue: any = a[sortConfig.key as keyof TaskRow];
      let bValue: any = b[sortConfig.key as keyof TaskRow];

      // Handle different data types
      if (sortConfig.key === 'vendor') {
        // String comparison for vendor name
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
      // Numeric comparison for all other fields
      aValue = aValue ?? 0;
      bValue = bValue ?? 0;

      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });
  }, [vendors, sortConfig]);

  // Add this function to handle header clicks
  const handleSort = (key: string, direction?: 'asc' | 'desc') => {
    if (direction) {
    // Direct sort with specified direction (from icon click)
      setSortConfig({ key, direction });
    } else {
    // Toggle sort (for backward compatibility if needed)
      setSortConfig((prevConfig) => {
        if (!prevConfig || prevConfig.key !== key) {
          return { key, direction: 'asc' };
        }

        if (prevConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        }

        return null;
      });
    }
  };

  return (
    <>
      <div className="p-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-text-primary mb-1">
              Tasks
            </h1>
            <p className=" text-text-secondary text-sm">
              Manage product SKUs and vendor assignments
            </p>
          </div>
        </div>

        <div>
          <TaskDashboard dashboardStats={dashboardData} />
        </div>

        <div className="mt-5">
          <h1 className="text-xl font-semibold text-text-primary mb-3">
            Vendor Details
          </h1>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <TaskTableHeader sortConfig={sortConfig} onSort={handleSort} />
                <tbody>
                  {getSortedVendors.length === 0 ? (
                    <tr>
                      <td colSpan={100}>
                        <div className="bg-card border border-border rounded-lg p-12 text-center">
                          <Icon
                            name="UserGroupIcon"
                            size={48}
                            className="mx-auto text-text-secondary mb-4"
                          />
                          <h3 className="text-lg font-medium text-text-primary mb-2">
                            No vendors found
                          </h3>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    getSortedVendors.map((vendor, index) => (
                      <TaskTableRow
                        key={vendor.id}
                        task={vendor}
                        index={index}
                        onAssignTask={handleAssignTask}
                        onViewTask={handleViewTask}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <TaskAssignForm
        apiKey={apiKey}
        token={token}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          fetchVendors();
          fetchTaskDashboardStats();
        }}
        // onAssign={handleAssign}
        vendorId={selectedTaskId}
      />

      <ViewTaskPage
        isOpen={isViewTaskOpen}
        onClose={() => setIsViewTaskOpen(false)}
        productOptions={productOptions}
        standardOptions={standardOptions}
        vendorDetails={vendorDetails} // ✅ ADD
        apiKey={apiKey} // ✅ ADD
        token={token}
      />
    </>
  );
}
