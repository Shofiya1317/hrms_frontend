/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */

'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import Select from 'react-select';
import toast from 'react-hot-toast';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import CustomStyles from '../CustomStyles/CustomStyles';
import { VendorService } from '../../lib/service';
import { getSectorList } from '../../lib/service/user';
import { getAllProducts } from '../../lib/service/sku';
import '../FormikPhoneNumber/FormikPhoneNumber.css';

interface InviteVendorModalProps {
  apiKey?: string;
  token?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  categories: { value: string; label: string }[];
  editData?: { id: string } | null;
}

interface CreateVendorPayload {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  vendor_category: string;
  products: string[];
  due_date: string;
  vendor_type: string;
  sector: string;
  industry: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
}

interface InviteVendorData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  vendorType: string;
  sector: string;
  industry: string;
  assignedSKUs: string[];
  dueDate: string;
  status: 'active' | 'pending' | 'inactive';
}

const InviteVendorModal = ({
  apiKey,
  token,
  isOpen,
  onClose,
  onSuccess,
  categories,
  editData,
}: InviteVendorModalProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [sectors, setSectors] = useState<
    { id: string; name: string; industry?: { id: string; name: string }[] }[]
  >([]);
  const [industries, setIndustries] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [products, setProducts] = useState<
    { id: string; product_code: string; product_name: string }[]
  >([]);
  const [formData, setFormData] = useState<InviteVendorData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    category: '',
    vendorType: '',
    sector: '',
    industry: '',
    assignedSKUs: [],
    dueDate: '',
    status: 'active',
  });

  // Add with your other useState declarations
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editData?.id) {
      const fetchVendorDetails = async () => {
        try {
          const res = await VendorService.getVendorById(
            apiKey!,
            editData.id,
            token,
          );
          const vendor = res?.data?.vendor;

          if (vendor) {
            setFormData({
              companyName: vendor.company_name || '',
              contactName: vendor.contact_name || '',
              email: vendor.email || '',
              phone: vendor.phone || '',
              category: vendor.vendor_category?.id || '',
              vendorType: vendor.vendor_type || '',
              sector: vendor.sector || '',
              industry: vendor.industry || '',
              assignedSKUs:
                vendor.product_vendors?.map((pv: any) => pv.product.id) || [],
              dueDate: vendor.due_date
                ? new Date(vendor.due_date).toISOString().split('T')[0]
                : '',
              status: vendor.status.toLowerCase() || 'active',
            });

            // Set industries for the selected sector
            if (vendor.sector) {
              const selectedSector = sectors.find(
                (s) => s.id === vendor.sector,
              );
              if (selectedSector?.industry) {
                setIndustries(selectedSector.industry);
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch vendor details:', error);
        }
      };

      fetchVendorDetails();
    } else if (!editData) {
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        category: '',
        vendorType: '',
        sector: '',
        industry: '',
        assignedSKUs: [],
        dueDate: '',
        status: 'active',
      });
    }
  }, [editData, isOpen, apiKey, token, sectors]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await getSectorList({}, apiKey, token);

        if (response.data?.success) {
          setSectors(response.data.sectors);
        }
      } catch (error) {
        console.error('Failed to fetch sectors:', error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await getAllProducts({}, apiKey, token);

        if (response.data?.success) {
          const activeProducts = response.data.data.filter(
            (product: any) => product.status === 'ACTIVE',
          );

          setProducts(activeProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    if (isOpen) {
      fetchSectors();
      fetchProducts();
    }
  }, [isOpen, apiKey, token]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Add this before handleSubmit
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Company Name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    } else if (formData.companyName.length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }

    // Contact Name validation
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    } else if (formData.contactName.length < 2) {
      newErrors.contactName = 'Contact name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Vendor Type validation
    if (!formData.vendorType) {
      newErrors.vendorType = 'Vendor type is required';
    }

    // Sector validation
    if (!formData.sector) {
      newErrors.sector = 'Sector is required';
    }

    // Industry validation
    if (!formData.industry) {
      newErrors.industry = 'Industry is required';
    }

    // Due Date validation (uncomment when due date field is enabled)
    // if (!formData.dueDate) {
    //   newErrors.dueDate = 'Due date is required';
    // } else if (new Date(formData.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))) {
    //   newErrors.dueDate = 'Due date cannot be in the past';
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
      const firstErrorField = document.querySelector('.error-border');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    try {
      const payload: CreateVendorPayload = {
        company_name: formData.companyName,
        contact_name: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        vendor_category: formData.category,
        vendor_type: formData.vendorType,
        sector: formData.sector,
        industry: formData.industry,
        products: formData.assignedSKUs,
        due_date: formData.dueDate,
        status: formData.status.toUpperCase() as
          | 'ACTIVE'
          | 'PENDING'
          | 'INACTIVE',
      };

      const response = editData?.id
        ? await VendorService.updateVendor(
          editData.id,
            payload as any,
            apiKey,
            token,
        )
        : await VendorService.createVendor(payload, apiKey, apiKey, token);

      if (response.data?.success) {
        toast.success(
          editData
            ? 'Vendor Updated Successfully'
            : 'Vendor Invited Successfully',
        );
        onSuccess?.();
        onClose();
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          category: '',
          vendorType: '',
          sector: '',
          industry: '',
          assignedSKUs: [],
          dueDate: '',
          status: 'active',
        });
      } else {
        toast.error(response.data?.error?.[0] || 'Failed to save vendor');
      }
    } catch (error) {
      console.error('Failed to save vendor:', error);
    }
  };

  const handleSKUToggle = (sku: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedSKUs: prev.assignedSKUs.includes(sku)
        ? prev.assignedSKUs.filter((s) => s !== sku)
        : [...prev.assignedSKUs, sku],
    }));
  };

  // Add this function with your other functions
  const resetForm = () => {
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      category: '',
      vendorType: '',
      sector: '',
      industry: '',
      assignedSKUs: [],
      dueDate: '',
      status: 'active',
    });
    setErrors({});
    setIndustries([]);
  };

  if (!isOpen) return null;

  if (!isHydrated) {
    return (
      <div className="fixed inset-0 z-overlay flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="relative bg-card rounded-lg shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="p-6">
            <div className="h-8 bg-muted rounded animate-pulse mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-backdrop">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal */}
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
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-semibold text-text-primary">
              {editData ? 'Edit Vendor' : 'Invite New Vendor'}
            </h2>
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="p-1 hover:bg-muted rounded-md transition-colors duration-fast"
              aria-label="Close modal"
            >
              <Icon
                name="XMarkIcon"
                size={24}
                className="text-text-secondary"
              />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Company Name */}
              <div className="mb-0">
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Company Name
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => {
                    setFormData({ ...formData, companyName: e.target.value });
                    if (errors.companyName) {
                      setErrors((prev) => ({ ...prev, companyName: '' }));
                    }
                  }}
                  placeholder="Enter company name"
                  className={`w-full fs-14 px-3 py-2 form-control text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.companyName ? 'border-red-500' : ''
                  }`}
                />
                {errors.companyName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.companyName}
                  </p>
                )}
              </div>

              {/* Contact Name */}
              <div>
                <label
                  htmlFor="contactName"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Contact Name
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="contactName"
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => {
                    setFormData({ ...formData, contactName: e.target.value });
                    if (errors.contactName) {
                      setErrors((prev) => ({ ...prev, contactName: '' }));
                    }
                  }}
                  placeholder="Enter contact name"
                  className={`w-full px-3 py-2 fs-14 form-control text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.contactName ? 'border-red-500' : ''
                  }`}
                />
                {errors.contactName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.contactName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Email Address
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  placeholder="vendor@example.com"
                  className={`w-full px-3 py-2 fs-14 form-control text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.email ? 'border-red-500' : ''
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-text-primary mb-1"
                >
                  Phone Number
                  {' '}
                  {/* <span className="text-red-500">*</span> */}
                </label>
                <PhoneInput
                  id="phone"
                  defaultCountry="IN"
                  international
                  countryCallingCodeEditable={false}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(value) => {
                    setFormData({ ...formData, phone: value || '' });
                    if (errors.phone) {
                      setErrors((prev) => ({ ...prev, phone: '' }));
                    }
                  }}
                  className={`w-full form-control fs-14 ${errors.phone ? 'border-red-500' : ''}`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Category
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  isDisabled={!categories || categories.length === 0}
                  styles={{
                    ...CustomStyles(false),
                    control: (provided, state) => ({
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
                    categories.find((cat) => cat.value === formData.category)
                    || null
                  }
                  onChange={(selected) => {
                    setFormData({
                      ...formData,
                      category:
                        (selected as { value: string } | null)?.value || '',
                    });
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
                {categories.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Please create a vendor category first.
                  </p>
                )}
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                )}
              </div>

              {/* Vendor Type */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Vendor Type
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  styles={{
                    ...CustomStyles(false),
                    control: (provided, state) => ({
                      ...CustomStyles(false).control?.(provided, state),
                      width: '100%',
                      borderColor: errors.vendorType
                        ? '#ef4444'
                        : provided.borderColor,
                      '&:hover': {
                        borderColor: errors.vendorType
                          ? '#ef4444'
                          : provided.borderColor,
                      },
                    }),
                  }}
                  value={
                    formData.vendorType
                      ? {
                        label: formData.vendorType,
                        value: formData.vendorType,
                      }
                      : null
                  }
                  onChange={(selected) => {
                    setFormData({
                      ...formData,
                      vendorType:
                        (selected as { value: string } | null)?.value || '',
                    });
                    if (errors.vendorType) {
                      setErrors((prev) => ({ ...prev, vendorType: '' }));
                    }
                  }}
                  options={[
                    { value: 'Downstream', label: 'Downstream' },
                    { value: 'Upstream', label: 'Upstream' },
                  ]}
                  placeholder="Select Vendor Type"
                />
                {errors.vendorType && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.vendorType}
                  </p>
                )}
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Sector
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  styles={{
                    ...CustomStyles(false),
                    control: (provided, state) => ({
                      ...CustomStyles(false).control?.(provided, state),
                      width: '100%',
                      borderColor: errors.sector
                        ? '#ef4444'
                        : provided.borderColor,
                      '&:hover': {
                        borderColor: errors.sector
                          ? '#ef4444'
                          : provided.borderColor,
                      },
                    }),
                  }}
                  value={
                    formData.sector
                    && sectors.find((sec) => sec.id === formData.sector)
                      ? {
                        label: sectors.find(
                          (sec) => sec.id === formData.sector,
                        )?.name,
                        value: formData.sector,
                      }
                      : null
                  }
                  onChange={(selected) => {
                    const option = selected as { value: string } | null;
                    setFormData({ ...formData, sector: option?.value || '' });
                    if (errors.sector) {
                      setErrors((prev) => ({ ...prev, sector: '' }));
                    }
                    const selectedSector = sectors.find(
                      (s) => s.id === option?.value,
                    );
                    setIndustries(selectedSector?.industry || []);
                  }}
                  options={sectors.map((sector) => ({
                    value: sector.id,
                    label: sector.name,
                  }))}
                  placeholder="Select Sector"
                />
                {errors.sector && (
                  <p className="text-xs text-red-500 mt-1">{errors.sector}</p>
                )}
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Industry
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  styles={{
                    ...CustomStyles(false),
                    control: (provided, state) => ({
                      ...CustomStyles(false).control?.(provided, state),
                      width: '100%',
                      borderColor: errors.industry
                        ? '#ef4444'
                        : provided.borderColor,
                      '&:hover': {
                        borderColor: errors.industry
                          ? '#ef4444'
                          : provided.borderColor,
                      },
                    }),
                  }}
                  value={
                    formData.industry
                    && industries.find((ind) => ind.id === formData.industry)
                      ? {
                        label: industries.find(
                          (ind) => ind.id === formData.industry,
                        )?.name,
                        value: formData.industry,
                      }
                      : null
                  }
                  onChange={(selected) => {
                    setFormData({
                      ...formData,
                      industry:
                        (selected as { value: string } | null)?.value || '',
                    });
                    if (errors.industry) {
                      setErrors((prev) => ({ ...prev, industry: '' }));
                    }
                  }}
                  options={industries.map((industry) => ({
                    value: industry.id,
                    label: industry.name,
                  }))}
                  placeholder="Select Industry"
                />
                {errors.industry && (
                  <p className="text-xs text-red-500 mt-1">{errors.industry}</p>
                )}
              </div>
            </div>

            {/* Assign SKUs */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Assign SKUs
              </label>
              <div className="border border-border rounded-md p-2 max-h-40 overflow-y-auto">
                {products.map((product) => {
                  const isChecked = formData.assignedSKUs.includes(product.id);

                  return (
                    <label
                      key={product.id}
                      className="flex items-center gap-2 py-2 px-2 rounded cursor-pointer hover:bg-muted"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSKUToggle(product.id);
                        }
                      }}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleSKUToggle(product.id)}
                        className="sr-only"
                      />
                      <span
                        className="flex-shrink-0 flex items-center justify-center transition-colors duration-200"
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '1.92px',
                          borderWidth: '0.64px',
                          borderStyle: 'solid',
                          borderColor: '#F2C644',
                          backgroundColor: isChecked ? '#F2C644' : '#F2C6441A',
                        }}
                      >
                        {isChecked && (
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
                      <span className="text-sm fs-14 text-text-primary">
                        {product.product_code}
                        {' '}
                        -
                        {product.product_name}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {formData.assignedSKUs.length}
                {' '}
                SKU(s) selected
              </p>
            </div>

            {/* Due Date - Commented out */}
            {/* <div>
  <label htmlFor="dueDate" className="block text-sm font-medium text-text-primary mb-1">
    Due Date <span className="text-red-500">*</span>
  </label>
  <input
    id="dueDate"
    type="date"
    required
    value={formData.dueDate}
    onChange={(e) => {
      setFormData({ ...formData, dueDate: e.target.value });
      if (errors.dueDate) {
        setErrors(prev => ({ ...prev, dueDate: '' }));
      }
    }}
    className={`w-full px-3 py-2 fs-14 form-control text-text-primary
    focus:outline-none focus:ring-2 focus:ring-primary/20 ${
      errors.dueDate ? 'border-red-500' : ''
    }`}
  />
  {errors.dueDate && (
    <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>
  )}
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
                    width: '100%',
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
                onChange={(selected: any) => {
                  setFormData({
                    ...formData,
                    status: selected?.value || 'active',
                  });
                  if (errors.status) {
                    setErrors((prev) => ({ ...prev, status: '' }));
                  }
                }}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                placeholder="Select Status"
                className="mb-3"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="w-[115px] h-[40px] rounded-[8px] border border-[#64656D] text-text-primary text-sm flex items-center justify-center hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-[127px] h-[40px] rounded-[8px] border border-[#64656D] bg-[#383838] text-white text-sm flex items-center justify-center hover:bg-[#2f2f2f] transition"
              >
                {editData ? 'Update Vendor' : 'Invite Vendor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteVendorModal;
