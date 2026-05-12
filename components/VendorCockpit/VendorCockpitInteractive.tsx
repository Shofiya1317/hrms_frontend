'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuCalculator } from 'react-icons/lu';
import { TaskDaily01Icon } from 'hugeicons-react';
import { GrResources } from 'react-icons/gr';
import { ITask, ISustainabilityData } from '@/lib/interface/ITask.interface';
import { IAccount } from '@/lib/interface/IAccount.interface';
import EmissionCalculator from '@/components/EmissionCalculator/EmissionCalculator';
import TasksOverview from './TasksOverview';
import Resource from './Resource';

// Add these interfaces after the existing ITask interface

export default function VendorCockpitInteractive({
  tasks,
  apiKey,
  token,
  cockpitData,
  user,
}: {
  tasks: ITask[];
  apiKey: string;
  token: string;
  cockpitData: ISustainabilityData;
  user: IAccount | null;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'tasks' | 'resources' | 'emission_calculator'
  >('tasks');

  React.useEffect(() => {
    router.refresh();
  }, [apiKey, token, activeTab, router]);

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex gap-3 overflow-x-auto pb-2 lg:justify-center pt-4">
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`w-[100px] flex-shrink-0 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-[14px] ${
            activeTab === 'tasks'
              ? 'bg-[#383838] text-white'
              : 'text-[#64656D] bg-transparent border border-border-default'
          }`}
        >
          <TaskDaily01Icon
            size={20}
            color={activeTab === 'tasks' ? '#FBA900' : '#64656D'}
          />
          <span>Tasks</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('resources')}
          className={`w-[130px] flex-shrink-0 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-[14px] ${
            activeTab === 'resources'
              ? 'bg-[#383838] text-white'
              : 'text-[#64656D] bg-transparent border border-border-default'
          }`}
        >
          <GrResources
            size={20}
            color={activeTab === 'resources' ? '#FBA900' : '#64656D'}
          />
          <span>Resources</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('emission_calculator')}
          className={`w-[200px] flex-shrink-0 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-[14px] ${
            activeTab === 'emission_calculator'
              ? 'bg-[#383838] text-white'
              : 'text-[#64656D] bg-transparent border border-border-default'
          }`}
        >
          <LuCalculator
            size={20}
            color={activeTab === 'emission_calculator' ? '#FBA900' : '#64656D'}
          />
          <span>Emission Calculator</span>
        </button>
      </div>

      {/* Conditional Content Rendering */}
      <div className="mt-3">
        {activeTab === 'tasks' && (
          <div>
            {/* Tasks Component - Add your tasks component here */}
            <TasksOverview
              tasks={tasks}
              apiKey={apiKey}
              token={token}
              sustainabilityData={cockpitData}
            />
          </div>
        )}

        {activeTab === 'resources' && (
          <div>
            <Resource tasks={tasks} user={user} apiKey={apiKey} token={token} />
          </div>
        )}

        {activeTab === 'emission_calculator' && (
          <div>
            <EmissionCalculator />
          </div>
        )}
      </div>
    </div>
  );
}
