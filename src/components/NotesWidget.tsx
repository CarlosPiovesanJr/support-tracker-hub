import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StickyNote, Plus, Save, Trash2, Edit3, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  created_at: string;
  updated_at: string;
}

const NOTE_COLORS = [
  { name: 'Amarelo', value: 'bg-yellow-100 border-yellow-300 text-yellow-900' },
  { name: 'Rosa', value: 'bg-pink-100 border-pink-300 text-pink-900' },
  { name: 'Azul', value: 'bg-blue-100 border-blue-300 text-blue-900' },
  { name: 'Verde', value: 'bg-green-100 border-green-300 text-green-900' },
  { name: 'Roxo', value: 'bg-purple-100 border-purple-300 text-purple-900' },
];

const NotesWidget: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: NOTE_COLORS[0].value });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Carregar notas
  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as anotações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Salvar nova nota
  const saveNote = useCallback(async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título e conteúdo.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('notes')
        .insert([{
          title: newNote.title.trim(),
          content: newNote.content.trim(),
          color: newNote.color
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Anotação salva com sucesso!",
      });

      setNewNote({ title: '', content: '', color: NOTE_COLORS[0].value });
      setIsCreating(false);
      loadNotes();
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a anotação.",
        variant: "destructive"
      });
    }
  }, [newNote, toast, loadNotes]);

  // Deletar nota
  const deleteNote = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Anotação removida!",
      });

      loadNotes();
    } catch (error) {
      console.error('Erro ao deletar nota:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a anotação.",
        variant: "destructive"
      });
    }
  }, [toast, loadNotes]);

  // Atualizar nota
  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Anotação atualizada!",
      });

      setEditingId(null);
      loadNotes();
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a anotação.",
        variant: "destructive"
      });
    }
  }, [toast, loadNotes]);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <StickyNote className="h-4 w-4 text-warning" />
            Anotações
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
            className="h-7 w-7 p-0"
          >
            {isCreating ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Formulário de Nova Nota */}
        {isCreating && (
          <div className="space-y-3 p-3 border border-dashed border-border rounded-lg bg-muted/20">
            <input
              type="text"
              placeholder="Título da anotação..."
              value={newNote.title}
              onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
            />
            <Textarea
              placeholder="Escreva sua anotação aqui... (ex: Clint & Escola da Perícia - aguardando documentos adicionais)"
              value={newNote.content}
              onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[100px] max-h-[200px] text-sm resize-y"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setNewNote(prev => ({ ...prev, color: color.value }))}
                    className={`w-5 h-5 rounded border-2 ${color.value} ${
                      newNote.color === color.value ? 'ring-2 ring-primary' : ''
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
              <Button onClick={saveNote} size="sm" className="h-7 text-xs">
                <Save className="mr-1 h-3 w-3" />
                Salvar
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Notas */}
        {isLoading ? (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Carregando anotações...
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg border-2 ${note.color} relative group`}
              >
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={note.title}
                      onChange={(e) => setNotes(prev => 
                        prev.map(n => n.id === note.id ? { ...n, title: e.target.value } : n)
                      )}
                      className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
                    />
                    <Textarea
                      value={note.content}
                      onChange={(e) => setNotes(prev => 
                        prev.map(n => n.id === note.id ? { ...n, content: e.target.value } : n)
                      )}
                      className="min-h-[80px] max-h-[150px] text-sm resize-y bg-background"
                    />
                    <div className="flex gap-1">
                      <Button
                        onClick={() => updateNote(note.id, { title: note.title, content: note.content })}
                        size="sm"
                        className="h-6 text-xs"
                      >
                        Salvar
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{note.title}</h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(note.id)}
                          className="h-5 w-5 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs whitespace-pre-wrap">{note.content}</p>
                    <div className="mt-2 pt-2 border-t border-current/20">
                      <Badge variant="outline" className="text-xs opacity-60">
                        {format(new Date(note.updated_at), 'dd/MM HH:mm', { locale: ptBR })}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma anotação ainda</p>
            <p className="text-xs">Clique no + para criar a primeira</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesWidget;