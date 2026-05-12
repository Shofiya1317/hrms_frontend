/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable max-len */

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowRight } from 'react-icons/fa';
import { Product, BusinessUnit, Site } from '@/lib/interface/ITask.interface';
import { updateTaskStatus } from '@/lib/service/task';
import { Button } from '../Button/Button';
import { IQuestionType } from '../types';

export interface PreviewQuestion {
  id: string;
  title: string;
  type: IQuestionType;
  answer: string | string[] | null;
  options?: { id: string; text: string }[];
  vuid?: string;
}

export interface PreviewIndicator {
  id: string;
  name: string;
  questions: PreviewQuestion[];
}

export interface PreviewTheme {
  id: string;
  name: string;
  indicators: PreviewIndicator[];
}

export interface PreviewData {
  product: Product;
  businessUnit: BusinessUnit;
  site: Site;
  themes: PreviewTheme[];
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: PreviewData;
  taskId: string;
  apiKey: string;
  token: string;
}

export default function PreviewModal({
  isOpen,
  onClose,
  previewData,
  taskId,
  apiKey,
  token,
}: PreviewModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await updateTaskStatus(
        taskId,
        'completed',
        apiKey,
        token,
      );

      if (response?.data) {
        toast.success('Task Submitted Successfully');
        router.push('/home');
        router.refresh();
      }
    } catch (error) {
      toast.error('Failed to update task status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPreviewQuestions = (indicator: PreviewIndicator) => indicator.questions.map((question) => {
    const answerValue = question.answer;

    // MULTI SELECT → render chips
    if (question.type === 'MULTI_SELECT') {
      let values: string[] = [];

      if (typeof answerValue === 'string') {
        values = answerValue.split(',').map((v: string) => v.trim());
      } else if (Array.isArray(answerValue)) {
        values = answerValue;
      }

      return (
        <div key={question.id} className="row mb-3 align-items-start">
          <label className="col-md-4 col-form-label small-label fw-500 fs-14">
            {question.title}
          </label>

          <div className="col-md-8">
            <div
              className="d-flex flex-wrap gap-2 p-1"
              style={{
                minHeight: 40,
                background: '#F9F9F980',
                border: '1px solid #E4E7EC',
                borderRadius: '8px',
                cursor: 'not-allowed',
                alignItems: 'center',
              }}
              aria-disabled="true"
            >
              {values.length > 0 ? (
                values.map((val) => (
                  <span
                    key={`${question.id}-${val}`}
                    style={{
                      backgroundColor: '#F9F9F9',
                      border: '1px solid #E4E7EC',
                      borderRadius: '60px',
                      padding: '2px 10px',
                      fontSize: '12px',
                      color: '#64656D',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    {val}
                  </span>
                ))
              ) : (
                <span className="text-muted">-</span>
              )}
            </div>
          </div>
        </div>
      );
    }

    // MIXED TYPE → split value into two boxes
    if (question.type === 'MIXED_TYPE') {
      let left = '';
      let right = '';

      if (typeof answerValue === 'string' && answerValue.includes(',')) {
        const parts = answerValue.split(',');
        left = parts[0] ?? '';
        right = parts[1] ?? '';
      } else {
        left = (answerValue as string) || '';
      }

      return (
        <div key={question.id} className="row mb-3 align-items-center">
          <label className="col-md-4 col-form-label small-label fw-500 fs-14">
            {question.title}
          </label>

          <div className="col-md-8">
            <div className="d-flex gap-2">
              <input
                disabled
                className="form-control bg-light"
                value={left}
              />
              <input
                disabled
                className="form-control bg-light"
                style={{ maxWidth: '120px' }}
                value={right}
              />
            </div>
          </div>
        </div>
      );
    }

    if (question.type === 'FILE') {
      let fileName = '-';

      if (typeof answerValue === 'string' && answerValue) {
        const lastPart = answerValue.split('/').pop() || '';

        const parts = lastPart.split('-');

        // Remove first 5 UUID parts
        if (parts.length > 5) {
          fileName = parts.slice(5).join('-');
        } else {
          fileName = lastPart;
        }
      }

      return (
        <div key={question.id} className="row mb-3 align-items-center">
          <label className="col-md-4 col-form-label small-label fw-500 fs-14">
            {question.title}
          </label>

          <div className="col-md-8">
            <input
              disabled
              className="form-control bg-light"
              value={fileName}
            />
          </div>
        </div>
      );
    }

    // DEFAULT (TEXT / NUMBER / SINGLE / FILE etc.)
    return (
      <div key={question.id} className="row mb-3 align-items-center">
        <label className="col-md-4 col-form-label small-label fw-500 fs-14">
          {question.title}
        </label>

        <div className="col-md-8">
          <input
            disabled
            className="form-control bg-light"
            value={
              Array.isArray(answerValue)
                ? answerValue.join(', ')
                : answerValue || ' '
            }
          />
        </div>
      </div>
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pt-14">
      <div className="bg-white w-full max-w-[55vw] h-[85vh] rounded-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative p-4 border-b bg-white shrink-0">
          <h5 className="fw-semibold text-center mb-0">Preview</h5>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-light absolute end-0 top-0 mt-3 me-3"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Top readonly fields */}
          <div className="mb-4">
            {/* SKU Name */}
            <div className="row mb-4 align-items-center">
              <label className="col-md-4 col-form-label small-label fw-500">
                SKU Name
              </label>
              <div className="col-md-8">
                <input
                  disabled
                  className="form-control bg-light"
                  value={previewData.product?.product_name || ''}
                />
              </div>
            </div>

            {/* Site / Location */}
            <div className="row align-items-center">
              <label className="col-md-4 col-form-label small-label fw-500">
                Site / Location
              </label>
              <div className="col-md-8">
                <input
                  disabled
                  className="form-control bg-light"
                  value={`${previewData.businessUnit?.name || ''} / ${
                    previewData.site?.location || ''
                  }`}
                />
              </div>
            </div>
          </div>

          <hr />

          {/* Themes with Indicators - Always visible, no dropdown */}
          {previewData.themes?.map((theme, themeIndex) => (
            <div key={theme.id} className="mb-4">
              {/* Theme Header - Static, not clickable */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px solid #E4E7EC',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1E1E1E',
                  }}
                >
                  {theme.name}
                </span>
              </div>

              {/* Indicators - Always visible */}
              <div className="">
                {theme.indicators.map((indicator) => (
                  <div
                    key={indicator.id}
                    className="border rounded-lg p-4 mb-3"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E4E7EC',
                    }}
                  >
                    <h6
                      className="fw-semibold mb-4"
                      style={{
                        fontSize: 16,
                        color: '#1E1E1E',
                        marginBottom: '1rem',
                        fontWeight: 600,
                      }}
                    >
                      {indicator.name}
                    </h6>

                    {/* Questions */}
                    {renderPreviewQuestions(indicator)}
                  </div>
                ))}
              </div>

              {/* HR line after each theme except the last one */}
              {themeIndex < previewData.themes.length - 1 && (
                <hr />
              )}
            </div>
          ))}

          <div className="pt-2 w-full px-5">
            <Button
              type="button"
              text={isSubmitting ? 'Submitting...' : 'Submit'}
              isSolid
              onClick={handleSubmit}
              isDisabled={isSubmitting}
              sufixIconChildren={
                <FaArrowRight size={20} className="ml-2" color="#FBA900" />
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
