# Poll-app

O Poll-app é uma aplicação feita para você fazer suas anotações, você também pode criar e fazer votos em uma enquete sem precisar de login!

## Funcionalidades 🔧

- Criação de notas/enquetes
- Deleção de notas/enquetes
- Barra de pesquisa (para notas/enquetes)
- Autenticação por cookie após voto (para o voto da enquete não ser duplicado/manipulado)
- Botão para criar nota/enquete por voz
- Botão para criar titulo/opção da enquete por voz
- Botão para fazer voto por voz
- Botão para trocar voto
- Resultado da enquete após voto
- Aplicação responsiva

## Tecnologias(libs) usadas ⚡️

- ViteJS
- TypeScript
- Axios
- React
- Radix UI
- Lucide React
- Date-fns
- Speech Recognition
- Tailwind CSS

A aplicação não está online para testes, então para fazer os testes você vai precisar instalar localmente no seu computador.

## Instalação 💡

Crie uma pasta para clonar o projeto e siga os seguintes passos.

Dentro da pasta que você criou, você vai abrir o seu prompt de comando e escolher qual método de clonagem que você irá utilizar:

```
// Método HTTPS

$ git clone https://github.com/shuharib0t/poll-app.git
$ npm install
$ npm run dev

ou

// Método SSH

$ git clone git@github.com:shuharib0t/poll-app.git
$ npm install
$ npm run dev
```

## IMPORTANTE

Para fazer os testes da aplicação no seu computador você vai precisar baixar a [API](https://github.com/shuharib0t/poll-app-api) do poll-app e também fazer uma simples configuração no front-end:

## Observações

Estou hospedando o servidor utilizando o plano gratuito então pode ter alguns 'bugs' de funcionalidades. Vou utilizar como exemplo a criação de notas/enquetes, apesar de eu colocar um timeout de 1s para chamar a nova nota/enquete que o usuário criou, o servidor pode acabar tendo um pico de lag e não vai aparecer a nota/enquete que o usuário criou, então nesse caso o usuário vai precisar dar um F5(Atualizar a página) para que a sua nota/enquete apareça. Lembrando que isso é totalmente culpa do servidor gratuito e não da aplicação.

Tenha paciência, as vezes a IA de reconhecimento de fala não detecta o que você diz perfeitamente, você pode corrigir isso repetindo a palavra/frase que você deseja novamente, recomendo você verificar a configuração do seu microfone antes de utilizar esse método.

Feito por [shuharib0t](https://www.linkedin.com/in/julio-ishikawa-449417213/) 👋.
