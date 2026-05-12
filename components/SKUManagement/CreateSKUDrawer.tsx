/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */

'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { IVendor } from '@/lib/interface/IVendor.interface';
import { SKUService, VendorService } from '../../lib/service';
import CustomStyles from '../CustomStyles/CustomStyles';

interface CreateSKUDrawerProps {
  apiKey?: string;
  token?: string;
  categories: { value: string; label: string }[]; // ✅ ADD THIS
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editData?: SKUFormData | null;
}

interface SKUFormData {
  id?: string;
  skuCode: string;
  name: string;
  category: string;
  description: string;
  assignedVendors: string[];
  businessUnit: string;
  site: string;
  status: 'active' | 'pending' | 'inactive';
}

const CreateSKUDrawer = ({
  apiKey,
  token,
  categories, // ✅ receive from parent
  isOpen,
  onClose,
  onSuccess,
  editData,
}: CreateSKUDrawerProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState<SKUFormData>({
    skuCode: '',
    name: '',
    category: '',
    description: '',
    assignedVendors: [],
    businessUnit: '',
    site: '',
    status: 'active',
  });
  const [businessUnits, setBusinessUnits] = useState<any[]>([]);
  const [sites, setSiteOptions] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [vendorsList, setVendorsList] = useState<IVendor[]>([]);
  // Add with your other useState declarations
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (editData?.id) {
      const fetchProductDetails = async () => {
        try {
          const res = await SKUService.getProductById(
            editData.id!,
            apiKey,
            token,
          );
          const product = res?.data?.product;

          if (product) {
            setFormData({
              id: product.id,
              skuCode: product.product_code,
              name: product.product_name,
              category: product.product_category?.id || '',
              description: product.description || '',
              assignedVendors:
                product.product_vendors?.map((pv: any) => pv.vendor.id) || [],
              businessUnit: product.business_unit?.id || '',
              site: product.site?.id || '',
              status: product.status.toLowerCase() as
                | 'active'
                | 'pending'
                | 'inactive',
            });

            // Set sites for the selected business unit
            if (product.business_unit?.id) {
              const selectedBU = businessUnits.find(
                (bu) => bu.id === product.business_unit.id,
              );
              if (selectedBU?.sites) {
                setSiteOptions(
                  selectedBU.sites.map((site: any) => ({
                    label: site.name,
                    value: site.id,
                  })),
                );
              }
            }
          }
        } catch (error) {
          // console.error('Failed to fetch product details:', error);
        }
      };

      fetchProductDetails();
    } else if (!editData) {
      setFormData({
        skuCode: '',
        name: '',
        category: '',
        description: '',
        assignedVendors: [],
        businessUnit: '',
        site: '',
        status: 'active',
      });
    }
  }, [editData, isOpen, apiKey, token, businessUnits]);

  const fetchBusinessUnits = async () => {
    try {
      const res = await SKUService.getBusinessUnits(apiKey, token);
      const data = res?.data;

      if (Array.isArray(data?.businessUnit)) {
        setBusinessUnits(data.businessUnit);
      }
    } catch (error) {
      // console.error(error);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await VendorService.getVendors(undefined, apiKey, token);
      const data = res?.data;

      if (Array.isArray(data?.vendors)) {
        setVendorsList(data.vendors);
      }
    } catch (error) {
      // console.error('Failed to fetch vendors:', error);
    }
  };

  useEffect(() => {
    if (isHydrated) {
      fetchBusinessUnits();
      fetchVendors();
    }
  }, [isHydrated, token]);

  // Add this before handleSubmit
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // SKU Code validation
    if (!formData.skuCode.trim()) {
      newErrors.skuCode = 'SKU Code is required';
    } else if (formData.skuCode.length < 2) {
      newErrors.skuCode = 'SKU Code must be at least 2 characters';
    }

    // Product Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Product name must be at least 2 characters';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Business Unit validation
    if (!formData.businessUnit) {
      newErrors.businessUnit = 'Business unit is required';
    }

    // Site validation
    if (!formData.site) {
      newErrors.site = 'Site is required';
    }

    // Description validation (optional - remove if not needed)
    // if (!formData.description.trim()) {
    //   newErrors.description = 'Description is required';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      const payload = {
        product_code: formData.skuCode,
        product_name: formData.name,
        product_category: formData.category,
        business_unit: formData.businessUnit,
        site: formData.site,
        description: formData.description,
        vendor_ids: formData.assignedVendors,
        status: formData.status.toUpperCase() as
          | 'DRAFT'
          | 'ACTIVE'
          | 'INACTIVE',
      };

      const response = editData?.id
        ? await SKUService.updateProduct(editData.id, payload, apiKey, token)
        : await SKUService.createProduct(payload, apiKey, token);

      if (response?.data?.success) {
        toast.success(
          editData
            ? 'Product Updated Successfully'
            : 'Product Created Successfully',
        );

        setFormData({
          skuCode: '',
          name: '',
          category: '',
          description: '',
          assignedVendors: [],
          businessUnit: '',
          site: '',
          status: 'active',
        });

        onClose();
        onSuccess?.();
      } else {
        toast.error(
          response?.data?.error?.[0] || 'Failed to create product',
        );
      }
    } catch (error) {
      // console.error('Error saving product:', error);
    }
  };

  const handleVendorToggle = (vendorId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedVendors: prev.assignedVendors.includes(vendorId)
        ? prev.assignedVendors.filter((id) => id !== vendorId)
        : [...prev.assignedVendors, vendorId],
    }));
  };

  // Add this function with your other functions
  const resetForm = () => {
    setFormData({
      skuCode: '',
      name: '',
      category: '',
      description: '',
      assignedVendors: [],
      businessUnit: '',
      site: '',
      status: 'active',
    });
    setErrors({});
    setSiteOptions([]); // Reset site options
  };

  if (!isHydrated || !isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-backdrop">
      {/* Transparent Background */}
      <div
        className="fixed inset-0 bg-black/20"
        onClick={() => {
          resetForm();
          onClose();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Centered Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-overlay mt-10">
        <div
          className="bg-white rounded-[10px] shadow-modal mt-12"
          style={{
            width: 750,
            height: 669,
            overflowY: 'auto',
            scrollBehavior: 'smooth',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-semibold text-text-primary">
              {editData ? 'Edit SKU' : 'Create New SKU'}
            </h2>
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="p-1 hover:bg-muted rounded-md transition-colors duration-fast"
              aria-label="Close drawer"
            >
              <Icon
                name="XMarkIcon"
                size={24}
                className="text-text-secondary"
              />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* SKU Code */}
            <div className="relative">
              {' '}
              {/* Just add relative, remove min-h */}
              <label className="block text-sm font-medium text-text-primary mb-1">
                SKU Code
                {' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                // Remove required attribute
                value={formData.skuCode}
                onChange={(e) => {
                  setFormData({ ...formData, skuCode: e.target.value });
                  if (errors.skuCode) {
                    setErrors((prev) => ({ ...prev, skuCode: '' }));
                  }
                }}
                placeholder="Enter SKU Code"
                className={`w-full px-3 py-2 text-[13px] form-control focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-[14px] ${
                  errors.skuCode ? 'border-red-500' : ''
                }`}
              />
              {errors.skuCode && (
                <p className="text-xs text-red-500 mt-1">{errors.skuCode}</p>
              )}
            </div>

            {/* Product Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Product Name
                {' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                // Remove required attribute
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: '' }));
                  }
                }}
                placeholder="Enter Product Name"
                className={`w-full px-3 py-2 text-[13px] form-control focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-[14px] ${
                  errors.name ? 'border-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div className="relative">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Category
                {' '}
                <span className="text-red-500">*</span>
              </label>

              <Select
                // Remove required attribute
                isDisabled={!categories || categories.length === 0}
                isLoading={!categories || categories.length === 0}
                styles={{
                  ...CustomStyles(false),
                  control: (provided: any, state: any) => ({
                    ...CustomStyles(false).control?.(provided, state),
                    width: '100%',
                    backgroundColor:
                      !categories || categories.length === 0
                        ? '#f5f5f5'
                        : provided.backgroundColor,
                    cursor:
                      !categories || categories.length === 0
                        ? 'not-allowed'
                        : 'pointer',
                    borderColor: errors.category
                      ? '#ef4444'
                      : provided.borderColor,
                    '&:hover': {
                      borderColor: errors.category
                        ? '#ef4444'
                        : provided.borderColor,
                    },
                  }),
                }}
                value={
                  categories.find(
                    (option) => option.value === formData.category,
                  ) || null
                }
                onChange={(selected: any) => {
                  setFormData({ ...formData, category: selected?.value || '' });
                  if (errors.category) {
                    setErrors((prev) => ({ ...prev, category: '' }));
                  }
                }}
                options={categories}
                placeholder={
                  categories.length === 0
                    ? 'No categories available'
                    : 'Select Category'
                }
              />

              {/* Remove duplicate error messages - keep only one */}
              {categories.length === 0 && (
                <p className="text-xs text-red-500 mt-1">
                  Please create a product category first.
                </p>
              )}
              {errors.category && (
                <p className="text-xs text-red-500 mt-1">{errors.category}</p>
              )}
            </div>

            {/* Business Unit */}
            <div className="relative">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Business Unit
                {' '}
                <span className="text-red-500">*</span>
              </label>

              <Select
                // Remove required attribute
                styles={{
                  ...CustomStyles(false),
                  control: (provided: any, state: any) => ({
                    ...CustomStyles(false).control?.(provided, state),
                    width: '100%',
                    borderColor: errors.businessUnit
                      ? '#ef4444'
                      : provided.borderColor,
                    '&:hover': {
                      borderColor: errors.businessUnit
                        ? '#ef4444'
                        : provided.borderColor,
                    },
                  }),
                }}
                value={
                  businessUnits
                    .map((bu) => ({ label: bu.name, value: bu.id }))
                    .find((opt) => opt.value === formData.businessUnit) || null
                }
                onChange={(selected: any) => {
                  const selectedBU = businessUnits.find(
                    (bu) => bu.id === selected?.value,
                  );
                  setFormData({
                    ...formData,
                    businessUnit: selected?.value || '',
                    site: '',
                  });
                  if (errors.businessUnit) {
                    setErrors((prev) => ({ ...prev, businessUnit: '' }));
                  }
                  if (selectedBU?.sites) {
                    const sitesList = selectedBU.sites.map((site: any) => ({
                      label: site.name,
                      value: site.id,
                    }));
                    setSiteOptions(sitesList);
                  } else {
                    setSiteOptions([]);
                  }
                }}
                options={businessUnits.map((bu) => ({
                  label: bu.name,
                  value: bu.id,
                }))}
                placeholder="Select Business Unit"
              />
              {errors.businessUnit && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.businessUnit}
                </p>
              )}
            </div>

            {/* Site */}
            <div className="relative">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Site
                {' '}
                <span className="text-red-500">*</span>
              </label>

              <Select
                // Remove required attribute
                isDisabled={!formData.businessUnit}
                styles={{
                  ...CustomStyles(false),
                  control: (provided: any, state: any) => ({
                    ...CustomStyles(false).control?.(provided, state),
                    width: '100%',
                    borderColor: errors.site ? '#ef4444' : provided.borderColor,
                    '&:hover': {
                      borderColor: errors.site
                        ? '#ef4444'
                        : provided.borderColor,
                    },
                  }),
                }}
                value={
                  sites.find((option) => option.value === formData.site) || null
                }
                onChange={(selected: any) => {
                  setFormData({ ...formData, site: selected?.value || '' });
                  if (errors.site) {
                    setErrors((prev) => ({ ...prev, site: '' }));
                  }
                }}
                options={sites}
                placeholder={
                  formData.businessUnit
                    ? 'Select Site'
                    : 'Select Business Unit first'
                }
              />
              {errors.site && (
                <p className="text-xs text-red-500 mt-1">{errors.site}</p>
              )}
            </div>

            {/* Location
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Location</label>
              <Select
                required
                styles={{
                  ...CustomStyles,
                  control: (provided: any, state: any) => ({
                    ...CustomStyles.control(provided, state),
                    width: '100%',
                  }),
                }}
                value={
                  formData.location ? { label: formData.location, value: formData.location } : null
                }
                onChange={(selected: any) =>
                  setFormData({ ...formData, location: selected?.value || '' })
                }
                options={locations.map((l) => ({ label: l, value: l }))}
                placeholder="Select Location"
              />
            </div> */}

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide Detailed Product Specification."
                className="placeholder:text-[14px] w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {/* Assign vendors */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Assign Vendors
              </label>
              <div className="border border-border rounded-md max-h-48 overflow-y-auto">
                {vendorsList?.map((vendor) => (
                  <label
                    key={vendor.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-muted cursor-pointer mb-1 mt-1"
                  >
                    {/* Hidden native checkbox */}
                    <input
                      type="checkbox"
                      checked={formData.assignedVendors.includes(vendor.id)}
                      onChange={() => handleVendorToggle(vendor?.id || '')}
                      className="sr-only"
                    />

                    {/* Custom checkbox */}
                    <span
                      className="flex-shrink-0 flex items-center justify-center"
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '1.92px',
                        borderWidth: '0.64px',
                        borderStyle: 'solid',
                        borderColor: '#F2C644',
                        backgroundColor: formData.assignedVendors.includes(
                          vendor?.id || '',
                        )
                          ? '#F2C644'
                          : '#F2C6441A',
                      }}
                    >
                      {formData.assignedVendors.includes(vendor?.id || '') && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 4L4 7L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>

                    {/* Vendor info with category pill */}
                    <div className="flex items-center w-full gap-1">
                      <span className="text-sm font-medium text-text-primary">
                        {vendor?.company_name || 'Unknown'}
                      </span>
                      <span
                        style={{
                          height: '22px',
                          borderRadius: '30px',
                          padding: '5px 10px',
                          background: '#F9F9F9',
                          display: 'inline-flex', // Changed from 'flex' to 'inline-flex' for better inline behavior
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          fontSize: '12px',
                          width: 'auto', // Explicitly set to auto (this is the default)
                          whiteSpace: 'nowrap', // Prevents text from wrapping
                        }}
                      >
                        {vendor?.vendor_category?.name || 'No Category'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              <div className="text-xs text-text-secondary mt-1">
                {formData.assignedVendors.length}
                {' '}
                vendor(s) selected
              </div>
            </div>

            {/* Questionnarie template */}
            {/* <div>
              <label
                htmlFor="template"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                Questionnaire Template
              </label>
              <Select
                required
                styles={{
                  ...CustomStyles,
                  control: (provided: any, state: any) => ({
                    ...CustomStyles.control(provided, state),
                    width: '100%', // make full width
                  }),
                }}
                value={
                  formData.templateId
                    ? {
                        label: templates.find((t) => t.id === formData.templateId)?.name || '',
                        value: formData.templateId,
                      }
                    : null
                }
                onChange={(selected: any) =>
                  setFormData({ ...formData, templateId: selected?.value || '' })
                }
                options={templates.map((template) => ({
                  value: template.id,
                  label: `${template.name} (${template.sections} sections)`,
                }))}
                placeholder="Select Template"
              />
            </div> */}

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-text-primary mb-1"
              >
                Status
              </label>
              <Select
                required
                styles={{
                  ...CustomStyles(false),
                  control: (provided: any, state: any) => ({
                    ...CustomStyles(false).control?.(provided, state),
                    width: '100%', // full width
                  }),
                }}
                value={
                  formData.status
                    ? {
                      label:
                          formData.status.charAt(0).toUpperCase()
                          + formData.status.slice(1),
                      value: formData.status,
                    }
                    : null
                }
                onChange={(selected: any) => setFormData({
                  ...formData,
                  status: selected?.value || 'active',
                })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                placeholder="Select Status"
              />
            </div>

            {/* Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="
                  w-[115px] h-[40px]
                  px-[15px] py-[10px]
                  rounded-[8px]
                  border border-[#64656D]
                  text-text-primary text-sm
                  flex items-center justify-center
                  hover:bg-muted transition
                "
              >
                Cancel
              </button>

              {/* Create / Update Button */}
              <button
                type="submit"
                className="
                  w-[127px] h-[40px]
                  px-[15px] py-[10px]
                  rounded-[8px]
                  border border-[#64656D]
                  bg-[#383838] text-white text-sm
                  flex items-center justify-center
                  hover:bg-[#2f2f2f] transition
                "
              >
                {editData ? 'Update SKU' : 'Create SKU'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSKUDrawer;
