import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, BarChart3, Edit3, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import CSVUploader from "@/components/CSVUploader";
import NotesWidget from "@/components/NotesWidget";

interface IntercomMonthlyStat {
  id?: string;
  user_name: string;
  monthly_total: number;
  evaluation_percentage: number;
  month: string;
  created_at?: string;
  updated_at?: string;
}

const IntercomViewer = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(startOfMonth(new Date()));
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState<IntercomMonthlyStat[]>([]);
  const { toast } = useToast();

  const loadMonthlyStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const startOfMonthFormatted = format(selectedMonth, "yyyy-MM-dd");
      const endOfMonthFormatted = format(endOfMonth(selectedMonth), "yyyy-MM-dd");

      const { data, error } = await supabase
        .from("intercom_monthly_stats")
        .select("*")
        .gte("month", startOfMonthFormatted)
        .lte("month", endOfMonthFormatted);

      if (error) throw error;
      setMonthlyStats(data || []);
    } catch (error) {
      console.error("Erro ao carregar estatísticas mensais:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as estatísticas mensais do Intercom.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, toast]);

  useEffect(() => {
    loadMonthlyStats();
  }, [loadMonthlyStats]);

  const deleteRecord = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("intercom_monthly_stats")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Registro removido com sucesso!",
      });

      loadMonthlyStats();
    } catch (error) {
      console.error("Erro ao deletar registro:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o registro.",
        variant: "destructive",
      });
    }
  }, [toast, loadMonthlyStats]);

  return (
    <div className="space-y-4">
      {/* Anotações */}
      <NotesWidget />
      
      {/* CSV Uploader */}
      <CSVUploader 
        selectedMonth={selectedMonth} 
        onUploadSuccess={loadMonthlyStats} 
      />
      
      {/* Visualizador dos Dados Mensais */}      
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-4 w-4 text-chart-2" />
              Dados Mensais Intercom
            </CardTitle>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal h-8",
                    !selectedMonth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  <span className="text-sm">
                    {selectedMonth ? format(selectedMonth, "MM/yyyy", { locale: ptBR }) : "Mês"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) => date && setSelectedMonth(startOfMonth(date))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : monthlyStats.length > 0 ? (
            <div className="space-y-2">
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-muted/20 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-primary">
                    {monthlyStats.reduce((sum, stat) => sum + stat.monthly_total, 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Média Avaliação</p>
                  <p className="text-lg font-bold text-chart-2">
                    {(monthlyStats.reduce((sum, stat) => sum + stat.evaluation_percentage, 0) / monthlyStats.length).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Integrantes</p>
                  <p className="text-lg font-bold text-success">{monthlyStats.length}</p>
                </div>
              </div>

              {/* Lista de Registros */}
              {monthlyStats
                .sort((a, b) => b.monthly_total - a.monthly_total)
                .map((stat) => (
                <div key={stat.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-secondary/20 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {stat.user_name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-medium text-sm">{stat.user_name}</span>
                      <p className="text-xs text-muted-foreground">
                        Atualizado: {stat.updated_at ? format(new Date(stat.updated_at), "dd/MM HH:mm", { locale: ptBR }) : "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-bold text-primary w-12 text-right">{stat.monthly_total}</span>
                        <span className={`font-medium w-12 text-right ${
                          stat.evaluation_percentage >= 90 ? 'text-success' :
                          stat.evaluation_percentage >= 70 ? 'text-warning' : 
                          stat.evaluation_percentage > 0 ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          {stat.evaluation_percentage > 0 ? `${stat.evaluation_percentage}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => stat.id && deleteRecord(stat.id)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Nenhum dado para {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}</p>
              <p className="text-xs">Use o upload de CSV acima para importar dados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntercomViewer;