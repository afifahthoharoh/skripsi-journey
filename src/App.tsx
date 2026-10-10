import React, { useState } from 'react';
import { AuthGroupProvider, useAuthGroup } from './context/AuthGroupContext';
import { AuthAndSetup } from './components/AuthAndSetup';
import { Navigation, ActiveTab } from './components/Navigation';

import { DashboardView } from './components/DashboardView';
import { MindMapView } from './components/MindMapView';
import { ChecklistTasksView } from './components/ChecklistTasksView';
import { ThemeDivisionView } from './components/ThemeDivisionView';
import { FieldSurveyView } from './components/FieldSurveyView';
import { LiteratureReviewView } from './components/LiteratureReviewView';
import { ResearchDataDocsView } from './components/ResearchDataDocsView';
import { ChaptersView } from './components/ChaptersView';
import { SupervisionRevisionView } from './components/SupervisionRevisionView';
import { SeminarProposalView } from './components/SeminarProposalView';
import { DefenseView } from './components/DefenseView';
import { RevisionsView } from './components/RevisionsView';
import { FinalDocsView } from './components/FinalDocsView';
import { TimelineCalendarView } from './components/TimelineCalendarView';
import { GroupSettingsView } from './components/GroupSettingsView';

function MainAppContent() {
  const { currentUser, group, loadingAuth } = useAuthGroup();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#1b4332] font-semibold text-sm">Memuat Skripsi Journey...</p>
      </div>
    );
  }

  // Show Auth / Group Setup Modal if not logged in or no group created/joined
  if (!currentUser || !group) {
    return <AuthAndSetup />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'mindmap':
        return <MindMapView />;
      case 'checklist':
        return <ChecklistTasksView />;
      case 'theme':
        return <ThemeDivisionView />;
      case 'survey':
        return <FieldSurveyView />;
      case 'literature':
        return <LiteratureReviewView />;
      case 'data_docs':
        return <ResearchDataDocsView />;
      case 'chapters':
        return <ChaptersView />;
      case 'supervision':
        return <SupervisionRevisionView />;
      case 'timeline':
        return <TimelineCalendarView />;
      case 'sempro':
        return <SeminarProposalView />;
      case 'sidang':
        return <DefenseView />;
      case 'revisions':
        return <RevisionsView />;
      case 'final_docs':
        return <FinalDocsView />;
      case 'settings':
        return <GroupSettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] flex">
      {/* Navigation Sidebar */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto w-full">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthGroupProvider>
      <MainAppContent />
    </AuthGroupProvider>
  );
}
