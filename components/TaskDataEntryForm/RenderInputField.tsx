/* eslint no-shadow: off */
/* eslint-disable react-hooks/exhaustive-deps */
import { IMixedQuestions } from '@/lib/interface/IStandard.interface';
import { useParams } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { IoMdAddCircleOutline, IoMdRemoveCircleOutline } from 'react-icons/io';
import { MdOutlineUploadFile } from 'react-icons/md';
import { IoEyeOutline } from 'react-icons/io5';
import { TaskService } from '@/lib/service';
import DateField from '../ResponseInputFields/DateField';
import InputSelectField from '../ResponseInputFields/InputSelectField';
import { NumberField } from '../ResponseInputFields/NumberField';
import { TextField } from '../ResponseInputFields/TextField';
import { IQuestionType } from '../types';

export interface IQuestionOption {
  id: string;
  text?: string;
  value?: string;
  label?: string;
}

interface RenderInputFieldProps {
  type: IQuestionType;
  placeholder: string;
  value: string | string[];
  isDisabled: boolean;
  options: IQuestionOption[];
  mixedQuestions: IMixedQuestions[];
  handleValueChange: (data: string | string[] | File) => void;
  error?: string;
  token?: string;
}

const RenderInputField: React.FC<RenderInputFieldProps> = ({
  type,
  placeholder,
  value,
  isDisabled,
  options,
  mixedQuestions,
  handleValueChange,
  error,
  token,
}) => {
  const { subdomain } = useParams();
  const slug = subdomain as string;
  const [localMixedValue, setLocalMixedValue] = useState<
    Record<
      string,
      {
        amount: string;
        unit: string;
      }
    >
  >({});
  const [numberError, setNumberError] = useState<string>('');
  const [localValidationError, setLocalValidationError] = useState<string>('');

  const uploadFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e?.target?.files?.[0];
      if (!file) return '';

      const formData = new FormData();
      formData.append('file', file);
      try {
        // const {
        //   data: { success, url, error },
        // } = await TaskService.uploadFile(slug, formData);
        // if (success) return url;
        // toast.error(error.join(', '));
      } catch (err) {
        toast.error('File upload failed');
      }
      return '';
    },
    [slug],
  );

  const handleViewFile = useCallback(async () => {
    if (!value || typeof value !== 'string') return;

    try {
      const res = await TaskService.getSignedUrl(slug, token, value);
      const signedUrl = res?.data?.signedUrl;

      if (!signedUrl) return;

      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error('Failed to open file');
    }
  }, [value, slug]);

  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState('');

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

  const renderFileInput = useCallback(() => {
    const hasFile = typeof value === 'string' && value;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e?.target?.files?.[0];
      if (!file) return;

      // Clear previous error
      setFileError('');

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setFileError('File size exceeds 2MB limit. Please upload a file smaller than 2MB.');
        // Clear the input value
        e.target.value = '';
        return;
      }

      setIsUploading(true);
      try {
        // Pass the file to parent component for upload
        handleValueChange(file);
      } catch (err) {
        console.error('File upload failed');
      } finally {
        setIsUploading(false);
        // Clear the input value so same file can be uploaded again if needed
        e.target.value = '';
      }
    };

    return (
      <>
        {/* hidden real input */}
        <input
          type="file"
          id="file-upload-input"
          className="d-none"
          disabled={isDisabled || isUploading}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
        />

        <div className="d-flex align-items-center gap-2">
          {/* View/Upload button */}
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => {
              if (hasFile) {
                handleViewFile();
              } else {
                document.getElementById('file-upload-input')?.click();
              }
            }}
            className="inline-flex items-center justify-center"
            style={{
              minWidth: 106,
              height: 30,
              borderRadius: 5,
              padding: '5px 10px',
              gap: 5,
              border: '1px solid #E4E7EC',
              background: '#F9F9F9',
              opacity: isDisabled ? 0.6 : 1,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {hasFile ? (
              <>
                <IoEyeOutline size={16} color="#383838" />
                <span className="text-xs text-[#383838]">
                  View uploaded file
                </span>
              </>
            ) : (
              <>
                <MdOutlineUploadFile size={16} color="#383838" />
                <span className="text-xs text-[#383838]">
                  {isUploading ? 'Uploading...' : 'File Upload'}
                </span>
              </>
            )}
          </button>

          {/* Edit/Replace button - only show when file exists */}
          {hasFile && !isDisabled && (
            <button
              type="button"
              onClick={() => document.getElementById('file-upload-input')?.click()}
              className="inline-flex items-center justify-center"
              style={{
                minWidth: 80,
                height: 30,
                borderRadius: 5,
                padding: '5px 10px',
                gap: 5,
                border: '1px solid #FBA900',
                background: '#FFF',
                color: '#FBA900',
                cursor: 'pointer',
              }}
            >
              <MdOutlineUploadFile size={14} color="#FBA900" />
              <span className="text-xs">Replace</span>
            </button>
          )}
        </div>

        {/* Show file name when file is uploaded */}
        {hasFile && value && !isDisabled && (
          <div className="mt-1">
            <span className="text-xs text-muted">
              File:
              {' '}
              {(() => {
                // Get filename from URL
                let fileName = decodeURIComponent(value.split('/').pop() || '');

                // Remove UUID pattern (8-4-4-4-12 format followed by dash)
                fileName = fileName.replace(
                  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-/i,
                  '',
                );

                // Clean up any double spaces or leading/trailing spaces
                fileName = fileName.trim();

                return fileName;
              })()}
            </span>
          </div>
        )}

        {/* File size error message */}
        {fileError && (
          <div className="mt-1">
            <span className="text-xs text-red-500" style={{ color: '#DC2626' }}>
              {fileError}
            </span>
          </div>
        )}

        {/* Other errors */}
        {error && !fileError ? (
          <div className="invalid-feedback d-block">{error}</div>
        ) : null}
      </>
    );
  }, [
    handleValueChange,
    handleViewFile,
    isDisabled,
    error,
    value,
    isUploading,
    fileError,
  ]);

  const handleMixedInput = useCallback(
    (id: string, key: 'amount' | 'unit', val: string) => {
      setLocalMixedValue((prevState) => {
        const valueParts = (value as string)?.split(',') || [];
        const fallbackAmount = valueParts[0] ?? '';
        const fallbackUnit = valueParts[1] ?? '';

        const prev = prevState[id] || {
          amount: fallbackAmount,
          unit: fallbackUnit,
        };

        let updated = { ...prev, [key]: val };

        // 🚨 if number is cleared, also clear unit
        if (key === 'amount' && val === '') {
          updated = { amount: '', unit: '' };
          handleValueChange('');
        } else if (updated.amount && updated.unit) {
          handleValueChange(`${updated.amount},${updated.unit}`);
        }

        return { ...prevState, [id]: updated };
      });
    },
    [handleValueChange, value],
  );

  const renderTextInput = useCallback(() => {
    const displayError = error || localValidationError;
    return (
      <TextField
        type={type.toLowerCase()}
        placeholder={placeholder}
        isValid={!displayError}
        error={displayError}
        isCustomRequired
        value={value as string}
        onChange={async (e) => {
          const raw = type === 'FILE' ? await uploadFile(e) : e.target.value;
          const val = (raw || '') as string;

          // Only apply regex validation for text-like fields but do not block typing
          if (type === 'TEXT') {
            const trimmed = val.trim();

            // ✅ don't validate until user typed meaningful input
            if (trimmed.length === 0) {
              setLocalValidationError('');
            } else {
              const letterMatches = trimmed.match(/[A-Za-z]/g) || [];
              const onlySpecial = /^[^A-Za-z0-9]+$/.test(trimmed);
              const onlyNumbers = /^[0-9]+$/.test(trimmed);

              // ✅ require at least 2 letters TOTAL
              if (letterMatches.length < 2 || onlySpecial || onlyNumbers) {
                setLocalValidationError(
                  'Only special characters / numbers not allowed. Min 2 alphabet letters required',
                );
              } else {
                setLocalValidationError('');
              }
            }
          }

          handleValueChange(val);
        }}
        disabled={isDisabled}
      />
    );
  }, [
    type,
    placeholder,
    value,
    isDisabled,
    handleValueChange,
    uploadFile,
    error,
    localValidationError,
  ]);

  const renderNumberInput = useCallback(() => {
    const numericValue = parseInt((value as string) || '0', 10) || 0;
    return (
      <>
        <NumberField
          key={placeholder}
          placeholder={placeholder}
          isValid={false}
          // isValid={!error && !numberError}
          // error={error || numberError}
          isCustomRequired
          rightIcon
          value={value as string}
          onChange={(e) => handleValueChange(e.target.value)}
          // onChange={(e) => {
          //   const v = (e.target.value || '').toString();
          //   const num = Number(v);
          //   if (v !== '' && !Number.isNaN(num) && num < 0) {
          //     setNumberError('Value cannot be negative');
          //     handleValueChange('');
          //   } else {
          //     if (numberError) setNumberError('');
          //     handleValueChange(v);
          //   }
          // }}
          icon={(
            <span className="d-inline-flex">
              <IoMdRemoveCircleOutline
                onClick={() => numericValue > 0
                  && handleValueChange((numericValue - 1).toString())}
                // Negative input prevention handled in onChange
                // onClick={() => {
                //   if (numericValue > 0 && !isDisabled) {
                //     setNumberError('');
                //     handleValueChange((numericValue - 1).toString());
                //   }
                // }}
                size={22}
                color={numericValue === 0 || isDisabled ? '#A6A6A6' : 'black'}
                className="me-2"
              />
              <IoMdAddCircleOutline
                color={isDisabled ? '#A6A6A6' : 'black'}
                size={22}
                onClick={() => handleValueChange((numericValue + 1).toString())}
                // onClick={() => {
                //   if (!isDisabled) {
                //     setNumberError('');
                //     handleValueChange((numericValue + 1).toString());
                //   }
                // }}
              />
            </span>
          )}
          disabled={isDisabled}
        />
        {error ? <div className="invalid-feedback d-block">{error}</div> : null}
      </>
    );
  }, [placeholder, value, isDisabled, handleValueChange]);
  // }, [placeholder, value, isDisabled, handleValueChange, numberError]);

  const renderSelectInput = useCallback(
    (isMulti: boolean) => (
      <>
        <InputSelectField
          onChange={(e) => {
            const selected = Array.isArray(e)
              ? e.map((item) => item.value)
              : e?.value;
            handleValueChange(selected);
          }}
          options={options.map((opt) => ({
            label: opt.text ?? opt.label ?? opt.value ?? '',
            value: opt.id ?? opt.value ?? '',
          }))}
          isMulti={isMulti}
          placeholder={placeholder}
          value={value}
          isDisabled={isDisabled}
        />
        {error ? <div className="invalid-feedback d-block">{error}</div> : null}
      </>
    ),
    [options, placeholder, value, isDisabled, handleValueChange],
  );

  const renderMixedInput = useMemo(
    () => mixedQuestions?.map((mixedQuestion) => {
      const { id } = mixedQuestion;
      const valueParts = (value as string)?.split(',') || [];
      const amount = localMixedValue[id]?.amount ?? valueParts[0] ?? '';
      const unit = localMixedValue[id]?.unit ?? valueParts[1] ?? '';
      const numeric = parseInt(amount || '0', 10);

      return (
        <div className="row" key={id}>
          <div className="col-lg-6 mb-3">
            <NumberField
              key={mixedQuestion?.value_name}
                // placeholder={mixedQuestion?.value_name}
              placeholder="Number"
              isValid={!error && !numberError}
              error={error || numberError}
              isCustomRequired
              rightIcon
              value={amount}
                // onChange={(e) => handleMixedInput(id, 'amount', e.target.value)}
              onChange={(e) => {
                const v = (e.target.value || '').toString();
                const num = Number(v);
                if (v !== '' && !Number.isNaN(num) && num < 0) {
                  setNumberError('Value cannot be negative');
                  // handleValueChange('');
                  handleMixedInput(id, 'amount', '');
                } else {
                  if (numberError) setNumberError('');
                  // handleValueChange(v);
                  handleMixedInput(id, 'amount', v);
                }
              }}
              icon={(
                <span className="d-inline-flex">
                  <IoMdRemoveCircleOutline
                    onClick={() => {
                      if (numeric && !isDisabled) {
                        setNumberError('');
                        handleMixedInput(
                          id,
                          'amount',
                          (numeric - 1).toString(),
                        );
                      }
                    }}
                    size={22}
                    color={numeric === 0 || isDisabled ? '#A6A6A6' : 'black'}
                    className="me-2"
                  />
                  <IoMdAddCircleOutline
                    size={22}
                    color={isDisabled ? '#A6A6A6' : 'black'}
                    onClick={() => {
                      if (!isDisabled) {
                        setNumberError('');
                        handleMixedInput(
                          id,
                          'amount',
                          (numeric + 1).toString(),
                        );
                      }
                    }}
                  />
                </span>
                )}
              disabled={isDisabled}
            />
          </div>
          <div className="col-lg-6 mb-3">
            {/* <InputSelectField
                onChange={(option) => {
                  const selectedValue = Array.isArray(option)
                    ? option[0]?.value
                    : option?.value;
                  if (selectedValue) {
                    handleMixedInput(id, 'unit', selectedValue);
                  }
                }}
                options={mixedQuestion?.unit_enum?.map((item) => ({
                  label: item,
                  value: item,
                }))}
                isMulti={false}
                // placeholder={mixedQuestion?.unit_name}
                placeholder={'Unit'}
                value={unit}
                isDisabled={isDisabled}
              /> */}
            <InputSelectField
              onChange={(option) => {
                const selectedValue = Array.isArray(option)
                  ? option[0]?.value
                  : option?.value;
                if (selectedValue) {
                  handleMixedInput(id, 'unit', selectedValue);
                } else {
                  // 🚨 if cleared, reset unit
                  handleMixedInput(id, 'unit', '');
                }
              }}
              options={mixedQuestion?.unit_enum?.map((item) => ({
                label: item,
                value: item,
              }))}
              isMulti={false}
              placeholder="Unit"
                // 🚨 Now always read from local state
                // value={String(amount).length > 0 ? unit : null}
              value={unit}
              isDisabled={isDisabled}
            />
          </div>
        </div>
      );
    }),
    [mixedQuestions, localMixedValue, value, handleMixedInput, isDisabled],
  );

  const renderDateInput = useCallback(
    () => (
      <DateField
        placeholder={placeholder}
        isCustomRequired
        value={value as string}
        onChange={handleValueChange}
        name={placeholder}
        isDisabled={isDisabled}
      />
    ),
    [placeholder, value, handleValueChange, isDisabled],
  );

  switch (type) {
    case 'TEXT':
    case 'URL':
      return renderTextInput();
    case 'FILE':
      return renderFileInput();
    case 'DATE':
      return renderDateInput();
    case 'NUMBER':
      return renderNumberInput();
    case 'MULTI_SELECT':
    case 'SINGLE_SELECT':
      return renderSelectInput(type === 'MULTI_SELECT');
    case 'MIXED_TYPE':
      // eslint-disable-next-line react/jsx-no-useless-fragment
      return <>{renderMixedInput}</>;
    default:
      return null;
  }
};

export default React.memo(RenderInputField);
