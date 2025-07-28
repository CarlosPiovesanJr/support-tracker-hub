import React, { useState, useCallback } from 'react';
import SupportTrackerSimple from '@/components/SupportTrackerSimple';

interface TeamMemberData {
  name: string;
  whatsapp: number;
}

const IndexBackup = () => {
  const [dailyTeamData, setDailyTeamData] = useState<TeamMemberData[]>([]);
  const [dailyAveragePerMember, setDailyAveragePerMember] = useState<number>(0);

  const handleDailyDataChange = useCallback((teamData: TeamMemberData[], averagePerMember: number) => {
    setDailyTeamData(teamData);
    setDailyAveragePerMember(averagePerMember);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Support Tracker Hub - Versão de Teste
        </h1>
        
        <SupportTrackerSimple />
        
        <div className="text-center text-sm text-muted-foreground">
          Esta é uma versão simplificada para testar se há problemas nos componentes.
        </div>
      </div>
    </div>
  );
};

export default IndexBackup;