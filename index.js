import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, 
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, 
  TextInputBuilder, TextInputStyle, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName('verificar-compra')
    .setDescription('Verifica o status de uma compra pelo e-mail ou Discord ID'),
  
  new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Mostra o painel de verificação de compras'),
    
  new SlashCommandBuilder()
    .setName('buscar-por-email')
    .setDescription('Busca compras pelo e-mail do cliente')
    .addStringOption(option => 
      option.setName('email')
        .setDescription('E-mail do cliente')
        .setRequired(true)),
        
  new SlashCommandBuilder()
    .setName('buscar-por-discord')
    .setDescription('Busca compras pelo Discord ID do cliente')
    .addStringOption(option => 
      option.setName('discord_id')
        .setDescription('ID do Discord do cliente')
        .setRequired(true))
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

async function buscarComprasPorDiscordId(discordId) {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CENTRALCART_API_KEY}`
      }
    };

    const response = await fetch(`https://api.centralcart.com.br/v1/app/order?q=${encodeURIComponent(discordId)}`, options);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Resposta da API para busca por Discord ID:', JSON.stringify(data, null, 2));
    
    if (data && data.errors) {
      throw new Error(data.errors[0]?.message || 'Erro desconhecido na API');
    }
    
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      if (data.internal_id) {
        return [data];
      }
      if (data.orders && Array.isArray(data.orders)) {
        return data.orders;
      }
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
    }
    
    console.error('Formato de resposta não reconhecido:', data);
    return [];
  } catch (error) {
    console.error('Erro ao buscar compras por Discord ID:', error);
    throw error;
  }
}

async function buscarCompraPorId(orderId) {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CENTRALCART_API_KEY}`
      }
    };

    const response = await fetch(`https://api.centralcart.com.br/v1/app/order/${orderId}`, options);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar compra por ID:', error);
    throw error;
  }
}

async function verificarCompra(orderId) {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CENTRALCART_API_KEY}`
      }
    };

    const response = await fetch(`https://api.centralcart.com.br/v1/app/order/${orderId}`, options);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao verificar compra:', error);
    throw error;
  }
}

async function buscarComprasPorEmail(email) {
  try {
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.CENTRALCART_API_KEY}`
      }
    };

    const response = await fetch(`https://api.centralcart.com.br/v1/app/order?email=${encodeURIComponent(email)}`, options);
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Resposta da API para busca por e-mail:', JSON.stringify(data, null, 2));
    
    if (data && data.errors) {
      throw new Error(data.errors[0]?.message || 'Erro desconhecido na API');
    }
    
    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object') {
      if (data.internal_id) {
        return [data];
      }
      if (data.orders && Array.isArray(data.orders)) {
        return data.orders;
      }
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
    }
    
    console.error('Formato de resposta não reconhecido:', data);
    return [];
  } catch (error) {
    console.error('Erro ao buscar compras por e-mail:', error);
    throw error;
  }
}

function formatarResposta(data) {
  console.log('Dados do pedido para formatação:', JSON.stringify(data, null, 2));
  
  let pacotes = 'Nenhum pacote encontrado';
  if (data.packages && Array.isArray(data.packages) && data.packages.length > 0) {
    pacotes = data.packages.map(pkg => {
      const nome = pkg.name || 'Pacote sem nome';
      const tipo = pkg.meta?.type || 'Tipo não especificado';
      const preco = pkg.price_display || `${pkg.price || 0}`;
      return `- **${nome}** (${tipo}) - ${preco}`;
    }).join('\n');
  }

  const internal_id = data.internal_id || 'ID não disponível';
  const status_display = data.status_display || data.status || 'Status desconhecido';
  const client_name = data.client_name || 'Cliente não identificado';
  const client_email = data.client_email || 'E-mail não disponível';
  const price_display = data.price_display || `${data.price || 0}`;
  const gateway_display = data.gateway_display || data.gateway || 'Método não especificado';
  const created_at = data.created_at ? new Date(data.created_at).toLocaleString('pt-BR') : 'Data não disponível';
  
  let color = 0x2e2e2e; 
  if (data.status === 'APPROVED') {
    color = 0x00FF00; 
  } else if (data.status === 'PENDING') {
    color = 0xFFAA00; 
  } else if (data.status === 'REJECTED' || data.status === 'CANCELED' || data.status === 'EXPIRED' || data.status === 'REFUNDED' || data.status === 'CHARGEDBACK') {
    color = 0xFF0000; 
  }

  return {
    title: `Pedido #${internal_id}`,
    description: `**Status:** ${status_display}\n**Cliente:** ${client_name}\n**Email:** ${client_email}\n**Valor:** ${price_display}\n**Método de Pagamento:** ${gateway_display}\n\n**Pacotes:**\n${pacotes}`,
    color: color,
    footer: `Data da compra: ${created_at}`
  };
}

function criarModalBuscaPedido() {
  const modal = new ModalBuilder()
    .setCustomId('modal_busca_pedido')
    .setTitle('Verificar Compras');

  const emailInput = new TextInputBuilder()
    .setCustomId('email_input')
    .setLabel('E-mail do cliente')
    .setPlaceholder('exemplo@email.com')
    .setRequired(false)
    .setStyle(TextInputStyle.Short);

  const discordIdInput = new TextInputBuilder()
    .setCustomId('discord_id_input')
    .setLabel('Discord ID do cliente')
    .setPlaceholder('Digite o ID do Discord (apenas números)')
    .setRequired(false)
    .setStyle(TextInputStyle.Short);

  const emailRow = new ActionRowBuilder().addComponents(emailInput);
  const discordIdRow = new ActionRowBuilder().addComponents(discordIdInput);
  
  modal.addComponents(emailRow, discordIdRow);

  return modal;
}

function criarPainelVerificacao() {
  const embed = new EmbedBuilder()
    .setTitle('Verificador de Compras - Flow')
    .setDescription('Clique no botão abaixo para verificar o status de uma compra usando o e-mail ou Discord ID do cliente.')
    .setColor(0x2e2e2e);

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('verificar_compra_btn')
        .setLabel('Verificar Compra')
        .setStyle(ButtonStyle.Primary)
    );

  return { embeds: [embed], components: [row] };
}

function criarSelectMenuCompras(compras) {
  if (!Array.isArray(compras) || compras.length === 0) {
    console.error('compras não é um array válido ou está vazio');
    return new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_compra_vazio')
          .setPlaceholder('Nenhuma compra disponível')
          .addOptions([
            {
              label: 'Nenhuma compra encontrada',
              description: 'Não há compras para mostrar',
              value: 'none'
            }
          ])
          .setDisabled(true)
      );
  }

  const options = compras.map((compra, index) => {
    const internal_id = compra.internal_id || `pedido_${index}`;
    const status_display = compra.status_display || compra.status || 'Status desconhecido';
    const price_display = compra.price_display || `${compra.price || 0}`;
    
    return {
      label: `Pedido #${internal_id.substring(0, 8)}...`,
      description: `${status_display} - ${price_display}`,
      value: internal_id
    };
  });

  const row = new ActionRowBuilder()
    .addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select_compra')
        .setPlaceholder('Selecione uma compra para ver os detalhes')
        .addOptions(options)
    );

  return row;
}

function criarBotaoLinkPedido(internalId) {
  if (!internalId || internalId === 'ID não disponível') {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('sem_link_pedido')
          .setLabel('Link indisponível')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
  }

  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('mostrar_link_pedido')
        .setLabel('Pedido')
        .setStyle(ButtonStyle.Primary)
    );
}

function exibirLinkPedido(interaction, internalId) {
  const baseUrl = process.env.CENTRALCART_BASE_URL || 'https://centralcart.com.br/';
  const linkPedido = `${baseUrl}${internalId}`;
  
  interaction.reply({
    content: `Acesse o pedido através do link: ${linkPedido}\n\nVocê também pode acessar copiando o ID \`${internalId}\` e adicionando após \`${baseUrl}\``,
    ephemeral: true
  });
}

client.once('ready', async () => {
  try {
    console.log(`Bot conectado como ${client.user.tag}!`);
    
    console.log('Registrando comandos slash...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('Comandos slash registrados com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar comandos:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    if (interaction.commandName === 'verificar-compra') {
      interaction.showModal(criarModalBuscaPedido());
    } 
    else if (interaction.commandName === 'painel') {
      await interaction.deferReply({ ephemeral: true });
      
      const painelMsg = criarPainelVerificacao();
      
      await interaction.channel.send(painelMsg);
      
      await interaction.editReply({ 
        content: 'Painel enviado com sucesso!',
        ephemeral: true
      });
    }
    else if (interaction.commandName === 'buscar-por-email') {
      await interaction.deferReply({ ephemeral: true });
      
      try {
        const email = interaction.options.getString('email');
        console.log(`Buscando compras para o email: ${email}`);
        
        let compras = [];
        try {
          compras = await buscarComprasPorEmail(email);
          console.log(`Encontradas ${compras.length} compras para o email ${email}`);
        } catch (apiError) {
          console.error('Erro ao chamar a API:', apiError);
          await interaction.editReply({
            content: `Erro ao buscar compras: ${apiError.message}`,
            ephemeral: true
          });
          return;
        }
        
        if (!compras || compras.length === 0) {
          await interaction.editReply({
            content: `Não encontramos compras associadas ao e-mail ${email}. Verifique se o e-mail está correto ou se o cliente já realizou alguma compra.`,
            ephemeral: true
          });
          return;
        }
        
        if (compras.length === 1) {
          try {
            const data = compras[0];
            const resposta = formatarResposta(data);
            
            const embed = new EmbedBuilder()
              .setTitle(resposta.title)
              .setDescription(resposta.description)
              .setColor(resposta.color)
              .setFooter({ text: resposta.footer });
            
            const botaoLinkPedido = criarBotaoLinkPedido(data.internal_id);
            
            await interaction.editReply({
              embeds: [embed],
              components: [botaoLinkPedido]
            });
          } catch (formatError) {
            console.error('Erro ao formatar resposta:', formatError);
            await interaction.editReply({
              content: `Encontramos o pedido, mas houve um erro ao exibir os detalhes: ${formatError.message}`,
              ephemeral: true
            });
          }
        } else {
          try {
            const embed = new EmbedBuilder()
              .setTitle('Compras Encontradas')
              .setDescription(`Foram encontradas ${compras.length} compras para o e-mail: ${email}`)
              .setColor(0x2e2e2e);
            
            const selectMenu = criarSelectMenuCompras(compras);
            
            await interaction.editReply({
              embeds: [embed],
              components: [selectMenu],
              ephemeral: true
            });
          } catch (menuError) {
            console.error('Erro ao criar menu de seleção:', menuError);
            await interaction.editReply({
              content: `Encontramos ${compras.length} pedidos, mas houve um erro ao criar o menu de seleção: ${menuError.message}`,
              ephemeral: true
            });
          }
        }
      } catch (error) {
        console.error('Erro geral na busca por email:', error);
        await interaction.editReply({
          content: `Erro ao buscar compras por e-mail: ${error.message}`,
          ephemeral: true
        });
      }
    }
    else if (interaction.commandName === 'buscar-por-discord') {
      await interaction.deferReply({ ephemeral: true });
      
      try {
        const discordId = interaction.options.getString('discord_id');
        console.log(`Buscando compras para o Discord ID: ${discordId}`);
        
        let compras = [];
        try {
          compras = await buscarComprasPorDiscordId(discordId);
          console.log(`Encontradas ${compras.length} compras para o Discord ID ${discordId}`);
        } catch (apiError) {
          console.error('Erro ao chamar a API:', apiError);
          await interaction.editReply({
            content: `Erro ao buscar compras: ${apiError.message}`,
            ephemeral: true
          });
          return;
        }
        
        if (!compras || compras.length === 0) {
          await interaction.editReply({
            content: `Não encontramos compras associadas ao Discord ID ${discordId}. Verifique se o Discord ID está correto ou se o cliente já realizou alguma compra.`,
            ephemeral: true
          });
          return;
        }
        
        if (compras.length === 1) {
          try {
            const data = compras[0];
            const resposta = formatarResposta(data);
            
            const embed = new EmbedBuilder()
              .setTitle(resposta.title)
              .setDescription(resposta.description)
              .setColor(resposta.color)
              .setFooter({ text: resposta.footer });
            
            const botaoLinkPedido = criarBotaoLinkPedido(data.internal_id);
            
            await interaction.editReply({
              embeds: [embed],
              components: [botaoLinkPedido]
            });
          } catch (formatError) {
            console.error('Erro ao formatar resposta:', formatError);
            await interaction.editReply({
              content: `Encontramos o pedido, mas houve um erro ao exibir os detalhes: ${formatError.message}`,
              ephemeral: true
            });
          }
        } else {
          try {
            const embed = new EmbedBuilder()
              .setTitle('Compras Encontradas')
              .setDescription(`Foram encontradas ${compras.length} compras para o Discord ID: ${discordId}`)
              .setColor(0x2e2e2e);
            
            const selectMenu = criarSelectMenuCompras(compras);
            
            await interaction.editReply({
              embeds: [embed],
              components: [selectMenu],
              ephemeral: true
            });
          } catch (menuError) {
            console.error('Erro ao criar menu de seleção:', menuError);
            await interaction.editReply({
              content: `Encontramos ${compras.length} pedidos, mas houve um erro ao criar o menu de seleção: ${menuError.message}`,
              ephemeral: true
            });
          }
        }
      } catch (error) {
        console.error('Erro ao processar busca por Discord ID:', error);
        await interaction.editReply({
          content: `Erro ao buscar compras por Discord ID: ${error.message}`,
          ephemeral: true
        });
      }
    }
  }
  
  else if (interaction.isButton()) {
    if (interaction.customId === 'verificar_compra_btn') {
      interaction.showModal(criarModalBuscaPedido());
    }
    else if (interaction.customId === 'mostrar_link_pedido') {
      try {
        const embed = interaction.message.embeds[0];
        const titulo = embed.title || '';
        const match = titulo.match(/Pedido #([^#\s]+)/);
        
        if (match && match[1]) {
          const pedidoId = match[1];
          exibirLinkPedido(interaction, pedidoId);
        } else {
          interaction.reply({
            content: 'Não foi possível identificar o ID do pedido.',
            ephemeral: true
          });
        }
      } catch (error) {
        console.error('Erro ao processar clique no botão de pedido:', error);
        interaction.reply({
          content: `Erro ao processar: ${error.message}`,
          ephemeral: true
        });
      }
    }
  }
  
  else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'modal_busca_pedido') {
      await interaction.deferReply({ ephemeral: true });
      
      try {
        const email = interaction.fields.getTextInputValue('email_input');
        const discordId = interaction.fields.getTextInputValue('discord_id_input');
        
        if ((!email || email.trim() === '') && (!discordId || discordId.trim() === '')) {
          await interaction.editReply({
            content: 'Por favor, forneça um e-mail ou um Discord ID válido.',
            ephemeral: true
          });
          return;
        }
        
        console.log(`Buscando compras para o e-mail: ${email || 'não fornecido'} e Discord ID: ${discordId || 'não fornecido'}`);
        
        let compras = [];
        try {
          if (email && email.trim() !== '') {
            compras = await buscarComprasPorEmail(email.trim());
            console.log(`Encontradas ${compras.length} compras para o e-mail ${email.trim()}`);
          } else if (discordId && discordId.trim() !== '') {
            compras = await buscarComprasPorDiscordId(discordId.trim());
            console.log(`Encontradas ${compras.length} compras para o Discord ID ${discordId.trim()}`);
          }
        } catch (apiError) {
          console.error('Erro ao chamar a API:', apiError);
          await interaction.editReply({
            content: `Erro ao buscar compras: ${apiError.message}`,
            ephemeral: true
          });
          return;
        }
        
        if (!compras || compras.length === 0) {
          const tipoConsulta = email && email.trim() !== '' ? `e-mail ${email.trim()}` : `Discord ID ${discordId.trim()}`;
          await interaction.editReply({
            content: `Não encontramos compras associadas ao ${tipoConsulta}. Verifique se as informações estão corretas ou se o cliente já realizou alguma compra.`,
            ephemeral: true
          });
          return;
        }
        
        if (compras.length === 1) {
          try {
            const data = compras[0];
            const resposta = formatarResposta(data);
            
            const embed = new EmbedBuilder()
              .setTitle(resposta.title)
              .setDescription(resposta.description)
              .setColor(resposta.color)
              .setFooter({ text: resposta.footer });
            
            const botaoLinkPedido = criarBotaoLinkPedido(data.internal_id);
            
            await interaction.editReply({
              embeds: [embed],
              components: [botaoLinkPedido]
            });
          } catch (formatError) {
            console.error('Erro ao formatar resposta:', formatError);
            await interaction.editReply({
              content: `Encontramos o pedido, mas houve um erro ao exibir os detalhes: ${formatError.message}`,
              ephemeral: true
            });
          }
        } else {
          try {
            const tipoConsulta = email && email.trim() !== '' ? `e-mail: ${email.trim()}` : `Discord ID: ${discordId.trim()}`;
            const embed = new EmbedBuilder()
              .setTitle('Compras Encontradas')
              .setDescription(`Foram encontradas ${compras.length} compras para o ${tipoConsulta}`)
              .setColor(0x2e2e2e);
            
            const selectMenu = criarSelectMenuCompras(compras);
            
            await interaction.editReply({
              embeds: [embed],
              components: [selectMenu],
              ephemeral: true
            });
          } catch (menuError) {
            console.error('Erro ao criar menu de seleção:', menuError);
            await interaction.editReply({
              content: `Encontramos ${compras.length} pedidos, mas houve um erro ao criar o menu de seleção: ${menuError.message}`,
              ephemeral: true
            });
          }
        }
      } catch (error) {
        console.error('Erro ao processar modal:', error);
        await interaction.editReply({
          content: `Erro ao processar a solicitação: ${error.message}`,
          ephemeral: true
        });
      }
    }
  }
  
  else if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'select_compra') {
      await interaction.deferUpdate();
      
      try {
        const orderId = interaction.values[0];
        const data = await verificarCompra(orderId);
        const resposta = formatarResposta(data);
        
        const embed = new EmbedBuilder()
          .setTitle(resposta.title)
          .setDescription(resposta.description)
          .setColor(resposta.color)
          .setFooter({ text: resposta.footer });
        
        const botaoLinkPedido = criarBotaoLinkPedido(data.internal_id);
        
        await interaction.editReply({
          embeds: [embed],
          components: [botaoLinkPedido]
        });
      } catch (error) {
        await interaction.editReply({
          content: `Erro ao verificar o pedido: ${error.message}`,
          components: []
        });
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);