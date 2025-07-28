import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, TrendingUp, CalendarIcon, Save } from 'lucide-react';
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
  showTotals?: boolean;
}

const SupportTrackerFixed: React.FC<SupportTrackerProps> = ({ onDataChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [teamData, setTeamData] = useState<TeamMemberData[]>(
    TEAM_MEMBERS.map(name => ({ name, whatsapp: 0 }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      
      // Carregar dados existentes
      if (data && data.length > 0) {
        data.forEach(record => {
          const memberIndex = resetTeamData.findIndex(member => member.name === record.integrante);
          if (memberIndex !== -1) {
            resetTeamData[memberIndex].whatsapp = record.chamados_whatsapp || 0;
          }
        });
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

  // Carregar dados iniciais
  useEffect(() => {
    loadDataForDate(selectedDate);
  }, []);

  // Carregar dados quando a data muda
  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate, loadDataForDate]);

  useEffect(() => {
    onDataChange(teamData, totals.averagePerMember);
  }, [teamData, totals.averagePerMember, onDataChange]);

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
              className="bg-primary hover:bg-primary/90 h-8 text-sm"
            >
              <Save className="mr-1 h-3 w-3" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
            
            {/* Totais Inline */}
            <div className="flex items-center gap-4 text-sm ml-auto">
              <div className="text-center">
                <span className="text-xs text-muted-foreground block">Total</span>
                <span className="font-bold text-primary">{totals.totalCalls}</span>
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
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={member.whatsapp || ''}
                    onChange={(e) => updateMemberData(index, parseInt(e.target.value) || 0)}
                    className="text-center h-7 w-14 text-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0" 
                    onClick={() => updateMemberData(index, member.whatsapp + 1)}
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