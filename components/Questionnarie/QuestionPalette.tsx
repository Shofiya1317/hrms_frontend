/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  CircleCheckBig,
  Star,
  Disc2,
  FileUp,
  NotepadText,
  SquareCheckIcon,
} from 'lucide-react';
import { QuestionType } from './QuestionnaireBuilderInteractive';

interface QuestionPaletteProps {
  onAddQuestion: (type: QuestionType) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const questionTypes: Array<{
  type: QuestionType;
  label: string;
  icon: string | any;
  description: string;
}> = [
  {
    type: 'multiple-choice',
    label: 'Multiple Choice',
    icon: <Disc2 color="#FBA900" size={25} />,
    description: 'Single selection from options',
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: <SquareCheckIcon color="#FBA900" size={25} />,
    description: 'Multiple selections allowed',
  },
  {
    type: 'rating-scale',
    label: 'Rating Scale',
    icon: <Star color="#FBA900" size={25} />,
    description: 'Numeric rating scale',
  },
  {
    type: 'text-response',
    label: 'Text Response',
    icon: <NotepadText color="#FBA900" size={25} />,
    description: 'Open-ended text input',
  },
  {
    type: 'file-upload',
    label: 'File Upload',
    icon: <FileUp color="#FBA900" size={25} />,
    description: 'Document or image upload',
  },
  {
    type: 'yes-no',
    label: 'Yes/No',
    icon: <CircleCheckBig color="#FBA900" size={25} />,
    description: 'Binary choice question',
  },
];

export default function QuestionPalette({
  onAddQuestion,
  isDragging,
  onDragStart,
  onDragEnd,
}: QuestionPaletteProps) {
  return (
    <div className="bg-white rounded-lg border border-border-default p-4 space-y-3">
      <h3 className="font-semibold text-text-primary text-base mb-1">Question Types</h3>

      {questionTypes.map((questionType) => (
        <button
          type="button"
          key={questionType.type}
          onClick={() => onAddQuestion(questionType.type)}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          draggable
          className={`w-full text-left p-3 rounded-lg border border-border-default hover:border-primary hover:bg-primary/5 transition-all duration-200 group ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div className="flex items-center gap-2">
            <div>{questionType.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-text-primary text-sm group-hover:text-primary transition-colors">
                {questionType.label}
              </div>
              <div className="text-xs text-text-secondary mt-1">{questionType.description}</div>
            </div>
          </div>
        </button>
      ))}

      <div className="pt-4 border-t border-border-default mt-4">
        <p className="text-xs text-text-secondary">
          💡 Drag and drop or click to add questions to your questionnaire
        </p>
      </div>
    </div>
  );
}
