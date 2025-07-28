import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown, Users, BarChart3, Target, Award } from 'lucide-react';

interface TeamMemberData {
  name: string;
  whatsapp: number;
}

interface DailySummaryProps {
  teamData: TeamMemberData[];
  averagePerMember: number;
}

const DailySummary: React.FC<DailySummaryProps> = ({ teamData, averagePerMember }) => {
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

  return (
    <Card className="bg-gradient-to-br from-card via-card/90 to-accent/10 border-border/50 shadow-lg">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Resumo do Dia</h2>
            <p className="text-sm text-muted-foreground font-normal">
              Análise detalhada do desempenho da equipe
            </p>
          </div>
        </CardTitle>
        <Separator className="mt-4" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</span>
            </div>
            <p className="text-2xl font-bold text-primary">{stats.totalCalls}</p>
            <p className="text-xs text-muted-foreground">chamados hoje</p>
          </div>
          
          <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-lg p-4 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-success" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ativos</span>
            </div>
            <p className="text-2xl font-bold text-success">{stats.activeMembers}</p>
            <p className="text-xs text-muted-foreground">de {stats.totalMembers} integrantes</p>
          </div>
          
          <div className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 rounded-lg p-4 border border-chart-2/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-chart-2" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Média</span>
            </div>
            <p className="text-2xl font-bold text-chart-2">{averagePerMember}</p>
            <p className="text-xs text-muted-foreground">por integrante</p>
          </div>
          
          <div className="bg-gradient-to-br from-warning/5 to-warning/10 rounded-lg p-4 border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-warning" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Top</span>
            </div>
            <p className="text-2xl font-bold text-warning">{stats.topPerformer.whatsapp}</p>
            <p className="text-xs text-muted-foreground">{stats.topPerformer.name}</p>
          </div>
        </div>

        {/* Tabela Detalhada */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Detalhamento por Integrante</h3>
            <Badge variant="outline" className="text-xs">
              {stats.aboveAverageCount} acima da média
            </Badge>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 bg-muted/30">
                  <TableHead className="font-semibold">Integrante</TableHead>
                  <TableHead className="font-semibold text-center">WhatsApp</TableHead>
                  <TableHead className="font-semibold text-center">Performance</TableHead>
                  <TableHead className="font-semibold text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamData
                  .sort((a, b) => b.whatsapp - a.whatsapp)
                  .map((member, index) => {
                    const total = member.whatsapp;
                    const isAboveAverage = total > averagePerMember;
                    const percentage = stats.totalCalls > 0 ? (total / stats.totalCalls) * 100 : 0;
                    const isTopPerformer = index < 3 && total > 0;
                    
                    return (
                      <TableRow key={member.name} className="border-border/30 hover:bg-secondary/30 group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isTopPerformer 
                                ? index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                                  index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700' :
                                  'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900'
                                : total > 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                            }`}>
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              {isTopPerformer && (
                                <Badge variant="secondary" className="text-xs">
                                  #{index + 1}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <span className={`text-lg font-bold ${
                            total > 0 ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {member.whatsapp}
                          </span>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          <div className="space-y-1">
                            <div className="flex items-center justify-center gap-2">
                              <Progress value={percentage} className="w-16 h-2" />
                              <span className="text-xs text-muted-foreground w-12 text-right">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              vs média: {total > 0 ? (total - averagePerMember > 0 ? '+' : '') + (total - averagePerMember) : '0'}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center">
                          {total > 0 ? (
                            <Badge 
                              variant={isAboveAverage ? "default" : "secondary"}
                              className={`${
                                isAboveAverage 
                                  ? "bg-success text-success-foreground" 
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isAboveAverage ? (
                                <><TrendingUp className="h-3 w-3 mr-1" />Acima</>
                              ) : (
                                <><TrendingDown className="h-3 w-3 mr-1" />Abaixo</>
                              )}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Sem registro
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummary;
