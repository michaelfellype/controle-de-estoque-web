# WMS Almoxarifado Pro - Gestão e Controle de Estoque

Aplicação web profissional, moderna e responsiva para controle e gestão de estoque (WMS / Almoxarifado), substituindo planilhas em Excel por um sistema em nuvem com controle de acessos multi-usuário (RBAC).

## 🚀 Funcionalidades

- **Dashboard Executivo:**
  - Métricas principais (Patrimônio em estoque, itens cadastrados, alertas para compra, itens sem estoque e volume de saídas).
  - Gráfico de materiais de maior saída e gráfico Donut da saúde do estoque.
  - Histórico de entradas e saídas mensais.
- **Cadastro de Materiais:**
  - Controle de localização física (rua/prateleira), fornecedores, unidade de medida e custo.
  - Cálculo automático de saldo: `Estoque Inicial + Entradas - Saídas`.
  - Alertas automáticos de estoque crítico e sem saldo.
- **Movimentações & Validações:**
  - Registro de Entradas (com NF-e), Saídas e Ajustes de Inventário.
  - Bloqueio inteligente de saídas quando a quantidade solicitada for maior que o saldo disponível.
  - Auto-preenchimento do nome e departamento ao informar a matrícula do solicitante.
- **Controle de Acesso (RBAC):**
  - **Gestor / Gerência:** Acesso analítico e visual (somente leitura).
  - **Operador de Almoxarifado:** Acesso operacional completo.
- **Exportação & Bipador:**
  - Exportação para Excel (.csv) com UTF-8 e separador de ponto e vírgula compatível com o Excel brasileiro.
  - Relatório para impressão / PDF.
  - Leitor óptico / Bipador de código de barras.

## 🛠️ Tecnologias

- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Lucide Icons**
- **Canvas Confetti**

## 📦 Como rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Compilar para produção
npm run build
```

## 🌐 Hospedagem no GitHub Pages

O projeto já inclui o arquivo `.github/workflows/deploy.yml` pré-configurado:
1. No seu repositório no GitHub, vá em **Settings** > **Pages**.
2. Em **Build and deployment** > **Source**, selecione **GitHub Actions**.
3. A cada `git push` na branch principal (`main`), o site será compilado e publicado automaticamente no seu endereço `https://<seu-usuario>.github.io/<nome-do-repositorio>/`.
