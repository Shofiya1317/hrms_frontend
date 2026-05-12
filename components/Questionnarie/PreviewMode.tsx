'use client';

import { QuestionnaireTemplate } from './QuestionnaireBuilderInteractive';

interface PreviewModeProps {
  template: QuestionnaireTemplate;
  onClose: () => void;
}

export default function PreviewMode({ template, onClose }: PreviewModeProps) {
  const getQuestionTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'multiple-choice': '☑️',
      checkbox: '✅',
      'rating-scale': '⭐',
      'text-response': '📝',
      'file-upload': '📎',
      'yes-no': '✓',
    };
    return icons[type] || '❓';
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg border border-border-default p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {template.name}
              </h1>
              <p className="text-text-secondary mt-1">
                Preview Mode - This is how vendors will see the questionnaire
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              ← Back to Editor
            </button>
          </div>

          <div className="flex gap-4 text-sm text-text-secondary">
            <span>
              Version
              {template.version}
            </span>
            <span>•</span>
            <span>
              {template.questions.length}
              {' '}
              Questions
            </span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {template.questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-lg border border-border-default p-6"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">{getQuestionTypeIcon(question.type)}</span>
                    <h3 className="font-semibold text-text-primary">
                      {question.title}
                      {question.required && (
                        <span className="text-error ml-1">*</span>
                      )}
                    </h3>
                  </div>

                  {question.description && (
                    <p className="text-text-secondary mt-2 text-sm">
                      {question.description}
                    </p>
                  )}

                  {question.helpText && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                      💡
                      {' '}
                      {question.helpText}
                    </div>
                  )}
                </div>
              </div>

              {/* Question Input Preview */}
              <div className="ml-11">
                {question.type === 'multiple-choice' && (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-2 p-3 border border-border-default rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          className="w-4 h-4 text-primary"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'checkbox' && (
                  <div className="space-y-2">
                    {question.options?.map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-2 p-3 border border-border-default rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary rounded"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'rating-scale' && (
                  <div className="flex gap-2">
                    {Array.from(
                      { length: (question.maxRating || 5) - (question.minRating || 1) + 1 },
                      (_, i) => i + (question.minRating || 1),
                    ).map((rating) => (
                      <button
                        type="button"
                        key={rating}
                        className="w-12 h-12 border-2 border-border-default rounded-lg hover:border-primary hover:bg-primary/5 transition-all font-semibold"
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === 'text-response' && (
                  <textarea
                    className="w-full px-4 py-3 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    rows={4}
                    placeholder="Enter your response..."
                  />
                )}

                {question.type === 'file-upload' && (
                  <div className="border-2 border-dashed border-border-default rounded-lg p-8 text-center">
                    <div className="text-4xl mb-2">📎</div>
                    <p className="text-text-primary font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    {question.validation?.fileTypes && (
                      <p className="text-sm text-text-secondary">
                        Allowed:
                        {' '}
                        {question.validation.fileTypes.join(', ')}
                      </p>
                    )}
                    {question.validation?.maxFileSize && (
                      <p className="text-sm text-text-secondary">
                        Max size:
                        {' '}
                        {question.validation.maxFileSize}
                        MB
                      </p>
                    )}
                  </div>
                )}

                {question.type === 'yes-no' && (
                  <div className="flex gap-4">
                    <button type="button" className="flex-1 px-6 py-3 border-2 border-border-default rounded-lg hover:border-primary hover:bg-primary/5 transition-all font-medium">
                      Yes
                    </button>
                    <button type="button" className="flex-1 px-6 py-3 border-2 border-border-default rounded-lg hover:border-primary hover:bg-primary/5 transition-all font-medium">
                      No
                    </button>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="ml-11 mt-4 flex gap-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  {question.category}
                </span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-text-secondary rounded">
                  Weight:
                  {' '}
                  {question.weight}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 bg-white rounded-lg border border-border-default p-6">
          <div className="flex justify-between items-center">
            <p className="text-text-secondary">
              This is a preview. Responses will not be saved.
            </p>
            <button type="button" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
              Submit Questionnaire (Preview)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
