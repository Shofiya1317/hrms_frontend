/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface CreateCategoryProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: VendorCategoryForm) => void;
}

interface VendorCategoryForm {
  name: string;
  description: string;
}

const CreateVendorCategory = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateCategoryProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [formData, setFormData] = useState<VendorCategoryForm>({
    name: '',
    description: '',
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setFormData({
      name: '',
      description: '',
    });
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
  };

  if (!isHydrated || !isOpen) return null;

  return (
    <>
      {/* Transparent Background */}
      <div
        className="fixed inset-0 bg-black/30 flex items-center justify-center z-backdrop"
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

      {/* Centered Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-overlay mt-10  ">
        <div
          className="
            bg-white rounded-[10px] shadow-modal mt-12
            w-[450px] sm:w-[510px] md:w-[550px]
            max-h-[90vh]
            overflow-y-auto
                    "
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') onClose();
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-border px-4 py-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-text-primary">
              Create Vendor Category
            </h2>
            <button
              type="button"
              onClick={onClose}
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="category"
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-[14px]"
              />
            </div>

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
            {/* Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
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
                  w-[150px] h-[40px]
                  px-[15px] py-[10px]
                  rounded-[8px]
                  border border-[#64656D]
                  bg-[#383838] text-white text-sm
                  flex items-center justify-center
                  hover:bg-[#2f2f2f] transition
                "
              >
                Create Category
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateVendorCategory;
