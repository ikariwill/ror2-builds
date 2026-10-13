# Deploy

Hospedagem: **Vercel**, projeto ligado ao repositório `ikariwill/ror2-builds`.

## Primeira vez

1. vercel.com → **Add New… → Project** → importar `ikariwill/ror2-builds`.
2. A Vercel detecta **Vite**. Confira:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
3. **Deploy.** Sem variáveis de ambiente.

## Depois disso

- Push na `main` → deploy de produção automático.
- Push em outra branch ou PR → deploy de pré-visualização com URL própria.

## Notas

- O roteamento é por hash (`#/bandit`), então não há reescrita de rotas a configurar.
- Os ícones ficam em `public/icons/` e são servidos estáticos com cache da Vercel.
- O build roda `tsc --noEmit` antes do `vite build`: erro de tipo quebra o deploy de propósito.
