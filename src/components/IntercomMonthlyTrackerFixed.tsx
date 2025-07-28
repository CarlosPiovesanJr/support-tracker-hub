import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, Save, BarChart3 } from "lucide-react";
import CSVUploader from "@/components/CSVUploader";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IntercomMonthlyStat {
  id?: string;
  user_name: string;
  monthly_total: number;
  evaluation_percentage: number;
  month: string;
  created_at?: string;
  updated_at?: string;
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

const IntercomMonthlyTrackerFixed = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    startOfMonth(new Date())
  );
  const [userName, setUserName] = useState<string>("");
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [evaluationPercentage, setEvaluationPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState<IntercomMonthlyStat[]>([]);
  const { toast } = useToast();

  const loadMonthlyStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const startOfMonthFormatted = format(selectedMonth, "yyyy-MM-dd");
      const endOfMonthFormatted = format(
        endOfMonth(selectedMonth),
        "yyyy-MM-dd"
      );

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
        description:
          "Não foi possível carregar as estatísticas mensais do Intercom.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, toast]);

  useEffect(() => {
    loadMonthlyStats();
  }, [loadMonthlyStats]);

  const handleSave = useCallback(async () => {
    if (
      !userName ||
      monthlyTotal <= 0 ||
      evaluationPercentage < 0 ||
      evaluationPercentage > 100
    ) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos corretamente.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const monthFormatted = format(selectedMonth, "yyyy-MM-dd");

      const dataToSave: IntercomMonthlyStat = {
        user_name: userName,
        monthly_total: monthlyTotal,
        evaluation_percentage: evaluationPercentage,
        month: monthFormatted,
      };

      const { error } = await supabase
        .from("intercom_monthly_stats")
        .upsert(dataToSave, {
          onConflict: "user_name,month",
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Dados mensais do Intercom salvos para ${userName} em ${format(
          selectedMonth,
          "MM/yyyy",
          { locale: ptBR }
        )}`,
      });

      loadMonthlyStats();
      setMonthlyTotal(0);
      setEvaluationPercentage(0);
    } catch (error) {
      console.error("Erro ao salvar dados mensais:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados mensais do Intercom.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [
    userName,
    monthlyTotal,
    evaluationPercentage,
    selectedMonth,
    toast,
    loadMonthlyStats,
  ]);

  return (
    <div className="space-y-4">
      {/* CSV Uploader */}
      <CSVUploader
        selectedMonth={selectedMonth}
        onUploadSuccess={loadMonthlyStats}
      />

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-4 w-4 text-chart-2" />
            Registro Manual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="user_name" className="text-sm">
                Integrante
              </Label>
              <Select onValueChange={setUserName} value={userName}>
                <SelectTrigger className="w-full h-8 text-sm">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map((member) => (
                    <SelectItem key={member} value={member} className="text-sm">
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="monthly_total" className="text-sm">
                Total Mensal
              </Label>
              <Input
                id="monthly_total"
                type="number"
                value={monthlyTotal || ""}
                onChange={(e) => setMonthlyTotal(Number(e.target.value) || 0)}
                placeholder="0"
                min="0"
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="evaluation_percentage" className="text-sm">
              % Avaliação (0-100)
            </Label>
            <Input
              id="evaluation_percentage"
              type="number"
              value={evaluationPercentage || ""}
              onChange={(e) =>
                setEvaluationPercentage(Number(e.target.value) || 0)
              }
              placeholder="0.0"
              step="0.1"
              min="0"
              max="100"
              className="h-8 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full sm:w-[160px] justify-start text-left font-normal h-8",
                    !selectedMonth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  <span className="text-sm">
                    {selectedMonth
                      ? format(selectedMonth, "MM/yyyy", { locale: ptBR })
                      : "Mês"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) =>
                    date && setSelectedMonth(startOfMonth(date))
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading || !userName}
              size="sm"
              className="bg-primary hover:bg-primary/90 h-8 text-sm"
            >
              <Save className="mr-1 h-3 w-3" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Resumo - {format(selectedMonth, "MM/yyyy", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          ) : monthlyStats.length > 0 ? (
            <div className="space-y-2">
              {monthlyStats.map((stat) => (
                <div
                  key={stat.id}
                  className="flex items-center justify-between p-2 rounded border border-border/50 hover:bg-secondary/20"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {stat.user_name.charAt(0)}
                    </div>
                    <span className="font-medium text-sm">
                      {stat.user_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-primary">
                      {stat.monthly_total}
                    </span>
                    <span
                      className={`font-medium ${
                        stat.evaluation_percentage >= 90
                          ? "text-success"
                          : stat.evaluation_percentage >= 70
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    >
                      {stat.evaluation_percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum dado para este mês</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntercomMonthlyTrackerFixed;
