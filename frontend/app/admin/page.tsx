"use client"

import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { logout, getUserEmail, getToken } from "@/lib/auth"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Package, Users, Briefcase, LogOut, BarChart3, Layers, UserCheck, 
  ShoppingCart, TrendingUp, FileText, DollarSign, Wallet, Banknote, 
  Activity, Gem, Loader2 
} from "lucide-react"
import { API_URL } from "@/lib/api"

// Interface dos dados dinâmicos do Back-end
interface DashboardData {
  totalJewelries: number
  totalStockValue: number
  salesCurrentMonth: number
  activeClients: number
  averageTicket: number
  activeSellers: number
  circulatingCases: number
  totalCollections: number
}

export default function AdminPage() {
  const router = useRouter()
  const userEmail = getUserEmail()

  // Estados do Dashboard
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Busca os dados assim que a tela abre
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_URL}/dashboard`, {
          headers: {
            "Authorization": `Bearer ${getToken()}`
          }
        })
        if (response.ok) {
          const dashboardData = await response.json()
          setData(dashboardData)
        } else {
          console.error("Falha ao buscar dados do dashboard")
        }
      } catch (error) {
        console.error("Erro de conexão:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (value: number) => {
    return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || "R$ 0,00"
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleGenerateReport = async (type: string) => {
    const endpoints: Record<string, string> = {
      "Ranking de Vendedoras": `${API_URL}/reports/sellers/ranking`,
      "Top Clientes": `${API_URL}/reports/clients/top`,
      "Auditoria de Maletas": `${API_URL}/reports/cases/audit`,
      "Performance das Coleções": `${API_URL}/reports/collections/performance`,
      "Histórico de Vendas Mensal": `${API_URL}/reports/sales/monthly`,
      "Top Joias": `${API_URL}/reports/jewelries/top`
    }

    const url = endpoints[type]

    if (!url) {
      alert("Este relatório será implementado em breve!")
      return
    }

    try {
      const token = getToken()
      if (!token) {
        alert("Sessão expirada. Faça login novamente.")
        handleLogout()
        return
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Falha ao gerar o arquivo PDF.")
      }

      const blob = await response.blob()
      
      const pdfUrl = window.URL.createObjectURL(blob)
      window.open(pdfUrl, "_blank")

    } catch (error) {
      console.error(error)
      alert("Não foi possível gerar o relatório. Verifique sua conexão com o servidor.")
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header isAdmin />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold mb-2">Painel Administrativo</h1>
              <p className="text-muted-foreground">Bem-vindo, {userEmail}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </div>
          </div>

          {/* INÍCIO DOS CARDS DINÂMICOS */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 mb-8 text-muted-foreground border rounded-lg bg-background/50">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p>Carregando indicadores do sistema...</p>
            </div>
          ) : data ? (
            <div className="space-y-6 mb-8">
              {/* LINHA 1: Financeiro e Clientes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-primary">Vendas (Este Mês)</CardTitle>
                    <Banknote className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(data.salesCurrentMonth)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Faturamento no período atual</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data.averageTicket)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Média de gasto por venda</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Valor em Estoque</CardTitle>
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data.totalStockValue)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Potencial bruto de vendas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.activeClients}</div>
                    <p className="text-xs text-muted-foreground mt-1">Cadastrados na base</p>
                  </CardContent>
                </Card>
              </div>

              {/* LINHA 2: Operacional */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Modelos de Joias</CardTitle>
                    <Gem className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.totalJewelries}</div>
                    <p className="text-xs text-muted-foreground mt-1">Produtos únicos em catálogo</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Maletas na Rua</CardTitle>
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.circulatingCases}</div>
                    <p className="text-xs text-muted-foreground mt-1">Mostruários configurados</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Vendedoras Ativas</CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.activeSellers}</div>
                    <p className="text-xs text-muted-foreground mt-1">Equipe de vendas</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Coleções Ativas</CardTitle>
                    <Layers className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.totalCollections}</div>
                    <p className="text-xs text-muted-foreground mt-1">Temporadas lançadas</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="mb-8 p-4 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">
              Não foi possível carregar os dados do painel. Verifique a conexão com o servidor.
            </div>
          )}
          {/* FIM DOS CARDS DINÂMICOS */}

          <h2 className="text-xl font-semibold mb-4">Módulos de Gestão</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Link href="/admin/joias" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <Package className="w-6 h-6" />
                  </div>
                  <CardTitle>Gerenciar Joias</CardTitle>
                  <CardDescription>Cadastre, edite e visualize todas as semijoias do estoque</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/colecoes" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <Layers className="w-6 h-6" />
                  </div>
                  <CardTitle>Gerenciar Coleções</CardTitle>
                  <CardDescription>Organize as joias por coleções e temporadas</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/vendedoras" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <CardTitle>Gerenciar Vendedoras</CardTitle>
                  <CardDescription>Cadastre e gerencie as vendedoras da equipe</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/maletas" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <CardTitle>Gerenciar Maletas</CardTitle>
                  <CardDescription>Controle as maletas e distribuição de produtos</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/clientes" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <CardTitle>Gerenciar Clientes</CardTitle>
                  <CardDescription>Cadastre e acompanhe o histórico de clientes</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/vendas" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <CardTitle>Gerenciar Vendas</CardTitle>
                  <CardDescription>Registre vendas e acompanhe o faturamento</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          <h2 className="text-xl font-semibold mb-4">Relatórios Rápidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-start gap-1 bg-transparent hover:bg-primary/5 transition-colors"
              onClick={() => handleGenerateReport("Ranking de Vendedoras")}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-medium">Ranking de Vendedoras</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-normal text-left">Performance de vendas por vendedora</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-start gap-1 bg-transparent hover:bg-primary/5 transition-colors"
              onClick={() => handleGenerateReport("Top Clientes")}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <span className="font-medium">Top Clientes</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-normal text-left">Clientes com maior volume de compras</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-start gap-1 bg-transparent hover:bg-primary/5 transition-colors"
              onClick={() => handleGenerateReport("Auditoria de Maletas")}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <span className="font-medium">Auditoria de Maletas</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-normal text-left">Inventário e status das maletas em circulação</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-start gap-1 bg-transparent hover:bg-primary/5 transition-colors"
              onClick={() => handleGenerateReport("Performance das Coleções")}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="font-medium">Performance das Coleções</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-normal text-left">Peso e valor potencial de cada coleção no estoque</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-start gap-1 bg-transparent hover:bg-primary/5 transition-colors"
              onClick={() => handleGenerateReport("Histórico de Vendas Mensal")}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">Histórico Mensal</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-normal text-left">Relatório agrupado de faturamento mês a mês</span>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto py-4 flex flex-col items-start gap-1 bg-transparent hover:bg-primary/5 transition-colors"
              onClick={() => handleGenerateReport("Top Joias")}
            >
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="font-medium">Top Joias</span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-normal text-left">Joias com maior volume de vendas</span>
            </Button>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}