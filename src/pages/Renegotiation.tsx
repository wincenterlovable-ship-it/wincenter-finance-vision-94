import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, Building, DollarSign, Clock, AlertCircle, CheckCircle, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFinancial } from "@/contexts/FinancialContext";

const Renegotiation = () => {
  const { toast } = useToast();
  const [selectedDebt, setSelectedDebt] = useState("");
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { debts, addDebt, updateDebt, deleteDebt, getTotalDebts } = useFinancial();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "negotiating":
        return <Badge className="bg-warning text-warning-foreground">Negociando</Badge>;
      case "overdue":
        return <Badge variant="destructive">Vencido</Badge>;
      case "resolved":
        return <Badge className="bg-success text-success-foreground">Resolvido</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const handleNegotiationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const creditorName = formData.get('creditorName') as string;
    const proposedAmount = parseFloat(formData.get('proposedAmount') as string);
    const installments = parseInt(formData.get('installments') as string);
    const installmentValue = parseFloat(formData.get('installmentValue') as string);
    const totalWithInterest = parseFloat(formData.get('totalWithInterest') as string);
    const firstPayment = formData.get('firstPayment') as string;
    const justification = formData.get('justification') as string;
    const additionalTerms = formData.get('additionalTerms') as string;

    addDebt({
      creditor: creditorName,
      description: justification,
      amount: proposedAmount,
      installments,
      installmentValue,
      totalWithInterest,
      dueDate: firstPayment,
      justification,
      additionalTerms,
      status: 'negotiating' as const
    });

    toast({
      title: "Proposta de Negociação Enviada",
      description: "Sua proposta foi registrada e será enviada ao credor.",
    });

    // Reset form
    (e.target as HTMLFormElement).reset();
  const handleEditDebt = (debt: any) => {
    setEditingDebt(debt);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const creditorName = formData.get('creditorName') as string;
    const proposedAmount = parseFloat(formData.get('proposedAmount') as string);
    const installments = parseInt(formData.get('installments') as string);
    const installmentValue = parseFloat(formData.get('installmentValue') as string);
    const totalWithInterest = parseFloat(formData.get('totalWithInterest') as string);
    const firstPayment = formData.get('firstPayment') as string;
    const justification = formData.get('justification') as string;
    const additionalTerms = formData.get('additionalTerms') as string;
    const status = formData.get('status') as string;

    updateDebt(editingDebt.id, {
      creditor: creditorName,
      description: justification,
      amount: proposedAmount,
      installments,
      installmentValue,
      totalWithInterest,
      dueDate: firstPayment,
      justification,
      additionalTerms,
      status: status as any
    });

    toast({
      title: "Dívida Atualizada",
      description: "A dívida foi atualizada com sucesso.",
    });

    setIsEditDialogOpen(false);
    setEditingDebt(null);
  };

  const handleDeleteDebt = (debtId: string) => {
    deleteDebt(debtId);
    toast({
      title: "Dívida Excluída",
      description: "A dívida foi removida com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Plano de Renegociação</h1>
        <p className="text-muted-foreground">Gerencie e renegocie dívidas pendentes</p>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total em Negociação</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">R$ {getTotalDebts().toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">{debts.length} contratos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Vencimentos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {debts.filter(d => {
                const dueDate = new Date(d.dueDate);
                const thirtyDaysFromNow = new Date();
                thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                return dueDate <= thirtyDaysFromNow;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Nos próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucesso em Negociações</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {debts.length > 0 ? Math.round((debts.filter(d => d.status === 'resolved').length / debts.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{debts.filter(d => d.status === 'resolved').length} de {debts.length} resolvidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Dívidas */}
      <Card>
        <CardHeader>
          <CardTitle>Dívidas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          {debts.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div>
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-semibold text-muted-foreground">Nenhuma dívida registrada</h4>
                <p className="text-sm text-muted-foreground">Use o formulário abaixo para registrar uma nova negociação</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {debts.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-4">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">{debt.creditor}</h4>
                      <p className="text-sm text-muted-foreground">{debt.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CalendarDays className="h-3 w-3" />
                        <span className="text-xs">Vence em {debt.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-lg font-bold">R$ {debt.amount.toLocaleString('pt-BR')}</div>
                    {getStatusBadge(debt.status)}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditDebt(debt)}>
                        <Edit2 className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteDebt(debt.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Negociação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Nova Proposta de Negociação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNegotiationSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="creditorName">Nome do Credor</Label>
                <Input
                  id="creditorName"
                  name="creditorName"
                  placeholder="Ex: Banco ABC, Fornecedor XYZ..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proposedAmount">Valor Proposto</Label>
                <Input
                  id="proposedAmount"
                  name="proposedAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installments">Número de Parcelas</Label>
                <Input
                  id="installments"
                  name="installments"
                  type="number"
                  placeholder="1"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installmentValue">Valor da Parcela (R$)</Label>
                <Input
                  id="installmentValue"
                  name="installmentValue"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalWithInterest">Valor Total com Juros (R$)</Label>
                <Input
                  id="totalWithInterest"
                  name="totalWithInterest"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstPayment">Primeira Parcela</Label>
                <Input
                  id="firstPayment"
                  name="firstPayment"
                  type="date"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justificativa da Proposta</Label>
              <Textarea
                id="justification"
                name="justification"
                placeholder="Explique os motivos da renegociação e os benefícios para ambas as partes..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalTerms">Termos Adicionais</Label>
              <Textarea
                id="additionalTerms"
                name="additionalTerms"
                placeholder="Condições especiais, garantias oferecidas, cronograma de pagamento..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Enviar Proposta
              </Button>
              <Button type="button" variant="outline">
                Salvar Rascunho
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Dialog para Editar Dívida */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Dívida</DialogTitle>
            <DialogDescription>
              Modifique os detalhes da negociação selecionada.
            </DialogDescription>
          </DialogHeader>
          
          {editingDebt && (
            <form onSubmit={handleUpdateDebt} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-creditorName">Nome do Credor</Label>
                  <Input
                    id="edit-creditorName"
                    name="creditorName"
                    defaultValue={editingDebt.creditor}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-proposedAmount">Valor Proposto</Label>
                  <Input
                    id="edit-proposedAmount"
                    name="proposedAmount"
                    type="number"
                    step="0.01"
                    defaultValue={editingDebt.amount}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-installments">Número de Parcelas</Label>
                  <Input
                    id="edit-installments"
                    name="installments"
                    type="number"
                    defaultValue={editingDebt.installments}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-installmentValue">Valor da Parcela (R$)</Label>
                  <Input
                    id="edit-installmentValue"
                    name="installmentValue"
                    type="number"
                    step="0.01"
                    defaultValue={editingDebt.installmentValue}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-totalWithInterest">Valor Total com Juros (R$)</Label>
                  <Input
                    id="edit-totalWithInterest"
                    name="totalWithInterest"
                    type="number"
                    step="0.01"
                    defaultValue={editingDebt.totalWithInterest}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-firstPayment">Primeira Parcela</Label>
                  <Input
                    id="edit-firstPayment"
                    name="firstPayment"
                    type="date"
                    defaultValue={editingDebt.dueDate}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={editingDebt.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="negotiating">Negociando</SelectItem>
                      <SelectItem value="overdue">Vencido</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-justification">Justificativa da Proposta</Label>
                <Textarea
                  id="edit-justification"
                  name="justification"
                  defaultValue={editingDebt.justification}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-additionalTerms">Termos Adicionais</Label>
                <Textarea
                  id="edit-additionalTerms"
                  name="additionalTerms"
                  defaultValue={editingDebt.additionalTerms}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Salvar Alterações
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Renegotiation;