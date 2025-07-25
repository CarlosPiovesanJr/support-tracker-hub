import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, TrendingUp, TrendingDown, CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [teamData, setTeamData] = useState<TeamMemberData[]>(
    TEAM_MEMBERS.map(name => ({ name, intercom: 0, whatsapp: 0 }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Carregar dados do dia selecionado
  const loadDataForDate = async (date: Date) => {
    setIsLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('registros_chamados_diarios')
        .select('*')
        .eq('data', formattedDate);

      if (error) throw error;

      // Atualizar estado com dados carregados
      const updatedTeamData = TEAM_MEMBERS.map(name => {
        const memberRecord = data?.find(record => record.integrante === name);
        return {
          name,
          intercom: memberRecord?.chamados_intercom || 0,
          whatsapp: memberRecord?.chamados_whatsapp || 0
        };
      });

      setTeamData(updatedTeamData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dia selecionado.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados quando a data mudar
  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate]);

  const updateMemberData = (index: number, field: 'intercom' | 'whatsapp', value: string) => {
    const numValue = parseInt(value) || 0;
    setTeamData(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: numValue } : member
    ));
  };

  const saveData = async () => {
    setIsSaving(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Preparar dados para inserção/atualização
      const dataToSave = teamData
        .filter(member => member.intercom > 0 || member.whatsapp > 0)
        .map(member => ({
          data: formattedDate,
          integrante: member.name,
          chamados_intercom: member.intercom,
          chamados_whatsapp: member.whatsapp
        }));

      // Usar upsert para inserir ou atualizar registros
      const { error } = await supabase
        .from('registros_chamados_diarios')
        .upsert(dataToSave, {
          onConflict: 'integrante,data'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Dados salvos para ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}`,
      });
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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

        {/* Seletor de Data */}
        <Card className="bg-gradient-to-br from-card to-accent/20 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Selecionar Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Button 
                onClick={saveData} 
                disabled={isSaving || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Salvando...' : 'Salvar Dados'}
              </Button>
            </div>
          </CardContent>
        </Card>

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
              Top Performers do Dia
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
            <CardTitle>
              Registro de Chamados para {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Carregando dados...</p>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Resumo do Dia */}
        <Card className="bg-gradient-to-br from-card to-accent/20 border-border/50">
          <CardHeader>
            <CardTitle>Resumo do Dia</CardTitle>
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