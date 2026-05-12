/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-array-index-key */

'use client';

import { Question } from './QuestionnaireBuilderInteractive';

interface PropertiesPanelProps {
  question: Question | null;
  categories: string[];
  onUpdateQuestion: (question: Question) => void;
}

export default function PropertiesPanel({
  question,
  categories,
  onUpdateQuestion,
}: PropertiesPanelProps) {
  if (!question) {
    return (
      <div className="bg-white rounded-lg border border-border-default p-4">
        <div className="text-center space-y-3">
          <div className="text-4xl">⚙️</div>
          <h3 className="font-semibold text-text-primary">Properties</h3>
          <p className="text-sm text-text-secondary">
            Select a question to view and edit its properties
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof Question, value: any) => {
    onUpdateQuestion({ ...question, [field]: value });
  };

  const handleValidationChange = (field: string, value: any) => {
    onUpdateQuestion({
      ...question,
      validation: {
        ...question.validation,
        [field]: value,
      },
    });
  };

  const handleAddOption = () => {
    const options = question.options || [];
    onUpdateQuestion({
      ...question,
      options: [...options, `Option ${options.length + 1}`],
    });
  };

  const handleRemoveOption = (index: number) => {
    const options = [...(question.options || [])];
    options.splice(index, 1);
    onUpdateQuestion({ ...question, options });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const options = [...(question.options || [])];
    options[index] = value;
    onUpdateQuestion({ ...question, options });
  };

  return (
    <div className="bg-white rounded-lg border border-border-default p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
      <div>
        <h3 className="font-semibold text-text-primary mb-0">Question Properties</h3>
      </div>

      {/* Basic Properties */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Question Title *
          </label>
          <input
            type="text"
            value={question.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            placeholder="Enter question title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
          <textarea
            value={question.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            rows={3}
            placeholder="Add helpful description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Help Text</label>
          <input
            type="text"
            value={question.helpText || ''}
            onChange={(e) => handleChange('helpText', e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
            placeholder="Guidance for vendors"
          />
        </div>
      </div>

      {/* Category and Weight */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
          <select
            value={question.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Weight</label>
          <input
            type="number"
            value={question.weight}
            onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
            min="0"
            max="10"
            step="0.5"
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
          />
        </div>
      </div>

      {/* Options for Multiple Choice */}
      {(question.type === 'multiple-choice' || question.type === 'checkbox') && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Options</label>
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <div key={`option-${optionIndex}`} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="px-3 py-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddOption}
              className="w-full px-3 py-2 border-2 border-dashed border-border-default rounded-lg text-text-secondary hover:border-primary hover:text-primary transition-colors"
            >
              + Add Option
            </button>
          </div>
        </div>
      )}

      {/* Rating Scale */}
      {question.type === 'rating-scale' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Min Rating</label>
            <input
              type="number"
              value={question.minRating || 1}
              onChange={(e) => handleChange('minRating', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Max Rating</label>
            <input
              type="number"
              value={question.maxRating || 5}
              onChange={(e) => handleChange('maxRating', parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      )}

      {/* Validation Rules */}
      <div className="space-y-4 pt-4 border-t border-border-default">
        <h4 className="font-medium text-text-primary">Validation</h4>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => handleChange('required', e.target.checked)}
            className="w-4 h-4 text-primary rounded focus:ring-2 focus:ring-primary"
          />
          <label className="text-sm text-text-primary">Required field</label>
        </div>

        {question.type === 'text-response' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Min Length</label>
              <input
                type="number"
                value={question.validation?.minLength || ''}
                onChange={(e) => handleValidationChange('minLength', parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-border-default rounded-lg text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Max Length</label>
              <input
                type="number"
                value={question.validation?.maxLength || ''}
                onChange={(e) => handleValidationChange('maxLength', parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-border-default rounded-lg text-sm"
                placeholder="1000"
              />
            </div>
          </div>
        )}

        {question.type === 'file-upload' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Allowed File Types</label>
              <input
                type="text"
                value={question.validation?.fileTypes?.join(', ') || ''}
                onChange={(e) => handleValidationChange(
                  'fileTypes',
                  e.target.value.split(',').map((t) => t.trim()),
                )}
                className="w-full px-3 py-2 border border-border-default rounded-lg text-sm"
                placeholder="pdf, doc, jpg"
              />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Max File Size (MB)</label>
              <input
                type="number"
                value={question.validation?.maxFileSize || ''}
                onChange={(e) => handleValidationChange('maxFileSize', parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-border-default rounded-lg text-sm"
                placeholder="10"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
