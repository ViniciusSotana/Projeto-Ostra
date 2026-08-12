import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section 
          className="relative py-20 md:py-32 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://png.pngtree.com/thumb_back/fh260/background/20250417/pngtree-a-closeup-of-various-seashells-and-pearls-scattered-on-the-sandy-image_17206186.jpg" }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
          
          <div className="relative z-10 container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-7xl font-serif font-bold tracking-tight text-balance mb-6 text-white">
                Elegância em cada detalhe
              </h1>
              <p className="text-lg md:text-2xl font-serif font-bold text-pretty mb-8 text-white/90">
                Descubra nossa coleção exclusiva de semijoias. Peças únicas que realçam sua beleza natural.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4">Nossa Coleção</h2>
              <p className="text-center text-muted-foreground max-w-2xl mx-auto">
                Peças cuidadosamente selecionadas para você
              </p>
            </div>
            <ProductGrid />
          </div>
        </section>

        <section id="sobre" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Sobre Nós</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Com anos de experiência no mercado de joias, oferecemos peças de alta qualidade que combinam
                sofisticação e preço acessível. Nossa missão é fazer você se sentir especial em cada ocasião.
              </p>
            </div>
          </div>
        </section>

        <section id="contato" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Entre em Contato</h2>
              <p className="text-lg text-muted-foreground mb-8">Tire suas dúvidas ou agende uma visita à nossa loja</p>
              <div className="flex justify-center">
                <a
                  href="https://wa.me/5518996932702?text=Ol%C3%A1%21%20Estava%20dando%20uma%20olhada%20no%20seu%20site%20e%20me%20interessei%20por%20uma%20joia."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Projeto Ostra. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
