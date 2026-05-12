'use client';

import {
  BookText, Eye, Save, Send,
} from 'lucide-react';
import { QuestionnaireTemplate } from './QuestionnaireBuilderInteractive';

interface TemplateControlsProps {
  template: QuestionnaireTemplate;
  onSave: () => void;
  onPublish: () => void;
  onPreview: () => void;
  onShowLibrary: () => void;
  onUpdateTemplate: (template: QuestionnaireTemplate) => void;
}

export default function TemplateControls({
  template,
  onSave,
  onPublish,
  onPreview,
  onShowLibrary,
  onUpdateTemplate,
}: TemplateControlsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-border-default p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Template Name and Version */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={template.name}
              onChange={(e) => onUpdateTemplate({ ...template, name: e.target.value })}
              className="text-xl font-semibold border border-border-default focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
              placeholder="Questionnaire Name"
            />
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                template.status,
              )}`}
            >
              {template.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary font-medium">
            <span className="bg-secondary-foreground rounded-full px-2 py-1">
              Version:
              {' '}
              {template.version}
            </span>
            <span className="bg-secondary-foreground rounded-full px-2 py-1">
              Questions:
              {' '}
              {template.questions.length}
            </span>
            <span className="bg-secondary-foreground rounded-full px-2 py-1">
              Last updated:
              {' '}
              {template.updatedAt.toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onShowLibrary}
            className="flex gap-1 px-4 py-2 border border-border-default rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium text-text-secondary"
          >
            {/* 📚 Question Library */}
            <BookText size={16} />
            {' '}
            Question Library
          </button>

          <button
            type="button"
            onClick={onPreview}
            className="flex gap-1 px-4 py-2 border border-border-default rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium text-text-secondary"
          >
            {/* 👁️ Preview */}
            <Eye size={16} />
            {' '}
            Preview
          </button>

          <button
            type="button"
            onClick={onSave}
            className="flex gap-1 px-4 py-2 border border-border-default rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium text-text-secondary"
          >
            {/* 💾 Save Draft */}
            <Save size={16} />
            {' '}
            Save Draft
          </button>

          {template.status === 'draft' && (
            <button
              type="button"
              onClick={onPublish}
              className="flex gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-xs font-medium"
              // style={{backgroundColor:"#383838"}}
            >
              {/* 🚀 Publish */}
              <Send size={16} color="#FBA900" />
              {' '}
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
