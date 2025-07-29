-- Adicionar coluna para total de chamados únicos na tabela registros_chamados_diarios
ALTER TABLE public.registros_chamados_diarios
ADD COLUMN total_chamados_unicos INTEGER DEFAULT 0;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.registros_chamados_diarios.total_chamados_unicos IS
'Total de chamados únicos para o dia (usado quando múltiplos atendentes atendem o mesmo chamado, evitando duplicação)';
