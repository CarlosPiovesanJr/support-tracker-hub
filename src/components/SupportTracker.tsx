import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';

interface TeamMemberData {
  name: string;
  intercom: number;
  whatsapp: number;
}

const TEAM_MEMBERS = [
  'Ana', 'Angelo', 'Carlos', 'Celso', 'Felipe', 
  'Haya', 'Lucas', 'Mateus', 'Matheus', 'Nicolas', 'Igor', 'Carol'
];

const SupportTracker = () => {
  const [teamData, setTeamData] = useState<TeamMemberData[]>(
    TEAM_MEMBERS.map(name => ({ name, intercom: 0, whatsapp: 0 }))
  );

  const updateMemberData = (index: number, field: 'intercom' | 'whatsapp', value: string) => {
    const numValue = parseInt(value) || 0;
    setTeamData(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: numValue } : member
    ));
  };

  const totals = useMemo(() => {
    const totalIntercom = teamData.reduce((sum, member) => sum + member.intercom, 0);
    const totalWhatsapp = teamData.reduce((sum, member) => sum + member.whatsapp, 0);
    const totalCalls = totalIntercom + totalWhatsapp;
    const averagePerMember = Math.round(totalCalls / TEAM_MEMBERS.length);
    
    return {
      totalIntercom,
      totalWhatsapp,
      totalCalls,
      averagePerMember
    };
  }, [teamData]);

  const topPerformers = useMemo(() => {
    return [...teamData]
      .sort((a, b) => (b.intercom + b.whatsapp) - (a.intercom + a.whatsapp))
      .slice(0, 3);
  }, [teamData]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent mb-2">
            Registro Manual de Chamados
          </h1>
          <p className="text-muted-foreground">
            Controle e acompanhe o desempenho da equipe de suporte
          </p>
        </div>

        {/* Indicadores Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-card to-secondary/50 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Chamados</p>
                  <p className="text-2xl font-bold text-primary">{totals.totalCalls}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-chart-2/20 border-chart-2/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-chart-2" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Intercom</p>
                  <p className="text-2xl font-bold text-chart-2">{totals.totalIntercom}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-chart-3/20 border-chart-3/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-chart-3" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">WhatsApp</p>
                  <p className="text-2xl font-bold text-chart-3">{totals.totalWhatsapp}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-success/20 border-success/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Média por Pessoa</p>
                  <p className="text-2xl font-bold text-success">{totals.averagePerMember}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topPerformers.map((performer, index) => (
                <Badge 
                  key={performer.name} 
                  variant={index === 0 ? "default" : "secondary"}
                  className={index === 0 ? "bg-primary text-primary-foreground" : ""}
                >
                  {performer.name}: {performer.intercom + performer.whatsapp} chamados
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Preenchimento */}
        <Card className="bg-gradient-to-br from-card to-secondary/30 border-border/50">
          <CardHeader>
            <CardTitle>Registro de Chamados por Integrante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamData.map((member, index) => (
                <div key={member.name} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-4 rounded-lg border border-border/50 bg-secondary/20">
                  <div className="font-medium text-foreground">
                    {member.name}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Chamados Intercom</label>
                    <Input
                      type="number"
                      min="0"
                      value={member.intercom || ''}
                      onChange={(e) => updateMemberData(index, 'intercom', e.target.value)}
                      className="bg-background/50 border-border/50"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground">Chamados WhatsApp</label>
                    <Input
                      type="number"
                      min="0"
                      value={member.whatsapp || ''}
                      onChange={(e) => updateMemberData(index, 'whatsapp', e.target.value)}
                      className="bg-background/50 border-border/50"
                      placeholder="0"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-primary">
                      {member.intercom + member.whatsapp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumo Mensal */}
        <Card className="bg-gradient-to-br from-card to-accent/20 border-border/50">
          <CardHeader>
            <CardTitle>Resumo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="font-semibold">Nome</TableHead>
                    <TableHead className="font-semibold text-chart-2">Intercom</TableHead>
                    <TableHead className="font-semibold text-chart-3">WhatsApp</TableHead>
                    <TableHead className="font-semibold text-primary">Total</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamData.map((member) => {
                    const total = member.intercom + member.whatsapp;
                    const isAboveAverage = total > totals.averagePerMember;
                    
                    return (
                      <TableRow key={member.name} className="border-border/30 hover:bg-secondary/30">
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell className="text-chart-2 font-medium">{member.intercom}</TableCell>
                        <TableCell className="text-chart-3 font-medium">{member.whatsapp}</TableCell>
                        <TableCell className="text-primary font-bold">{total}</TableCell>
                        <TableCell>
                          {total > 0 && (
                            <Badge 
                              variant={isAboveAverage ? "default" : "secondary"}
                              className={`${isAboveAverage 
                                ? "bg-success text-success-foreground" 
                                : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isAboveAverage ? (
                                <><TrendingUp className="h-3 w-3 mr-1" />Acima da Média</>
                              ) : (
                                <><TrendingDown className="h-3 w-3 mr-1" />Abaixo da Média</>
                              )}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupportTracker;