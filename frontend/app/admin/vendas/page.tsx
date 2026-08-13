"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ArrowLeft, Trash2, ShoppingCart, Loader2, Calendar, Search, X, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getToken } from "@/lib/auth"
import * as XLSX from "xlsx" // <-- Importação da biblioteca Excel
import { API_URL } from "@/lib/api"

interface SaleItemResponse {
  jewelryId: string
  jewelryName: string
  jewelrySku: string
  quantity: number
  unitPrice: number
  subTotal: number
}

interface Venda {
  id: string
  saleDate: string
  totalAmount: number
  clientId: string
  clientName: string
  sellerId: string | null
  sellerName: string | null
  status: string
  items: SaleItemResponse[]
}

interface Cliente { id: string, name: string }
interface Vendedora { id: string, name: string }
interface Joia { id: string, sku: string, name: string, sellingPrice: number, stockQuantity: number }

interface MaletaItem { jewelryId: string, quantity: number }
interface Maleta { id: string, sellerId: string, items: MaletaItem[] }

interface CartItem {
  jewelryId: string
  name: string
  sku: string
  quantity: number
  price: number
  maxStock: number
}

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [vendedoras, setVendedoras] = useState<Vendedora[]>([])
  const [joias, setJoias] = useState<Joia[]>([])
  const [maletas, setMaletas] = useState<Maleta[]>([]) 
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false)
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null)

  const [clientId, setClientId] = useState<string>("")
  const [sellerId, setSellerId] = useState<string>("")
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedJoiaId, setSelectedJoiaId] = useState<string>("")
  const [quantidadeToAdd, setQuantidadeToAdd] = useState<string>("1")

  // Estados para os filtros
  const [showCanceled, setShowCanceled] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchDate, setSearchDate] = useState("")

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const headers = { "Authorization": `Bearer ${getToken()}` }
      
      const [vendasRes, clientesRes, vendedorasRes, joiasRes, maletasRes] = await Promise.all([
        fetch(`${API_URL}/sales`, { headers }),
        fetch(`${API_URL}/clients`, { headers }),
        fetch(`${API_URL}/sellers`, { headers }),
        fetch(`${API_URL}/jewelries`, { headers }),
        fetch(`${API_URL}/jewelry-cases`, { headers })
      ])

      if (vendasRes.ok) setVendas(await vendasRes.json())
      if (clientesRes.ok) setClientes(await clientesRes.json())
      if (vendedorasRes.ok) setVendedoras(await vendedorasRes.json())
      if (joiasRes.ok) setJoias(await joiasRes.json())
      if (maletasRes.ok) setMaletas(await maletasRes.json())
        
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openNewSaleModal = () => {
    setClientId("")
    setSellerId("none")
    setCart([])
    setSelectedJoiaId("")
    setQuantidadeToAdd("1")
    setIsOpen(true)
  }

  let joiasDisponiveis: Joia[] = []
  let vendedoraTemMaleta = true

  if (sellerId && sellerId !== "none") {
    const maletaDaVendedora = maletas.find(m => m.sellerId === sellerId)
    
    if (maletaDaVendedora) {
      joiasDisponiveis = maletaDaVendedora.items.map(itemMaleta => {
        const joiaGeral = joias.find(j => j.id === itemMaleta.jewelryId)
        if (joiaGeral) {
          return {
            ...joiaGeral,
            stockQuantity: itemMaleta.quantity 
          }
        }
        return null
      }).filter(j => j !== null && j.stockQuantity > 0) as Joia[]
    } else {
      joiasDisponiveis = []
      vendedoraTemMaleta = false
    }
  } else {
    joiasDisponiveis = joias.map(joia => {
      const quantidadeNasMaletas = maletas.reduce((total, maleta) => {
        const itemNaMaleta = maleta.items.find(i => i.jewelryId === joia.id)
        return total + (itemNaMaleta ? itemNaMaleta.quantity : 0)
      }, 0)

      const estoqueRealDaLoja = joia.stockQuantity - quantidadeNasMaletas

      return {
        ...joia,
        stockQuantity: estoqueRealDaLoja
      }
    }).filter(joia => joia.stockQuantity > 0)
  }

  const handleAddToCart = () => {
    if (!selectedJoiaId) return
    const joia = joiasDisponiveis.find(j => j.id === selectedJoiaId)
    if (!joia) return

    const qtd = parseInt(quantidadeToAdd)
    if (isNaN(qtd) || qtd <= 0) return alert("Quantidade inválida.")

    const existingIndex = cart.findIndex(item => item.jewelryId === selectedJoiaId)
    const currentQtdInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0
    const totalDesejado = currentQtdInCart + qtd

    if (totalDesejado > joia.stockQuantity) {
      return alert(`Estoque insuficiente! O limite disponível é de ${joia.stockQuantity} unidades.`)
    }

    if (existingIndex >= 0) {
      const newCart = [...cart]
      newCart[existingIndex].quantity = totalDesejado
      setCart(newCart)
    } else {
      setCart([...cart, {
        jewelryId: joia.id,
        name: joia.name,
        sku: joia.sku,
        quantity: qtd,
        price: joia.sellingPrice,
        maxStock: joia.stockQuantity
      }])
    }

    setSelectedJoiaId("")
    setQuantidadeToAdd("1")
  }

  const removeFromCart = (jewelryId: string) => {
    setCart(cart.filter(item => item.jewelryId !== jewelryId))
  }

  const totalCarrinho = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  const handleSaveVenda = async () => {
    if (cart.length === 0) return alert("Adicione pelo menos uma joia à venda.")
    
    setIsSaving(true)
    try {
      const payload = {
        clientId: clientId,
        sellerId: sellerId === "none" ? null : sellerId,
        items: cart.map(item => ({
          jewelryId: item.jewelryId,
          quantity: item.quantity
        }))
      }

      const response = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setIsOpen(false)
        fetchData()
      } else {
        const errorData = await response.json().catch(() => null)
        alert(errorData?.message || "Falha ao registrar a venda. Verifique o estoque.")
      }
    } catch (error) {
      console.error("Erro ao salvar venda:", error)
      alert("Erro de conexão com o servidor.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Atenção! Deseja cancelar esta venda? O faturamento será desfeito e as joias voltarão para o estoque.")) return

    try {
      const response = await fetch(`${API_URL}/sales/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      })
      if (response.ok) {
        fetchData()
      } else {
        alert("Erro ao cancelar a venda. Talvez ela já tenha sido cancelada.")
      }
    } catch (error) {
      console.error("Erro ao cancelar venda:", error)
    }
  }

  const formatCurrency = (value: number) => {
    return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || "R$ 0,00"
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  // Filtragem
  const filteredVendas = vendas.filter(venda => {
    if (!showCanceled && venda.status === "CANCELADA") {
      return false
    }

    const term = searchTerm.toLowerCase()
    const matchesSearch = 
      venda.clientName?.toLowerCase().includes(term) ||
      (venda.sellerName && venda.sellerName.toLowerCase().includes(term)) ||
      venda.id.toLowerCase().includes(term)
    
    if (searchTerm && !matchesSearch) {
      return false
    }

    if (searchDate) {
      const vendaDateStr = venda.saleDate.split('T')[0] 
      if (vendaDateStr !== searchDate) {
        return false
      }
    }

    return true
  })

  const handleExportExcel = () => {
    if (filteredVendas.length === 0) {
      alert("Não há dados para exportar com os filtros atuais.")
      return
    }

    const dadosParaExcel = filteredVendas.map(v => ({
      "Data e Hora": formatDate(v.saleDate),
      "Código do Recibo": v.id,
      "Cliente": v.clientName,
      "Vendedora": v.sellerName || "Venda Direta",
      "Qtd. Itens": v.items.reduce((acc, item) => acc + item.quantity, 0),
      "Valor Total (R$)": v.totalAmount, 
      "Status": v.status
    }))

    const worksheet = XLSX.utils.json_to_sheet(dadosParaExcel)
    const workbook = XLSX.utils.book_new()
    
    const wscols = [
      { wch: 18 },
      { wch: 36 },
      { wch: 25 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 12 }
    ]
    worksheet['!cols'] = wscols

    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório de Vendas")

    const hoje = new Date().toISOString().split('T')[0]
    XLSX.writeFile(workbook, `Relatorio_Vendas_${hoje}.xlsx`)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header isAdmin />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /> Voltar ao painel
            </Link>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold">Registro de Vendas</h1>
                <p className="text-muted-foreground mt-1">Gere novas vendas e acompanhe o faturamento</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="gap-2 text-emerald-700 border-emerald-600/30 hover:bg-emerald-50 hover:text-emerald-800" 
                  onClick={handleExportExcel}
                >
                  <Download className="w-4 h-4" /> Exportar Excel
                </Button>
                <Button className="gap-2" onClick={openNewSaleModal}>
                  <Plus className="w-4 h-4" /> Nova Venda
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:max-w-xl">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar cliente, vendedora ou ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white"
                  />
                </div>
                
                <div className="relative w-full sm:w-48 flex items-center gap-2">
                  <Input 
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="bg-white text-muted-foreground flex-1"
                  />
                  {searchDate && (
                    <Button variant="ghost" size="icon" onClick={() => setSearchDate("")} className="h-9 w-9 text-muted-foreground hover:text-destructive" title="Limpar Data">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-md border shrink-0">
                <input
                  type="checkbox"
                  id="canceled-filter"
                  checked={showCanceled}
                  onChange={(e) => setShowCanceled(e.target.checked)}
                  className="w-4 h-4 rounded border-muted-foreground/30 text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <Label htmlFor="canceled-filter" className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Mostrar vendas canceladas
                </Label>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                  <p>Buscando histórico de vendas...</p>
                </div>
              ) : (
                <div className="rounded-md border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data / Hora</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Vendedora</TableHead>
                        <TableHead>Qtd. Itens</TableHead>
                        <TableHead className="text-right">Valor Total</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVendas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Nenhuma venda encontrada com os filtros atuais.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredVendas.map((venda) => (
                          <TableRow 
                            key={venda.id} 
                            className={venda.status === "CANCELADA" ? "opacity-60 bg-muted/10" : ""}
                          >
                            <TableCell className="font-medium flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              {formatDate(venda.saleDate)}
                            </TableCell>
                            <TableCell>{venda.clientName}</TableCell>
                            <TableCell>
                              {venda.sellerName ? (
                                venda.sellerName
                              ) : (
                                <span className="text-muted-foreground italic text-xs bg-muted px-2 py-1 rounded">Venda Direta</span>
                              )}
                            </TableCell>
                            <TableCell>{venda.items.reduce((acc, item) => acc + item.quantity, 0)} itens</TableCell>
                            <TableCell className="text-right font-bold">
                              {venda.status === "CANCELADA" ? (
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-muted-foreground line-through font-normal">{formatCurrency(venda.totalAmount)}</span>
                                  <Badge variant="destructive" className="text-[10px] h-4 leading-none">Cancelada</Badge>
                                </div>
                              ) : (
                                <span className="text-primary">{formatCurrency(venda.totalAmount)}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setVendaSelecionada(venda); setIsDetalhesOpen(true) }} className="h-8 px-2 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                  Detalhes
                                </Button>
                                {venda.status !== "CANCELADA" && (
                                  <Button variant="ghost" size="sm" onClick={() => handleDelete(venda.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
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
          <DialogContent className="sm:max-w-[700px] overflow-hidden flex flex-col max-h-[90vh]">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Registrar Nova Venda
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                    <SelectContent>
                      {clientes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vendedora Responsável</Label>
                  <Select 
                    value={sellerId} 
                    onValueChange={(val) => { 
                      setSellerId(val); 
                      setCart([]);
                      setSelectedJoiaId("");
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione a vendedora" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma (Venda Direta da Loja)</SelectItem>
                      {vendedoras.map((v) => (<SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border space-y-4">
                <Label className="text-base font-semibold">Adicionar Joias ao Carrinho</Label>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Joia {sellerId !== "none" ? "(Filtro: Maleta da Vendedora)" : "(Estoque Físico da Loja)"}</Label>
                    <Select value={selectedJoiaId} onValueChange={(val) => { setSelectedJoiaId(val); setQuantidadeToAdd("1"); }} disabled={sellerId !== "none" && !vendedoraTemMaleta}>
                      <SelectTrigger>
                        <SelectValue placeholder={sellerId !== "none" && !vendedoraTemMaleta ? "Vendedora sem maleta cadastrada" : "Bipar ou selecionar joia..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {joiasDisponiveis.map((joia) => (
                          <SelectItem key={joia.id} value={joia.id}>
                            {joia.sku} - ({formatCurrency(joia.sellingPrice)}) - Disp: {joia.stockQuantity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-2">
                    <Label className="text-xs">Qtd.</Label>
                    <Input type="number" min="1" value={quantidadeToAdd} onChange={(e) => setQuantidadeToAdd(e.target.value)} disabled={!selectedJoiaId} />
                  </div>
                  <Button onClick={handleAddToCart} disabled={!selectedJoiaId} className="gap-2">
                    <Plus className="w-4 h-4" /> Inserir
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Resumo do Pedido</Label>
                <div className="rounded-md border bg-white">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="w-20 text-center">Qtd.</TableHead>
                        <TableHead className="text-right">Unitário</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">
                            Carrinho vazio
                          </TableCell>
                        </TableRow>
                      ) : (
                        cart.map((item) => (
                          <TableRow key={item.jewelryId}>
                            <TableCell className="font-medium text-sm">
                              <span className="text-xs text-muted-foreground mr-2">{item.sku}</span>
                              {item.name}
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(item.price * item.quantity)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.jewelryId)} className="h-6 w-6 p-0 text-destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 flex flex-col gap-4">
              <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg border border-primary/20">
                <span className="text-lg font-semibold">Total a Pagar:</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(totalCarrinho)}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveVenda} 
                  className="flex-1 h-12 text-lg" 
                  disabled={isSaving || !clientId || cart.length === 0}
                >
                  {isSaving && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                  Finalizar Venda
                </Button>
                <Button type="button" variant="outline" className="h-12" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Comprovante de Venda
                {vendaSelecionada?.status === "CANCELADA" && (
                  <Badge variant="destructive" className="ml-2">CANCELADA</Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            {vendaSelecionada && (
              <div className="space-y-4 py-4">
                {vendaSelecionada.status === "CANCELADA" && (
                  <div className="bg-destructive/10 text-destructive text-center py-2 rounded-md font-bold mb-4 text-sm border border-destructive/20">
                    ESTA VENDA FOI CANCELADA E O ESTOQUE FOI ESTORNADO
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-md border">
                  <div>
                    <p className="text-muted-foreground text-xs">Data da Venda</p>
                    <p className="font-medium">{formatDate(vendaSelecionada.saleDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Código (ID)</p>
                    <p className="font-mono text-xs mt-1 truncate" title={vendaSelecionada.id}>{vendaSelecionada.id.substring(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Cliente</p>
                    <p className="font-medium">{vendaSelecionada.clientName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Vendedora</p>
                    <p className="font-medium">{vendaSelecionada.sellerName || "Venda Direta"}</p>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-center">Qtd</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendaSelecionada.items.map((item, idx) => (
                        <TableRow key={idx} className={vendaSelecionada.status === "CANCELADA" ? "opacity-60" : ""}>
                          <TableCell className="text-sm">{item.jewelrySku}</TableCell>
                          <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium text-sm">{formatCurrency(item.subTotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold">TOTAL DA VENDA</span>
                  <span className={`text-xl font-bold ${vendaSelecionada.status === "CANCELADA" ? "text-muted-foreground line-through" : "text-primary"}`}>
                    {formatCurrency(vendaSelecionada.totalAmount)}
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={() => setIsDetalhesOpen(false)}>Fechar Recibo</Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AuthGuard>
  )
}