import React, { useState, useEffect } from 'react';
import SimpleAuth from '@/components/SimpleAuth';
import SupportTrackerFixed from '@/components/SupportTrackerFixed';
import IntercomViewer from '@/components/IntercomViewer';
import DailySummaryCompact from '@/components/DailySummaryCompact';
import { Button } from '@/components/ui/button';
import { LogOut, BarChart3 } from 'lucide-react';

interface TeamMemberData {
  name: string;
  whatsapp: number;
}

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dailyTeamData, setDailyTeamData] = useState<TeamMemberData[]>([]);
  const [dailyAveragePerMember, setDailyAveragePerMember] = useState<number>(0);

  // Verificar se já está autenticado
  useEffect(() => {
    const authStatus = localStorage.getItem('admin_authenticated');
    const authTime = localStorage.getItem('admin_auth_time');
    
    if (authStatus === 'true' && authTime) {
      const timeElapsed = Date.now() - parseInt(authTime);
      const fourHours = 4 * 60 * 60 * 1000; // 4 horas em ms
      
      if (timeElapsed < fourHours) {
        setIsAuthenticated(true);
      } else {
        // Sessão expirada
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_auth_time');
      }
    }
  }, []);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_time');
    setIsAuthenticated(false);
  };

  const handleDailyDataChange = (teamData: TeamMemberData[], averagePerMember: number) => {
    setDailyTeamData(teamData);
    setDailyAveragePerMember(averagePerMember);
  };

  if (!isAuthenticated) {
    return <SimpleAuth onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header com botão de logout */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent mb-1">
              Painel Administrativo
            </h1>
            <p className="text-sm text-muted-foreground">
              Área restrita para registro e controle de chamados
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('/', '_blank')}
              className="text-xs"
            >
              <BarChart3 className="mr-1 h-3 w-3" />
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-xs text-destructive hover:text-destructive"
            >
              <LogOut className="mr-1 h-3 w-3" />
              Sair
            </Button>
          </div>
        </div>
        
        {/* Layout de 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Coluna 1: Registro Diário + Resumo do Dia */}
          <div className="space-y-4">
            <SupportTrackerFixed onDataChange={handleDailyDataChange} />
            <DailySummaryCompact teamData={dailyTeamData} averagePerMember={dailyAveragePerMember} />
          </div>
          
          {/* Coluna 2: Intercom Viewer (Anotações + CSV + Dados) */}
          <div>
            <IntercomViewer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;