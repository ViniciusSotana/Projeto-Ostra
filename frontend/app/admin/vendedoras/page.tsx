"use client"

import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, Trash2, Search, Loader2, DollarSign } from "lucide-react"
import { getToken } from "@/lib/auth"

interface Vendedora {
  id: string
  nome: string
  email: string
  telefone: string
  status: "ativa" | "inativa"
  vendas: number
  comissao: number
  soldValue: number
}

export default function VendedorasPage() {
  const [vendedoras, setVendedoras] = useState<Vendedora[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyActive, setShowOnlyActive] = useState(false)
  
  const [isOpen, setIsOpen] = useState(false)
  const [editingVendedora, setEditingVendedora] = useState<Vendedora | null>(null)
  
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [paymentVendedora, setPaymentVendedora] = useState<Vendedora | null>(null)

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    status: "ativa" as "ativa" | "inativa",
    comissao: "15",
  })

  const fetchVendedoras = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:8080/sellers", {
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        
        const mappedSellers = data.map((v: any) => ({
          id: v.id,
          nome: v.name || "Sem Nome",
          email: v.email || "Não informado",
          telefone: v.phone || "-",
          status: v.isActive ? "ativa" : "inativa",
          vendas: v.salesCount || 0,           
          comissao: v.commissionRate || 0,
          soldValue: v.soldValue || 0
        }))
        
        setVendedoras(mappedSellers)
      }
    } catch (error) {
      console.error("Erro ao buscar vendedoras:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVendedoras()
  }, [])

  const filteredVendedoras = vendedoras.filter((v) => {
    const matchesSearch = v.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = showOnlyActive ? v.status === "ativa" : true

    return matchesSearch && matchesStatus
  })

  const handleOpenDialog = (vendedora?: Vendedora) => {
    if (vendedora) {
      setEditingVendedora(vendedora)
      setFormData({
        nome: vendedora.nome,
        email: vendedora.email !== "Não informado" ? vendedora.email : "",
        telefone: vendedora.telefone !== "-" ? vendedora.telefone : "",
        status: vendedora.status,
        comissao: vendedora.comissao.toString()
      })
    } else {
      setEditingVendedora(null)
      setFormData({ nome: "", email: "", telefone: "", status: "ativa", comissao: "15" })
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const isEditing = !!editingVendedora
      const method = isEditing ? "PUT" : "POST"
      const url = isEditing 
        ? `http://localhost:8080/sellers/${editingVendedora.id}` 
        : "http://localhost:8080/sellers"

      const payload = {
        name: formData.nome,
        email: formData.email,
        phone: formData.telefone,
        isActive: formData.status === "ativa",
        commissionRate: parseFloat(formData.comissao) || 0
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setIsOpen(false)
        fetchVendedoras() 
      } else {
        alert("Falha ao salvar a vendedora. Verifique os dados inseridos.")
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro de conexão com o servidor.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja inativar (excluir) esta vendedora?")) return

    try {
      const response = await fetch(`http://localhost:8080/sellers/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        fetchVendedoras()
      } else {
        alert("Não foi possível excluir a vendedora.")
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
    }
  }

  const handleOpenPayment = (vendedora: Vendedora) => {
    if (vendedora.soldValue <= 0) {
      alert(`${vendedora.nome} não possui vendas registradas neste ciclo para receber comissão.`)
      return
    }

    if (confirm(`Deseja iniciar o fechamento de comissão de ${vendedora.nome}?`)) {
      setPaymentVendedora(vendedora)
      setIsPaymentOpen(true)
    }
  }

  const handleConfirmPayment = async () => {
    if (!paymentVendedora) return
    setIsSaving(true)

    try {
      const response = await fetch(`http://localhost:8080/sellers/${paymentVendedora.id}/pay`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        alert(`Pagamento de ${paymentVendedora.nome} realizado e ciclo zerado com sucesso!`)
        setIsPaymentOpen(false)
        fetchVendedoras()
      } else {
        alert("Ocorreu um erro ao processar o pagamento no servidor.")
      }
    } catch (error) {
      console.error("Erro ao pagar:", error)
      alert("Erro de conexão com o servidor.")
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header isAdmin />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao painel
            </Link>
            
            <div className="flex flex-row items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold">Gerenciar Vendedoras</h1>
                <p className="text-muted-foreground mt-1">Cadastre e gerencie a sua equipe</p>
              </div>
              <Button className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4" />
                Nova Vendedora
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar vendedora..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* NOVO: Checkbox de Filtro de Ativas */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active-filter"
                  checked={showOnlyActive}
                  onChange={(e) => setShowOnlyActive(e.target.checked)}
                  className="w-4 h-4 rounded border-muted-foreground/30 text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <Label htmlFor="active-filter" className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Mostrar apenas vendedoras ativas
                </Label>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                  <p>Buscando equipe no banco de dados...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Comissão</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Vendas</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendedoras.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Nenhuma vendedora encontrada com estes filtros.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredVendedoras.map((vendedora) => (
                          <TableRow key={vendedora.id} className={vendedora.status === "inativa" ? "opacity-60 bg-muted/30" : ""}>
                            <TableCell className="font-medium">{vendedora.nome}</TableCell>
                            <TableCell>{vendedora.email}</TableCell>
                            <TableCell>{vendedora.telefone}</TableCell>
                            <TableCell className="font-semibold text-primary">{vendedora.comissao}%</TableCell>
                            <TableCell>
                              <Badge variant={vendedora.status === "ativa" ? "default" : "destructive"}>
                                {vendedora.status === "ativa" ? "Ativa" : "Inativa"}
                              </Badge>
                            </TableCell>
                            <TableCell>{vendedora.vendas} vendas</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {vendedora.status === "ativa" && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleOpenPayment(vendedora)} 
                                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                    title="Pagar Comissão"
                                  >
                                    <DollarSign className="w-4 h-4" />
                                  </Button>
                                )}
                                
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(vendedora)} className="h-8 w-8 p-0">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                
                                {vendedora.status === "ativa" && (
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(vendedora.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingVendedora ? "Editar Vendedora" : "Cadastrar Nova Vendedora"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" placeholder="(11) 99999-9999" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comissao">Comissão (%)</Label>
                  <Input id="comissao" type="number" step="0.1" placeholder="Ex: 15.0" value={formData.comissao} onChange={(e) => setFormData({ ...formData, comissao: e.target.value })} required />
                </div>
              </div>
              
              {editingVendedora && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: "ativa" | "inativa") => setFormData({ ...formData, status: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativa">Ativa</SelectItem>
                      <SelectItem value="inativa">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1 gap-2" disabled={isSaving || !formData.nome}>
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingVendedora ? "Salvar Alterações" : "Cadastrar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Fechamento de Comissão</DialogTitle>
              <DialogDescription>
                Resumo financeiro do ciclo atual para pagamento.
              </DialogDescription>
            </DialogHeader>

            {paymentVendedora && (
              <div className="space-y-6 py-4">
                <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Vendedora:</span>
                    <span className="font-medium">{paymentVendedora.nome}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-2">
                    <span className="text-muted-foreground">Taxa Acordada:</span>
                    <span className="font-semibold text-primary">{paymentVendedora.comissao}%</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-muted-foreground">Total Vendido no Ciclo:</span>
                    <span className="font-medium">{formatCurrency(paymentVendedora.soldValue)}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex flex-col items-center justify-center space-y-1">
                  <span className="text-sm font-medium text-emerald-800">Valor a Transferir</span>
                  <span className="text-3xl font-bold text-emerald-600">
                    {formatCurrency(paymentVendedora.soldValue * (paymentVendedora.comissao / 100))}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  Ao confirmar o pagamento, os valores financeiros deste ciclo serão zerados e a vendedora estará pronta para um novo mês de vendas.
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleConfirmPayment} 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" 
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Confirmar Pagamento
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </AuthGuard>
  )
}