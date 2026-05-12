/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import {
  useEffect, useMemo, useState, useRef,
} from 'react';
import { IoEyeOutline } from 'react-icons/io5';
import {
  ITask,
  StandardIndicator,
  StandardQuestion,
} from '@/lib/interface/ITask.interface';
import {
  getTaskById,
  updateTaskAnswers,
  updateTaskStatus,
  uploadTaskFile,
} from '@/lib/service/task';
import Select from 'react-select';
import PreviewModal, { PreviewData } from './PreviewModal';
import './TaskDataEntryForm.css';
import RenderInputField from './RenderInputField';
import { Button } from '../Button/Button';
import CustomStyles from '../CustomStyles/CustomStylesFilters';

interface TaskDataEntryFormProps {
  apiKey: string;
  token: string;
  currentTask: ITask;
  actionType?: string;
}

export default function TaskDataEntryForm({
  apiKey,
  token,
  currentTask,
  actionType,
}: TaskDataEntryFormProps) {
  // console.log(currentTask, 'currentTask');
  const [task, setTask] = useState<ITask>(currentTask);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  // const [activeIndicator, setActiveIndicator] = useState<StandardIndicator | null>(null);

  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [isLangLoading, setIsLangLoading] = useState(false);

  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [activeIndicator, setActiveIndicator] = useState<StandardIndicator | null>(null);

  const handleLangChange = async (lang: string) => {
    setSelectedLang(lang);
    setIsLangLoading(true);
    try {
      const langParam = lang === 'en' ? undefined : lang;
      const res = await getTaskById(task.id, apiKey, token, langParam);
      if (res?.data) {
        setTask(res.data as ITask);
      }
    } catch (err) {
      // console.error('Failed to fetch translated task', err);
    } finally {
      setIsLangLoading(false);
    }
  };

  const indicators: StandardIndicator[] = useMemo(() => {
    if (!task?.tenant_standard?.standard_themes) return [];

    const indicatorMap = new Map<string, StandardIndicator>();

    task.tenant_standard.standard_themes.forEach((theme) => {
      theme.standard_indicators.forEach((indicator) => {
        const key = indicator.master_indicator_id;

        if (!indicatorMap.has(key)) {
          // clone first occurrence
          indicatorMap.set(key, {
            ...indicator,
            standard_questions: [...indicator.standard_questions],
          });
        } else {
          // merge questions into existing indicator
          const existing = indicatorMap.get(key)!;

          const mergedQuestions = [
            ...existing.standard_questions,
            ...indicator.standard_questions,
          ];

          // ✅ remove duplicates by question id (safety)
          const uniqueQuestions = Array.from(
            new Map(mergedQuestions.map((q) => [q.id, q])).values(),
          );

          existing.standard_questions = uniqueQuestions;
        }
      });
    });

    return Array.from(indicatorMap.values()).sort(
      (a, b) => a.sequence - b.sequence,
    );
  }, [task]);

  useEffect(() => {
    if (indicators.length > 0) {
      if (!activeIndicator) {
        setActiveIndicator(indicators[0]);
      } else {
        // Sync activeIndicator with the current indicator from the list (pick up translations)
        const current = indicators.find((ind) => ind.id === activeIndicator.id);
        if (current) setActiveIndicator(current);
      }
    }
  }, [indicators]);

  const themes = useMemo(
    () => task?.tenant_standard?.standard_themes || [],
    [task],
  );

  // Auto-select first theme + first indicator on load
  useEffect(() => {
    if (themes.length > 0 && !activeThemeId) {
      const firstTheme = themes[0];
      setActiveThemeId(firstTheme.id);
      if (firstTheme.standard_indicators?.length > 0) {
        setActiveIndicator(firstTheme.standard_indicators[0]);
      }
    }
  }, [themes]);

  const getCurrentMonth = () => new Date().toLocaleString('default', { month: 'long' });

  const getAnswerIdForQuestion = (questionId: string): string => {
    if (!task?.question_answers?.length) return '';

    const selected = task.question_answers.find(
      (ans) => ans.question_id?.id === questionId && !ans.is_deleted,
    );

    return selected?.id || '';
  };

  useEffect(() => {
    if (!task) return;

    const initialAnswers: Record<string, string | string[]> = {};

    const allQuestions = task?.tenant_standard?.standard_themes
      ?.flatMap((theme) => theme.standard_indicators)
      ?.flatMap((indicator) => indicator.standard_questions) || [];

    allQuestions.forEach((question) => {
      const selectedAnswer = task.question_answers?.find(
        (ans) => ans.question_id?.id === question.id
          && ans.answer_value !== null
          && !ans.is_deleted,
      );

      if (!selectedAnswer) return;

      if (question.question_type === 'SINGLE_SELECT') {
        initialAnswers[question.id] = selectedAnswer.option_id ?? '';
      } else if (question.question_type === 'MULTI_SELECT') {
        initialAnswers[question.id] = selectedAnswer.option_id?.split('~~') ?? [];
      } else {
        initialAnswers[question.id] = selectedAnswer.answer_value ?? '';
      }
    });

    setAnswers(initialAnswers);
  }, [task]);

  const shouldRenderQuestion = (question: StandardQuestion) => {
    // If not dependent → always show
    if (!question.dependent_questions?.length) return true;

    const dependentConfig = question.dependent_questions?.[0];
    if (!dependentConfig) return false;

    const parentQuestionId = dependentConfig.parent_question?.id;
    const requiredOptionId = dependentConfig.parent_option?.id;

    const parentAnswer = answers[parentQuestionId];

    if (Array.isArray(parentAnswer)) {
      return parentAnswer.includes(requiredOptionId);
    }

    return parentAnswer === requiredOptionId;
  };

  const getIndicatorCompletion = (indicator: StandardIndicator) => {
    const visibleQuestions = indicator.standard_questions.filter((q) => shouldRenderQuestion(q));

    const totalQuestions = visibleQuestions.length;
    if (totalQuestions === 0) return 0;

    const answeredQuestions = visibleQuestions.filter((q) => {
      const answer = answers[q.id];
      return (
        answer !== undefined
        && answer !== ''
        && (Array.isArray(answer) ? answer.length > 0 : true)
      );
    }).length;

    return Math.round((answeredQuestions / totalQuestions) * 100);
  };

  const previewData: PreviewData = useMemo(
    () => ({
      product: task.product,
      businessUnit: task.product?.business_unit,
      site: task.product?.site,
      themes: themes.map((theme) => ({
        id: theme.id,
        name: theme.name,
        indicators: theme.standard_indicators
          .sort((a, b) => a.sequence - b.sequence)
          .map((indicator) => ({
            id: indicator.id,
            name: indicator.name,
            questions: [...indicator.standard_questions]
              .sort((a, b) => a.sequence - b.sequence)
              .filter((q) => shouldRenderQuestion(q))
              .map((q: StandardQuestion) => {
                const rawAnswer = answers[q.id];
                let resolvedAnswer = rawAnswer;

                if (q.question_type === 'FILE') {
                  resolvedAnswer = rawAnswer;
                }

                if (
                  q.question_type === 'SINGLE_SELECT'
                  && typeof rawAnswer === 'string'
                ) {
                  const selectedOption = q.standard_question_options.find(
                    (opt) => opt.id === rawAnswer,
                  );
                  resolvedAnswer = selectedOption?.text || '-';
                }

                if (
                  q.question_type === 'MULTI_SELECT'
                  && Array.isArray(rawAnswer)
                ) {
                  const labels = rawAnswer
                    .map((id) => {
                      const opt = q.standard_question_options.find(
                        (o) => o.id === id,
                      );
                      return opt?.text;
                    })
                    .filter(Boolean);
                  resolvedAnswer = labels.join(', ') || '-';
                }

                return {
                  id: q.id,
                  title: q.title,
                  type: q.question_type,
                  answer: resolvedAnswer ?? null,
                  options: q.standard_question_options,
                  vuid: q.universal_question_id,
                };
              }),
          })),
      })),
    }),
    [task, answers, themes],
  );

  const formatSingleAnswer = (
    questionId: string,
    answerValue: string | string[],
  ) => {
    // Find question from themes structure instead of flat indicators
    const question = previewData.themes
      .flatMap((theme) => theme.indicators)
      .flatMap((indicator) => indicator.questions)
      .find((q) => q.id === questionId);

    if (!question) return null;

    const questionType = question.type;

    // include MIXED here
    const isTextLike = questionType === 'TEXT'
      || questionType === 'NUMBER'
      || questionType === 'FILE'
      || questionType === 'MIXED_TYPE';

    const getOptionText = (optionId: string) => {
      const option = question.options?.find((opt) => opt.id === optionId);
      return option?.text || '';
    };

    const answerId = getAnswerIdForQuestion(questionId);

    // ARRAY CASE (multi select)
    if (Array.isArray(answerValue)) {
      return {
        answer_id: answerId,
        question_id: questionId,
        option_id: answerValue.join('~~'),
        answer_value: answerValue
          .map((optId) => getOptionText(optId))
          .join('~~'),
        question_type: questionType,
        frequency_month: getCurrentMonth(),
        VUID: question.vuid || '',
      };
    }

    // SINGLE VALUE
    return {
      answer_id: answerId,
      question_id: questionId,
      option_id: isTextLike ? '' : answerValue,
      answer_value: isTextLike ? answerValue : getOptionText(answerValue),
      question_type: questionType,
      frequency_month: getCurrentMonth(),
      VUID: question.vuid || '',
    };
  };

  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleAnswerChange = async (
    questionId: string,
    value: string | string[],
  ) => {
    // find question metadata from themes structure
    const question = previewData.themes
      .flatMap((theme) => theme.indicators)
      .flatMap((indicator) => indicator.questions)
      .find((q) => q.id === questionId);

    if (!question) return;

    // FILE TYPE FLOW
    if (question.type === 'FILE') {
      const file = value as unknown as File;

      if (!(file instanceof File)) return;

      try {
        const formData = new FormData();
        formData.append('file', file);

        // 1. upload file
        const uploadRes = await uploadTaskFile(formData, apiKey);

        const fileUrl = uploadRes?.data?.url;
        if (!fileUrl) throw new Error('No file URL returned');

        // 2. update local state
        setAnswers((prev) => ({
          ...prev,
          [questionId]: fileUrl,
        }));

        // 3. send to update answer API
        const formatted = formatSingleAnswer(questionId, fileUrl);

        if (formatted) {
          await updateTaskAnswers(task.id, [formatted], apiKey, token);
        }

        // 4. update status if pending
        if (task.status === 'pending') {
          await updateTaskStatus(task.id, 'in_progress', apiKey, token);
          task.status = 'in_progress';
        }
      } catch (err) {
        // console.error('File upload failed', err);
      }

      return;
    }

    // NORMAL FLOW (existing behavior)
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // debounce
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }

    autoSaveTimeout.current = setTimeout(async () => {
      try {
        const formatted = formatSingleAnswer(questionId, value);
        if (!formatted) return;

        await updateTaskAnswers(task.id, [formatted], apiKey, token);

        if (task.status === 'pending') {
          await updateTaskStatus(task.id, 'in_progress', apiKey, token);
          task.status = 'in_progress';
        }
      } catch (err) {
        // silent
      }
    }, 500);
  };

  const getPlaceholderByType = (question: StandardQuestion) => {
    if (question.placeholder) return question.placeholder;

    switch (question.question_type) {
      case 'TEXT':
        return 'Enter text';

      case 'NUMBER':
        return 'Enter number';

      case 'SINGLE_SELECT':
        return 'Select option';

      case 'MULTI_SELECT':
        return 'Select one or more options';

      case 'DATE':
        return 'Select date';

      case 'FILE':
        return 'Upload file';

      default:
        return 'Enter value';
    }
  };

  const renderQuestions = () => {
    if (!activeIndicator) return null;

    const sortedQuestions = [...activeIndicator.standard_questions].sort(
      (a, b) => a.sequence - b.sequence,
    );

    return sortedQuestions
      .filter((question) => shouldRenderQuestion(question))
      .map((question: StandardQuestion) => (
        <div key={question.id} className="row mb-3 align-items-center">
          <label className="col-md-4 col-form-label small-label fw-500">
            {question.title}
          </label>

          <div className="col-md-8">
            <RenderInputField
              type={question.question_type}
              placeholder={getPlaceholderByType(question)}
              value={answers[question.id] || ''}
              isDisabled={actionType === 'view'}
              options={question.standard_question_options}
              mixedQuestions={question.mixed_questions || []}
              handleValueChange={(val: string | string[] | File) => {
                handleAnswerChange(question.id, val as any);
              }}
              error={undefined}
              token={token}
            />
          </div>
        </div>
      ));
  };

  const langOptions = [
    { value: 'en', label: 'English (US)' },
    { value: 'hi', label: 'हिंदी (Hindi)' },
    { value: 'mr', label: 'मराठी (Marathi)' },
    { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { value: 'ta', label: 'தமிழ் (Tamil)' },
  ];

  const handleOpenPreview = () => {
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  const isAllIndicatorsCompleted = useMemo(() => {
    if (!themes.length) return false;

    return themes.every((theme) => theme.standard_indicators.every(
      (indicator) => getIndicatorCompletion(indicator) === 100,
    ));
  }, [themes, answers]);

  return (
    <>
      <div className="">
        <div className="d-flex justify-content-between align-items-center px-2 py-4">
          <div className="d-flex">
            <h4 className="text-[24px] font-semibold text-[#1E1E1E] mt-1">
              {currentTask?.tenant_standard?.name?.replace(/_[^_]*$/, '')
                ?? 'Unknown Standard'}
            </h4>
            <span className="ml-3 mt-2 px-[12px] py-1 h-[25px] rounded-full bg-[#2380D31A] text-[#2380D3] text-[12px] font-medium">
              {currentTask?.product?.product_name}
            </span>
            <span className="ml-3 mt-2 px-[15px] py-1 h-[25px] rounded-full bg-[#FF78001A] text-[#FF7800] text-[12px] font-medium">
              {currentTask?.product?.business_unit?.name}
            </span>
            <span className="ml-3 mt-2 px-[15px] py-1 h-[25px] rounded-full bg-[#FF78001A] text-[#FF7800] text-[12px] font-medium">
              {currentTask?.product?.site?.location}
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center mr-2">
              <span className="text-[12px] font-medium text-[#667085] mr-2">
                Language:
              </span>
              <Select
                value={langOptions.find((o) => o.value === selectedLang)}
                onChange={(opt) => opt && handleLangChange(opt.value)}
                options={langOptions}
                isDisabled={isLangLoading}
                isLoading={isLangLoading}
                isSearchable={false}
                styles={CustomStyles}
              />
            </div>
            {actionType !== 'view' && (
              <Button
                isSolid
                text="Preview"
                onClick={handleOpenPreview}
                isDisabled={!isAllIndicatorsCompleted}
                prefixIconChildren={
                  <IoEyeOutline size={20} color="#FBA900" className="mr-2" />
                }
                className={`px-4 gap-3 ${
                  !isAllIndicatorsCompleted
                    ? 'opacity-10 cursor-not-allowed'
                    : ''
                }`}
              />
            )}
          </div>
        </div>

        <hr className="m-0" style={{ borderColor: '#E4E7EC', opacity: 1 }} />

        {/* Body */}
        <div className="row g-0">
          {/* Indicators */}
          <div className="col-12 col-lg-3">
            <div className="h-100 border-end d-flex flex-column">
              {/* Scrollable list */}
              <div className="p-2 overflow-auto flex-grow-1">
                {themes.map((theme) => {
                  const isThemeActive = activeThemeId === theme.id;

                  return (
                    <div key={theme.id} className="mb-2">
                      {/* ===== THEME ROW ===== */}
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setActiveThemeId(theme.id);
                          if (theme.standard_indicators?.length > 0) {
                            setActiveIndicator(theme.standard_indicators[0]);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setActiveThemeId(theme.id);
                            if (theme.standard_indicators?.length > 0) {
                              setActiveIndicator(theme.standard_indicators[0]);
                            }
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 13px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          background: isThemeActive ? '#f3f4f6' : 'transparent',
                          transition: 'background 0.15s',
                          marginBottom: '10px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#1e1e1e',
                          }}
                        >
                          {theme.name}
                        </span>

                        {/* Chevron */}
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="#9ca3af"
                          strokeWidth="1.5"
                          style={{
                            width: 17,
                            height: 17,
                            flexShrink: 0,
                            transform: isThemeActive
                              ? 'rotate(90deg)'
                              : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                          }}
                        >
                          <path d="M6 4l4 4-4 4" />
                        </svg>
                      </div>

                      {/* ===== INDICATORS ===== */}
                      {isThemeActive && (
                        <div className=" mt-1">
                          {theme.standard_indicators.map((indicator) => {
                            const isIndicatorActive = activeIndicator?.id === indicator.id;
                            const completionPercentage = getIndicatorCompletion(indicator);

                            return (
                              <div
                                key={indicator.id}
                                role="button"
                                tabIndex={0}
                                className={`sidebarItem p-3 mb-2 ${isIndicatorActive ? 'active' : ''}`}
                                onClick={() => setActiveIndicator(indicator)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    setActiveIndicator(indicator);
                                  }
                                }}
                              >
                                <span className="text-dark fs-14 fw-500">
                                  {indicator.name}
                                </span>
                                <div
                                  className={`fs-14 mt-1 ${isIndicatorActive ? 'text-warning' : 'text-secondary'}`}
                                >
                                  {completionPercentage}
                                  % Completed
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Forms  */}
          <div className="col-12 col-lg-9">
            <div className="p-4">
              <h5 className="fw-semibold mb-4">{activeIndicator?.name}</h5>

              {renderQuestions()}
            </div>
          </div>
        </div>
      </div>
      {isPreviewOpen && (
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          previewData={previewData}
          taskId={task.id}
          apiKey={apiKey}
          token={token}
        />
      )}
    </>
  );
}
