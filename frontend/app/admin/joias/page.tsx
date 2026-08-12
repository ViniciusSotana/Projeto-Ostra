"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ArrowLeft, Pencil, Trash2, Search, Loader2, Image as ImageIcon, Tag } from "lucide-react"
import Link from "next/link"
import { getToken } from "@/lib/auth"

interface Joia {
  id: string
  name: string
  sku: string
  description: string
  originalPrice: number
  sellingPrice: number
  discountValue: number
  stockQuantity: number
  imageUrl: string
  typeId: string
  typeName: string
  collectionId: string
  collectionName: string
}

interface Colecao { id: string, name: string }
interface TipoJoia { id: string, name: string }

export default function JoiasPage() {
  const [joias, setJoias] = useState<Joia[]>([])
  const [colecoes, setColecoes] = useState<Colecao[]>([])
  const [tipos, setTipos] = useState<TipoJoia[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editingJoia, setEditingJoia] = useState<Joia | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    price: "", 
    stockQuantity: "",
    typeId: "",
    collectionId: "none",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [isPromocaoOpen, setIsPromocaoOpen] = useState(false)
  const [promocaoType, setPromocaoType] = useState<"percentage" | "fixed">("percentage")
  const [promocaoValue, setPromocaoValue] = useState("")
  const [currentPromocaoJoia, setCurrentPromocaoJoia] = useState<Joia | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const headers = { "Authorization": `Bearer ${getToken()}` }
      
      const [joiasRes, tiposRes, colecoesRes] = await Promise.all([
        fetch("http://localhost:8080/jewelries", { headers }),
        fetch("http://localhost:8080/jewelry-types", { headers }),
        fetch("http://localhost:8080/collections", { headers })
      ])

      if (joiasRes.ok) setJoias(await joiasRes.json())
      if (tiposRes.ok) setTipos(await tiposRes.json())
      if (colecoesRes.ok) setColecoes(await colecoesRes.json())
        
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredJoias = joias.filter(j => 
    j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenDialog = (joia?: Joia) => {
    setImageFile(null)
    if (joia) {
      setEditingJoia(joia)
      setFormData({
        name: joia.name,
        sku: joia.sku,
        description: joia.description || "",
        price: joia.originalPrice.toString(), 
        stockQuantity: joia.stockQuantity.toString(),
        typeId: joia.typeId,
        collectionId: joia.collectionId || "none",
      })
    } else {
      setEditingJoia(null)
      setFormData({
        name: "", sku: "", description: "", price: "",
        stockQuantity: "", typeId: "", collectionId: "none"
      })
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const isEditing = !!editingJoia
      const url = isEditing 
        ? `http://localhost:8080/jewelries/${editingJoia.id}` 
        : "http://localhost:8080/jewelries"
      const method = isEditing ? "PUT" : "POST"

      const basePrice = parseFloat(formData.price)
      let discountV = 0
      let sellingP = basePrice

      if (isEditing && editingJoia) {
        discountV = editingJoia.discountValue || 0
        sellingP = Math.max(0, basePrice - discountV)
      }

      const requestDTO = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        originalPrice: basePrice,
        sellingPrice: sellingP,
        discountValue: discountV,
        stockQuantity: parseInt(formData.stockQuantity),
        typeId: formData.typeId,
        collectionId: formData.collectionId !== "none" ? formData.collectionId : null
      }

      const payload = new FormData()
      payload.append("data", new Blob([JSON.stringify(requestDTO)], { type: "application/json" }))

      if (imageFile) {
        payload.append("image", imageFile)
      } else if (!isEditing) {
        alert("Por favor, selecione uma imagem para a joia.")
        setIsSaving(false)
        return
      }

      const response = await fetch(url, {
        method: method,
        headers: { "Authorization": `Bearer ${getToken()}` },
        body: payload
      })

      if (response.ok) {
        setIsOpen(false)
        fetchData() 
      } else {
        alert("Falha ao salvar a joia. Verifique os dados.")
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const openPromocaoDialog = (joia: Joia) => {
    setCurrentPromocaoJoia(joia)
    setPromocaoValue("")
    setPromocaoType("percentage")
    setIsPromocaoOpen(true)
  }

  const applyPromocao = async () => {
    if (!currentPromocaoJoia) return

    const value = parseFloat(promocaoValue)
    if (isNaN(value) || value <= 0) {
      alert("Por favor, insira um valor válido para o desconto.")
      return
    }

    setIsSaving(true)
    let discountVal = 0

    if (promocaoType === "percentage") {
      discountVal = currentPromocaoJoia.originalPrice * (value / 100)
    } else {
      discountVal = value
    }

    const newSellingPrice = Math.max(0, currentPromocaoJoia.originalPrice - discountVal)

    const requestDTO = {
      name: currentPromocaoJoia.name,
      sku: currentPromocaoJoia.sku,
      description: currentPromocaoJoia.description,
      originalPrice: currentPromocaoJoia.originalPrice,
      sellingPrice: newSellingPrice,    
      discountValue: discountVal,      
      stockQuantity: currentPromocaoJoia.stockQuantity,
      typeId: currentPromocaoJoia.typeId,
      collectionId: currentPromocaoJoia.collectionId
    }

    const payload = new FormData()
    payload.append("data", new Blob([JSON.stringify(requestDTO)], { type: "application/json" }))

    try {
      const response = await fetch(`http://localhost:8080/jewelries/${currentPromocaoJoia.id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${getToken()}` },
        body: payload
      })

      if (response.ok) {
        setIsPromocaoOpen(false)
        fetchData()
      } else {
        alert("Erro ao aplicar promoção.")
      }
    } catch (error) {
      console.error("Erro ao promover:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const removePromocao = async (joia: Joia) => {
    if (!confirm("Deseja remover a promoção e voltar ao preço original?")) return

    const requestDTO = {
      name: joia.name,
      sku: joia.sku,
      description: joia.description,
      originalPrice: joia.originalPrice,
      sellingPrice: joia.originalPrice,
      discountValue: 0,                 
      stockQuantity: joia.stockQuantity,
      typeId: joia.typeId,
      collectionId: joia.collectionId
    }

    const payload = new FormData()
    payload.append("data", new Blob([JSON.stringify(requestDTO)], { type: "application/json" }))

    try {
      const response = await fetch(`http://localhost:8080/jewelries/${joia.id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${getToken()}` },
        body: payload
      })

      if (response.ok) {
        fetchData()
      } else {
        alert("Erro ao remover promoção.")
      }
    } catch (error) {
      console.error("Erro:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta joia?")) return
    try {
      const response = await fetch(`http://localhost:8080/jewelries/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      })
      if (response.ok) fetchData()
    } catch (error) {
      console.error("Erro ao excluir:", error)
    }
  }

  const formatCurrency = (value: number) => {
    return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || "R$ 0,00"
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
                <h1 className="text-3xl font-serif font-bold">Catálogo de Joias</h1>
                <p className="text-muted-foreground mt-1">Gerencie todas as peças do seu estoque</p>
              </div>
              <Button className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4" /> Nova Joia
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código ou nome..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                  <p>Buscando catálogo no banco de dados...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Foto</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Estoque</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJoias.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma joia encontrada.</TableCell>
                        </TableRow>
                      ) : (
                        filteredJoias.map((joia) => (
                          <TableRow key={joia.id}>
                            <TableCell>
                              {joia.imageUrl ? (
                                <img src={joia.imageUrl} alt={joia.name} className="w-10 h-10 object-cover rounded-md border" />
                              ) : (
                                <div className="w-10 h-10 bg-muted flex items-center justify-center rounded-md border text-muted-foreground">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{joia.sku}</TableCell>
                            <TableCell>
                              <div className="font-medium">{joia.name}</div>
                              <div className="text-xs text-muted-foreground">{joia.typeName} • {joia.collectionName || "Sem Coleção"}</div>
                            </TableCell>
                            <TableCell>
                              {joia.discountValue > 0 ? (
                                <div className="flex flex-col">
                                  <span className="text-xs line-through text-muted-foreground">{formatCurrency(joia.originalPrice)}</span>
                                  <span className="font-semibold text-red-600">{formatCurrency(joia.sellingPrice)}</span>
                                </div>
                              ) : (
                                <span className="font-semibold text-primary">{formatCurrency(joia.sellingPrice)}</span>
                              )}
                            </TableCell>
                            <TableCell>{joia.stockQuantity} un.</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {joia.discountValue > 0 ? (
                                  <Button variant="ghost" size="sm" onClick={() => removePromocao(joia)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" title="Remover Promoção">
                                    <Tag className="w-4 h-4 fill-current" />
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="sm" onClick={() => openPromocaoDialog(joia)} className="h-8 w-8 p-0" title="Aplicar Promoção">
                                    <Tag className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(joia)} className="h-8 w-8 p-0">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(joia.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
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
          <DialogContent className="sm:max-w-[600px] overflow-y-scroll max-h-screen">
            <DialogHeader>
              <DialogTitle>{editingJoia ? "Editar Joia" : "Cadastrar Nova Joia"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Código)</Label>
                  <Input id="sku" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="Ex: COL001" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Joia</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Valor Base (R$)</Label>
                  <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Quantidade no Estoque</Label>
                  <Input id="stockQuantity" type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="typeId">Tipo da Joia</Label>
                  <Select value={formData.typeId} onValueChange={(value) => setFormData({ ...formData, typeId: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>{tipo.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collectionId">Coleção (Opcional)</Label>
                  <Select value={formData.collectionId} onValueChange={(value) => setFormData({ ...formData, collectionId: value })}>
                    <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {colecoes.map((col) => (
                        <SelectItem key={col.id} value={col.id}>{col.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="image">Foto da Joia {editingJoia && "(Opcional: deixe em branco para manter a atual)"}</Label>
                <Input 
                  id="image" 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImageFile(e.target.files[0])
                    }
                  }}
                  className="cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1 gap-2" disabled={isSaving || !formData.name || !formData.sku || !formData.typeId || !formData.price}>
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingJoia ? "Salvar Alterações" : "Cadastrar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isPromocaoOpen} onOpenChange={setIsPromocaoOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Aplicar Promoção</DialogTitle>
              <DialogDescription>
                {currentPromocaoJoia && `Gerar desconto para a joia "${currentPromocaoJoia.name}"`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Desconto</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={promocaoType === "percentage" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPromocaoType("percentage")}
                  >
                    Percentual (%)
                  </Button>
                  <Button
                    type="button"
                    variant={promocaoType === "fixed" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setPromocaoType("fixed")}
                  >
                    Fixo (R$)
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="promocao-value">
                  {promocaoType === "percentage" ? "Quantos % de desconto?" : "Quantos Reais (R$) de desconto?"}
                </Label>
                <Input
                  id="promocao-value"
                  type="number"
                  step="0.01"
                  placeholder={promocaoType === "percentage" ? "Ex: 20" : "Ex: 15.50"}
                  value={promocaoValue}
                  onChange={(e) => setPromocaoValue(e.target.value)}
                />
                {currentPromocaoJoia && promocaoValue && (
                   <p className="text-xs text-muted-foreground mt-2">
                      Preço original: <strong>{formatCurrency(currentPromocaoJoia.originalPrice)}</strong>
                   </p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={applyPromocao} className="flex-1 gap-2" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Aplicar Promoção
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsPromocaoOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </AuthGuard>
  )
}