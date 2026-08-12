import Link from "next/link"
import { ShoppingBag, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href={isAdmin ? "/admin" : "/"} className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xl font-serif font-semibold tracking-tight">Projeto Ostra</span>
          </Link>

          {!isAdmin ? (
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Catálogo
              </Link>
              <Link href="/colecoes" className="text-sm font-medium hover:text-primary transition-colors">
                Coleções
              </Link>
              <Link href="/#sobre" className="text-sm font-medium hover:text-primary transition-colors">
                Sobre
              </Link>
              <Link href="/#contato" className="text-sm font-medium hover:text-primary transition-colors">
                Contato
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-8">
              <span className="text-sm font-medium text-muted-foreground">Painel Administrativo</span>
            </nav>
          )}

          <div className="flex items-center gap-4">
            {!isAdmin && (
              <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent">
                <Link href="/login">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
