import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CSVData {
  user_name: string;
  monthly_total: number;
  evaluation_percentage: number;
}

interface CSVUploaderProps {
  selectedMonth: Date;
  onUploadSuccess: () => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ selectedMonth, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<CSVData[]>([]);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  const parseCSV = (text: string): CSVData[] => {
    const lines = text.trim().split('\n');
    const data: CSVData[] = [];
    
    // Formato específico do Intercom:
    // Coluna A = Nome do atendente (índice 0)
    // Coluna B = Conversas que receberam respostas (índice 1) 
    // Coluna D = Mediana tempo de respostas em segundos (índice 3)
    // Coluna E = Pontuação CSAT do membro da equipe (índice 4)
    // Dados começam na linha 8 (índice 7)
    
    if (lines.length < 8) {
      throw new Error('CSV deve ter pelo menos 8 linhas (dados começam na linha 8)');
    }
    
    // Processar a partir da linha 8 (índice 7)
    for (let i = 7; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length >= 5) {
        // Coluna A (0) = Nome
        const user_name = values[0];
        // Coluna B (1) = Total de conversas/chamados
        const monthly_total = parseInt(values[1]) || 0;
        // Coluna E (4) = CSAT percentage
        const evaluation_percentage = parseFloat(values[4]) || 0;

        // Verificar se o nome não está vazio e se há dados válidos
        if (user_name && user_name.trim() !== '' && monthly_total > 0) {
          data.push({
            user_name: user_name.trim(),
            monthly_total,
            evaluation_percentage
          });
        }
      }
    }

    if (data.length === 0) {
      throw new Error('Nenhum dado válido encontrado. Verifique se o CSV segue o formato do Intercom com dados a partir da linha 8');
    }

    return data;
  };

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('Por favor, selecione um arquivo CSV válido');
        return;
      }
      setFile(selectedFile);
      setError('');
      
      // Preview do arquivo
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = parseCSV(text);
          setPreviewData(data.slice(0, 5)); // Mostrar apenas 5 primeiros para preview
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao processar arquivo');
        }
      };
      reader.readAsText(selectedFile);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const data = parseCSV(text);
          
          const monthFormatted = format(selectedMonth, 'yyyy-MM-dd');
          
          // Primeiro, deletar todos os dados existentes do mês selecionado
          const { error: deleteError } = await supabase
            .from('intercom_monthly_stats')
            .delete()
            .eq('month', monthFormatted);

          if (deleteError) throw deleteError;
          
          // Depois, inserir os novos dados
          const dataToSave = data.map(item => ({
            user_name: item.user_name,
            monthly_total: item.monthly_total,
            evaluation_percentage: item.evaluation_percentage,
            month: monthFormatted
          }));

          const { error } = await supabase
            .from('intercom_monthly_stats')
            .insert(dataToSave);

          if (error) throw error;

          toast({
            title: "Sucesso!",
            description: `${data.length} registros importados para ${format(selectedMonth, "MM/yyyy", { locale: ptBR })}`,
          });

          // Limpar estado
          setFile(null);
          setPreviewData([]);
          onUploadSuccess();
          
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erro ao processar dados');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no upload');
    } finally {
      setIsProcessing(false);
    }
  }, [file, selectedMonth, toast, onUploadSuccess]);

  const clearFile = () => {
    setFile(null);
    setPreviewData([]);
    setError('');
  };

  return (
    <Card className="shadow-sm border-dashed border-2 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-4 w-4 text-primary" />
          Upload CSV - Dados do Intercom
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="space-y-3">
          <Label htmlFor="csv-upload" className="text-sm">
            Arquivo CSV do Intercom (formato específico)
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="text-sm"
              disabled={isProcessing}
            />
            {file && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="border-destructive/50 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {previewData.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview dos dados:</Label>
            <div className="bg-muted/30 rounded-lg p-3 space-y-1">
              {previewData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{item.user_name}</span>
                  <div className="flex items-center gap-2">
                    <span>{item.monthly_total} chamados</span>
                    {item.evaluation_percentage > 0 && (
                      <span>{item.evaluation_percentage}%</span>
                    )}
                  </div>
                </div>
              ))}
              {previewData.length === 5 && (
                <div className="text-xs text-muted-foreground text-center pt-1">
                  ...e mais registros
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {file && !error && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleUpload}
              disabled={isProcessing}
              size="sm"
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              {isProcessing ? (
                <>
                  <FileText className="mr-1 h-3 w-3 animate-pulse" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Importar Dados
                </>
              )}
            </Button>
            <span className="text-xs text-muted-foreground">
              para {format(selectedMonth, "MM/yyyy", { locale: ptBR })}
            </span>
          </div>
        )}

        {/* Instructions */}
        <Alert className="border-info/50 bg-info/5">
          <FileText className="h-4 w-4 text-info" />
          <AlertDescription className="text-info text-xs">
            <strong>Formato Intercom:</strong> CSV com dados a partir da linha 8. 
            Coluna A = Nome, Coluna B = Conversas respondidas, Coluna D = Tempo resposta, Coluna E = CSAT%
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default CSVUploader;