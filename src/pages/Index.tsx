import React, { useState, useCallback } from 'react';
import SupportTrackerFixed from '@/components/SupportTrackerFixed';
import IntercomMonthlyTrackerFixed from '@/components/IntercomMonthlyTrackerFixed';
import DailySummaryCompact from '@/components/DailySummaryCompact';
import NotesWidget from '@/components/NotesWidget';

interface TeamMemberData {
  name: string;
  whatsapp: number;
}

const Index = () => {
  const [dailyTeamData, setDailyTeamData] = useState<TeamMemberData[]>([]);
  const [dailyAveragePerMember, setDailyAveragePerMember] = useState<number>(0);

  const handleDailyDataChange = useCallback((teamData: TeamMemberData[], averagePerMember: number) => {
    setDailyTeamData(teamData);
    setDailyAveragePerMember(averagePerMember);
  }, []);

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent mb-1">
            Support Tracker Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Controle e acompanhe o desempenho da equipe de suporte
          </p>
        </div>
        
        {/* Layout de 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Coluna 1: Registro Diário */}
          <div>
            <SupportTrackerFixed onDataChange={handleDailyDataChange} />
          </div>
          
          {/* Coluna 2: Intercom + Resumo do Dia + Anotações */}
          <div className="space-y-4">
            <IntercomMonthlyTrackerFixed />
            <DailySummaryCompact teamData={dailyTeamData} averagePerMember={dailyAveragePerMember} />
            <NotesWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;