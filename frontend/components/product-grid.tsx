"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Loader2, Tag } from "lucide-react"
import { API_URL } from "@/lib/api"

interface Jewelry {
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

interface JewelryType {
  id: string
  name: string
}

interface Collection {
  id: string
  name: string
}

interface ProductGridProps {
  showFilters?: boolean
}

export function ProductGrid({ showFilters = true }: ProductGridProps) {
  const [jewelries, setJewelries] = useState<Jewelry[]>([])
  const [types, setTypes] = useState<JewelryType[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isFiltering, setIsFiltering] = useState(false)

  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedCollection, setSelectedCollection] = useState<string>("all")
  const [isPromoOnly, setIsPromoOnly] = useState<boolean>(false)
  
  const [selectedProduct, setSelectedProduct] = useState<Jewelry | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [typesRes, colRes] = await Promise.all([
          fetch(`${API_URL}/jewelry-types`),
          fetch(`${API_URL}/collections`)
        ])
        
        if (typesRes.ok) setTypes(await typesRes.json())
        if (colRes.ok) setCollections(await colRes.json())
      } catch (error) {
        console.error("Erro ao buscar filtros:", error)
      }
    }
    fetchMetadata()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsFiltering(true)
      try {
        let url = new URL(`${API_URL}/jewelries`)
        if (selectedType !== "all") url.searchParams.append("typeId", selectedType)
        if (selectedCollection !== "all") url.searchParams.append("collectionId", selectedCollection)
        if (isPromoOnly) url.searchParams.append("isPromo", "true")

        const response = await fetch(url.toString())
        if (response.ok) {
          setJewelries(await response.json())
        }
      } catch (error) {
        console.error("Erro ao buscar joias:", error)
      } finally {
        setIsLoading(false)
        setIsFiltering(false)
      }
    }
    fetchProducts()
  }, [selectedType, selectedCollection, isPromoOnly])

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleViewDetails = (product: Jewelry) => {
    setSelectedProduct(product)
    setDetailsOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
        <p>Carregando nosso catálogo...</p>
      </div>
    )
  }

  return (
    <div>
      {showFilters && (
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-muted/30 p-4 rounded-lg">
          
          <div className="flex flex-wrap gap-2 justify-center flex-1">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Todos os Modelos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Modelos</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4 items-center w-full md:w-auto">
            <Button
              variant={isPromoOnly ? "destructive" : "outline"}
              size="sm"
              onClick={() => setIsPromoOnly(!isPromoOnly)}
              className={`gap-2 ${!isPromoOnly ? "bg-background text-red-500 hover:text-red-600 border-red-200" : ""}`}
            >
              <Tag className="w-4 h-4" />
              Promoções
            </Button>

            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Filtrar por Coleção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Coleções</SelectItem>
                {collections.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${isFiltering ? 'opacity-50' : 'opacity-100'}`}>
        {jewelries.map((product) => (
          <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0 relative">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {product.discountValue > 0 && (
                <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 shadow-md">
                  {Math.round((product.discountValue / product.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-3 p-6">
              <div className="w-full">
                <p className="text-xs text-muted-foreground mb-1">{product.collectionName || 'Coleção Standard'}</p>
                <h3 className="font-medium text-lg truncate" title={product.name}>{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {product.discountValue > 0 ? (
                    <>
                      <p className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
                      <p className="text-2xl font-serif text-red-600">{formatPrice(product.sellingPrice)}</p>
                    </>
                  ) : (
                    <p className="text-2xl font-serif text-primary">{formatPrice(product.sellingPrice)}</p>
                  )}
                </div>
              </div>
              <Button 
                className="w-full bg-transparent" 
                variant="outline"
                onClick={() => handleViewDetails(product)}
              >
                Ver Detalhes
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {jewelries.length === 0 && !isFiltering && (
        <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed mt-4">
          <p className="text-lg font-serif text-muted-foreground">Nenhuma joia encontrada com estes filtros.</p>
          <Button variant="link" onClick={() => {
            setSelectedType("all"); 
            setSelectedCollection("all"); 
            setIsPromoOnly(false);
          }}>
            Limpar Filtros
          </Button>
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-muted shadow-sm">
                <img
                  src={selectedProduct.imageUrl || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Código SKU</span>
                  <span className="font-medium">{selectedProduct.sku}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Coleção</span>
                  <span className="font-medium">{selectedProduct.collectionName || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Tipo de Joia</span>
                  <span className="font-medium">{selectedProduct.typeName}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Preço Original</span>
                  <span className={`font-medium ${selectedProduct.discountValue > 0 ? 'line-through text-muted-foreground' : 'text-primary'}`}>
                    {formatPrice(selectedProduct.originalPrice)}
                  </span>
                </div>
                {selectedProduct.discountValue > 0 && (
                  <div className="flex justify-between items-center py-2 border-b bg-red-50 -mx-4 px-4">
                    <span className="text-red-700 font-medium">Preço Promocional</span>
                    <span className="font-medium text-red-600 text-xl">{formatPrice(selectedProduct.sellingPrice)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Disponibilidade</span>
                  <Badge variant={selectedProduct.stockQuantity > 5 ? "default" : selectedProduct.stockQuantity > 0 ? "secondary" : "destructive"}>
                    {selectedProduct.stockQuantity > 0 ? `${selectedProduct.stockQuantity} unidades` : "Esgotado"}
                  </Badge>
                </div>
                {selectedProduct.description && (
                  <div className="pt-2">
                    <span className="text-sm text-muted-foreground block mb-1">Descrição:</span>
                    <p className="text-sm">{selectedProduct.description}</p>
                  </div>
                )}
              </div>
              <Button className="w-full" onClick={() => setDetailsOpen(false)}>
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}