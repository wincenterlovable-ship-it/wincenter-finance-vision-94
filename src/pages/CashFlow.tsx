import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, DollarSign, Plus, Calendar, TrendingUp, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFinancial } from "@/contexts/FinancialContext";

const CashFlow = () => {
  const { toast } = useToast();
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { cashFlowEntries, addCashFlowEntry, updateCashFlowEntry, deleteCashFlowEntry, getTotalRevenue, getTotalExpenses, getNetCashFlow } = useFinancial();

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const transactionType = formData.get('transactionType') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const category = formData.get('category') as string;
    const date = formData.get('date') as string;
    const status = formData.get('status') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const description = formData.get('description') as string;

    addCashFlowEntry({
      description,
      type: transactionType === 'inflow' ? 'entrada' : 'saida',
      amount,
      date,
      category,
      status,
      paymentMethod
    });

    toast({
      title: "Transação Registrada",
      description: "A entrada/saída foi registrada com sucesso no fluxo de caixa.",
    });

    // Reset form
    (e.target as HTMLFormElement).reset();
  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleUpdateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const transactionType = formData.get('transactionType') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const category = formData.get('category') as string;
    const date = formData.get('date') as string;
    const status = formData.get('status') as string;
    const paymentMethod = formData.get('paymentMethod') as string;
    const description = formData.get('description') as string;

    updateCashFlowEntry(editingEntry.id, {
      description,
      type: transactionType === 'inflow' ? 'entrada' : 'saida',
      amount,
      date,
      category,
      status,
      paymentMethod
    });

    toast({
      title: "Transação Atualizada",
      description: "A transação foi atualizada com sucesso.",
    });

    setIsEditDialogOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteCashFlowEntry(entryId);
    toast({
      title: "Transação Excluída",
      description: "A transação foi removida com sucesso.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-success text-success-foreground">Confirmado</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "paid":
        return <Badge className="bg-success text-success-foreground">Pago</Badge>;
      case "scheduled":
        return <Badge className="bg-warning text-warning-foreground">Agendado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const totalInflows = getTotalRevenue();
  const totalOutflows = getTotalExpenses();
  const netCashFlow = getNetCashFlow();
  
  const inflows = cashFlowEntries.filter(entry => entry.type === 'entrada');
  const outflows = cashFlowEntries.filter(entry => entry.type === 'saida');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fluxo de Caixa</h1>
        <p className="text-muted-foreground">Controle de entradas e saídas financeiras</p>
      </div>

      {/* Resumo do Fluxo de Caixa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ {totalInflows.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Este período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ {totalOutflows.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Este período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fluxo Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
              R$ {netCashFlow.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">Diferença líquida</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Entradas e Saídas */}
      <Tabs defaultValue="inflows" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inflows">Entradas</TabsTrigger>
          <TabsTrigger value="outflows">Saídas</TabsTrigger>
        </TabsList>

        <TabsContent value="inflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-success" />
                Entradas de Dinheiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inflows.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-center">
                  <div>
                    <ArrowUpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold text-muted-foreground">Nenhuma entrada registrada</h4>
                    <p className="text-sm text-muted-foreground">Use o formulário abaixo para registrar entradas de dinheiro</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {inflows.map((inflow) => (
                    <div key={inflow.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div>
                        <h4 className="font-semibold">{inflow.description}</h4>
                        <p className="text-sm text-muted-foreground">{inflow.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">{inflow.date}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-lg font-bold text-success">+R$ {inflow.amount.toLocaleString('pt-BR')}</div>
                        {getStatusBadge(inflow.status || 'pending')}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditEntry(outflow)}>
                            <Edit2 className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteEntry(outflow.id)}
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
        </TabsContent>

        <TabsContent value="outflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-destructive" />
                Saídas de Dinheiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              {outflows.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-center">
                  <div>
                    <ArrowDownCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold text-muted-foreground">Nenhuma saída registrada</h4>
                    <p className="text-sm text-muted-foreground">Use o formulário abaixo para registrar saídas de dinheiro</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {outflows.map((outflow) => (
                    <div key={outflow.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div>
                        <h4 className="font-semibold">{outflow.description}</h4>
                        <p className="text-sm text-muted-foreground">{outflow.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">{outflow.date}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-lg font-bold text-destructive">-R$ {outflow.amount.toLocaleString('pt-BR')}</div>
                        {getStatusBadge(outflow.status || 'pending')}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditEntry(inflow)}>
                            <Edit2 className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteEntry(inflow.id)}
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
        </TabsContent>
      </Tabs>

      {/* Formulário para Nova Transação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Registrar Nova Transação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTransaction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="transactionType">Tipo de Transação</Label>
                <Select name="transactionType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inflow">Entrada (+)</SelectItem>
                    <SelectItem value="outflow">Saída (-)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Vendas</SelectItem>
                    <SelectItem value="services">Serviços</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="personnel">Pessoal</SelectItem>
                    <SelectItem value="infrastructure">Infraestrutura</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                <Select name="paymentMethod">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                    <SelectItem value="card">Cartão</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descrição detalhada da transação..."
                className="min-h-[80px]"
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Registrar Transação
              </Button>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Dialog para Editar Transação */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Transação</DialogTitle>
            <DialogDescription>
              Modifique os detalhes da transação selecionada.
            </DialogDescription>
          </DialogHeader>
          
          {editingEntry && (
            <form onSubmit={handleUpdateEntry} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-transactionType">Tipo de Transação</Label>
                  <Select name="transactionType" defaultValue={editingEntry.type === 'entrada' ? 'inflow' : 'outflow'} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inflow">Entrada (+)</SelectItem>
                      <SelectItem value="outflow">Saída (-)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Valor (R$)</Label>
                  <Input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={editingEntry.amount}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select name="category" defaultValue={editingEntry.category} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Vendas</SelectItem>
                      <SelectItem value="services">Serviços</SelectItem>
                      <SelectItem value="investment">Investimento</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="personnel">Pessoal</SelectItem>
                      <SelectItem value="infrastructure">Infraestrutura</SelectItem>
                      <SelectItem value="financial">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-date">Data</Label>
                  <Input
                    id="edit-date"
                    name="date"
                    type="date"
                    defaultValue={editingEntry.date}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={editingEntry.status || 'pending'} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-paymentMethod">Método de Pagamento</Label>
                  <Select name="paymentMethod" defaultValue={editingEntry.paymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                      <SelectItem value="card">Cartão</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingEntry.description}
                  className="min-h-[80px]"
                  required
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

export default CashFlow;