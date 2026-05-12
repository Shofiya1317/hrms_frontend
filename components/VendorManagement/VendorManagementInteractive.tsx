/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { IoMdAdd } from 'react-icons/io';
import toast from 'react-hot-toast';
import FilterBar, { type FilterState } from './FilterBar';
import VendorTableRow from './VendorTableRow';
import VendorMobileCard from './VendorMobileCard';
import InviteVendorModal from './InviteVendorModal';
import CreateVendorCategory from './CreateVendorCategory';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { VendorService } from '../../lib/service';

interface Vendor {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  categoryId: string;
  region: string;
  rating: string;
  ratingScore: number;
  assignedSKUs: number;
  invitationStatus: 'pending' | 'active' | 'inactive' | 'not-sent';
  logo: string;
  logoAlt: string;
  lastSubmission: string;
}

interface VendorCategoryForm {
  name: string;
  description: string;
}

const VendorManagementInteractive = ({
  apiKey,
  token,
}: {
  apiKey?: string;
  token?: string;
}) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<{ id: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingVendor, setDeletingVendor] = useState<{ id: string; name: string } | null>(null);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  const fetchVendors = async () => {
    try {
      const res = await VendorService.getVendors(undefined, apiKey, token);

      if (res?.data?.success && Array.isArray(res.data.vendors)) {
        const vendorData = res.data.vendors.map((vendor: {
          id: string;
          company_name: string;
          contact_name: string;
          email: string;
          phone: string;
          vendor_category?: { id: string; name: string };
          sector: string;
          product_vendors?: unknown[];
          updatedAt: string;
          status: string;
          rating: string;
          avg_score: number;
        }) => ({
          id: vendor.id,
          companyName: vendor.company_name,
          contactName: vendor.contact_name,
          email: vendor.email,
          phone: vendor.phone,
          category: vendor?.vendor_category?.name ?? '',
          categoryId: vendor?.vendor_category?.id ?? '',
          region: vendor.sector,
          rating: vendor.rating,
          ratingScore: vendor.avg_score,
          assignedSKUs: vendor.product_vendors?.length ?? 0,
          invitationStatus: vendor.status.toLowerCase(),
          logo: '',
          logoAlt: '',
          lastSubmission: new Date(vendor.updatedAt).toLocaleDateString(
            'en-US',
            { month: '2-digit', day: '2-digit', year: 'numeric' },
          ),
        }));

        setVendors(vendorData);
        setFilteredVendors(vendorData);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
      toast.error('Failed to load vendors');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await VendorService.getVendorCategories(apiKey, token);
      if (res?.data?.success && Array.isArray(res.data.vendor_categories)) {
        const options = res.data.vendor_categories.map((cat: any) => ({
          value: cat.id,
          label: cat.name,
        }));
        setCategories(options);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [isInviteModalOpen]);

  useEffect(() => {
    setIsHydrated(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      fetchVendors();
    }
  }, [isHydrated]);

  // Client-side filtering — same pattern as SKUManagementInteractive
  const handleFilterChange = useCallback((filters: FilterState) => {
    let filtered = [...vendors];

    if (filters.search) {
      filtered = filtered.filter((v) => v.companyName.toLowerCase().includes(filters.search.toLowerCase())
        || v.contactName.toLowerCase().includes(filters.search.toLowerCase()));
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter((v) => v.categoryId === filters.category);
    }

    if (filters.rating !== 'all') {
      filtered = filtered.filter((v) => v.rating === filters.rating);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((v) => v.invitationStatus === filters.status);
    }

    setFilteredVendors(filtered);
  }, [vendors]);

  const handleSelectVendor = (id: string) => {
    setSelectedVendors((prev) => (
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    ));
  };

  const handleCreateCategory = async (data: VendorCategoryForm) => {
    try {
      await VendorService.createVendorCategory(
        { name: data.name, description: data.description },
        apiKey,
      );
      toast.success('Product category created successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create product category');
    }
  };

  const handleDeleteVendor = (vendor: Vendor) => {
    setDeletingVendor({ id: vendor.id, name: vendor.companyName });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingVendor) return;
    try {
      await VendorService.deleteVendor(deletingVendor.id, apiKey, token);
      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      toast.error('Failed to delete vendor');
    } finally {
      setIsDeleteModalOpen(false);
      setDeletingVendor(null);
    }
  };

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="h-10 w-64 bg-muted rounded-md animate-pulse" />
          <div className="h-10 w-40 bg-muted rounded-md animate-pulse" />
        </div>
        <div className="h-32 bg-muted rounded-lg animate-pulse" />
        <div className="h-96 bg-muted rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="p-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary mb-1">
              Vendor Management
            </h1>
            <p className="text-text-secondary text-sm">
              Manage vendor relationships, track sustainability performance, and
              coordinate questionnaire assignments.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setIsCategoryFormOpen(true)}
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
              Create Vendor Category
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
          <div>
            <FilterBar
              onFilterChange={handleFilterChange}
              resultsCount={filteredVendors.length}
              categories={categories}
            />
          </div>
          <div className="flex justify-end" style={{ marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setEditingVendor(null);
                setIsInviteModalOpen(true);
              }}
              className="
                flex items-center gap-[7px]
                w-[180px] h-[40px]
                rounded-[8px]
                border border-[#64656D]
                bg-[#383838]
                text-white
                text-[14px] font-medium
                px-[10px] py-[10px]
              "
            >
              <IoMdAdd color="#FBA900" size={20} />
              Invite New Vendor
            </button>
          </div>
        </div>

        {isMobile ? (
          <div className="space-y-4">
            {filteredVendors.map((vendor) => (
              <VendorMobileCard
                key={vendor.id}
                vendor={vendor}
                isSelected={selectedVendors.includes(vendor.id)}
                onSelect={handleSelectVendor}
                onEdit={() => {}}
                onViewHistory={() => {}}
                onManageSKUs={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F2C6441A]" style={{ width: '1340px', height: '54px' }}>
                  <th className="px-4 py-3 text-left text-sm text-text-primary">Rating</th>
                  <th className="px-4 py-3 text-left text-sm text-text-primary">Vendor Name</th>
                  <th className="px-4 py-3 text-left text-sm text-text-primary">Contact</th>
                  <th className="px-4 py-3 text-left text-sm text-text-primary">Category</th>
                  <th className="px-4 py-3 text-left text-sm text-text-primary">SKU's</th>
                  <th className="px-4 py-3 text-left text-sm text-text-primary">Status</th>
                  <th className="px-4 py-3 text-left text-sm text-text-primary">Last Updated</th>
                  <th className="px-4 py-3 text-left text-sm text-text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map((vendor) => (
                  <VendorTableRow
                    key={vendor.id}
                    vendor={vendor}
                    isSelected={selectedVendors.includes(vendor.id)}
                    onSelect={handleSelectVendor}
                    onEdit={() => {
                      setEditingVendor({ id: vendor.id });
                      setIsInviteModalOpen(true);
                    }}
                    onDelete={handleDeleteVendor}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredVendors.length === 0 && (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Icon
              name="UserGroupIcon"
              size={48}
              className="mx-auto text-text-secondary mb-4"
            />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              No vendors found
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
          </div>
        )}
      </div>

      <InviteVendorModal
        apiKey={apiKey}
        token={token}
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setEditingVendor(null);
        }}
        onSuccess={() => fetchVendors()}
        categories={categories}
        editData={editingVendor}
      />

      <CreateVendorCategory
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        onSubmit={handleCreateCategory}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingVendor(null);
        }}
        onConfirm={confirmDelete}
        itemName={deletingVendor?.name || ''}
      />
    </>
  );
};

export default VendorManagementInteractive;
