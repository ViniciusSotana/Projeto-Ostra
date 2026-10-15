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
import { Plus, ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { getToken } from "@/lib/auth"
import { API_URL } from "@/lib/api"

interface Colecao {
  id: string
  nome: string
  descricao: string
  dataLancamento: string
}

export default function ColecoesPage() {
  const [colecoes, setColecoes] = useState<Colecao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editingColecao, setEditingColecao] = useState<Colecao | null>(null)
  
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    dataLancamento: "",
  })

  const fetchColecoes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/collections`, {
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        
        const mappedCollections = data.map((c: any) => ({
          id: c.id,
          nome: c.name || "Sem Nome",
          descricao: c.description || "-",
          dataLancamento: c.launchDate || ""
        }))
        
        setColecoes(mappedCollections)
      }
    } catch (error) {
      console.error("Erro ao buscar coleções:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchColecoes()
  }, [])

  const handleOpenDialog = (colecao?: Colecao) => {
    if (colecao) {
      setEditingColecao(colecao)
      setFormData({
        nome: colecao.nome,
        descricao: colecao.descricao !== "-" ? colecao.descricao : "",
        dataLancamento: colecao.dataLancamento,
      })
    } else {
      setEditingColecao(null)
      setFormData({ nome: "", descricao: "", dataLancamento: "" })
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const isEditing = !!editingColecao
      const method = isEditing ? "PUT" : "POST"
      const url = isEditing 
        ? `${API_URL}/collections/${editingColecao.id}` 
        : `${API_URL}/collections`

      const payload = {
        name: formData.nome,
        description: formData.descricao,
        launchDate: formData.dataLancamento ? formData.dataLancamento : null
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
        fetchColecoes()
      } else {
        alert("Falha ao salvar a coleção. Verifique os dados.")
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro de conexão com o servidor.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta coleção?")) return

    try {
      const response = await fetch(`http://localhost:8080/collections/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${getToken()}`
        }
      })

      if (response.ok) {
        fetchColecoes()
      } else {
        alert("Não foi possível excluir. Podem existir joias vinculadas a esta coleção.")
      }
    } catch (error) {
      console.error("Erro ao excluir:", error)
    }
  }

  const formatarData = (dataIso: string) => {
    if (!dataIso) return "-"
    const partes = dataIso.split("-")
    if (partes.length !== 3) return dataIso
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Header isAdmin />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao painel
            </Link>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Gerenciar Coleções</CardTitle>
              <Button className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4" />
                Nova Coleção
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                  <p>Buscando coleções no banco de dados...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Data de Lançamento</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {colecoes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            Nenhuma coleção encontrada.
                          </TableCell>
                        </TableRow>
                      ) : (
                        colecoes.map((colecao) => (
                          <TableRow key={colecao.id}>
                            <TableCell className="font-medium">{colecao.nome}</TableCell>
                            <TableCell>{colecao.descricao}</TableCell>
                            <TableCell>{formatarData(colecao.dataLancamento)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(colecao)} className="h-8 w-8 p-0">
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(colecao.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
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
              <DialogTitle>{editingColecao ? "Editar Coleção" : "Cadastrar Nova Coleção"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Coleção</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Primavera 2026"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  placeholder="Descreva o estilo da coleção"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataLancamento">Data de Lançamento</Label>
                <Input
                  id="dataLancamento"
                  type="date"
                  value={formData.dataLancamento}
                  onChange={(e) => setFormData({ ...formData, dataLancamento: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1 gap-2" disabled={isSaving || !formData.nome}>
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingColecao ? "Salvar Alterações" : "Cadastrar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
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