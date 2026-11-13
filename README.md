# Conversor de Roteiro para SRT
Ferramenta simples para transformar um roteiro em texto num arquivo de legendas `.srt`. Funciona direto no navegador, sem instalação e sem enviar nada para servidores. Portátil !

## Recursos
- Divide o texto em blocos respeitando o fim das frases
- Duração fixa por bloco ou calculada pela velocidade de leitura
- Intervalo configurável entre blocos
- Limite de caracteres por bloco
- Abre arquivos `.txt` e conta caracteres e palavras
- Mostra o total de blocos e a duração final
- Copia ou baixa o SRT pronto
- Lembra suas configurações no navegador

## Como usar
1. Baixe o arquivo os arquivos do repositório.
2. Abra no navegador (clique duas vezes no arquivo 'index.html').
3. Cole o roteiro ou use **Abrir .txt**.
4. Ajuste as opções e clique em **Converter para SRT**.
5. Use **Baixar SRT** ou **Copiar SRT**.

## Opções
| Opção | Padrão | O que faz |
|---|---|---|
| Duração | Fixa por bloco | Escolhe entre duração fixa ou pela velocidade de leitura |
| Duração (s) | 30 | Tempo de cada bloco no modo fixo |
| Caracteres por segundo | 15 | Velocidade de leitura no modo automático (mínimo de 1,5 s por bloco) |
| Intervalo (s) | 12 | Pausa entre o fim de um bloco e o início do próximo |
| Máx. caracteres | 500 | Tamanho máximo de cada bloco |

## Exemplo de saída
```
1
00:00:00,000 --> 00:00:30,000
Toda história começa com uma primeira frase. O resto vem depois.

2
00:00:42,000 --> 00:01:12,000
Continue escrevendo, e a legenda acompanha.
```

## Dicas
- Mantenha entre 12 e 17 caracteres por segundo para uma leitura confortável.
- Prefira blocos curtos. Para vídeos comuns, de 80 a 120 caracteres costumam funcionar melhor que o limite padrão de 500, que serve a usos como narração em lote.
- Use intervalo baixo (de 0 a 1 s) quando as legendas devem acompanhar uma fala contínua.
- Revise o resultado no seu editor de vídeo e ajuste os tempos se necessário.
- Salve o roteiro original, porque a ferramenta não guarda o texto colado.
- Teste mudanças na lógica de conversão.