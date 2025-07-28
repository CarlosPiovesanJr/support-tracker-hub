import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Users, TrendingUp, MessageSquare, Calendar, Award, Target, CalendarIcon, Filter, Table } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DailyRecord {
  integrante: string;
  chamados_whatsapp: number;
  data: string;
}

interface MonthlyRecord {
  user_name: string;
  monthly_total: number;
  evaluation_percentage: number;
  month: string;
}

const DashboardPublic: React.FC = () => {
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [selectedAttendant, setSelectedAttendant] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date()
  });
  const [showHistoryTable, setShowHistoryTable] = useState(false);

  // Carregar dados baseado nos filtros
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Dados diários baseado no range de datas
        let dailyQuery = supabase
          .from('registros_chamados_diarios')
          .select('*')
          .gte('data', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('data', format(dateRange.to, 'yyyy-MM-dd'));

        // Filtrar por atendente se selecionado
        if (selectedAttendant !== 'all') {
          dailyQuery = dailyQuery.eq('integrante', selectedAttendant);
        }

        const { data: dailyData, error: dailyError } = await dailyQuery;
        if (dailyError) throw dailyError;

        // Dados mensais do Intercom baseado no range de datas
        let monthlyQuery = supabase
          .from('intercom_monthly_stats')
          .select('*')
          .gte('month', format(startOfMonth(dateRange.from), 'yyyy-MM-dd'))
          .lte('month', format(endOfMonth(dateRange.to), 'yyyy-MM-dd'));

        // Filtrar por atendente se selecionado (usando user_name)
        if (selectedAttendant !== 'all') {
          monthlyQuery = monthlyQuery.eq('user_name', selectedAttendant);
        }

        const { data: monthlyData, error: monthlyError } = await monthlyQuery;
        if (monthlyError) throw monthlyError;

        setDailyRecords(dailyData || []);
        setMonthlyRecords(monthlyData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dateRange, selectedAttendant]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRecords = dailyRecords.filter(record => record.data === today);
    
    // Dados básicos WhatsApp
    const totalTodayWhatsApp = todayRecords.reduce((sum, record) => sum + record.chamados_whatsapp, 0);
    const totalWeekWhatsApp = dailyRecords.reduce((sum, record) => sum + record.chamados_whatsapp, 0);
    const activeToday = todayRecords.length;
    
    // Dados básicos Intercom
    const totalMonthIntercom = monthlyRecords.reduce((sum, record) => sum + record.monthly_total, 0);
    const avgEvaluation = monthlyRecords.length > 0 
      ? monthlyRecords.reduce((sum, record) => sum + record.evaluation_percentage, 0) / monthlyRecords.length
      : 0;

    // Dados combinados com ponderação (WhatsApp = 1.5x)
    const totalTodayWeighted = totalTodayWhatsApp * 1.5;
    const totalWeekWeighted = totalWeekWhatsApp * 1.5;
    const totalPeriodWeighted = totalWeekWeighted + totalMonthIntercom;

    // Top performers hoje (WhatsApp com ponderação)
    const topToday = todayRecords
      .map(record => ({
        ...record,
        weighted_score: record.chamados_whatsapp * 1.5
      }))
      .sort((a, b) => b.weighted_score - a.weighted_score)
      .slice(0, 3);

    // Top performers combinado (WhatsApp + Intercom)
    const combinedPerformers = new Map();
    
    // Adicionar dados do WhatsApp (período filtrado)
    dailyRecords.forEach(record => {
      const key = record.integrante;
      if (!combinedPerformers.has(key)) {
        combinedPerformers.set(key, {
          name: key,
          whatsapp: 0,
          intercom: 0,
          whatsapp_weighted: 0,
          total_weighted: 0
        });
      }
      const performer = combinedPerformers.get(key);
      performer.whatsapp += record.chamados_whatsapp;
      performer.whatsapp_weighted = performer.whatsapp * 1.5;
    });

    // Adicionar dados do Intercom
    monthlyRecords.forEach(record => {
      const key = record.user_name;
      if (!combinedPerformers.has(key)) {
        combinedPerformers.set(key, {
          name: key,
          whatsapp: 0,
          intercom: 0,
          whatsapp_weighted: 0,
          total_weighted: 0
        });
      }
      const performer = combinedPerformers.get(key);
      performer.intercom += record.monthly_total;
    });

    // Calcular totais ponderados
    Array.from(combinedPerformers.values()).forEach(performer => {
      performer.total_weighted = performer.whatsapp_weighted + performer.intercom;
    });

    const topCombined = Array.from(combinedPerformers.values())
      .sort((a, b) => b.total_weighted - a.total_weighted)
      .slice(0, 3);

    return {
      // Dados básicos
      totalTodayWhatsApp,
      totalWeekWhatsApp,
      totalMonthIntercom,
      activeToday,
      avgEvaluation,
      
      // Dados ponderados
      totalTodayWeighted,
      totalWeekWeighted,
      totalPeriodWeighted,
      
      // Rankings
      topToday,
      topCombined
    };
  }, [dailyRecords, monthlyRecords]);

  // Dados para tabela histórica
  const historyData = useMemo(() => {
    const uniqueAttendants = [...new Set(dailyRecords.map(r => r.integrante))].sort();
    const uniqueDates = [...new Set(dailyRecords.map(r => r.data))].sort();
    
    return {
      attendants: uniqueAttendants,
      dates: uniqueDates,
      records: dailyRecords
    };
  }, [dailyRecords]);

  // Lista de todos os atendentes para filtro
  const allAttendants = useMemo(() => {
    return [...new Set(dailyRecords.map(r => r.integrante))].sort();
  }, [dailyRecords]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent mb-2">
            Dashboard - Support Tracker
          </h1>
          <p className="text-lg text-muted-foreground">
            Indicadores de performance da equipe de suporte
          </p>
          <Badge variant="outline" className="mt-2">
            Atualizado em {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </Badge>
        </div>

        {/* Filtros */}
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-4 w-4 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              {/* Filtro por Atendente */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Atendente:</label>
                <Select value={selectedAttendant} onValueChange={setSelectedAttendant}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {allAttendants.map(attendant => (
                      <SelectItem key={attendant} value={attendant}>
                        {attendant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Data */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Período:</label>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px] text-sm">
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {format(dateRange.from, 'dd/MM', { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="text-muted-foreground">até</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px] text-sm">
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {format(dateRange.to, 'dd/MM', { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Botões de período rápido */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDateRange({ 
                    from: subDays(new Date(), 7), 
                    to: new Date() 
                  })}
                  className="text-xs"
                >
                  7 dias
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDateRange({ 
                    from: startOfMonth(new Date()), 
                    to: new Date() 
                  })}
                  className="text-xs"
                >
                  Este mês
                </Button>
              </div>

              {/* Toggle da tabela histórica */}
              <Button
                variant={showHistoryTable ? "default" : "outline"}
                size="sm"
                onClick={() => setShowHistoryTable(!showHistoryTable)}
                className="ml-auto"
              >
                <Table className="mr-2 h-3 w-3" />
                {showHistoryTable ? "Ocultar" : "Mostrar"} Histórico
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WhatsApp Hoje</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalTodayWhatsApp}</p>
                  <p className="text-xs text-muted-foreground">Ponderado: {stats.totalTodayWeighted.toFixed(1)}</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 border-chart-3/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">WhatsApp Período</p>
                  <p className="text-2xl font-bold text-chart-3">{stats.totalWeekWhatsApp}</p>
                  <p className="text-xs text-muted-foreground">Ponderado: {stats.totalWeekWeighted.toFixed(1)}</p>
                </div>
                <div className="p-2 rounded-full bg-chart-3/10">
                  <Calendar className="h-5 w-5 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Intercom Período</p>
                  <p className="text-2xl font-bold text-success">{stats.totalMonthIntercom}</p>
                  <p className="text-xs text-muted-foreground">Valor direto</p>
                </div>
                <div className="p-2 rounded-full bg-success/10">
                  <BarChart3 className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500/5 to-violet-500/10 border-violet-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Combinado</p>
                  <p className="text-2xl font-bold text-violet-600">{stats.totalPeriodWeighted.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">WhatsApp + Intercom</p>
                </div>
                <div className="p-2 rounded-full bg-violet-500/10">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avaliação</p>
                  <p className="text-2xl font-bold text-warning">{stats.avgEvaluation.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">média Intercom</p>
                </div>
                <div className="p-2 rounded-full bg-warning/10">
                  <Target className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                WhatsApp Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topToday.length > 0 ? (
                <div className="space-y-3">
                  {stats.topToday.map((performer, index) => (
                    <div key={performer.integrante} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700' :
                        'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{performer.integrante}</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-primary">
                              {performer.chamados_whatsapp}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              Pond: {performer.weighted_score.toFixed(1)}
                            </p>
                          </div>
                        </div>
                        <Progress 
                          value={stats.totalTodayWhatsApp > 0 ? (performer.chamados_whatsapp / stats.totalTodayWhatsApp) * 100 : 0} 
                          className="h-2 mt-1" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum chamado hoje</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-success" />
                Intercom Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyRecords.length > 0 ? (
                <div className="space-y-3">
                  {monthlyRecords
                    .sort((a, b) => b.monthly_total - a.monthly_total)
                    .slice(0, 3)
                    .map((performer, index) => (
                    <div key={performer.user_name} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700' :
                        'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{performer.user_name}</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-success">
                              {performer.monthly_total}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {performer.evaluation_percentage}%
                            </p>
                          </div>
                        </div>
                        <Progress 
                          value={stats.totalMonthIntercom > 0 ? (performer.monthly_total / stats.totalMonthIntercom) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum dado Intercom</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-violet-600" />
                Ranking Combinado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topCombined.length > 0 ? (
                <div className="space-y-3">
                  {stats.topCombined.map((performer, index) => (
                    <div key={performer.name} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700' :
                        'bg-gradient-to-r from-orange-400 to-orange-500 text-orange-900'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{performer.name}</span>
                          <span className="text-lg font-bold text-violet-600">
                            {performer.total_weighted.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <span>W: {performer.whatsapp} → {performer.whatsapp_weighted.toFixed(1)}</span>
                          <span>I: {performer.intercom}</span>
                        </div>
                        <Progress 
                          value={stats.totalPeriodWeighted > 0 ? (performer.total_weighted / stats.totalPeriodWeighted) * 100 : 0} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabela Histórica */}
        {showHistoryTable && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5 text-primary" />
                Histórico Detalhado
                <Badge variant="outline" className="ml-2">
                  {format(dateRange.from, 'dd/MM', { locale: ptBR })} - {format(dateRange.to, 'dd/MM', { locale: ptBR })}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyData.dates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Data</th>
                        {historyData.attendants.map(attendant => (
                          <th key={attendant} className="text-center p-2 font-medium min-w-[80px]">
                            {attendant}
                          </th>
                        ))}
                        <th className="text-center p-2 font-medium bg-muted/20">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.dates.map(date => {
                        const dayRecords = historyData.records.filter(r => r.data === date);
                        const dayTotal = dayRecords.reduce((sum, r) => sum + r.chamados_whatsapp, 0);
                        
                        return (
                          <tr key={date} className="border-b hover:bg-muted/5">
                            <td className="p-2 font-medium">
                              {format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })}
                            </td>
                            {historyData.attendants.map(attendant => {
                              const record = dayRecords.find(r => r.integrante === attendant);
                              const value = record?.chamados_whatsapp || 0;
                              
                              return (
                                <td key={attendant} className="text-center p-2">
                                  {value > 0 ? (
                                    <Badge 
                                      variant="secondary" 
                                      className={`${
                                        value >= dayTotal / historyData.attendants.length 
                                          ? 'bg-success/10 text-success border-success/20' 
                                          : 'bg-secondary'
                                      }`}
                                    >
                                      {value}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">-</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="text-center p-2 bg-muted/10">
                              <Badge variant="default" className="bg-primary">
                                {dayTotal}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                      
                      {/* Linha de Total */}
                      <tr className="border-t-2 bg-muted/10 font-semibold">
                        <td className="p-2">Total</td>
                        {historyData.attendants.map(attendant => {
                          const attendantTotal = historyData.records
                            .filter(r => r.integrante === attendant)
                            .reduce((sum, r) => sum + r.chamados_whatsapp, 0);
                          
                          return (
                            <td key={attendant} className="text-center p-2">
                              <Badge variant="outline" className="font-bold">
                                {attendantTotal}
                              </Badge>
                            </td>
                          );
                        })}
                        <td className="text-center p-2">
                          <Badge variant="default" className="bg-primary font-bold">
                            {historyData.records.reduce((sum, r) => sum + r.chamados_whatsapp, 0)}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Table className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum dado encontrado para o período selecionado</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Dashboard público - Dados atualizados automaticamente</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPublic;