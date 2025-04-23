# Pagamentos - Bot Verificador de Compras - CENTRAL CART

Bot de Discord desenvolvido para verificar e gerenciar compras realizadas através da plataforma CentralCart. Este sistema facilita a administração e suporte ao cliente, permitindo aos administradores consultar rapidamente os status de pagamentos e detalhes de compras feitas pelos usuários.

## Funcionalidades

- **Verificação de Compras**: Consulta de pedidos através do e-mail ou ID do Discord do cliente
- **Detalhes Completos**: Visualização de informações como status do pagamento, valor, método de pagamento e pacotes adquiridos
- **Acesso Rápido**: Links diretos para os pedidos na plataforma do CentralCart

## Screenshots

### Painel de Verificação
![Painel de Verificação](https://i.postimg.cc/9fb2KVd4/Screenshot-1.png)

### Modal de Busca
![Modal de Busca](https://i.postimg.cc/tTmjR5mp/Screenshot-2.png)

### Exibição de Compra
![Exibição de Compra](https://i.postimg.cc/J4nZ6cXm/Screenshot-4.png)

### Detalhes
![Múltiplas Compras](https://i.postimg.cc/SR2pnMw8/Screenshot-3.png)

## Comandos do Bot

- `/verificar-compra` - Abre um modal para buscar compras por e-mail ou ID do Discord
- `/painel` - Cria um painel interativo de verificação no canal atual
- `/buscar-por-email` - Busca compras diretamente pelo e-mail do cliente
- `/buscar-por-discord` - Busca compras diretamente pelo ID do Discord do cliente

## Tecnologias Utilizadas

- **Javascript** -
- **Discord.js** - Framework para interação com a API do Discord
- **API CentralCart** - Integração com a plataforma de pagamentos

## Como Usar

1. Configure as variáveis de ambiente em um arquivo `.env`:
   - `DISCORD_TOKEN` - Token do bot do Discord
   - `CENTRALCART_API_KEY` - Chave de API da plataforma CentralCart
   - `CENTRALCART_BASE_URL` - URL base para os pedidos (ex: 'https://flow.centralcart.com.br/order/')

2. Instale as dependências:
   ```
   npm install
   ```

3. Inicie o bot:
   ```
   npm start
   ```

## Segurança

O bot utiliza comunicação com a API da CentralCart através de requisições autenticadas, garantindo que apenas pessoal autorizado tenha acesso às informações dos pedidos. As informações sensíveis como tokens e URLs são armazenadas em variáveis de ambiente para melhor segurança.


## Desenvolvido Por:

Desenvolvido por Miguel França Alves, com a intenção de facilitar o processo de verificação de compras e agilizar o atendimento ao cliente, proporcionando uma ferramenta eficiente para uma equipe de suporte!
