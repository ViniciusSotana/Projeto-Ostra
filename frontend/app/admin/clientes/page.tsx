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
import { Plus, ArrowLeft, Pencil, Trash2, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { getToken } from "@/lib/auth"
import { API_URL } from "@/lib/api"

interface Cliente {
  id: string
  nome: string
  email: string
  cpf: string
  telefone: string
  endereco: string
  totalGasto: number
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    endereco: "",
  })

  const fetchClientes = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/clients`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
      })
      if (response.ok) {
        const data = await response.json()
        const mappedClients = data.map((c: any) => ({
          id: c.id,
          nome: c.name || "Sem Nome",
          email: c.email || "-",
          cpf: c.cpf || "-",
          telefone: c.phone || "-",
          endereco: c.address || "",
          totalGasto: c.totalSpent || 0
        }))
        setClientes(mappedClients)
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const filteredClientes = clientes.filter((c) => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf.includes(searchTerm)
  )

  const handleOpenDialog = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente)
      setFormData({
        nome: cliente.nome,
        email: cliente.email !== "-" ? cliente.email : "",
        cpf: cliente.cpf !== "-" ? cliente.cpf : "",
        telefone: cliente.telefone !== "-" ? cliente.telefone : "",
        endereco: cliente.endereco,
      })
    } else {
      setEditingCliente(null)
      setFormData({ nome: "", email: "", cpf: "", telefone: "", endereco: "" })
    }
    setIsOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const isEditing = !!editingCliente
      const url = isEditing 
        ? `${API_URL}/clients/${editingCliente.id}` 
        : `${API_URL}/clients`
      const method = isEditing ? "PUT" : "POST"

      const payload = {
        name: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        phone: formData.telefone,
        address: formData.endereco
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
        fetchClientes() 
      } else {
        alert("Falha ao salvar o cliente. Verifique se o e-mail é válido e preencha todos os campos obrigatórios.")
      }
    } catch (error) {
      console.error("Erro ao salvar:", error)
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
                <h1 className="text-3xl font-serif font-bold">Gerenciar Clientes</h1>
                <p className="text-muted-foreground mt-1">Cadastre e acompanhe sua carteira de clientes</p>
              </div>
              <Button className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou CPF..."
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
                  <p>Buscando clientes no banco de dados...</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Endereço / Cidade</TableHead>
                        <TableHead className="text-right">Total Gasto</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClientes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            Nenhum cliente encontrado.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClientes.map((cliente) => (
                          <TableRow key={cliente.id}>
                            <TableCell className="font-medium">
                              <div>{cliente.nome}</div>
                              <div className="text-xs text-muted-foreground">CPF: {cliente.cpf}</div>
                            </TableCell>
                            <TableCell>{cliente.email}</TableCell>
                            <TableCell>{cliente.telefone}</TableCell>
                            <TableCell>{cliente.endereco || "-"}</TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              {formatCurrency(cliente.totalGasto)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(cliente)} className="h-8 w-8 p-0">
                                  <Pencil className="w-4 h-4" />
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
              <DialogTitle>{editingCliente ? "Editar Cliente" : "Cadastrar Novo Cliente"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Maria Silva"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="maria@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço / Cidade</Label>
                  <Input
                    id="endereco"
                    placeholder="Ex: Assis - SP"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1 gap-2" disabled={isSaving || !formData.nome || !formData.email}>
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCliente ? "Salvar Alterações" : "Cadastrar"}
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