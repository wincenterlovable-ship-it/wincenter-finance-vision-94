import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, CheckCircle, Edit3, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFinancial } from "@/contexts/FinancialContext";

interface ProcessedEntry {
  entryType: 'cashflow' | 'operational' | 'negotiation';
  type?: 'entrada' | 'saida';
  amount: number;
  category: string;
  paymentMethod: string;
  status: string;
  suggestedDescription: string;
  date: string;
  // Campos específicos para negociações
  creditor?: string;
  installments?: number;
  installmentValue?: number;
  dueDate?: string;
}

const SmartEntryInput = () => {
  const { toast } = useToast();
  const { addCashFlowEntry, addOperationalCost, addDebt } = useFinancial();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedEntry, setProcessedEntry] = useState<ProcessedEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState<ProcessedEntry | null>(null);

  const handleProcess = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva o lançamento financeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-financial-entry', {
        body: { description: inputText }
      });

      if (error) {
        throw error;
      }

      console.log('Processed data:', data);
      
      // Ensure data is an object, not an array
      let processedData = data;
      if (Array.isArray(data)) {
        processedData = data[0]; // Take the first item if it's an array
      }
      
      // Ensure required fields have default values
      processedData = {
        entryType: 'cashflow',
        type: 'saida',
        amount: 0,
        category: 'other',
        paymentMethod: 'other',
        status: 'pending',
        suggestedDescription: 'Lançamento processado',
        date: new Date().toISOString().split('T')[0],
        ...processedData
      };
      
      setProcessedEntry(processedData);
      setEditedEntry({ ...processedData });
      
      toast({
        title: "Processado com sucesso!",
        description: "A IA analisou seu lançamento. Revise e confirme os dados.",
      });

    } catch (error) {
      console.error('Error processing entry:', error);
      toast({
        title: "Erro ao processar",
        description: "Não foi possível processar o lançamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async () => {
    if (!editedEntry) return;

    try {
      if (editedEntry.entryType === 'cashflow') {
        await addCashFlowEntry({
          description: editedEntry.suggestedDescription,
          type: editedEntry.type!,
          amount: editedEntry.amount,
          date: editedEntry.date,
          category: editedEntry.category,
          status: editedEntry.status,
          paymentMethod: editedEntry.paymentMethod,
        });
      } else if (editedEntry.entryType === 'operational') {
        await addOperationalCost({
          description: editedEntry.suggestedDescription,
          type: editedEntry.type === 'saida' ? 'variavel' : 'fixo',
          amount: editedEntry.amount,
          date: editedEntry.date,
          category: editedEntry.category,
        });
      } else if (editedEntry.entryType === 'negotiation') {
        await addDebt({
          description: editedEntry.suggestedDescription,
          amount: editedEntry.amount,
          installments: editedEntry.installments || 1,
          installmentValue: editedEntry.installmentValue || editedEntry.amount,
          dueDate: editedEntry.dueDate || editedEntry.date,
          creditor: editedEntry.creditor || 'Não informado',
          status: editedEntry.status === 'confirmed' ? 'negotiating' : 'pending',
          additionalTerms: '',
          justification: editedEntry.suggestedDescription,
          totalWithInterest: (editedEntry.installments || 1) * (editedEntry.installmentValue || editedEntry.amount),
        });
      }

      toast({
        title: "Lançamento adicionado!",
        description: `${editedEntry.entryType === 'cashflow' ? 'Fluxo de caixa' : editedEntry.entryType === 'operational' ? 'Custo operacional' : 'Negociação'} salvo no sistema.`,
      });

      // Reset form
      setInputText('');
      setProcessedEntry(null);
      setEditedEntry(null);
      setIsEditing(false);

    } catch (error) {
      console.error('Error saving entry:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o lançamento.",
        variant: "destructive",
      });
    }
  };

  const getEntryTypeLabel = (entryType: string) => {
    switch (entryType) {
      case 'cashflow': return 'Fluxo de Caixa';
      case 'operational': return 'Custo Operacional';
      case 'negotiation': return 'Negociação';
      default: return entryType;
    }
  };

  const getEntryTypeColor = (entryType: string) => {
    switch (entryType) {
      case 'cashflow': return 'bg-blue-100 text-blue-800';
      case 'operational': return 'bg-orange-100 text-orange-800';
      case 'negotiation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Lançamento Inteligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="smart-input">Descreva seu lançamento financeiro</Label>
          <Textarea
            id="smart-input"
            placeholder="Ex: Comprei um almoço por R$ 25 no cartão de crédito..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <Button 
          onClick={handleProcess} 
          disabled={isProcessing || !inputText.trim()}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando com IA...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Processar com IA
            </>
          )}
        </Button>

        {processedEntry && editedEntry && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Resultado da Análise:</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
                <Button onClick={handleConfirm} size="sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirmar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Lançamento</Label>
                <Badge className={getEntryTypeColor(editedEntry.entryType)}>
                  {getEntryTypeLabel(editedEntry.entryType)}
                </Badge>
              </div>

              {(editedEntry.entryType === 'cashflow' || editedEntry.entryType === 'operational') && (
                <div>
                  <Label>Entrada/Saída</Label>
                  {isEditing ? (
                    <Select
                      value={editedEntry.type}
                      onValueChange={(value) => 
                        setEditedEntry({ ...editedEntry, type: value as 'entrada' | 'saida' })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="saida">Saída</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={editedEntry.type === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {editedEntry.type === 'entrada' ? 'Entrada' : 'Saída'}
                    </Badge>
                  )}
                </div>
              )}

              <div>
                <Label>Valor</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editedEntry.amount}
                    onChange={(e) => 
                      setEditedEntry({ ...editedEntry, amount: parseFloat(e.target.value) || 0 })
                    }
                  />
                ) : (
                  <p className="font-medium">
                    R$ {(editedEntry.amount || 0).toFixed(2)}
                  </p>
                )}
              </div>

              {editedEntry.entryType === 'negotiation' && editedEntry.creditor && (
                <div>
                  <Label>Credor</Label>
                  <p className="font-medium">{editedEntry.creditor}</p>
                </div>
              )}

              {editedEntry.entryType === 'negotiation' && editedEntry.installments && (
                <div>
                  <Label>Parcelas</Label>
                  <p className="font-medium">{editedEntry.installments}x de R$ {(editedEntry.installmentValue || 0).toFixed(2)}</p>
                </div>
              )}

              <div>
                <Label>Categoria</Label>
                {isEditing ? (
                  <Select
                    value={editedEntry.category}
                    onValueChange={(value) => 
                      setEditedEntry({ ...editedEntry, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Alimentação</SelectItem>
                      <SelectItem value="transport">Transporte</SelectItem>
                      <SelectItem value="health">Saúde</SelectItem>
                      <SelectItem value="education">Educação</SelectItem>
                      <SelectItem value="entertainment">Entretenimento</SelectItem>
                      <SelectItem value="utilities">Utilidades</SelectItem>
                      <SelectItem value="salary">Salário</SelectItem>
                      <SelectItem value="investment">Investimento</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline">{editedEntry.category}</Badge>
                )}
              </div>

              {editedEntry.entryType !== 'negotiation' && (
                <div>
                  <Label>Forma de Pagamento</Label>
                  {isEditing ? (
                    <Select
                      value={editedEntry.paymentMethod}
                      onValueChange={(value) => 
                        setEditedEntry({ ...editedEntry, paymentMethod: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="credit">Cartão de Crédito</SelectItem>
                        <SelectItem value="debit">Cartão de Débito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">{editedEntry.paymentMethod}</Badge>
                  )}
                </div>
              )}

              <div className="col-span-2">
                <Label>Descrição</Label>
                {isEditing ? (
                  <Input
                    value={editedEntry.suggestedDescription}
                    onChange={(e) => 
                      setEditedEntry({ ...editedEntry, suggestedDescription: e.target.value })
                    }
                  />
                ) : (
                  <p className="font-medium">{editedEntry.suggestedDescription}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartEntryInput;