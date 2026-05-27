# Varredura técnica — Lance Certo Web

## O que foi corrigido nesta revisão

- Corrigido o build de produção que quebrava ao tentar baixar fontes do Google durante o processo de `ng build`.
- Rotas principais convertidas para `loadComponent`, reduzindo o bundle inicial de aproximadamente `769.97 kB` para `313.95 kB`.
- Corrigido o controle de loading da consulta FIPE: antes, alguns loaders podiam ficar travados quando a requisição retornava erro, porque o `complete` não executa em erro.
- Corrigidas mensagens com encoding quebrado, exemplo: `NÃ£o foi possÃ­vel`.
- Removidos imports e propriedades não usadas no login.
- Aplicado Prettier no projeto e adicionados scripts para manter o padrão de formatação.

## Validação executada

```bash
npm ci
npm run build
```

Resultado: build finalizado com sucesso.

Aviso restante:

```text
src/app/pages/vehicle-create/vehicle-create.scss exceeded maximum budget.
```

Esse aviso não quebra o build, mas indica que o SCSS da tela de cadastro de veículo está grande demais e deve ser quebrado/padronizado.

## Pontos críticos encontrados

### 1. SCSS muito grande por página

Arquivos com maior risco de manutenção:

- `vehicle-detail.scss`: 824 linhas
- `vehicle-create.scss`: 776 linhas
- `finance.scss`: 463 linhas
- `subscription.scss`: 452 linhas
- `vehicles.scss`: 440 linhas
- `home.scss`: 432 linhas

Recomendação: extrair classes utilitárias e componentes visuais reutilizáveis para reduzir repetição.

### 2. Tela de cadastro de veículo está grande demais

Arquivos principais:

- `vehicle-create.html`: mais de 500 linhas
- `vehicle-create.ts`: concentra formatação, integração FIPE, payload e submit
- `vehicle-create.scss`: passa do budget configurado

Próxima refatoração recomendada:

- `VehicleFipeSelectorComponent`: tipo, marca, modelo e ano FIPE
- `VehicleAuctionFormSectionComponent`: leiloeira, tipo de leilão, datas, URL e endereço
- `VehicleFinancialFormSectionComponent`: valores, margem, lance inicial e lance atual
- `VehicleConditionFormSectionComponent`: avarias, observações e estado geral
- `vehicle-payload.mapper.ts`: montagem do payload enviado ao backend

### 3. Build inicial estava pesado

Antes, as páginas eram importadas diretamente em `app.routes.ts`, então entravam no bundle inicial. A alteração para lazy loading reduziu bastante o carregamento inicial.

### 4. Gerados de build não devem ir para versionamento

A pasta `dist/` é gerada pelo Angular. Ela deve ficar fora do repositório e do pacote de código-fonte.

## Próximos passos recomendados

1. Quebrar a tela `vehicle-create` em componentes menores.
2. Criar um padrão global para botões, cards, badges, empty states e page header.
3. Centralizar helpers de formulário em diretivas ou componentes de input.
4. Adicionar ESLint para pegar imports mortos, propriedades não usadas e problemas de template antes do build.
5. Criar testes unitários para `VehicleCreateFacade`, `Auth` e helpers de formatação.
