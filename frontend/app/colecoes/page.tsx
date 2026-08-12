"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { ArrowLeft, Loader2, Tag } from "lucide-react"
import Link from "next/link"

interface Joia {
  id: string
  codigo: string
  name: string
  price: number 
  promoPrice: number | null 
  image: string | null
  stock: number
}

interface Colecao {
  id: string
  name: string
  description: string
  image: string | null 
  joias: Joia[]
}

export default function ColecoesPage() {
  const [colecoes, setColecoes] = useState<Colecao[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedColecao, setSelectedColecao] = useState<Colecao | null>(null)
  const [selectedJoia, setSelectedJoia] = useState<Joia | null>(null)
  const [joiaDetailsOpen, setJoiaDetailsOpen] = useState(false)
  
  const [isPromoOnly, setIsPromoOnly] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [colResponse, joiResponse] = await Promise.all([
          fetch("http://localhost:8080/collections"),
          fetch("http://localhost:8080/jewelries")
        ])

        if (colResponse.ok && joiResponse.ok) {
          const colecoesData = await colResponse.json()
          const joiasData = await joiResponse.json()

          const colecoesMapeadas: Colecao[] = colecoesData.map((col: any) => {
            const joiasDestaColecao = joiasData.filter((j: any) => j.collectionId === col.id)

            const joiasFormatadas: Joia[] = joiasDestaColecao.map((j: any) => ({
              id: j.id,
              codigo: j.sku,
              name: j.name,
              price: j.originalPrice,
              promoPrice: j.discountValue > 0 ? j.sellingPrice : null,
              image: j.imageUrl,
              stock: j.stockQuantity
            }))

            return {
              id: col.id,
              name: col.name,
              description: col.description || "Descubra as peças exclusivas desta coleção.",
              image: joiasFormatadas.length > 0 ? joiasFormatadas[0].image : null,
              joias: joiasFormatadas
            }
          })

          const colecoesComJoias = colecoesMapeadas.filter(c => c.joias.length > 0)
          setColecoes(colecoesComJoias)
        }
      } catch (error) {
        console.error("Erro ao carregar coleções:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  if (selectedColecao) {
    const joiasExibidas = isPromoOnly 
      ? selectedColecao.joias.filter(joia => joia.promoPrice !== null)
      : selectedColecao.joias;

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            className="mb-6 gap-2"
            onClick={() => {
              setSelectedColecao(null)
              setIsPromoOnly(false)
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar às Coleções
          </Button>

          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{selectedColecao.name}</h1>
              <p className="text-muted-foreground">{selectedColecao.description}</p>
            </div>
            
            <Button
              variant={isPromoOnly ? "destructive" : "outline"}
              onClick={() => setIsPromoOnly(!isPromoOnly)}
              className={`gap-2 w-full md:w-auto ${!isPromoOnly ? "text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50" : ""}`}
            >
              <Tag className="w-4 h-4" />
              Apenas Promoções
            </Button>
          </div>

          {joiasExibidas.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
              <p className="text-lg font-serif text-muted-foreground mb-4">
                Não há peças em promoção nesta coleção no momento.
              </p>
              <Button variant="outline" onClick={() => setIsPromoOnly(false)}>
                Ver todas as peças da coleção
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all">
              {joiasExibidas.map((joia) => (
                <Card key={joia.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0 relative">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={joia.image || "/placeholder.svg"}
                        alt={joia.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    {joia.promoPrice && (
                      <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-600">
                        {Math.round((1 - joia.promoPrice / joia.price) * 100)}% OFF
                      </Badge>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-3 p-6">
                    <div className="w-full">
                      <h3 className="font-medium text-lg truncate" title={joia.name}>{joia.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {joia.promoPrice ? (
                          <>
                            <p className="text-lg text-muted-foreground line-through">{formatPrice(joia.price)}</p>
                            <p className="text-2xl font-serif text-red-600">{formatPrice(joia.promoPrice)}</p>
                          </>
                        ) : (
                          <p className="text-2xl font-serif text-primary">{formatPrice(joia.price)}</p>
                        )}
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-transparent" 
                      variant="outline"
                      onClick={() => {
                        setSelectedJoia(joia)
                        setJoiaDetailsOpen(true)
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          <Dialog open={joiaDetailsOpen} onOpenChange={setJoiaDetailsOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">{selectedJoia?.name}</DialogTitle>
              </DialogHeader>
              {selectedJoia && (
                <div className="space-y-4">
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted shadow-sm">
                    <img
                      src={selectedJoia.image || "/placeholder.svg"}
                      alt={selectedJoia.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Código SKU</span>
                      <span className="font-medium">{selectedJoia.codigo}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Coleção</span>
                      <span className="font-medium">{selectedColecao.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Preço Original</span>
                      <span className={`font-medium ${selectedJoia.promoPrice ? 'line-through text-muted-foreground' : 'text-primary'}`}>
                        {formatPrice(selectedJoia.price)}
                      </span>
                    </div>
                    {selectedJoia.promoPrice && (
                      <div className="flex justify-between items-center py-2 border-b bg-red-50 -mx-4 px-4">
                        <span className="text-red-700 font-medium">Preço Promocional</span>
                        <span className="font-medium text-red-600 text-xl">{formatPrice(selectedJoia.promoPrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Disponível</span>
                      <Badge variant={selectedJoia.stock > 10 ? "default" : selectedJoia.stock > 0 ? "secondary" : "destructive"}>
                        {selectedJoia.stock > 0 ? `${selectedJoia.stock} unidades` : "Esgotado"}
                      </Badge>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => setJoiaDetailsOpen(false)}>
                    Fechar
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>

        <footer className="border-t border-border bg-card py-8">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-muted-foreground">
              © 2026 Projeto Ostra. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section 
          className="relative py-12 md:py-16 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://png.pngtree.com/thumb_back/fh260/background/20250417/pngtree-a-closeup-of-various-seashells-and-pearls-scattered-on-the-sandy-image_17206186.jpg')" }} 
        >
          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative z-10 container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-5xl md:text-5xl font-serif font-bold mb-4 text-white">
                Nossas Coleções
              </h1>
              <p className="text-2xl font-serif font-bold max-w-2xl mx-auto text-white/90">
                Explore nossas coleções exclusivas de semijoias
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                <p>Preparando coleções exclusivas...</p>
              </div>
            ) : colecoes.length === 0 ? (
              <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
                <p className="text-lg font-serif text-muted-foreground">Nenhuma coleção disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {colecoes.map((colecao) => (
                  <Card 
                    key={colecao.id} 
                    className="group overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border-transparent hover:border-primary/20"
                    onClick={() => setSelectedColecao(colecao)}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-video overflow-hidden bg-muted flex items-center justify-center">
                        {colecao.image ? (
                          <img
                            src={colecao.image}
                            alt={colecao.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm font-medium">Sem prévia disponível</span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start gap-2 p-6 bg-card">
                      <h3 className="font-serif font-bold text-xl">{colecao.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">{colecao.description}</p>
                      <p className="text-sm font-medium text-primary mt-2">
                        {colecao.joias.length} {colecao.joias.length === 1 ? "peça" : "peças"}
                      </p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2026 Projeto Ostra. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}