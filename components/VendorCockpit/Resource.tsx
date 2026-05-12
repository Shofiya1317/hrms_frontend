/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-nested-ternary */

'use client';

import {
  useState, useMemo, useEffect, useCallback, useRef,
} from 'react';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { MdOutlineAdd } from 'react-icons/md';
import { RiDeleteBinLine } from 'react-icons/ri';
import { FaRegEye } from 'react-icons/fa6';
import { FiX } from 'react-icons/fi';
import Select, { StylesConfig } from 'react-select';
import toast from 'react-hot-toast';
import { ITask } from '@/lib/interface/ITask.interface';
import { IAccount } from '@/lib/interface/IAccount.interface';
import {
  getResources,
  uploadResource,
  deleteResource,
} from '@/lib/service/resource';

interface SelectOption {
  value: string;
  label: string;
}

const customStyles: StylesConfig<SelectOption, false> = {
  control: (provided) => ({
    ...provided,
    minWidth: '130px',
    height: '34px',
    borderRadius: '8px',
    border: '1px solid #E4E7EC',
    backgroundColor: '#ffffff',
    boxShadow: 'none',
    cursor: 'pointer',
    '&:hover': { borderColor: '#D0D5DD' },
  }),
  option: (provided, { isFocused, isSelected }) => ({
    ...provided,
    backgroundColor: isSelected ? '#fba900' : isFocused ? '#e9eaed' : '#ffffff',
    color: isSelected ? '#ffffff' : isFocused ? '#fba900' : '#64656D',
    cursor: 'pointer',
    fontSize: '13px',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '8px',
    marginTop: 4,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 50,
  }),
  menuList: (provided) => ({
    ...provided,
    maxHeight: '160px',
    overflowY: 'auto',
    padding: '4px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#1E1E1E',
    fontSize: '13px',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#9DA4AE',
    fontSize: '13px',
  }),
  dropdownIndicator: (provided, state) => ({
    ...provided,
    padding: '0 6px',
    color: '#9DA4AE',
    display: state.hasValue ? 'none' : 'flex',
  }),
  clearIndicator: (provided) => ({
    ...provided,
    padding: '0 6px',
    cursor: 'pointer',
    color: '#9DA4AE',
    '&:hover': { color: '#666' },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  valueContainer: (provided) => ({
    ...provided,
    paddingRight: '0px',
  }),
};

interface Document {
  id: string;
  name: string;
  file: string;
  financialYear: string;
  taskId?: string;
  updatedAt: string;
  source: 'api' | 'task';
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    financialYear: string,
    fileName: string,
    file: File
  ) => Promise<void>;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string>('');

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

  // Auto-populate file name when file is selected
  useEffect(() => {
    if (selectedFile && !selectedFileName) {
      // Remove extension from file name
      const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '');
      setSelectedFileName(nameWithoutExtension);
    }
  }, [selectedFile, selectedFileName]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    // Clear previous error
    setFileError('');

    if (file) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setFileError(
          `File size exceeds 2MB limit. Current file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
        );
        setSelectedFile(null);
        setSelectedFileName('');
        // Clear the file input
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
    } else {
      setSelectedFile(null);
      setSelectedFileName('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFinancialYear || !selectedFileName || !selectedFile) {
      return;
    }

    // Double-check file size before upload
    if (selectedFile.size > MAX_FILE_SIZE) {
      setFileError(
        `File size exceeds 2MB limit. Current file size: ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB`,
      );
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(selectedFinancialYear, selectedFileName, selectedFile);
      setSelectedFinancialYear('');
      setSelectedFileName('');
      setSelectedFile(null);
      setFileError('');
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFinancialYear('');
    setSelectedFileName('');
    setSelectedFile(null);
    setFileError('');
    setIsUploading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-[500px] max-w-[90%] shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-[#E4E7EC]">
          <h2 className="text-xl font-semibold text-[#1E1E1E]">
            Upload Document
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#344054] mb-2">
              Financial Year
              {' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={selectedFinancialYear}
              onChange={(e) => setSelectedFinancialYear(e.target.value)}
              placeholder="Enter financial year (e.g., 2024-2025)"
              className="w-full h-[42px] px-3 bg-white border border-[#E4E7EC] rounded-lg text-[14px] text-[#1E1E1E] focus:outline-none focus:border-[#FBA900]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#344054] mb-2">
              Document Name
              {' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={selectedFileName}
              onChange={(e) => setSelectedFileName(e.target.value)}
              placeholder="Enter document name (e.g., Annual Report 2024)"
              className="w-full h-[42px] px-3 bg-white border border-[#E4E7EC] rounded-lg text-[14px] text-[#1E1E1E] focus:outline-none focus:border-[#FBA900]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#344054] mb-2">
              Document File
              {' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="border border-[#E4E7EC] rounded-lg bg-white">
              <div className="">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex items-center justify-between gap-3 bg-[#F5F7FA] rounded-lg min-h-[40px]">
                    <div className="flex items-center gap-2 px-2">
                      <IoDocumentTextOutline
                        size={20}
                        className="text-[#FBA900]"
                      />
                      <p className="text-sm font-medium text-[#1E1E1E] leading-normal mt-3">
                        {selectedFile.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setSelectedFileName('');
                        setFileError('');
                      }}
                      className="text-gray-400 hover:text-red-500 transition flex-shrink-0 px-2"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 h-[40px]">
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-500 text-sm font-medium rounded-l-lg hover:bg-[#F5F7FA] transition cursor-pointer"
                    >
                      Choose File
                    </label>
                    <p className="text-sm text-[#64656D] mt-3">
                      No file chosen
                    </p>
                  </div>
                )}
              </div>
            </div>
            {fileError && (
              <p className="mt-2 text-xs text-red-500">{fileError}</p>
            )}
            <p className="mt-2 text-xs text-[#ACACAC]">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG
              {' '}
              <span className="text-red-500">(Max size: 2MB)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E4E7EC]">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-[#64656D] bg-white border border-[#E4E7EC] rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              !selectedFinancialYear
              || !selectedFileName
              || !selectedFile
              || isUploading
              || !!fileError
            }
            className="px-4 py-2 text-sm font-medium text-white bg-[#383838] rounded-lg hover:bg-[#4a4a4a] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Resources({
  tasks,
  user,
  apiKey,
  token,
}: {
  tasks: ITask[];
  user: IAccount | null;
  apiKey: string;
  token: string;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ✅ FIX: Keep tasks in a ref so fetchDocuments can always read the latest
  // value without it being a useCallback dependency. This prevents
  // fetchDocuments from being recreated on every parent re-render (which
  // caused useEffect to fire twice and produced the double loading flash).
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const getFileNameFromUrl = useCallback((url: string): string => {
    try {
      let fileName = url.split('/').pop() || '';
      fileName = decodeURIComponent(fileName);

      // remove UUID prefix
      fileName = fileName.replace(/^[a-f0-9-]{36}-/i, '');

      // remove any extension (.pdf, .png, .jpg, .docx, etc.)
      fileName = fileName.replace(/\.[^/.]+$/, '');

      return fileName.trim();
    } catch {
      return 'Untitled';
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    // ✅ FIX: Read from ref instead of closing over the `tasks` prop directly.
    // `tasks` is removed from the dependency array — the ref always holds the
    // latest value so there's no stale-closure risk.
    const extractDocumentsFromTasks = (): Document[] => {
      const docs: Document[] = [];

      tasksRef.current.forEach((task) => {
        if (task.question_answers && task.question_answers.length > 0) {
          task.question_answers.forEach((answer) => {
            if (answer.question_type === 'FILE' && answer.answer_value) {
              const urlParts = answer.answer_value.split('/');
              let fileName = urlParts[urlParts.length - 1];

              fileName = decodeURIComponent(fileName);

              // remove UUID prefix
              fileName = fileName.replace(
                /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-/i,
                '',
              );

              // remove any file extension
              fileName = fileName.replace(/\.[^/.]+$/, '');

              fileName = fileName.trim();

              docs.push({
                id: `${task.id}_${answer.id}`,
                name: fileName,
                file: answer.answer_value,
                financialYear: task.financial_year,
                taskId: task.id,
                updatedAt: answer.updatedAt,
                source: 'task',
              });
            }
          });
        }
      });

      return docs;
    };

    setIsLoading(true);

    try {
      let apiDocuments: Document[] = [];

      if (apiKey) {
        try {
          const response = await getResources(apiKey, token);

          apiDocuments = response.data.map((doc: any) => ({
            id: doc.id,
            name:
              doc.file_name || getFileNameFromUrl(doc.file_url) || 'Untitled',
            file: doc.file_url || doc.url || '',
            financialYear: doc.financial_year || doc.financialYear || 'N/A',
            taskId: doc.task_id || doc.taskId,
            updatedAt: doc.updatedAt,
            source: 'api' as const,
          }));
        } catch (error) {
          console.error('Failed to fetch documents from API:', error);
        }
      }

      const taskDocuments = extractDocumentsFromTasks();

      const allDocuments = [...apiDocuments, ...taskDocuments];

      // Remove duplicates based on file URL
      const uniqueDocuments = allDocuments.reduce((acc, current) => {
        const existing = acc.find((item) => item.file === current.file);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, [] as Document[]);

      // Sort newest → oldest
      setDocuments(
        uniqueDocuments.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
      );
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      const tasksDocuments = extractDocumentsFromTasks();
      setDocuments(
        tasksDocuments.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, token, getFileNameFromUrl]); // ✅ `tasks` removed — no more spurious re-runs

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const financialYearOptions = useMemo(() => {
    const years = new Set(documents.map((doc) => doc.financialYear));
    return Array.from(years)
      .sort()
      .map((year) => ({ value: year, label: year }));
  }, [documents]);

  const filteredDocuments = useMemo(
    () => documents.filter((doc) => {
      const matchesSearch = doc.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesYear = !selectedFinancialYear || doc.financialYear === selectedFinancialYear;
      return matchesSearch && matchesYear;
    }),
    [documents, searchTerm, selectedFinancialYear],
  );

  const handleUpload = async (
    financialYear: string,
    fileName: string,
    file: File,
  ): Promise<void> => {
    if (!apiKey) {
      throw new Error('API Key not found');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('financial_year', financialYear);
    formData.append('file_name', fileName);

    try {
      const response = await uploadResource(formData, apiKey, token);

      if (response?.data?.success) {
        toast.success('Document uploaded successfully!');
      } else {
        toast.error(
          response?.data?.error[0] || 'Upload failed. Please try again.',
        );
        return;
      }

      await fetchDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleDelete = async (docId: string) => {
    const docToDelete = documents.find((doc) => doc.id === docId);
    if (docToDelete?.source === 'task') {
      toast.error('Cannot delete task documents');
      return;
    }

    setDeletingId(docId);
    try {
      const res = await deleteResource(docId, apiKey, token);
      if (res?.data?.success) {
        setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== docId));
        toast.success('Document deleted successfully!');
      } else {
        toast.error(
          res?.data?.error[0] || 'Failed to delete document. Please try again.',
        );
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-3">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-3">
        <div className="flex-[8]">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by document name"
              className="w-full h-[40px] pl-4 pr-10 bg-white border border-[#E4E7EC]
                       rounded-lg text-[14px] text-[#1E1E1E] focus:outline-none focus:border-[#FBA900]"
            />
          </div>
        </div>

        <div className="flex-[1]">
          <Select
            options={financialYearOptions}
            styles={customStyles}
            placeholder="Financial Year"
            isClearable
            onChange={(option) => setSelectedFinancialYear(option?.value || '')}
            value={financialYearOptions.find(
              (opt) => opt.value === selectedFinancialYear,
            )}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex-[1] flex items-center justify-center gap-[7px] h-[40px]
            rounded-[8px] border border-[#64656D] bg-[#383838] text-white
            text-[14px] font-medium px-[10px] py-[10px] whitespace-nowrap hover:bg-[#4a4a4a] transition"
        >
          <MdOutlineAdd color="#FBA900" size={18} />
          Upload Document
        </button>
      </div>

      {/* COUNT BADGE */}
      <div className="mt-4">
        <span
          className="text-[13px] text-[#667085] bg-[#EFF0F3]
          px-3 h-[25px] rounded-full inline-flex items-center whitespace-nowrap"
        >
          {isLoading
            ? 'Loading...'
            : `Showing ${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* DOCUMENT LIST */}
      <div className="mt-3 space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading documents...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No documents found
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="w-full bg-white border border-[#E4E7EC] rounded-lg p-3
                       flex items-center justify-between hover:shadow-sm transition min-h-[70px]"
            >
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="flex items-center gap-2 bg-[#FFFFFF]
                    px-3 py-1.5 rounded-full border border-[#E4E7EC]"
                >
                  <span className="text-[13px] font-medium text-[#344054]">
                    {user?.account_name || 'Resource'}
                  </span>
                </div>

                <div className="h-6 w-px bg-[#D0D5DD]" />

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-[#2380D31A] px-2 py-1 rounded-xl">
                      <IoDocumentTextOutline
                        className="text-[#2380D3]"
                        size={18}
                      />
                      <span className="text-[12px] text-[#2380D3] font-medium">
                        {doc.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* View Button */}
                <button
                  type="button"
                  onClick={() => window.open(doc.file, '_blank')}
                  style={{ border: '1px solid #FBA900', color: '#FBA900' }}
                  className="px-2 w-[74px] h-[30px] flex items-center justify-center gap-2
                  rounded-lg bg-white text-[13px] font-medium hover:bg-[#FBA900] hover:text-white transition"
                >
                  <FaRegEye size={16} className="text-current" />
                  <span>View</span>
                </button>

                {/* Delete Button - Disabled for task documents */}
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id || doc.source === 'task'}
                  style={{
                    border: '1px solid #DD4014',
                    color: '#DD4014',
                    opacity:
                      deletingId === doc.id || doc.source === 'task' ? 0.5 : 1,
                    cursor:
                      deletingId === doc.id || doc.source === 'task'
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                  className="px-2 w-[80px] h-[30px] flex items-center justify-center gap-2 rounded-lg
                  bg-white text-[13px] font-medium hover:bg-[#DD4014] hover:text-white transition
                  disabled:opacity-50 disabled:cursor-not-allowed"
                  title={
                    doc.source === 'task'
                      ? 'Task documents cannot be deleted'
                      : 'Delete document'
                  }
                >
                  <RiDeleteBinLine size={16} className="text-current" />
                  <span>{deletingId === doc.id ? '...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
