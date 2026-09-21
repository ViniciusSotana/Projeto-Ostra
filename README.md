# Projeto Ostra 💍

Sistema de gestão para joalherias, desenvolvido como Trabalho de Conclusão de Curso. Permite controlar catálogo de joias, coleções, vendas, maletas de vendedoras, clientes e relatórios de desempenho.

## 📋 Sobre o projeto

O Projeto Ostra nasceu da necessidade de digitalizar o controle de estoque e vendas de uma joalheria que trabalha com revenda através de vendedoras autônomas (o modelo de "maleta"). O sistema centraliza o catálogo de joias, o controle de estoque por maleta, o registro de vendas e a geração de relatórios de comissão.

## ✨ Funcionalidades

- **Catálogo de joias**: cadastro de joias, tipos de joia e coleções, com upload de imagens via Cloudinary
- **Maletas de vendedoras**: controle de quais joias estão com cada vendedora e em qual quantidade
- **Vendas**: registro de vendas vinculadas a cliente e vendedora, com baixa automática de estoque (seja do estoque geral, seja da maleta)
- **Cancelamento de vendas**: estorno automático de estoque, valores vendidos e comissões
- **Clientes**: cadastro e histórico de valor total gasto por cliente
- **Vendedoras**: cálculo automático de comissão com base no valor vendido
- **Dashboard**: indicadores gerais do negócio
- **Relatórios**: exportação de relatórios de desempenho
- **Autenticação**: login com token (JWT), rotas públicas de consulta e rotas protegidas para operações

## 🛠️ Tecnologias

**Backend**
- Java 17
- Spring Boot 3.3.1 (Web, Security, Data JPA)
- PostgreSQL 16 em contêiner próprio (H2 em modo arquivo apenas como padrão ao rodar fora do Docker)
- Cloudinary (armazenamento de imagens)
- Maven

**Frontend**
- Next.js (App Router)
- TypeScript

**Infraestrutura**
- Docker e Docker Compose (3 contêineres: frontend, backend e banco de dados)

## 📁 Estrutura do repositório

```
ProjetoOstra/
├── backend/            # API REST em Spring Boot
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/           # Aplicação Next.js
│   ├── app/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml  # Orquestração dos três serviços (frontend, backend e banco)
├── .env                # Variáveis de ambiente (banco, JWT, Cloudinary) - não versionado
├── .env.example        # Modelo do .env
└── README.md
```

## 🚀 Como rodar o projeto

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução

### Passo a passo

1. Clone o repositório:
```bash
git clone https://github.com/ViniciusSotana/ProjetoOstra.git
cd ProjetoOstra
```

2. Crie o arquivo `.env` na raiz a partir do modelo (`cp .env.example .env`) e preencha os valores:
```env
POSTGRES_DB=ostra
POSTGRES_USER=ostra
POSTGRES_PASSWORD=troque_esta_senha
JWT_SECRET=troque_por_um_segredo_longo_e_aleatorio
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

3. Suba os containers:
```bash
docker-compose up --build
```

4. Acesse:
   - **Frontend**: http://localhost:3000
   - **Backend (API)**: http://localhost:8080
   - **Banco de dados (PostgreSQL)**: só é acessível dentro da rede do Compose; para consultar use `docker compose exec database psql -U ostra -d ostra`

### Parar a aplicação

```bash
docker-compose down
```

Os dados do PostgreSQL ficam salvos no volume Docker `postgres-data`, então persistem entre reinicializações. Para apagar também os dados (reset completo):

```bash
docker-compose down -v
```

## 🐳 Arquitetura Docker

A aplicação roda em três contêineres, orquestrados pelo `docker-compose.yml`:

| Serviço | Origem | Porta | Função |
|---------|--------|-------|--------|
| `frontend` | `frontend/Dockerfile` (Node 20, build standalone do Next.js) | 3000 | Interface web |
| `backend` | `backend/Dockerfile` (Maven + JRE 17) | 8080 | API REST (Spring Boot) |
| `database` | imagem oficial `postgres:16-alpine` | 5432 (somente rede interna) | Banco de dados |

- **Dockerfile**: frontend e backend têm Dockerfile multi-stage (um estágio compila, outro só executa, resultando em imagens menores).
- **Docker Compose**: define os serviços, portas, volume, variáveis de ambiente e a ordem de inicialização. O backend só sobe depois que o `healthcheck` do PostgreSQL confirmar que o banco aceita conexões.
- **Rede**: os três serviços ficam na rede `app-network`. O backend acessa o banco pelo nome do serviço: `jdbc:postgresql://database:5432/ostra`.
- **Volume**: o volume `postgres-data` guarda `/var/lib/postgresql/data`, então os dados sobrevivem a `docker-compose down` (só são apagados com `-v`).
- **Variáveis de ambiente**: usuário, senha e nome do banco, segredo do JWT e chaves do Cloudinary vêm do `.env`. Nenhuma credencial fica no código: o `application.properties` lê `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` e `SPRING_DATASOURCE_PASSWORD`.

Comandos úteis para demonstrar cada conceito:

```bash
docker compose ps                                        # três contêineres em execução
docker network ls                                        # rede criada pelo Compose
docker volume ls                                         # volume postgres-data
docker compose exec database psql -U ostra -d ostra -c "\dt"   # tabelas criadas pela API
```

## 🔌 Principais endpoints da API

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/auth/login` | Autenticação e geração de token | Público |
| GET | `/jewelries` | Lista todas as joias | Público |
| GET | `/collections` | Lista todas as coleções | Público |
| GET | `/jewelry-types` | Lista todos os tipos de joia | Público |
| GET/POST | `/clients` | Consulta/cadastro de clientes | Autenticado |
| GET/POST | `/sellers` | Consulta/cadastro de vendedoras | Autenticado |
| GET/POST | `/sales` | Consulta/registro de vendas | Autenticado |
| DELETE | `/sales/{id}` | Cancelamento de venda | Autenticado |
| GET | `/dashboard` | Indicadores gerais | Autenticado |
| GET | `/reports` | Relatórios de desempenho | Autenticado |

> Rotas autenticadas exigem o token JWT obtido em `/auth/login`, enviado no header `Authorization: Bearer <token>`.

## 🏗️ Arquitetura

O backend segue uma organização por domínio (feature-based), com cada módulo contendo sua própria entidade, controller, service, repository e DTOs:

- `catalog/` — joias, tipos de joia e coleções
- `people/` — clientes e vendedoras
- `sale/` — maletas, itens de maleta e vendas
- `security/` — autenticação, autorização e configuração de segurança
- `dashboard/` e `report/` — indicadores e relatórios

## 👤 Autor

Desenvolvido por Vinicius como Trabalho de Conclusão de Curso.