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
import {
  CalendarIcon,
  Save,
  BarChart3,
  Users,
  Percent,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface IntercomMonthlyStat {
  id?: string;
  user_name: string;
  monthly_total: number;
  evaluation_percentage: number;
  month: string; // YYYY-MM-DD format, always first day of the month
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

const IntercomMonthlyTracker = () => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(
    startOfMonth(new Date())
  );
  const [userName, setUserName] = useState<string>("");
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [evaluationPercentage, setEvaluationPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState<IntercomMonthlyStat[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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

  const handleSaveClick = useCallback(() => {
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
    setShowConfirmDialog(true);
  }, [userName, monthlyTotal, evaluationPercentage, toast]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (
        !userName ||
        monthlyTotal <= 0 ||
        evaluationPercentage < 0 ||
        evaluationPercentage > 100
      ) {
        toast({
          title: "Erro de Validação",
          description:
            "Por favor, preencha todos os campos corretamente. Total e Porcentagem devem ser válidos.",
          variant: "destructive",
        });
        return;
      }

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
      // Recarregar dados após salvar
      loadMonthlyStats();
      // Limpar formulário
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
    <div className="space-y-8">
      {/* Header Melhorado */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-chart-2/20 to-primary/20 mb-4">
          <BarChart3 className="w-8 h-8 text-chart-2" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-2 via-primary to-chart-3 bg-clip-text text-transparent mb-2">
            Registro Mensal Intercom
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Controle e acompanhe as estatísticas mensais do Intercom da equipe
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

      {/* Formulário de Preenchimento Melhorado */}
      <Card className="bg-gradient-to-br from-card via-card/90 to-secondary/20 border-border/50 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <BarChart3 className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Registrar Dados Mensais</h2>
              <p className="text-sm text-muted-foreground font-normal">
                {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </CardTitle>
          <Separator className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Mês */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Selecionar Mês
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[320px] justify-start text-left font-normal h-12 border-2 hover:border-primary/50",
                    !selectedMonth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {selectedMonth
                        ? format(selectedMonth, "MMMM 'de' yyyy", {
                            locale: ptBR,
                          })
                        : "Selecione um mês"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Mês de referência
                    </span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-2">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) =>
                    date && setSelectedMonth(startOfMonth(date))
                  }
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Campos do Formulário */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="user_name"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Nome do Integrante
              </Label>
              <Select onValueChange={setUserName} value={userName}>
                <SelectTrigger className="w-full h-12 border-2 hover:border-primary/50">
                  <SelectValue placeholder="Selecione um integrante da equipe" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_MEMBERS.map((member) => (
                    <SelectItem key={member} value={member} className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {member.charAt(0)}
                        </div>
                        {member}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="monthly_total"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Total Mensal de Chamados
              </Label>
              <Input
                id="monthly_total"
                type="number"
                value={monthlyTotal || ""}
                onChange={(e) => setMonthlyTotal(Number(e.target.value) || 0)}
                placeholder="Ex: 150"
                className="h-12 border-2 hover:border-primary/50 focus:border-primary"
                min="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="evaluation_percentage"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Percent className="w-4 h-4" />
              Porcentagem de Avaliação (0-100%)
            </Label>
            <Input
              id="evaluation_percentage"
              type="number"
              value={evaluationPercentage || ""}
              onChange={(e) =>
                setEvaluationPercentage(Number(e.target.value) || 0)
              }
              placeholder="Ex: 85.5"
              step="0.1"
              min="0"
              max="100"
              className="h-12 border-2 hover:border-primary/50 focus:border-primary"
            />
          </div>

          {/* Validação em tempo real */}
          {userName &&
            (monthlyTotal <= 0 ||
              evaluationPercentage < 0 ||
              evaluationPercentage > 100) && (
              <Alert className="border-warning/50 bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning-foreground">
                  Verifique os valores: Total deve ser maior que 0 e porcentagem
                  entre 0-100%
                </AlertDescription>
              </Alert>
            )}

          {/* Botão de Salvar */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveClick}
              disabled={isSaving || isLoading || !userName}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary h-12 px-8 shadow-md"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Dados Mensais
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Resumo Mensal Melhorada */}
      <Card className="bg-gradient-to-br from-card to-accent/10 border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <BarChart3 className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Resumo Mensal Intercom
                </h2>
                <p className="text-sm text-muted-foreground font-normal">
                  {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </CardTitle>

            {monthlyStats.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Total de registros
                </p>
                <p className="text-2xl font-bold text-primary">
                  {monthlyStats.length}
                </p>
              </div>
            )}
          </div>
          <Separator className="mt-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                Carregando dados mensais...
              </p>
            </div>
          ) : monthlyStats.length > 0 ? (
            <div className="space-y-4">
              {/* Estatísticas Gerais */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Total de Chamados
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {monthlyStats.reduce(
                      (sum, stat) => sum + stat.monthly_total,
                      0
                    )}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 rounded-lg p-4 border border-chart-2/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="w-4 h-4 text-chart-2" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Média de Avaliação
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-chart-2">
                    {(
                      monthlyStats.reduce(
                        (sum, stat) => sum + stat.evaluation_percentage,
                        0
                      ) / monthlyStats.length
                    ).toFixed(1)}
                    %
                  </p>
                </div>

                <div className="bg-gradient-to-br from-success/5 to-success/10 rounded-lg p-4 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Integrantes Ativos
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-success">
                    {monthlyStats.length}
                  </p>
                </div>
              </div>

              {/* Tabela de Dados */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 bg-muted/30">
                      <TableHead className="font-semibold">
                        Integrante
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        Total Mensal
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        % Avaliação
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold">
                        Última Atualização
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyStats
                      .sort((a, b) => b.monthly_total - a.monthly_total)
                      .map((stat, index) => {
                        const isTopPerformer = index < 3;
                        const evaluationLevel =
                          stat.evaluation_percentage >= 90
                            ? "high"
                            : stat.evaluation_percentage >= 70
                            ? "medium"
                            : "low";

                        return (
                          <TableRow
                            key={stat.id}
                            className="border-border/30 hover:bg-secondary/30 group"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                    isTopPerformer
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {stat.user_name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {stat.user_name}
                                  </p>
                                  {isTopPerformer && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      Top {index + 1}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-lg font-bold text-primary">
                                {stat.monthly_total}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span
                                  className={`text-lg font-bold ${
                                    evaluationLevel === "high"
                                      ? "text-success"
                                      : evaluationLevel === "medium"
                                      ? "text-warning"
                                      : "text-destructive"
                                  }`}
                                >
                                  {stat.evaluation_percentage}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  evaluationLevel === "high"
                                    ? "default"
                                    : evaluationLevel === "medium"
                                    ? "secondary"
                                    : "destructive"
                                }
                                className={
                                  evaluationLevel === "high"
                                    ? "bg-success text-success-foreground"
                                    : evaluationLevel === "medium"
                                    ? "bg-warning text-warning-foreground"
                                    : ""
                                }
                              >
                                {evaluationLevel === "high"
                                  ? "Excelente"
                                  : evaluationLevel === "medium"
                                  ? "Bom"
                                  : "Atenção"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {stat.updated_at
                                  ? format(
                                      new Date(stat.updated_at),
                                      "dd/MM/yyyy HH:mm",
                                      { locale: ptBR }
                                    )
                                  : "N/A"}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhum dado encontrado
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Não há registros para{" "}
                {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}.
              </p>
              <p className="text-xs text-muted-foreground">
                Use o formulário acima para adicionar dados mensais.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Confirmação */}
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleSave}
        title="Confirmar Registro Mensal"
        description={`Você está registrando ${monthlyTotal} chamados mensais para ${userName} com ${evaluationPercentage}% de avaliação em ${format(
          selectedMonth,
          "MMMM 'de' yyyy",
          { locale: ptBR }
        )}. Esta ação sobrescreverá dados existentes. Continuar?`}
        confirmText="Sim, Registrar"
        cancelText="Cancelar"
        variant="success"
        isLoading={isSaving}
      />
    </div>
  );
};

export default IntercomMonthlyTracker;
