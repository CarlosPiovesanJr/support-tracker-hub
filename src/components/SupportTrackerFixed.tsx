import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, TrendingUp, CalendarIcon, Save, Check } from 'lucide-react';
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
  onDataChange: (teamData: TeamMemberData[], averagePerMember: number, totalCalls: number) => void;
  showTotals?: boolean;
}

const SupportTrackerFixed: React.FC<SupportTrackerProps> = ({ onDataChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [teamData, setTeamData] = useState<TeamMemberData[]>(
    TEAM_MEMBERS.map(name => ({ name, whatsapp: 0 }))
  );
  const [totalAdjustment, setTotalAdjustment] = useState<number>(0);
  const [baseTotal, setBaseTotal] = useState<number>(0); // Total base do banco
  const [initialIndividualSum, setInitialIndividualSum] = useState<number>(0); // Soma inicial dos integrantes
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const { toast } = useToast();

  const loadDataForDate = useCallback(async (date: Date) => {
    setIsLoading(true);
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('registros_chamados_diarios')
        .select('*')
        .eq('data', formattedDate);

      if (error) throw error;

      // Resetar dados da equipe
      const resetTeamData = TEAM_MEMBERS.map(name => ({ name, whatsapp: 0 }));
      
      let totalFromBank = 0;
      let hasAdjustment = false;
      
      // Carregar dados existentes
      if (data && data.length > 0) {
        data.forEach(record => {
          if (record.integrante === 'TOTAL_ADJUSTMENT') {
            totalFromBank = record.chamados_whatsapp || 0;
            hasAdjustment = true;
          } else {
            const memberIndex = resetTeamData.findIndex(member => member.name === record.integrante);
            if (memberIndex !== -1) {
              resetTeamData[memberIndex].whatsapp = record.chamados_whatsapp || 0;
            }
          }
        });
      }
      
      // Calcular soma inicial dos integrantes
      const individualSum = resetTeamData.reduce((sum, member) => sum + member.whatsapp, 0);
      
      if (hasAdjustment) {
        // Se tem TOTAL_ADJUSTMENT, usar como base e calcular ajuste
        setBaseTotal(totalFromBank);
        setInitialIndividualSum(individualSum);
        setTotalAdjustment(totalFromBank - individualSum);
      } else {
        // Se não tem TOTAL_ADJUSTMENT, usar soma individual
        setBaseTotal(individualSum);
        setInitialIndividualSum(individualSum);
        setTotalAdjustment(0);
      }
      
      setTeamData(resetTeamData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados da data selecionada.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateMemberData = useCallback((index: number, value: number) => {
    setTeamData(prev => prev.map((member, i) => 
      i === index ? { ...member, whatsapp: value } : member
    ));
  }, []);

  const saveData = useCallback(async () => {
    setIsSaving(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const dataToSave = teamData
        .filter(member => member.whatsapp > 0)
        .map(member => ({
          data: formattedDate,
          integrante: member.name,
          chamados_whatsapp: member.whatsapp
        }));

      // Calcular total final diretamente
      const currentIndividualSum = teamData.reduce((sum, member) => sum + member.whatsapp, 0);
      const individualDifference = currentIndividualSum - initialIndividualSum;
      const finalTotal = baseTotal + individualDifference;
      
      const totalRecord = {
        data: formattedDate,
        integrante: 'TOTAL_ADJUSTMENT',
        chamados_whatsapp: finalTotal
      };
      
      dataToSave.push(totalRecord);
      
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

      // Feedback visual temporário
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
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
  }, [selectedDate, teamData, totalAdjustment, baseTotal, initialIndividualSum, toast]);

  const totals = useMemo(() => {
    const currentIndividualSum = teamData.reduce((sum, member) => sum + member.whatsapp, 0);
    const individualDifference = currentIndividualSum - initialIndividualSum;
    const totalCalls = baseTotal + individualDifference;
    const averagePerMember = Math.round(totalCalls / TEAM_MEMBERS.length);
    
    
    return {
      totalWhatsapp: currentIndividualSum,
      totalCalls,
      averagePerMember,
      adjustment: totalAdjustment,
      baseTotal,
      individualDifference
    };
  }, [teamData, totalAdjustment, baseTotal, initialIndividualSum]);

  // Carregar dados quando a data muda ou componente é montado
  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate, loadDataForDate]);

  useEffect(() => {
    onDataChange(teamData, totals.averagePerMember, totals.totalCalls);
  }, [teamData, totals.averagePerMember, totals.totalCalls, onDataChange]);

  return (
    <div className="space-y-4">
      {/* Header Compacto */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-4 w-4 text-primary" />
            Registro Diário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full sm:w-[200px] justify-start text-left font-normal h-8",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  <span className="text-sm">
                    {isLoading ? "Carregando..." : selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ptBR }) : "Data"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  disabled={isLoading}
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={saveData} 
              disabled={isSaving || isLoading}
              size="sm"
              className={`h-8 text-sm transition-all ${
                justSaved 
                  ? 'bg-success hover:bg-success/90 text-success-foreground' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
              title="Salvar registros de chamados para a data selecionada"
            >
              {justSaved ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="mr-1 h-3 w-3" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </>
              )}
            </Button>
            
            {/* Totais Inline com Controles */}
            <div className="flex items-center gap-4 text-sm ml-auto">
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Individual</span>
                <span className="font-bold text-muted-foreground">{totals.totalWhatsapp}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block">Total</span>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-6 w-6 p-0" 
                      onClick={() => setBaseTotal(prev => Math.max(0, prev - 1))}
                      title="Diminuir total geral"
                    >
                      -
                    </Button>
                    <span className="font-bold text-primary min-w-[40px] text-center">{totals.totalCalls}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-6 w-6 p-0" 
                      onClick={() => setBaseTotal(prev => prev + 1)}
                      title="Aumentar total geral"
                    >
                      +
                    </Button>
                  </div>
                  {totals.individualDifference !== 0 && (
                    <span className={`text-xs ${totals.individualDifference > 0 ? 'text-success' : 'text-destructive'}`}>
                      {totals.individualDifference > 0 ? '+' : ''}{totals.individualDifference}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Média</span>
                <span className="font-bold text-success">{totals.averagePerMember}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Registros Compacto */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Chamados - {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {teamData.map((member, index) => (
              <div key={member.name} className="grid grid-cols-4 gap-3 items-center p-3 rounded border border-border/50 hover:bg-secondary/20">
                {/* Nome */}
                <div className="font-medium text-sm">
                  {member.name}
                </div>
                
                {/* Controles de Input - Layout Corrigido */}
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0" 
                    onClick={() => updateMemberData(index, Math.max(0, member.whatsapp - 1))}
                    title={`Diminuir chamados de ${member.name}`}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={member.whatsapp || ''}
                    onChange={(e) => updateMemberData(index, parseInt(e.target.value) || 0)}
                    className="text-center h-7 w-14 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                    title={`Número de chamados atendidos por ${member.name}`}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0" 
                    onClick={() => updateMemberData(index, member.whatsapp + 1)}
                    title={`Aumentar chamados de ${member.name}`}
                  >
                    +
                  </Button>
                </div>
                
                {/* Total */}
                <div className="text-center">
                  <span className="text-lg font-bold text-primary">
                    {member.whatsapp}
                  </span>
                </div>
                
                {/* Status */}
                <div className="text-center">
                  {member.whatsapp > totals.averagePerMember ? (
                    <Badge variant="default" className="bg-success text-success-foreground text-xs">
                      Acima
                    </Badge>
                  ) : member.whatsapp > 0 ? (
                    <Badge variant="secondary" className="text-xs">
                      Normal
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTrackerFixed;