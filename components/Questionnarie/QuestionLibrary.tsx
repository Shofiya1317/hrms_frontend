/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Question } from './QuestionnaireBuilderInteractive';

interface QuestionLibraryProps {
  onClose: () => void;
  onImport: (questions: Question[]) => void;
}
const standardOptions = [
  {
    label: 'ECOVADIS',
    value: 'ECOVADIS',
    selected: true,
    logo: '/assets/gri-logo.svg',
  },
  // { label: 'BRSR', value: 'BRSR', selected: true, logo: '/assets/brsr-circle.svg' },
  // { label: 'GRI', value: 'GRI', logo: '/assets/gri-logo.svg' },
  // { label: 'SASB', value: 'SASB', logo: '/assets/sasb-logo.webp' },
  // { label: 'CDP', value: 'CDP', logo: '/assets/cdp-logo.jpg' },
  // { label: 'BRSR', value: 'BRSR', selected: true, logo: '/assets/brsr-circle.svg' },
  // { label: 'GRI', value: 'GRI', logo: '/assets/gri-logo.svg' },
];
// Mock library questions
const libraryQuestions: Question[] = [
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',

    // Additional fields for ESG context Demo
    theme: 'Environment',
    indicator: 'Certificates',
    score: '20.00%',
    questions: [
      {
        title:
          'Does your company hold Environmental certifications (e.g., ISO 14001, EMAS)?',
        score: '100.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',

    // Additional fields for ESG context Demo
    theme: 'Environment',
    indicator: 'Coverage',
    score: '0.00%',
    questions: [
      {
        title:
          'Does your entity monitor relevant GHG emissions for the entire scope?',
        score: '0.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',

    // Additional fields for ESG context Demo
    theme: 'Environment',
    indicator: 'Endorsements',
    score: '7.00%',
    questions: [
      {
        title:
          'Does your company formally endorse the Science Based Targets initiative (SBTi)?',
        score: '25.0000%',
      },
      {
        title:
          'Is your company a respondent to CDP’s Climate Change Questionnaire?',
        score: '25.0000%',
      },
      {
        title:
          'Does your company formally endorse the Responsible Minerals Initiative (RMI)?',
        score: '25.0000%',
      },
      {
        title:
          'Does your company formally endorse the United Nations Global Compact (UNGC)?',
        score: '25.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-2',
    type: 'rating-scale',
    title: 'Rate your carbon emission reduction initiatives',
    category: 'Environmental',
    required: true,
    weight: 3,
    minRating: 1,
    maxRating: 5,
    description: 'Scale: 1 (No initiatives) to 5 (Comprehensive program)',
    theme: 'Environment',
    indicator: 'Measures',
    score: '30.00%',
    questions: [
      {
        title: 'Do you use recovered input materials (recycled/scrap)?',
        score: '2.9412%',
      },
      {
        title: 'Do you use eco-friendly or bio-based input materials?',
        score: '2.9412%',
      },
      {
        title: 'Have you implemented environmental emergency measures?',
        score: '2.9412%',
      },
      {
        title:
          'Have you implemented actions for labeling, storing, handling, and transporting hazardous substances?',
        score: '2.9412%',
      },
      {
        title:
          'Environmental Risk Assessment Coverage – % of operational sites assessed',
        score: '2.9412%',
      },
      {
        title: 'Have you provided training on hazardous substance management?',
        score: '2.9412%',
      },
      {
        title: 'Do you ensure safe disposal of hazardous substances?',
        score: '2.9412%',
      },
      {
        title:
          'Have you implemented waste reduction actions (reuse/recovery/repurpose)?',
        score: '2.9412%',
      },
      {
        title: 'Have you provided training on waste reduction and sorting?',
        score: '2.9412%',
      },
      {
        title: 'Do you practice internal waste sorting by stream?',
        score: '2.9412%',
      },
      {
        title: 'Have you implemented water-saving technologies?',
        score: '2.9412%',
      },
      { title: 'Have you implemented rainwater harvesting?', score: '2.9412%' },
      {
        title: 'Have you implemented wastewater control in operations?',
        score: '2.9412%',
      },
      {
        title: 'Do you collect primary Scope 3 data from suppliers?',
        score: '2.9412%',
      },
      {
        title: 'Have you conducted an Energy or carbon audit?',
        score: '2.9412%',
      },
      {
        title: 'Have you improved energy efficiency through technology?',
        score: '2.9412%',
      },
      {
        title: 'Have you purchased or generated renewable energy?',
        score: '2.9412%',
      },

      // Upstream transportation & distribution
      {
        title:
          'Select the method of calculation for upstream transportation and distribution emissions',
        score: '2.9412%',
      },
      {
        title: 'Mode of transport – upstream transportation',
        score: '2.9412%',
      },
      {
        title: 'Total distance travelled – upstream transportation',
        score: '2.9412%',
      },
      { title: 'Load factor', score: '2.9412%' },
      { title: 'Weight of goods transported', score: '2.9412%' },
      { title: 'Total amount spent on fuel', score: '2.9412%' },

      // Business travel
      { title: 'Business travel – mode of transport', score: '2.9412%' },
      { title: 'Business travel – distance per trip', score: '2.9412%' },
      { title: 'Business travel – number of trips', score: '2.9412%' },

      // Employee commuting
      { title: 'Employee commuting – mode of transport', score: '2.9412%' },
      {
        title: 'Employee commuting – average one-way distance',
        score: '2.9412%',
      },
      { title: 'Employee commuting – frequency of travel', score: '2.9412%' },

      // Climate / pollution / efficiency
      {
        title: 'Have you implemented training on energy / climate?',
        score: '2.9412%',
      },
      {
        title:
          'Have you implemented technologies to mitigate particulate matter (PM)?',
        score: '2.9412%',
      },
      {
        title: 'Have you implemented water reuse / recycling technologies?',
        score: '2.9412%',
      },
      {
        title: 'Do you conduct wastewater quality monitoring?',
        score: '2.9412%',
      },
      {
        title:
          'Have you implemented actions to reduce material consumption through process optimization?',
        score: '2.9412%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Environment',
    indicator: 'Policies',
    score: '25.00%',
    questions: [
      {
        title:
          'Does your company have a policy for Energy consumption and GHGs?',
        score: '33.3333%',
      },
      {
        title: 'Does your company have a policy for Water?',
        score: '33.3333%',
      },
      {
        title:
          'Does your company have a policy for Materials, chemicals, and waste?',
        score: '33.3333%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Environment',
    indicator: 'Reporting',
    score: '18.00%',
    questions: [
      { title: 'Do you share GHG emissions internally?', score: '8.3333%' },
      {
        title:
          'Is your GHG inventory calculated at the corporate level (aligned with GHG Protocol)?',
        score: '8.3333%',
      },
      {
        title: 'Is your GHG inventory updated at least once per year?',
        score: '8.3333%',
      },
      {
        title: 'Is your GHG emissions report publicly available?',
        score: '8.3333%',
      },
      {
        title: 'Do you verify GHG emissions through a third party?',
        score: '8.3333%',
      },
      {
        title: 'Does your company report metrics on energy and GHGs?',
        score: '8.3333%',
      },
      { title: 'Does your company report metrics on water?', score: '8.3333%' },
      {
        title: 'Does your company report metrics on biodiversity?',
        score: '8.3333%',
      },
      { title: 'Total energy consumption', score: '8.3333%' },
      { title: 'Renewable energy consumption (%)', score: '8.3333%' },
      { title: 'Total water consumption', score: '8.3333%' },
      { title: 'Waste diverted from landfills (%)', score: '8.3333%' },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Ethics',
    indicator: 'Measures',
    score: '30.00%',
    questions: [
      {
        title: 'Have you provided anti-corruption training?',
        score: '25.0000%',
      },
      {
        title:
          'Have you implemented third-party anti-corruption due diligence?',
        score: '25.0000%',
      },
      {
        title: 'Have you implemented information security training?',
        score: '25.0000%',
      },
      {
        title: 'Do you have an incident response plan for data breaches?',
        score: '25.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Ethics',
    indicator: 'Policies',
    score: '25.00%',
    questions: [
      {
        title: 'Does your company have a policy on Corruption?',
        score: '100.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Ethics',
    indicator: 'Reporting',
    score: '18.00%',
    questions: [
      {
        title: 'Do you have a whistleblower procedure for corruption?',
        score: '50.0000%',
      },
      {
        title: 'Number of whistleblower reports',
        score: '50.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Labour & Human Rights',
    indicator: 'Certificates',
    score: '20.00%',
    questions: [
      {
        title:
          'Does your company hold Labor & Human Rights certifications (e.g., ISO 45001, SA8000)?',
        score: '100.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Labour & Human Rights',
    indicator: 'Coverage',
    score: '0.00%',
    questions: [
      {
        title:
          'Does your company have a policy for Child labor, forced labor, and human trafficking?',
        score: '0.0000%',
      },
      {
        title: 'Does your company have an Employee representatives body?',
        score: '0.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Labour & Human Rights',
    indicator: 'Measures',
    score: '30.00%',
    questions: [
      {
        title:
          'Have you implemented actions to prevent discrimination in recruitment?',
        score: '33.3333%',
      },
      {
        title: 'Have you implemented health & safety emergency plans?',
        score: '33.3333%',
      },
      {
        title: 'Have you provided health & safety training?',
        score: '33.3333%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Labour & Human Rights',
    indicator: 'Policies',
    score: '25.00%',
    questions: [
      {
        title: 'Does your company engage in collective bargaining on wages?',
        score: '20.0000%',
      },
      {
        title: 'Have you made a commitment to pay a living wage?',
        score: '20.0000%',
      },
      {
        title:
          'Does your policy include a quantitative target to pay a living wage within a set deadline?',
        score: '20.0000%',
      },
      {
        title: 'Do you have a commitment to continuously pay a living wage?',
        score: '20.0000%',
      },
      {
        title:
          'Does your company have a policy for Employee health and safety?',
        score: '20.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Labour & Human Rights',
    indicator: 'Reporting',
    score: '18.00%',
    questions: [
      {
        title: 'Does your company report metrics on air pollution?',
        score: '11.1111%',
      },
      {
        title: 'Does your company report metrics on materials and waste?',
        score: '11.1111%',
      },
      {
        title: 'Has a materiality analysis been conducted?',
        score: '11.1111%',
      },
      {
        title: 'Is sustainability reporting aligned with GRI / SASB?',
        score: '11.1111%',
      },
      {
        title: 'Is sustainability reporting externally assured?',
        score: '11.1111%',
      },
      {
        title: 'Does your company communicate progress on SDGs?',
        score: '11.1111%',
      },
      {
        title: 'Number of work-related accidents',
        score: '11.1111%',
      },
      {
        title: 'Wage gap (%)',
        score: '11.1111%',
      },
      {
        title: '% employees paid below living wage',
        score: '11.1111%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Sustainable Procurement',
    indicator: 'Endorsements',
    score: '7.00%',
    questions: [
      {
        title:
          'Does your company formally endorse the International Council on Mining and Metals (ICMM)?',
        score: '100.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Sustainable Procurement',
    indicator: 'Measures',
    score: '30.00%',
    questions: [
      {
        title: 'Do you engage suppliers in climate action?',
        score: '50.0000%',
      },
      {
        title: 'Does your company have an inclusive sourcing program in place?',
        score: '50.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Sustainable Procurement',
    indicator: 'Policies',
    score: '25.00%',
    questions: [
      {
        title:
          'Does your company have a policy regarding Supplier Environmental Practices?',
        score: '50.0000%',
      },
      {
        title: 'Does your company have a Supplier code of conduct?',
        score: '50.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
  {
    id: 'lib-1',
    type: 'multiple-choice',
    title: 'Does your organization have a documented environmental policy?',
    category: 'Environmental',
    required: true,
    weight: 2,
    options: [
      'Yes, publicly available',
      'Yes, internal only',
      'In development',
      'No',
    ],
    description: 'Environmental management system documentation',
    theme: 'Sustainable Procurement',
    indicator: 'Reporting',
    score: '18.00%',
    questions: [
      {
        title:
          'Is there any tin, tantalum, tungsten, or gold remaining in the product you manufacture?',
        score: '100.0000%',
      },
    ],
    standard: 'ECOVADIS',
  },
];

export default function QuestionLibrary({
  onClose,
  onImport,
}: QuestionLibraryProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [standardIndicators, setStandardIndicators] = useState<Question[]>(
    libraryQuestions.filter((q) => q.standard === standardOptions[0].value),
  );
  const [selectedStandard, setSelectedStandard] = useState<string>(
    standardOptions[0].value,
  );

  const toggleQuestion = (questionId: string) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  // const handleImport = () => {
  //   const questionsToImport = libraryQuestions
  //     .filter((q) => selectedQuestions.has(q.id))
  //     .map((q) => ({ ...q, id: `q-${Date.now()}-${Math.random()}` }));
  //   onImport(questionsToImport);
  // };

  const handleStandardOptionClick = (standardValue: string) => {
    // Implement filtering based on standard if needed
    const filtered = libraryQuestions.filter(
      (q) => q.standard === standardValue,
    );
    setStandardIndicators(filtered);
    setSelectedStandard(standardValue);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-border-default">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-text-primary ps-1">
              Question Library
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
              style={
                {
                  // position: 'absolute',
                  // right: -10,
                  // top: -10,
                  // color: 'white',
                  // backgroundColor: '#383838',
                  // borderRadius: '50%',
                  // width: '25px',
                  // height: '25px',
                  // fontSize: '14px',
                  // fontWeight: 'bold',
                  // lineHeight: '25px',
                  // textAlign: 'center',
                }
              }
            >
              ✕
            </button>
          </div>

          {/* Search and Filter */}
          {/* <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions"
              // className="flex-1 px-4 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              className="flex-1 px-4 py-2 border border-border-default rounded-lg text-sm"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2  border border-border-default rounded-lg  text-sm text-text-secondary cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div> */}
        </div>

        <div className="flex gap-3">
          <div
            className=""
            style={{ width: 250, borderRight: '1px solid #E4E7EC' }}
          >
            <div className="ms-5 mt-2">
              <p className="text-sm text-[#64656D]">Choose</p>
              <h4 className="text-md text-[#1E1E1E]">Standards</h4>
            </div>
            <div
              className="flex flex-col items-center overflow-y-auto"
              style={{ maxHeight: '50vh', minHeight: '45vh' }}
            >
              {standardOptions.map((option) => {
                const isSelected = option.value === selectedStandard;
                return (
                  <div
                    className={`border border-[#E4E7EC] rounded-lg mt-3 py-3 px-5 cursor-pointer hover:bg-[#F2C6441A] ${
                      isSelected
                        ? 'border-[#F2C644] bg-[#F2C6441A] '
                        : 'border-border-default hover:border-[#F2C644]'
                    }`}
                    key={option.value}
                    style={{ width: 210 }}
                    onClick={() => handleStandardOptionClick(option.value)}
                  >
                    <div className="flex gap-1 items-center">
                      <Image
                        src={option.logo}
                        alt="logo"
                        width={40}
                        height={40}
                      />
                      <p className="text-sm text-text-secondary p-4">
                        {option.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex-1 p-6">
            <h4 className="text-md text-[#1E1E1E] mb-2">Questions</h4>
            <hr />
            <div
              className="space-y-3 mt-2 overflow-y-auto pe-2"
              style={{ maxHeight: '50vh' }}
            >
              {standardIndicators.map((question, idx) => (
                <>
                  <div
                    key={question.id}
                    onClick={() => toggleQuestion(question.id)}
                    className={`p-3 border-2 border-[#E4E7EC] rounded-lg cursor-pointer transition-all ${
                      selectedQuestions.has(question.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border-default hover:border-gray-400 bg-gradient-to-r from-[#F2C644]/10 to-[#FFFFFF]'
                    }`}
                  >
                    {/* <input
                      type="checkbox"
                      checked={selectedQuestions.has(question.id)}
                      onChange={() => toggleQuestion(question.id)}
                      className="mt-1 w-4 h-4 text-primary rounded"
                      style={{ backgroundColor: '#F2C6441A', border: '1px solid #F2C644' }}
                    /> */}
                    <div className="flex justify-between items-center">
                      <div className="">
                        <span className="font-medium text-text-primary text-[14px]">
                          {question.indicator}
                        </span>
                        <span className="text-[10px] px-2 py-1 bg-[#FF78001A] text-[#FB8C00] rounded-full ml-3">
                          {question.theme}
                        </span>
                      </div>

                      {question.required && (
                        <div className="text-[10px] px-2 py-1 bg-[#E4E7EC80] text-[#64656D] rounded-full">
                          Score:
                          {' '}
                          {question.score}
                        </div>
                      )}
                    </div>

                    {/* </div> */}
                  </div>
                  {question?.questions?.map((q: any, index: number) => (
                    <div
                      key={`question-${question.id}-${index}`}
                      className="flex-1 p-3 border-2 border-[#E4E7EC] rounded-lg cursor-pointer transition-all"
                    >
                      <h4 className="font-medium text-[#1E1E1E] text-sm mb-2">
                        Question
                        {' '}
                        {index + 1}
                      </h4>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-text-primary text-sm text-[#1E1E1E]">
                          {q.title}
                        </h4>
                        {question.required && (
                          <span className="text-[10px] px-2 py-1 bg-[#E4E7EC80] text-[#64656D] rounded-full">
                            Score:
                            {' '}
                            {q.score}
                          </span>
                        )}
                      </div>

                      {/* {question.description && (
                      <p className="text-xs text-text-secondary mt-1">{question.description}</p>
                    )}

                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-[#F2C6441A] text-[#FBA900] rounded-full">
                        {question.type.replace('-', ' ').toLocaleUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-1 bg-[#AE1AF81A] text-[#AE1AF8] rounded-full">
                        Weight: {question.weight}
                      </span>
                      <span className="text-xs px-2 py-1 bg-[#2380D31A] text-[#2380D3] rounded-full">
                        {question.category}
                      </span>
                    </div> */}
                    </div>
                  ))}
                </>
              ))}
            </div>

            {/* {filteredQuestions.length === 0 && (
              <div className="text-center py-12 text-text-secondary">
                No questions found matching your criteria
              </div>
            )} */}
          </div>
        </div>

        {/* Question List */}
        {/* <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                onClick={() => toggleQuestion(question.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedQuestions.has(question.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border-default hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedQuestions.has(question.id)}
                    onChange={() => toggleQuestion(question.id)}
                    className="mt-1 w-4 h-4 text-primary rounded"
                    style={{ backgroundColor: '#F2C6441A', border: '1px solid #F2C644' }}
                  />

                  <div className="flex-1 pe-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-text-primary text-sm">{question.title}</h4>
                      {question.required && (
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                          Required
                        </span>
                      )}
                    </div>

                    {question.description && (
                      <p className="text-xs text-text-secondary mt-1">{question.description}</p>
                    )}

                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-[#F2C6441A] text-[#FBA900] rounded-full">
                        {question.type.replace('-', ' ').toLocaleUpperCase()}
                      </span>
                      <span className="text-xs px-2 py-1 bg-[#AE1AF81A] text-[#AE1AF8] rounded-full">
                        Weight: {question.weight}
                      </span>
                      <span className="text-xs px-2 py-1 bg-[#2380D31A] text-[#2380D3] rounded-full">
                        {question.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12 text-text-secondary">
              No questions found matching your criteria
            </div>
          )}
        </div> */}

        {/* Footer */}
        {/* <div className="p-5 border-t border-border-default bg-gray-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary bg-gray-100 rounded-full px-3 py-1">
              {selectedQuestions.size} question{selectedQuestions.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-border-default rounded-lg hover:bg-white transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={selectedQuestions.size === 0}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm border-1 border-[#64656D]"
              >
                Import Selected
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
