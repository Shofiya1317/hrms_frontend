/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  CircleCheckBig,
  Star,
  Disc2,
  FileUp,
  NotepadText,
  SquareCheckIcon,
  Trash2,
} from 'lucide-react';
import { Question } from './QuestionnaireBuilderInteractive';

interface QuestionnaireCanvasProps {
  questions: Question[];
  selectedQuestion: Question | null;
  onSelectQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
  onReorderQuestions: (startIndex: number, endIndex: number) => void;
}

export default function QuestionnaireCanvas({
  questions,
  selectedQuestion,
  onSelectQuestion,
  onDeleteQuestion,
  onReorderQuestions,
}: QuestionnaireCanvasProps) {
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (dragIndex !== dropIndex) {
      onReorderQuestions(dragIndex, dropIndex);
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    const icons: Record<string, string | any> = {
      'multiple-choice': <Disc2 color="#FBA900" size={25} />,
      checkbox: <SquareCheckIcon color="#FBA900" size={25} />,
      'rating-scale': <Star color="#FBA900" size={25} />,
      'text-response': <NotepadText color="#FBA900" size={25} />,
      'file-upload': <FileUp color="#FBA900" size={25} />,
      'yes-no': <CircleCheckBig color="#FBA900" size={25} />,
    };
    return icons[type] || '❓';
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-border-default p-12 text-center">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="text-6xl">📋</div>
          <h3 className="text-xl font-semibold text-text-primary">
            Start Building Your Questionnaire
          </h3>
          <p className="text-text-secondary">
            Add questions from the palette on the left or import from the question library
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button type="button" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              Import from Library
            </button>
            <button type="button" className="px-4 py-2 border border-border-default rounded-lg hover:bg-gray-50 transition-colors">
              View Examples
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border-default p-4 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">
          Questions (
          {questions.length}
          )
        </h3>
        <div className="text-sm text-text-secondary">Drag to reorder • Click to edit</div>
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={question.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => onSelectQuestion(question)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectQuestion(question);
              }
            }}
            role="button"
            tabIndex={0}
            className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-move ${
              selectedQuestion?.id === question.id
                ? 'border-primary bg-primary/5'
                : 'border-border-default hover:border-gray-400'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center items-center font-semibold text-text-secondary">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getQuestionTypeIcon(question.type)}</span>
                    <h4 className="font-medium text-text-primary">{question.title}</h4>
                    {question.required && <span className="text-error text-sm">*</span>}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQuestion(question.id);
                    }}
                    className="text-text-secondary hover:text-error transition-colors"
                  >
                    <Trash2 color="#DD4014" size={20} />
                  </button>
                </div>

                {question.description && (
                  <p className="text-sm text-text-secondary mt-1">{question.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                    Weight:
                    {' '}
                    {question.weight}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {question.category}
                  </span>
                  {question.conditionalLogic && (
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                      Conditional
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
