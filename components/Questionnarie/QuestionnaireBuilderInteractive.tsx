/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState } from 'react';
import QuestionPalette from './QuestionPalette';
import QuestionnaireCanvas from './QuestionnaireCanvas';
import PropertiesPanel from './PropertiesPanel';
import TemplateControls from './TemplateControls';
import QuestionLibrary from './QuestionLibrary';
import PreviewMode from './PreviewMode';

export type QuestionType =
  | 'multiple-choice'
  | 'rating-scale'
  | 'file-upload'
  | 'text-response'
  | 'yes-no'
  | 'checkbox';

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  weight: number;
  category: string;
  options?: string[];
  minRating?: number;
  maxRating?: number;
  validation?: {
    minLength?: number;
    maxLength?: number;
    fileTypes?: string[];
    maxFileSize?: number;
  };
  helpText?: string;
  conditionalLogic?: {
    dependsOn?: string;
    condition?: string;
    value?: any;
  };
  theme?: string;
  indicator?: string;
  score?: string;
  questions?: any;
  standard?: string;
}

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  questions: Question[];
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default function QuestionnaireBuilderInteractive() {
  const [template, setTemplate] = useState<QuestionnaireTemplate>({
    id: '1',
    name: 'Untitled Questionnaire',
    version: '1.0',
    status: 'draft',
    questions: [],
    categories: ['Environmental', 'Social', 'Governance', 'Economic'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type,
      title: `New ${type.replace('-', ' ')} question`,
      required: false,
      weight: 1,
      category: 'Environmental',
    };

    setTemplate((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      updatedAt: new Date(),
    }));
    setSelectedQuestion(newQuestion);
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    setTemplate((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === updatedQuestion.id ? updatedQuestion : q)),
      updatedAt: new Date(),
    }));
    setSelectedQuestion(updatedQuestion);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setTemplate((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
      updatedAt: new Date(),
    }));
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null);
    }
  };

  const handleReorderQuestions = (startIndex: number, endIndex: number) => {
    const result = Array.from(template.questions);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    setTemplate((prev) => ({
      ...prev,
      questions: result,
      updatedAt: new Date(),
    }));
  };

  const handleSaveTemplate = () => {
    // API call would go here
    // alert('Template saved successfully!');
  };

  const handlePublishTemplate = () => {
    setTemplate((prev) => ({
      ...prev,
      status: 'published',
      updatedAt: new Date(),
    }));
    // alert('Template published successfully!');
  };

  const handleImportFromLibrary = (libraryQuestions: Question[]) => {
    setTemplate((prev) => ({
      ...prev,
      questions: [...prev.questions, ...libraryQuestions],
      updatedAt: new Date(),
    }));
    setShowLibrary(false);
  };

  if (isPreviewMode) {
    return <PreviewMode template={template} onClose={() => setIsPreviewMode(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Questionnaire Builder</h1>
        <p className="text-sm text-text-secondary">
          Create and customize sustainability questionnaire templates for comprehensive vendor
          assessments.
        </p>
      </div>
      {/* Template Controls */}
      <TemplateControls
        template={template}
        onSave={handleSaveTemplate}
        onPublish={handlePublishTemplate}
        onPreview={() => setIsPreviewMode(true)}
        onShowLibrary={() => setShowLibrary(true)}
        onUpdateTemplate={setTemplate}
      />

      {/* Main Builder Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Question Palette - Left Side */}
        <div className="lg:col-span-2">
          <QuestionPalette
            onAddQuestion={handleAddQuestion}
            isDragging={isDragging}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          />
        </div>

        {/* Canvas - Center */}
        <div className="lg:col-span-7">
          <QuestionnaireCanvas
            questions={template.questions}
            selectedQuestion={selectedQuestion}
            onSelectQuestion={setSelectedQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onReorderQuestions={handleReorderQuestions}
            // isDragging={isDragging}
          />
        </div>

        {/* Properties Panel - Right Side */}
        <div className="lg:col-span-3">
          <PropertiesPanel
            question={selectedQuestion}
            categories={template.categories}
            onUpdateQuestion={handleUpdateQuestion}
          />
        </div>
      </div>

      {/* Question Library Modal */}
      {showLibrary && (
        <QuestionLibrary
          onClose={() => setShowLibrary(false)}
          onImport={handleImportFromLibrary}
          // existingQuestions={template.questions}
        />
      )}
    </div>
  );
}
