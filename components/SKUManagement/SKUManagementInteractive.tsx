/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-len */
/* eslint-disable no-shadow */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { IoMdAdd } from 'react-icons/io';
// import { MdOutlineUploadFile } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import SKUFilters from './SKUFilters';
import SKUTableHeader from './SKUTableHeader';
import SKUTableRow from './SKUTableRow';
import SKUMobileCard from './SKUMobileCard';
import CreateSKUDrawer from './CreateSKUDrawer';
import CreateProductCategory from './CreateProductCategory';
import BulkActionsBar from './BulkActionsBar';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { SKUService } from '../../lib/service';

interface Vendor {
  id: string;
  name: string;
  category: string;
  sustainabilityScore: number;
}

interface SKU {
  id: string;
  skuCode: string;
  name: string;
  category: string;
  assignedVendors: Vendor[];
  businessUnit: string;
  site: string;
  averageScore: number;
  status: 'active' | 'pending' | 'inactive';
  createdDate: string;
  lastUpdated: string;
}

interface FilterState {
  category: string;
  status: string;
  vendorAssignment: string;
  searchQuery: string;
}

interface ProductCategoryForm {
  name: string;
  description: string;
}

const SKUManagementInteractive = ({
  apiKey,
  token,
}: {
  apiKey?: string;
  token?: string;
}) => {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [filteredSKUs, setFilteredSKUs] = useState<SKU[]>([]);
  const [selectedSKUs, setSelectedSKUs] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSKU, setEditingSKU] = useState<SKU | null>(null);
  // const [assigningSKU, setAssigningSKU] = useState<SKU | null>(null);
  const [deletingItem, setDeletingItem] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);

  const fetchCategories = async () => {
    try {
      const res = await SKUService.getProductCategories(apiKey, token);

      if (res?.data?.success && Array.isArray(res.data.categories)) {
        const options = res.data.categories.map((item: any) => ({
          value: item.id,
          label: item.name,
        }));
        setCategories(options);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [isDrawerOpen]);

  const fetchSKUs = async () => {
    try {
      // setLoading(true);
      const filters = {
        search: '',
        limit: 50,
      };
      const res = await SKUService.getAllProducts(filters, apiKey, token);

      const products = res?.data?.data || [];

      const apiSKUs: SKU[] = products.map((item: any) => ({
        id: item.id,
        skuCode: item.product_code,
        name: item.product_name,

        // flatten objects
        category: item.product_category?.name ?? '',
        businessUnit: item.business_unit?.name ?? '',
        site: item.site?.name ?? '',

        // vendors mapping
        assignedVendors: (item.product_vendors || []).map((pv: any) => ({
          id: pv.vendor.id,
          name: pv.vendor.company_name,
          category: pv.vendor.vendor_type,
          sustainabilityScore: 0, // backend doesn’t send this yet
        })),

        averageScore: 0,
        status: item.status.toLowerCase(),
        createdDate: item.createdAt,
        lastUpdated: new Date(item.updatedAt).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        }),
      }));

      setSKUs(apiSKUs);
      setFilteredSKUs(apiSKUs);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load SKUs');
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchSKUs();
  }, []);

  useEffect(() => {
    setIsHydrated(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleFilterChange = useCallback((filters: FilterState) => {
    let filtered = [...skus];

    if (filters.searchQuery) {
      filtered = filtered.filter(
        (sku) => sku.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
          || sku.skuCode
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase())
          || sku.category.toLowerCase().includes(filters.searchQuery.toLowerCase()),
      );
    }

    if (filters.category !== 'all') {
      const selectedCategory = categories.find((c) => c.value === filters.category);
      filtered = filtered.filter((sku) => sku.category === selectedCategory?.label);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((sku) => sku.status === filters.status);
    }

    if (filters.vendorAssignment === 'assigned') {
      filtered = filtered.filter((sku) => sku.assignedVendors.length > 0);
    } else if (filters.vendorAssignment === 'unassigned') {
      filtered = filtered.filter((sku) => sku.assignedVendors.length === 0);
    }

    setFilteredSKUs(filtered);
  }, [skus, categories]);

  const handleSelectSKU = (id: string) => {
    setSelectedSKUs((prev) => (prev.includes(id) ? prev.filter((skuId) => skuId !== id) : [...prev, id]));
  };

  const handleCreateCategory = async (data: ProductCategoryForm) => {
    const payload = {
      name: data.name,
      description: data.description,
    };

    try {
      await SKUService.createProductCategory(payload, apiKey);
      toast.success('Product category created successfully');
      router.refresh();
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create product category');
    }
  };

  const handleDeleteSKU = async (id: string) => {
    const sku = skus.find((s) => s.id === id);
    if (sku) {
      setDeletingItem({ id, name: sku.name });
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;

    try {
      await SKUService.deleteProduct(deletingItem.id, apiKey, token);
      toast.success('Product Deleted Successfully');
      fetchSKUs();
    } catch (error) {
      console.error('Failed to delete SKU:', error);
      toast.error('Failed to delete SKU');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingItem(null);
    }
  };

  // const handleAssignVendors = (sku: SKU) => {
  //   // setAssigningSKU(sku);
  //   // setIsAssignModalOpen(true);
  // };

  const handleBulkExport = () => {
    displayToast(`Exporting ${selectedSKUs.length} SKU(s)...`);
  };

  if (!isHydrated) {
    return (
      <div className="p-6">
        <div className="h-10 bg-muted animate-pulse rounded mb-6" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary mb-1">
            SKU Management
          </h1>
          <p className=" text-text-secondary text-sm">
            Manage product SKUs and vendor assignments
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              setIsCategoryFormOpen(true);
            }}
            className="
              flex items-center gap-[7px]
              w-[220px] h-[40px]
              rounded-[8px]
              border border-[#64656D]
              bg-[#383838]
              text-white
              text-[14px] font-medium
              px-[10px] py-[10px]
            "
          >
            <IoMdAdd color="#FBA900" size={20} />
            Create Product Category
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between w-full">
        {/* LEFT --- Filters */}
        <SKUFilters
          categories={categories}
          onFilterChange={handleFilterChange}
          totalResults={filteredSKUs.length}
        />

        {/* RIGHT --- Buttons */}
        <div
          className="flex justify-end"
          style={{ marginBottom: '20px' }}
        >
          {/* Create New SKU */}
          <button
            type="button"
            onClick={() => {
              setEditingSKU(null);
              setIsDrawerOpen(true);
            }}
            className="
              flex items-center gap-[7px]
              w-[164px] h-[40px]
              rounded-[8px]
              border border-[#64656D]
              bg-[#383838]
              text-white
              text-[14px] font-medium
              px-[10px] py-[10px]
            "
          >
            <IoMdAdd color="#FBA900" size={20} />
            Create New SKU
          </button>

          {/* Upload File */}
          {/* <button
            type="button"
            className="
              flex items-center gap-[7px]
              w-[127px] h-[40px]
              rounded-[8px]
              border-1 border-[#64656D]
              bg-white
              text-[#64656D]
              text-[14px] font-medium
              px-[10px] py-[10px]
            "
          >
            <MdOutlineUploadFile color="#64656D" size={18} />
            Upload File
          </button> */}
        </div>
      </div>
      {isMobile ? (
        <div>
          {filteredSKUs.map((sku) => (
            <SKUMobileCard
              key={sku.id}
              sku={sku}
              onEdit={(sku: any) => {
                setEditingSKU(sku);
                setIsDrawerOpen(true);
              }}
              onDelete={handleDeleteSKU}
              // onAssignVendors={handleAssignVendors}
              isSelected={selectedSKUs.includes(sku.id)}
              onSelect={handleSelectSKU}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <SKUTableHeader />
              <tbody>
                {filteredSKUs.map((sku) => (
                  <SKUTableRow
                    key={sku.id}
                    sku={sku}
                    onEdit={(sku: any) => {
                      setEditingSKU(sku);
                      setIsDrawerOpen(true);
                    }}
                    onDelete={handleDeleteSKU}
                    // onAssignVendors={handleAssignVendors}
                    // isSelected={selectedSKUs.includes(sku.id)}
                    // onSelect={handleSelectSKU}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredSKUs.length === 0 && (
            <div className="text-center py-12">
              <Icon
                name="CubeIcon"
                size={48}
                className="mx-auto mb-4 text-text-secondary opacity-50"
              />
              <p className="text-text-secondary">No SKUs found</p>
            </div>
          )}
        </div>
      )}

      <BulkActionsBar
        selectedCount={selectedSKUs.length}
        onBulkAssign={() => displayToast('Bulk vendor assignment coming soon')}
        onBulkExport={handleBulkExport}
        // onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedSKUs([])}
      />

      <CreateSKUDrawer
        apiKey={apiKey}
        token={token}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingSKU(null);
          router.refresh();
        }}
        onSuccess={() => {
          // Refresh SKU list after successful creation/edit
          router.refresh();
          fetchSKUs();
        }}
        categories={categories}
        editData={
          editingSKU
            ? {
              id: editingSKU.id,
              skuCode: editingSKU.skuCode,
              name: editingSKU.name,
              category: editingSKU.category,
              description: '',
              assignedVendors: editingSKU.assignedVendors.map((v) => v.id),
              businessUnit: editingSKU.businessUnit,
              site: editingSKU.site,
              status: editingSKU.status,
            }
            : null
        }
      />

      <CreateProductCategory
        isOpen={isCategoryFormOpen}
        onClose={() => {
          setIsCategoryFormOpen(false);
        }}
        onSubmit={handleCreateCategory}
      />

      {/* <VendorAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssigningSKU(null);
        }}
        onSave={handleSaveVendorAssignments}
        vendors={mockVendors}
        currentAssignments={
          assigningSKU?.assignedVendors.map((v) => v.id) || []
        }
        skuName={assigningSKU?.name || ''}
      /> */}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingItem(null);
        }}
        onConfirm={confirmDelete}
        itemName={deletingItem?.name || ''}
      />

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-surface border border-border rounded-lg shadow-modal px-4 py-3 flex items-center gap-3 z-overlay">
          <Icon name="CheckCircleIcon" size={20} className="text-success" />
          <span className="text-sm text-text-primary">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default SKUManagementInteractive;
