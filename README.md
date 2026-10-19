# Ana Clara — portfólio de moda

Primeira versão local, criada a partir das cinco imagens enviadas em 16/10/2026.

## Estrutura

- Hero de rolagem longa com retrato, apresentação e visão em camadas. O vídeo enviado depois substituirá o retrato como fundo.
- Seção de processo com três etapas e explicações breves.
- Projeto 01: moldes, moulage e protótipo de blazer, com legendas específicas.
- Projeto 02: moldes e construção de calça de alfaiataria, com legendas específicas.
- Direção visual em amarelo, manteiga e marrom; as fotos mantêm as cores originais.

## Próximos materiais

- Vídeo de fundo da Hero (arquivo original, preferencialmente MP4/H.264 ou WebM).
- Retrato de Ana Clara e novos trabalhos.
- Nome completo, papel em cada projeto, breve texto em suas próprias palavras e créditos de colaboradores.
- Contato profissional, se ela desejar publicá-lo.

Quando o vídeo chegar, copiar para `dist/assets/hero.mp4`, definir `src="assets/hero.mp4"` em `#hero-video` no `dist/index.html`, testar reprodução, enquadramento, velocidade e legibilidade da Hero.

## Publicação

O site está publicado em https://ana-clara-portfolio-nine.vercel.app. O projeto
`ana-clara-portfolio` está conectado ao repositório GitHub `portfolio-moda` na
Vercel. A pasta `dist/` é publicada diretamente, sem etapa de build.

Para publicar as alterações desta pasta manualmente em produção, execute
`vercel deploy --prod`. Commits enviados ao GitHub também geram deploys
automáticos; as alterações locais só entram nesse fluxo depois de commit e push.
