"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ArrowLeft, Pencil, Trash2, UserPlus, Package, Loader2 } from "lucide-react"
import Link from "next/link"
import { getToken } from "@/lib/auth"
import { API_URL } from "@/lib/api"

interface JoiaNaMaleta {
  jewelryId: string
  jewelryName: string
  quantity: number
}

interface Maleta {
  id: string
  code: string
  description: string
  sellerId: string | null
  sellerName: string | null
  items: JoiaNaMaleta[]
}

interface Vendedora { id: string, name: string, isActive: boolean }
interface Joia { id: string, sku: string, name: string, stockQuantity: number }

export default function MaletasPage() {
  const [maletas, setMaletas] = useState<Maleta[]>([])
  const [vendedoras, setVendedoras] = useState<Vendedora[]>([])
  const [joiasDisponiveis, setJoiasDisponiveis] = useState<Joia[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [isOpen, setIsOpen] = useState(false)
  const [editingMaleta, setEditingMaleta] = useState<Maleta | null>(null)
  const [formData, setFormData] = useState({ code: "", description: "" })

  const [isAtribuirOpen, setIsAtribuirOpen] = useState(false)
  const [maletaToAtribuir, setMaletaToAtribuir] = useState<Maleta | null>(null)
  const [selectedVendedoraId, setSelectedVendedoraId] = useState<string>("none")

  const [isJoiasOpen, setIsJoiasOpen] = useState(false)
  const [maletaJoias, setMaletaJoias] = useState<Maleta | null>(null)
  
  const [isAdicionarJoiaOpen, setIsAdicionarJoiaOpen] = useState(false)
  const [selectedJoiaId, setSelectedJoiaId] = useState<string>("")
  const [quantidadeJoia, setQuantidadeJoia] = useState<string>("1")

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const headers = { "Authorization": `Bearer ${getToken()}` }
      
      const [maletasRes, vendedorasRes, joiasRes] = await Promise.all([
        fetch(`${API_URL}/jewelry-cases`, { headers }),
        fetch(`${API_URL}/sellers`, { headers }),
        fetch(`${API_URL}/jewelries`, { headers })
      ])

      if (maletasRes.ok) setMaletas(await maletasRes.json())
      if (vendedorasRes.ok) setVendedoras(await vendedorasRes.json())
      if (joiasRes.ok) setJoiasDisponiveis(await joiasRes.json())
        
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const vendedorasOcupadas = maletas.map(m => m.sellerId).filter(Boolean) as string[]

  const getEstoqueLivre = (jewelryId: string) => {
    const joia = joiasDisponiveis.find(j => j.id === jewelryId)
    if (!joia) return 0
    
    let qtdNaRua = 0
    maletas.forEach(maleta => {
      const itemNaMaleta = maleta.items?.find(i => i.jewelryId === jewelryId)
      if (itemNaMaleta) {
        qtdNaRua += itemNaMaleta.quantity
      }
    })
    
    return Math.max(0, joia.stockQuantity - qtdNaRua)
  }

  const maxQuantidadePermitida = selectedJoiaId ? getEstoqueLivre(selectedJoiaId) : 0

  const handleOpenDialog = (maleta?: Maleta) => {
    if (maleta) {
      setEditingMaleta(maleta)
      setFormData({ code: maleta.code, description: maleta.description || "" })
    } else {
      setEditingMaleta(null)
      setFormData({ code: "", description: "" })
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const isEditing = !!editingMaleta
      const url = isEditing ? `${API_URL}/jewelry-cases/${editingMaleta.id}` : `${API_URL}/jewelry-cases`
      const method = isEditing ? "PUT" : "POST"

      const itemsPayload = isEditing && editingMaleta
        ? editingMaleta.items.map(i => ({ jewelryId: i.jewelryId, quantity: i.quantity }))
        : []

      const payload = {
        code: formData.code,
        description: formData.description,
        sellerId: isEditing ? editingMaleta?.sellerId : null,
        items: itemsPayload
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setIsOpen(false)
        fetchData()
      } else {
        alert("Falha ao salvar a maleta.")
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta maleta?")) return
    try {
      const response = await fetch(`${API_URL}/jewelry-cases/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      })
      if (response.ok) fetchData()
    } catch (error) {
      console.error("Erro ao excluir:", error)
    }
  }

  const handleAtribuir = (maleta: Maleta) => {
    setMaletaToAtribuir(maleta)
    setSelectedVendedoraId(maleta.sellerId || "none")
    setIsAtribuirOpen(true)
  }

  const handleSaveAtribuicao = async () => {
    if (!maletaToAtribuir) return
    setIsSaving(true)
    try {
      const payload = {
        code: maletaToAtribuir.code,
        description: maletaToAtribuir.description,
        sellerId: selectedVendedoraId === "none" ? null : selectedVendedoraId,
        items: maletaToAtribuir.items.map(i => ({ jewelryId: i.jewelryId, quantity: i.quantity }))
      }

      const response = await fetch(`${API_URL}/jewelry-cases/${maletaToAtribuir.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setIsAtribuirOpen(false)
        fetchData()
      }
    } catch (error) {
      console.error("Erro ao atribuir:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAdicionarJoia = async () => {
    if (!maletaJoias || !selectedJoiaId) return
    const qtd = parseInt(quantidadeJoia)
    
    if (isNaN(qtd) || qtd <= 0) {
      return alert("Quantidade inválida.")
    }

    if (qtd > maxQuantidadePermitida) {
      return alert(`Estoque insuficiente! Você só tem ${maxQuantidadePermitida} unidades livres na matriz.`)
    }

    setIsSaving(true)
    try {
      const currentItems = maletaJoias.items.map(i => ({ jewelryId: i.jewelryId, quantity: i.quantity }))
      
      const existingIndex = currentItems.findIndex(i => i.jewelryId === selectedJoiaId)
      if (existingIndex >= 0) {
        currentItems[existingIndex].quantity += qtd
      } else {
        currentItems.push({ jewelryId: selectedJoiaId, quantity: qtd })
      }

      const payload = {
        code: maletaJoias.code,
        description: maletaJoias.description,
        sellerId: maletaJoias.sellerId,
        items: currentItems
      }

      const response = await fetch(`${API_URL}/jewelry-cases/${maletaJoias.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const updatedMaleta = await response.json()
        setMaletaJoias(updatedMaleta) 
        setIsAdicionarJoiaOpen(false)
        fetchData() 
      } else {
        alert("Falha ao adicionar joia.")
      }
    } catch (error) {
      console.error("Erro:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoverJoia = async (jewelryId: string) => {
    if (!maletaJoias || !confirm("Tem certeza que deseja remover esta joia da maleta? (Ela voltará para o estoque livre da matriz)")) return

    try {
      const currentItems = maletaJoias.items
        .filter(i => i.jewelryId !== jewelryId)
        .map(i => ({ jewelryId: i.jewelryId, quantity: i.quantity }))

      const payload = {
        code: maletaJoias.code,
        description: maletaJoias.description,
        sellerId: maletaJoias.sellerId,
        items: currentItems
      }

      const response = await fetch(`${API_URL}/jewelry-cases/${maletaJoias.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const updatedMaleta = await response.json()
        setMaletaJoias(updatedMaleta)
        fetchData()
      }
    } catch (error) {
      console.error("Erro ao remover joia:", error)
    }
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
            <div className="flex flex-row items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold">Gerenciar Maletas</h1>
                <p className="text-muted-foreground mt-1">Controle de mostruários e atribuições</p>
              </div>
              <Button className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4" /> Nova Maleta
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                  <p>Buscando maletas no banco de dados...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Vendedora</TableHead>
                        <TableHead>Joias no Mostruário</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maletas.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma maleta encontrada.</TableCell>
                        </TableRow>
                      ) : (
                        maletas.map((maleta) => (
                          <TableRow key={maleta.id}>
                            <TableCell className="font-mono text-sm">{maleta.code}</TableCell>
                            <TableCell className="font-medium">{maleta.description || "-"}</TableCell>
                            <TableCell>{maleta.sellerName || "-"}</TableCell>
                            <TableCell>{maleta.items?.reduce((total, joia) => total + joia.quantity, 0) || 0} un.</TableCell>
                            <TableCell>
                              <Badge variant={maleta.sellerId ? "default" : "secondary"}>
                                {maleta.sellerId ? "Com Vendedora" : "Livre"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setMaletaJoias(maleta); setIsJoiasOpen(true); }} className="h-8 px-2 gap-1" title="Ver joias">
                                  <Package className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleAtribuir(maleta)} className="h-8 px-2 gap-1" title="Atribuir vendedora">
                                  <UserPlus className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(maleta)} className="h-8 w-8 p-0">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(maleta.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
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
              <DialogTitle>{editingMaleta ? "Editar Maleta" : "Cadastrar Nova Maleta"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código da Maleta</Label>
                <Input id="code" placeholder="Ex: MAL001" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" placeholder="Ex: Maleta Executiva" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1" disabled={isSaving || !formData.code}>
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingMaleta ? "Salvar Alterações" : "Cadastrar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAtribuirOpen} onOpenChange={setIsAtribuirOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Atribuir Maleta</DialogTitle>
              <DialogDescription>
                {maletaToAtribuir && `Responsável pela maleta ${maletaToAtribuir.code}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Vendedora Responsável</Label>
                <Select value={selectedVendedoraId} onValueChange={setSelectedVendedoraId}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma (Livre)</SelectItem>
                    {vendedoras
                      .filter((v) => v.isActive || v.id === maletaToAtribuir?.sellerId)
                      .map((v) => {
                        const isOcupada = vendedorasOcupadas.includes(v.id) && v.id !== maletaToAtribuir?.sellerId
                        return (
                          <SelectItem key={v.id} value={v.id} disabled={isOcupada}>
                            {v.name} {isOcupada ? " (Já possui maleta)" : ""}
                          </SelectItem>
                        )
                      })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSaveAtribuicao} className="flex-1" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Salvar
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAtribuirOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isJoiasOpen} onOpenChange={setIsJoiasOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Joias do Mostruário</DialogTitle>
              <DialogDescription>
                {maletaJoias && `Gerencie o estoque da maleta ${maletaJoias.code}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {maletaJoias && maletaJoias.items?.length > 0 ? (
                <div className="rounded-md border max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Joia</TableHead>
                        <TableHead>Qtd.</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maletaJoias.items.map((joia) => (
                        <TableRow key={joia.jewelryId}>
                          <TableCell className="font-medium">{joia.jewelryName}</TableCell>
                          <TableCell>{joia.quantity} un.</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleRemoverJoia(joia.jewelryId)} className="h-8 w-8 p-0 text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">Nenhuma joia nesta maleta</p>
              )}
              <div className="flex gap-2 pt-2">
                <Button onClick={() => { setSelectedJoiaId(""); setQuantidadeJoia("1"); setIsAdicionarJoiaOpen(true); }} className="flex-1 gap-2">
                  <Plus className="w-4 h-4" /> Adicionar Joia
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsJoiasOpen(false)}>Fechar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAdicionarJoiaOpen} onOpenChange={setIsAdicionarJoiaOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Joia à Maleta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Catálogo de Joias</Label>
                <Select value={selectedJoiaId} onValueChange={(val) => { setSelectedJoiaId(val); setQuantidadeJoia("1"); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma joia..." /></SelectTrigger>
                  <SelectContent>
                    {joiasDisponiveis.map((joia) => {
                      const livre = getEstoqueLivre(joia.id)
                      return (
                        <SelectItem key={joia.id} value={joia.id} disabled={livre <= 0}>
                          {joia.sku} - {joia.name} (Livre: {livre} / Total: {joia.stockQuantity})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantidade a adicionar</Label>
                <Input 
                  type="number" 
                  min="1" 
                  max={maxQuantidadePermitida}
                  value={quantidadeJoia} 
                  onChange={(e) => setQuantidadeJoia(e.target.value)}
                  disabled={!selectedJoiaId}
                />
                {selectedJoiaId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo permitido: {maxQuantidadePermitida} unidades.
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAdicionarJoia} className="flex-1" disabled={isSaving || !selectedJoiaId || parseInt(quantidadeJoia) > maxQuantidadePermitida}>
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Adicionar
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsAdicionarJoiaOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AuthGuard>
  )
}