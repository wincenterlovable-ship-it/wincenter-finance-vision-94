import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart3, DollarSign, TrendingDown, TrendingUp, Users, AlertTriangle, FileText, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useFinancial } from "@/contexts/FinancialContext";

const Dashboard = () => {
  const { 
    getTotalRevenue, 
    getTotalExpenses, 
    getTotalDebts, 
    getTotalOperationalCosts, 
    getNetCashFlow,
    cashFlowEntries,
    operationalCosts,
    debts
  } = useFinancial();

  // Calcular dados reais
  const totalRevenue = getTotalRevenue();
  const totalExpenses = getTotalExpenses();
  const totalDebts = getTotalDebts();
  const totalOperationalCosts = getTotalOperationalCosts();
  const netCashFlow = getNetCashFlow();

  // Dados para gráficos baseados nos dados reais
  const fluxoCaixaData = [
    { mes: "Atual", entrada: totalRevenue, saida: totalExpenses, liquido: netCashFlow },
  ];

  // Agrupar custos operacionais por categoria
  const custosData = operationalCosts.reduce((acc, cost) => {
    const existing = acc.find(item => item.categoria === cost.category);
    if (existing) {
      existing.valor += cost.amount;
    } else {
      acc.push({ categoria: cost.category, valor: cost.amount });
    }
    return acc;
  }, [] as { categoria: string; valor: number }[]);

  // Separar custos fixos e variáveis
  const fixedCosts = operationalCosts
    .filter(cost => cost.type === 'fixo')
    .reduce((sum, cost) => sum + cost.amount, 0);
  
  const variableCosts = operationalCosts
    .filter(cost => cost.type === 'variavel')
    .reduce((sum, cost) => sum + cost.amount, 0);

  const despesasData = [
    { name: "Fixas", value: fixedCosts, color: "hsl(var(--chart-1))" },
    { name: "Variáveis", value: variableCosts, color: "hsl(var(--chart-2))" },
    { name: "Outros", value: totalExpenses - fixedCosts - variableCosts, color: "hsl(var(--chart-3))" },
  ].filter(item => item.value > 0);

  const tendenciasData = [
    { periodo: "Atual", receita: totalRevenue/1000, custos: totalOperationalCosts/1000, margem: totalRevenue > 0 ? ((netCashFlow / totalRevenue) * 100) : 0 },
  ];

  const chartConfig = {
    entrada: { label: "Entrada", color: "hsl(var(--success))" },
    saida: { label: "Saída", color: "hsl(var(--destructive))" },
    liquido: { label: "Líquido", color: "hsl(var(--primary))" },
    valor: { label: "Valor", color: "hsl(var(--primary))" },
    receita: { label: "Receita", color: "hsl(var(--success))" },
    custos: { label: "Custos", color: "hsl(var(--warning))" },
    margem: { label: "Margem %", color: "hsl(var(--primary))" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Visão geral da situação financeira da Wincenter</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Última atualização</p>
          <p className="text-sm font-medium">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-success to-success-light text-success-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR')}</div>
            <p className="text-xs opacity-80">{cashFlowEntries.filter(e => e.type === 'entrada').length} entradas registradas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive to-red-600 text-destructive-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dívidas Totais</CardTitle>
            <TrendingDown className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalDebts.toLocaleString('pt-BR')}</div>
            <p className="text-xs opacity-80">{debts.length} dívidas em aberto</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning to-orange-500 text-warning-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Operacionais</CardTitle>
            <BarChart3 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalOperationalCosts.toLocaleString('pt-BR')}</div>
            <p className="text-xs opacity-80">R$ {fixedCosts.toLocaleString('pt-BR')} fixos + R$ {variableCosts.toLocaleString('pt-BR')} variáveis</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary to-primary-light text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {netCashFlow.toLocaleString('pt-BR')}</div>
            <p className="text-xs opacity-80">{netCashFlow >= 0 ? 'Fluxo positivo' : 'Fluxo negativo'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Ações Prioritárias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalRevenue === 0 && totalExpenses === 0 && totalDebts === 0 ? (
              <div className="flex items-center justify-center p-8 bg-accent rounded-lg">
                <div className="text-center">
                  <h4 className="font-semibold text-muted-foreground">Nenhuma ação prioritária</h4>
                  <p className="text-sm text-muted-foreground">Comece adicionando dados nas páginas do sistema</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {netCashFlow < 0 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h4 className="font-semibold text-destructive">Fluxo de Caixa Negativo</h4>
                    <p className="text-sm text-destructive/80">Suas saídas superam as entradas</p>
                  </div>
                )}
                {totalDebts > totalRevenue * 0.3 && totalRevenue > 0 && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <h4 className="font-semibold text-warning">Alto Endividamento</h4>
                    <p className="text-sm text-warning/80">Dívidas representam mais de 30% da receita</p>
                  </div>
                )}
                {debts.filter(d => d.status === 'overdue').length > 0 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h4 className="font-semibold text-destructive">Dívidas Vencidas</h4>
                    <p className="text-sm text-destructive/80">{debts.filter(d => d.status === 'overdue').length} dívida(s) em atraso</p>
                  </div>
                )}
                {totalRevenue > 0 && totalExpenses === 0 && (
                  <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                    <h4 className="font-semibold text-success">Situação Positiva</h4>
                    <p className="text-sm text-success/80">Você tem receitas sem gastos registrados</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Saúde Financeira</span>
                <span className={`font-medium ${netCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {netCashFlow >= 0 ? 'Boa' : 'Atenção'}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${netCashFlow >= 0 ? 'bg-success' : 'bg-destructive'}`} 
                  style={{ width: netCashFlow >= 0 ? '75%' : '25%' }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Liquidez</span>
                <span className={`font-medium ${netCashFlow > totalOperationalCosts ? 'text-success' : 'text-warning'}`}>
                  {netCashFlow > totalOperationalCosts ? 'Boa' : 'Limitada'}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${netCashFlow > totalOperationalCosts ? 'bg-success' : 'bg-warning'}`} 
                  style={{ width: netCashFlow > totalOperationalCosts ? '80%' : '40%' }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Endividamento</span>
                <span className={`font-medium ${
                  totalRevenue === 0 ? 'text-muted-foreground' :
                  totalDebts / totalRevenue < 0.3 ? 'text-success' : 
                  totalDebts / totalRevenue < 0.6 ? 'text-warning' : 'text-destructive'
                }`}>
                  {totalRevenue === 0 ? 'N/A' :
                   totalDebts / totalRevenue < 0.3 ? 'Baixo' : 
                   totalDebts / totalRevenue < 0.6 ? 'Moderado' : 'Alto'}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    totalRevenue === 0 ? 'bg-muted-foreground' :
                    totalDebts / totalRevenue < 0.3 ? 'bg-success' : 
                    totalDebts / totalRevenue < 0.6 ? 'bg-warning' : 'bg-destructive'
                  }`} 
                  style={{ 
                    width: totalRevenue === 0 ? '0%' : 
                           Math.min((totalDebts / totalRevenue) * 100, 100) + '%' 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análises e Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fluxo de Caixa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Fluxo de Caixa Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <AreaChart data={fluxoCaixaData}>
                <defs>
                  <linearGradient id="entradaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="saidaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, ""]} 
                  />} 
                />
                <Area
                  type="monotone"
                  dataKey="entrada"
                  stackId="1"
                  stroke="hsl(var(--success))"
                  fill="url(#entradaGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="saida"
                  stackId="2"
                  stroke="hsl(var(--destructive))"
                  fill="url(#saidaGradient)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Custos por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-warning" />
              Custos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart data={custosData}>
                <XAxis dataKey="categoria" />
                <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, ""]} 
                  />} 
                />
                <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Despesas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              Distribuição de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <PieChart>
                <Pie
                  data={despesasData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {despesasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, ""]} 
                  />} 
                />
              </PieChart>
            </ChartContainer>
            <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
              {despesasData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tendências Trimestrais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tendências Trimestrais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart data={tendenciasData}>
                <XAxis dataKey="periodo" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent 
                    formatter={(value, name) => [
                      name === 'margem' ? `${value}%` : `${value}k`,
                      chartConfig[name as keyof typeof chartConfig]?.label || name
                    ]} 
                  />} 
                />
                <Bar dataKey="receita" fill="hsl(var(--success))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="custos" fill="hsl(var(--warning))" radius={[2, 2, 0, 0]} />
                <Bar dataKey="margem" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Links Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button asChild variant="outline" className="h-16" size="lg">
          <Link to="/renegotiation" className="flex flex-col items-center gap-2">
            <FileText className="h-6 w-6" />
            <span>Plano de Renegociação</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-16" size="lg">
          <Link to="/costs" className="flex flex-col items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            <span>Custos Operacionais</span>
          </Link>
        </Button>

        <Button asChild variant="outline" className="h-16" size="lg">
          <Link to="/cashflow" className="flex flex-col items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <span>Fluxo de Caixa</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;