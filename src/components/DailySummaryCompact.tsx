import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, BarChart3 } from 'lucide-react';

interface TeamMemberData {
  name: string;
  whatsapp: number;
}

interface DailySummaryCompactProps {
  teamData: TeamMemberData[];
  averagePerMember: number;
  totalCalls: number;
}


const DailySummaryCompact: React.FC<DailySummaryCompactProps> = ({ teamData, averagePerMember, totalCalls }) => {


  const stats = useMemo(() => {
    const totalCalls = teamData.reduce((sum, member) => sum + member.whatsapp, 0);
    const activeMembers = teamData.filter(member => member.whatsapp > 0).length;
    const topPerformer = teamData.reduce((top, member) => 
      member.whatsapp > top.whatsapp ? member : top, teamData[0] || { name: '', whatsapp: 0 }
    );
    const aboveAverageCount = teamData.filter(member => member.whatsapp > averagePerMember).length;
    
    return {
      totalCalls,
      activeMembers,
      topPerformer,
      aboveAverageCount,
      totalMembers: teamData.length
    };
  }, [teamData, averagePerMember]);

  if (stats.totalCalls === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="text-center py-4 text-muted-foreground">
            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum chamado registrado ainda</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-4 w-4 text-primary" />
          Resumo do Dia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estatísticas Gerais Compactas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Único</span>
            </div>
            <p className="text-xl font-bold text-primary">
              {totalCalls}
            </p>
            <p className="text-xs text-muted-foreground">
              soma do dia
            </p>
          </div>
          
          <div className="bg-success/5 rounded-lg p-3 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3 h-3 text-success" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ativos</span>
            </div>
            <p className="text-xl font-bold text-success">{stats.activeMembers}</p>
            <p className="text-xs text-muted-foreground">de {stats.totalMembers} integrantes</p>
          </div>
        </div>

        {/* Top Performers Compacto */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Top Performers</h3>
          <div className="space-y-2">
            {teamData
              .filter(member => member.whatsapp > 0)
              .sort((a, b) => b.whatsapp - a.whatsapp)
              .slice(0, 5)
              .map((member, index) => {
                const percentage = totalCalls > 0 ? (member.whatsapp / totalCalls) * 100 : 0;
                const isAboveAverage = member.whatsapp > averagePerMember;
                
                return (
                  <div key={member.name} className="flex items-center gap-2 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate">{member.name}</span>
                        <span className="text-xs font-bold">{member.whatsapp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="flex-1 h-1" />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="ml-2">
                      {isAboveAverage ? (
                        <Badge variant="default" className="bg-success text-success-foreground text-xs px-1 py-0">
                          <TrendingUp className="h-2 w-2 mr-1" />
                          +
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          <TrendingDown className="h-2 w-2 mr-1" />
                          =
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Estatísticas Finais */}
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Média por integrante: <strong>{averagePerMember}</strong></span>
            <span>Acima da média: <strong>{stats.aboveAverageCount}</strong></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummaryCompact;