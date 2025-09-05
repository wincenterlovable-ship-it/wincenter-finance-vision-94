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
import { BarChart3, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFinancial } from "@/contexts/FinancialContext";

const OperationalCosts = () => {
  const { toast } = useToast();
  const [editingCost, setEditingCost] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { operationalCosts, addOperationalCost, updateOperationalCost, deleteOperationalCost, getTotalOperationalCosts } = useFinancial();

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const costName = formData.get('costName') as string;
    const costType = formData.get('costType') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const category = formData.get('category') as string;
    const dueDate = formData.get('dueDate') as string;
    const frequency = formData.get('frequency') as string;
    const description = formData.get('description') as string;

    addOperationalCost({
      description: costName,
      type: costType === 'fixed' ? 'fixo' : 'variavel',
      amount,
      date: dueDate,
      category
    });

    toast({
      title: "Custo Adicionado",
      description: "O novo custo foi registrado com sucesso.",
    });

    // Reset form
    (e.target as HTMLFormElement).reset();
  const handleEditCost = (cost: any) => {
    setEditingCost(cost);
    setIsEditDialogOpen(true);
  };

  const handleUpdateCost = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const costName = formData.get('costName') as string;
    const costType = formData.get('costType') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const category = formData.get('category') as string;
    const dueDate = formData.get('dueDate') as string;
    const description = formData.get('description') as string;

    updateOperationalCost(editingCost.id, {
      description: costName,
      type: costType === 'fixed' ? 'fixo' : 'variavel',
      amount,
      date: dueDate,
      category
    });

    toast({
      title: "Custo Atualizado",
      description: "O custo foi atualizado com sucesso.",
    });

    setIsEditDialogOpen(false);
    setEditingCost(null);
  };

  const handleDeleteCost = (costId: string) => {
    deleteOperationalCost(costId);
    toast({
      title: "Custo Excluído",
      description: "O custo foi removido com sucesso.",
    });
  };

  const fixedCosts = operationalCosts.filter(cost => cost.type === 'fixo');
  const variableCosts = operationalCosts.filter(cost => cost.type === 'variavel');
  
  const totalFixed = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalVariable = variableCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const totalCosts = getTotalOperationalCosts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Custos Operacionais</h1>
        <p className="text-muted-foreground">Gerencie custos fixos e variáveis da operação</p>
      </div>

      {/* Resumo dos Custos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Fixos</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">R$ {totalFixed.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Mensais recorrentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Variáveis</CardTitle>
            <BarChart3 className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">R$ {totalVariable.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operacional</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ {totalCosts.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground">Período atual</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Custos Fixos e Variáveis */}
      <Tabs defaultValue="fixed" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fixed">Custos Fixos</TabsTrigger>
          <TabsTrigger value="variable">Custos Variáveis</TabsTrigger>
        </TabsList>

        <TabsContent value="fixed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custos Fixos Mensais</CardTitle>
            </CardHeader>
            <CardContent>
              {fixedCosts.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-center">
                  <div>
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold text-muted-foreground">Nenhum custo fixo registrado</h4>
                    <p className="text-sm text-muted-foreground">Use o formulário abaixo para adicionar custos fixos</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {fixedCosts.map((cost) => (
                    <div key={cost.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{cost.description}</h4>
                        <p className="text-sm text-muted-foreground">{cost.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">{cost.date}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-lg font-bold">R$ {cost.amount.toLocaleString('pt-BR')}</div>
                        <Badge variant="destructive">Fixo</Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditCost(cost)}>
                            <Edit2 className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteCost(cost.id)}
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

        <TabsContent value="variable" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custos Variáveis</CardTitle>
            </CardHeader>
            <CardContent>
              {variableCosts.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-center">
                  <div>
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold text-muted-foreground">Nenhum custo variável registrado</h4>
                    <p className="text-sm text-muted-foreground">Use o formulário abaixo para adicionar custos variáveis</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {variableCosts.map((cost) => (
                    <div key={cost.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{cost.description}</h4>
                        <p className="text-sm text-muted-foreground">{cost.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span className="text-xs">{cost.date}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-lg font-bold">R$ {cost.amount.toLocaleString('pt-BR')}</div>
                        <Badge className="bg-warning text-warning-foreground">Variável</Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditCost(cost)}>
                            <Edit2 className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteCost(cost.id)}
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

      {/* Formulário para Adicionar Novo Custo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Novo Custo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCost} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="costName">Nome do Custo</Label>
                <Input
                  id="costName"
                  name="costName"
                  placeholder="Ex: Aluguel, Energia, Matéria Prima..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costType">Tipo do Custo</Label>
                <Select name="costType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Custo Fixo</SelectItem>
                    <SelectItem value="variable">Custo Variável</SelectItem>
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
                    <SelectItem value="infrastructure">Infraestrutura</SelectItem>
                    <SelectItem value="personnel">Pessoal</SelectItem>
                    <SelectItem value="utilities">Utilidades</SelectItem>
                    <SelectItem value="production">Produção</SelectItem>
                    <SelectItem value="sales">Vendas</SelectItem>
                    <SelectItem value="services">Serviços</SelectItem>
                    <SelectItem value="logistics">Logística</SelectItem>
                    <SelectItem value="operational">Operacional</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Vencimento/Data</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequência</Label>
                <Select name="frequency">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                    <SelectItem value="once">Uma vez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descrição detalhada do custo, fornecedor, condições de pagamento..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Adicionar Custo
              </Button>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Dialog para Editar Custo */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Custo</DialogTitle>
            <DialogDescription>
              Modifique os detalhes do custo selecionado.
            </DialogDescription>
          </DialogHeader>
          
          {editingCost && (
            <form onSubmit={handleUpdateCost} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-costName">Nome do Custo</Label>
                  <Input
                    id="edit-costName"
                    name="costName"
                    defaultValue={editingCost.description}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-costType">Tipo do Custo</Label>
                  <Select name="costType" defaultValue={editingCost.type === 'fixo' ? 'fixed' : 'variable'} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Custo Fixo</SelectItem>
                      <SelectItem value="variable">Custo Variável</SelectItem>
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
                    defaultValue={editingCost.amount}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select name="category" defaultValue={editingCost.category} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="infrastructure">Infraestrutura</SelectItem>
                      <SelectItem value="personnel">Pessoal</SelectItem>
                      <SelectItem value="utilities">Utilidades</SelectItem>
                      <SelectItem value="production">Produção</SelectItem>
                      <SelectItem value="sales">Vendas</SelectItem>
                      <SelectItem value="services">Serviços</SelectItem>
                      <SelectItem value="logistics">Logística</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="financial">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Vencimento/Data</Label>
                  <Input
                    id="edit-dueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={editingCost.date}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingCost.description}
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

export default OperationalCosts;