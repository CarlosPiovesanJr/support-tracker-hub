import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { NumberInputWithControls } from '@/components/ui/number-input-with-controls';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Users, MessageSquare, TrendingUp, CalendarIcon, Save, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TeamMemberData {
  name: string;
  whatsapp: number;
}

const TEAM_MEMBERS = [
  "Ana",
  "Angelo",
  "Celso",
  "Carlos",
  "Carol",
  "Felipe",
  "Haya",
  "Igor",
  "Lucas",
  "Mateus",
  "Matheus",
  "Nicolas"
];

interface SupportTrackerProps {
  onDataChange: (teamData: TeamMemberData[], averagePerMember: number) => void;
}

const SupportTracker: React.FC<SupportTrackerProps> = ({ onDataChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [teamData, setTeamData] = useState<TeamMemberData[]>(
    TEAM_MEMBERS.map(name => ({ name, whatsapp: 0 }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  // Carregar dados do dia selecionado
  const loadDataForDate = useCallback(async (date: Date) => {
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
  }, [toast]);

  // Carregar dados quando a data mudar
  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate, loadDataForDate]);

  const updateMemberData = useCallback((index: number, field: 'whatsapp', value: number) => {
    setTeamData(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ));
  }, []);

  const handleSaveClick = useCallback(() => {
    if (totals.totalCalls === 0) {
      toast({
        title: "Nada para salvar",
        description: "Nenhum chamado foi registrado ainda.",
        variant: "destructive"
      });
      return;
    }
    setShowConfirmDialog(true);
  }, [totals.totalCalls, toast]);

  const saveData = useCallback(async () => {
    setIsSaving(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      // Preparar dados para inserção/atualização
      const dataToSave = teamData
        .filter(member => member.whatsapp > 0)
        .map(member => ({
          data: formattedDate,
          integrante: member.name,
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
  }, [selectedDate, teamData, toast]);

  const totals = useMemo(() => {
    const totalWhatsapp = teamData.reduce((sum, member) => sum + member.whatsapp, 0);
    const totalCalls = totalWhatsapp;
    const averagePerMember = Math.round(totalCalls / TEAM_MEMBERS.length);
    
    return {
      totalWhatsapp,
      totalCalls,
      averagePerMember
    };
  }, [teamData]);

  const topPerformers = useMemo(() => {
    return [...teamData]
      .sort((a, b) => b.whatsapp - a.whatsapp)
      .slice(0, 3);
  }, [teamData]);

  // Pass data up to parent whenever teamData or totals change
  useEffect(() => {
    onDataChange(teamData, totals.averagePerMember);
  }, [teamData, totals.averagePerMember, onDataChange]);

  return (
    <div className="space-y-8">
      {/* Header Melhorado */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-chart-2 to-chart-3 bg-clip-text text-transparent mb-2">
            Registro Manual de Chamados
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Controle e acompanhe o desempenho da equipe de suporte em tempo real
          </p>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2 text-sm">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Carregando dados...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <span>Sistema online</span>
            </div>
          )}
        </div>
      </div>

      {/* Seletor de Data e Ações */}
      <Card className="bg-gradient-to-br from-card via-card/80 to-accent/10 border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Controle de Data</h2>
              <p className="text-sm text-muted-foreground font-normal">Selecione a data para registrar os chamados</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full sm:w-[320px] justify-start text-left font-normal h-12 border-2 hover:border-primary/50",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-3 h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : "Selecione uma data"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedDate ? format(selectedDate, "EEEE", { locale: ptBR }) : "Data do registro"}
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={handleSaveClick} 
                disabled={isSaving || isLoading}
                className="flex-1 sm:flex-none bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary h-12 px-6 shadow-md"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Dados
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Alert para dados não salvos */}
          {totals.totalCalls > 0 && (
            <Alert className="border-warning/50 bg-warning/5">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning-foreground">
                Você tem {totals.totalCalls} chamados registrados. Não esqueça de salvar!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Indicadores Gerais Melhorados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-md hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total de Chamados</p>
                <p className="text-3xl font-bold text-primary">{totals.totalCalls}</p>
                <div className="flex items-center gap-2">
                  <Progress value={(totals.totalCalls / (TEAM_MEMBERS.length * 20)) * 100} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round((totals.totalCalls / (TEAM_MEMBERS.length * 20)) * 100)}%
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-chart-3/5 border-chart-3/20 hover:border-chart-3/40 transition-all duration-300 shadow-md hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">WhatsApp</p>
                <p className="text-3xl font-bold text-chart-3">{totals.totalWhatsapp}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>100% do total</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-chart-3/10">
                <MessageSquare className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-success/5 border-success/20 hover:border-success/40 transition-all duration-300 shadow-md hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Média por Pessoa</p>
                <p className="text-3xl font-bold text-success">{totals.averagePerMember}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{TEAM_MEMBERS.length} integrantes</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Melhorado */}
      <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Top Performers do Dia</h2>
              <p className="text-sm text-muted-foreground font-normal">Integrantes que mais atenderam chamados</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topPerformers.some(p => p.whatsapp > 0) ? (
            <div className="space-y-3">
              {topPerformers.filter(p => p.whatsapp > 0).map((performer, index) => {
                const isFirst = index === 0;
                const percentage = totals.totalCalls > 0 ? (performer.whatsapp / totals.totalCalls) * 100 : 0;
                
                return (
                  <div key={performer.name} className="flex items-center gap-4 p-3 rounded-lg border border-border/50 bg-secondary/20">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      isFirst ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700' :
                      'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{performer.name}</span>
                        <span className="text-sm font-bold">{performer.whatsapp} chamados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={percentage} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum chamado registrado ainda</p>
              <p className="text-sm">Comece preenchendo o formulário abaixo</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Preenchimento Melhorado */}
      <Card className="bg-gradient-to-br from-card via-card/90 to-secondary/20 border-border/50 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <MessageSquare className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Registro de Chamados
                </h2>
                <p className="text-sm text-muted-foreground font-normal">
                  {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </CardTitle>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-primary">{totals.totalCalls}</p>
            </div>
          </div>
          <Separator className="mt-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teamData.map((member, index) => {
                const isAboveAverage = member.whatsapp > totals.averagePerMember;
                const hasValue = member.whatsapp > 0;
                
                return (
                  <div key={member.name} className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    hasValue 
                      ? 'border-primary/30 bg-gradient-to-r from-primary/5 to-transparent shadow-sm' 
                      : 'border-border/50 bg-secondary/10 hover:border-border hover:bg-secondary/20'
                  }`}>
                    <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center p-6">
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            hasValue ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{member.name}</p>
                            {hasValue && (
                              <p className={`text-xs ${
                                isAboveAverage ? 'text-success' : 'text-muted-foreground'
                              }`}>
                                {isAboveAverage ? 'Acima da média' : 'Dentro da média'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-2">
                        <NumberInputWithControls
                          label="Chamados WhatsApp"
                          value={member.whatsapp}
                          onChange={(value) => updateMemberData(index, 'whatsapp', value)}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="lg:col-span-1 text-center">
                        <p className="text-sm text-muted-foreground mb-1">Total</p>
                        <p className={`text-2xl font-bold ${
                          hasValue ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {member.whatsapp}
                        </p>
                      </div>
                      
                      <div className="lg:col-span-1">
                        {hasValue && (
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-1">
                              <CheckCircle className="w-5 h-5 text-success" />
                            </div>
                            <p className="text-xs text-success font-medium">Registrado</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Barra de progresso visual */}
                    {hasValue && (
                      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-chart-2" 
                           style={{ width: `${Math.min((member.whatsapp / 50) * 100, 100)}%` }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={saveData}
        title="Confirmar Salvamento"
        description={`Você está prestes a salvar ${totals.totalCalls} chamados para ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}. Esta ação sobrescreverá dados existentes para esta data. Deseja continuar?`}
        confirmText="Sim, Salvar"
        cancelText="Cancelar"
        variant="success"
        isLoading={isSaving}
      />
    </div>
  );
};

export default SupportTracker;