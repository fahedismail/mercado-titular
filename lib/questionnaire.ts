export type QuestionType = "text" | "textarea" | "select" | "multiselect" | "url" | "image";
export type Question = { id: string; label: string; type: QuestionType; required?: boolean; options?: string[]; placeholder?: string; help?: string };
export type Section = { id: string; title: string; description: string; questions: Question[] };

export const sections: Section[] = [
  { id: "business", title: "Dados do negócio", description: "Informações básicas sobre o mercado/estabelecimento.", questions: [
    { id: "businessName", label: "Nome do estabelecimento", type: "text", required: true },
    { id: "ownerName", label: "Nome do proprietário", type: "text", required: true },
    { id: "businessType", label: "Tipo de negócio", type: "multiselect", required: true, options: ["Supermercado", "Churrascaria", "Bar", "Lanchonete", "Restaurante", "Delivery", "Padaria", "Açougue"] },
    { id: "city", label: "Cidade e bairro", type: "text", required: true },
    { id: "address", label: "Endereço completo", type: "text" },
    { id: "phone", label: "Telefone / WhatsApp", type: "text", required: true },
    { id: "openHours", label: "Horário de funcionamento", type: "text", required: true }
  ]},
  { id: "story", title: "História do negócio", description: "Conte a história para criar uma identidade autêntica.", questions: [
    { id: "story", label: "Conte a história do negócio (como começou, há quanto tempo existe)", type: "textarea", required: true },
    { id: "whyStarted", label: "Por que abriu este negócio?", type: "textarea", required: true },
    { id: "highlights", label: "O que torna seu estabelecimento especial?", type: "textarea", required: true },
    { id: "remembered", label: "Como deseja ser lembrado pelos clientes?", type: "textarea", required: true }
  ]},
  { id: "goals", title: "Objetivos", description: "O que o projeto deve alcançar.", questions: [
    { id: "mainGoals", label: "Objetivos principais", type: "multiselect", required: true, options: ["Atrair mais clientes", "Aumentar vendas", "Criar presença online", "Delivery/pedidos online", "Fortalecer a marca", "Fidelizar clientes", "Expandir para novos públicos", "Abrir filial"] },
    { id: "sixMonths", label: "Onde deseja estar em 6 meses?", type: "textarea", required: true },
    { id: "projectSuccess", label: "Como saberemos que este projeto deu certo?", type: "textarea", required: true }
  ]},
  { id: "audience", title: "Público-alvo", description: "Quem são seus clientes.", questions: [
    { id: "idealClient", label: "Descreva seu cliente ideal (idade, perfil, hábitos)", type: "textarea", required: true },
    { id: "clientNeeds", label: "O que seus clientes mais procuram?", type: "multiselect", required: true, options: ["Preço bom", "Qualidade", "Rapidez", "Variedade", "Atendimento", "Ambiente agradável", "Delivery rápido", "Promoções"] },
    { id: "peakTimes", label: "Quais são os horários de pico?", type: "textarea", required: true },
    { id: "notAudience", label: "Existe algum público que não deseja priorizar?", type: "textarea" }
  ]},
  { id: "positioning", title: "Posicionamento", description: "Como a marca deve ser percebida.", questions: [
    { id: "perception", label: "Escolha as características desejadas para a marca", type: "multiselect", required: true, options: ["Popular", "Premium", "Familiar", "Moderna", "Tradicional", "Acolhedora", "Rápida", "Confiável", "Inovadora", "Econômica"] },
    { id: "differentials", label: "Quais são seus principais diferenciais?", type: "textarea", required: true },
    { id: "competitors", label: "Quem são seus concorrentes na região?", type: "textarea", required: true },
    { id: "brandPhrase", label: "Complete: Quero que meus clientes pensem...", type: "textarea", required: true }
  ]},
  { id: "visual", title: "Identidade visual", description: "Preferências de cores, estilos e aparência.", questions: [
    { id: "hasLogo", label: "Já tem logo?", type: "select", required: true, options: ["Sim, e gosto", "Sim, mas quero mudar", "Não tenho"] },
    { id: "likedColors", label: "Cores que você gosta para a marca", type: "text", required: true },
    { id: "dislikedColors", label: "Cores que não deseja usar", type: "text" },
    { id: "visualStyles", label: "Estilos que combinam com o negócio", type: "multiselect", required: true, options: ["Rústico", "Moderno", "Colorido", "Clean", "Industrial", "Artesanal", "Sofisticado", "Popular", "Retrô", "Neutro"] },
    { id: "avoid", label: "O que a identidade nunca deve parecer?", type: "textarea" },
    { id: "logoImage", label: "Envie sua logo atual (se tiver)", type: "image" },
    { id: "styleImage", label: "Envie uma imagem que represente o estilo desejado", type: "image" }
  ]},
  { id: "products", title: "Produtos e cardápio", description: "O que você vende e oferece.", questions: [
    { id: "mainProducts", label: "Principais produtos/pratos que vende", type: "textarea", required: true, placeholder: "Ex.: Picanha, hambúrguer artesanal, cervejas artesanais..." },
    { id: "bestSellers", label: "Produtos mais vendidos (carro-chefe)", type: "textarea", required: true },
    { id: "hasMenu", label: "Já tem cardápio organizado?", type: "select", required: true, options: ["Sim, digital", "Sim, impresso", "Não, preciso criar"] },
    { id: "priceRange", label: "Faixa de preço média", type: "text", required: true, placeholder: "Ex.: R$15 - R$60" },
    { id: "menuImage", label: "Envie foto do cardápio atual (se tiver)", type: "image" }
  ]},
  { id: "digital", title: "Presença digital atual", description: "O que já tem online.", questions: [
    { id: "hasInstagram", label: "Tem Instagram?", type: "select", required: true, options: ["Sim, ativo", "Sim, mas parado", "Não"] },
    { id: "instagramLink", label: "Link do Instagram (se tiver)", type: "url" },
    { id: "hasFacebook", label: "Tem Facebook?", type: "select", options: ["Sim, ativo", "Sim, mas parado", "Não"] },
    { id: "hasWhatsapp", label: "Usa WhatsApp Business?", type: "select", required: true, options: ["Sim", "Não, mas quero", "Não"] },
    { id: "hasSite", label: "Tem site?", type: "select", required: true, options: ["Sim", "Não, mas quero", "Não preciso agora"] },
    { id: "deliveryPlatforms", label: "Plataformas de delivery que usa", type: "multiselect", options: ["iFood", "Rappi", "99Food", "Uber Eats", "Delivery próprio", "Nenhum"] }
  ]},
  { id: "content", title: "Conteúdo e redes sociais", description: "Estratégia de conteúdo desejada.", questions: [
    { id: "networks", label: "Redes que pretende usar ativamente", type: "multiselect", required: true, options: ["Instagram", "Facebook", "WhatsApp", "TikTok", "YouTube", "Google Meu Negócio"] },
    { id: "contentTypes", label: "Tipos de conteúdo que deseja publicar", type: "multiselect", required: true, options: ["Fotos de pratos/produtos", "Promoções", "Stories do dia a dia", "Reels/Vídeos curtos", "Cardápio digital", "Depoimentos de clientes", "Bastidores", "Novidades"] },
    { id: "postFrequency", label: "Quantas vezes por semana pretende postar?", type: "select", required: true, options: ["Todo dia", "3-5x por semana", "1-2x por semana", "Não sei ainda"] },
    { id: "whoManages", label: "Quem vai gerenciar as redes?", type: "select", required: true, options: ["Eu mesmo", "Um funcionário", "Vamos contratar alguém", "A equipe do projeto"] }
  ]},
  { id: "website", title: "Site e funcionalidades", description: "O que o site deve ter.", questions: [
    { id: "siteFeatures", label: "Funcionalidades desejadas no site", type: "multiselect", required: true, options: ["Página inicial", "Cardápio online", "Pedidos/Delivery", "WhatsApp direto", "Galeria de fotos", "Sobre nós", "Localização/mapa", "Promoções", "Depoimentos", "Reservas"] },
    { id: "siteStyle", label: "Que tipo de site deseja?", type: "select", required: true, options: ["Simples e direto (1 página)", "Completo com várias seções", "Com sistema de pedidos", "Landing page para promoções"] },
    { id: "siteMessage", label: "Qual mensagem principal o site deve transmitir?", type: "textarea", required: true }
  ]},
  { id: "whatsapp", title: "WhatsApp e pedidos", description: "Estratégia de WhatsApp e delivery.", questions: [
    { id: "whatsappGoals", label: "O que deseja fazer pelo WhatsApp?", type: "multiselect", required: true, options: ["Receber pedidos", "Enviar promoções", "Atendimento ao cliente", "Cardápio digital", "Lista de transmissão", "Status/Stories", "Catálogo de produtos"] },
    { id: "orderSystem", label: "Como recebe pedidos atualmente?", type: "textarea", required: true },
    { id: "deliveryArea", label: "Área de entrega (bairros/raio)", type: "textarea" },
    { id: "deliveryFee", label: "Cobra taxa de entrega?", type: "text", placeholder: "Ex.: Grátis acima de R$50, ou R$5 fixo" }
  ]},
  { id: "produtos_mercado", title: "Produtos do mercado", description: "Detalhes sobre marcas e setores do mercado.", questions: [
    { id: "marcasVende", label: "Quais marcas vende?", type: "textarea", required: true, placeholder: "Liste as principais marcas que comercializa" },
    { id: "bebidasMercado", label: "Quais bebidas vende?", type: "textarea", required: true, placeholder: "Cervejas, refrigerantes, sucos, água..." },
    { id: "acougue", label: "Tem açougue? Descreva o que oferece", type: "textarea", placeholder: "Tipos de corte, carnes especiais..." },
    { id: "padaria", label: "Tem padaria? Descreva o que oferece", type: "textarea", placeholder: "Pães, bolos, salgados..." },
    { id: "hortifruti", label: "Tem hortifruti? Descreva", type: "textarea", placeholder: "Frutas, verduras, legumes..." },
    { id: "frios", label: "Tem seção de frios? Descreva", type: "textarea", placeholder: "Frios, queijos, embutidos..." }
  ]},
  { id: "lanchonete", title: "Lanchonete", description: "Detalhes sobre a lanchonete do estabelecimento.", questions: [
    { id: "quaisLanches", label: "Quais lanches oferece?", type: "textarea", required: true, placeholder: "Hambúrguer, hot dog, sanduíches..." },
    { id: "bebidasLanchonete", label: "Quais bebidas na lanchonete?", type: "textarea", placeholder: "Sucos, refrigerantes, milkshake..." },
    { id: "porcoes", label: "Quais porções oferece?", type: "textarea", placeholder: "Batata frita, mandioca, frango..." },
    { id: "fotosLanches", label: "Envie fotos dos lanches/porções", type: "image" }
  ]},
  { id: "domingo_frango", title: "Domingo — Frango assado", description: "Detalhes sobre o frango de domingo (diferencial).", questions: [
    { id: "quantosFrangos", label: "Quantos frangos vende por domingo?", type: "text", required: true, placeholder: "Ex.: 50, 100..." },
    { id: "fazReserva", label: "Faz reserva de frango?", type: "select", required: true, options: ["Sim", "Não", "Às vezes"] },
    { id: "acabaRapido", label: "Acaba rápido?", type: "select", required: true, options: ["Sim, sempre esgota", "Às vezes", "Não"] },
    { id: "horarioFrango", label: "Qual horário fica pronto / vende?", type: "text", required: true, placeholder: "Ex.: a partir das 11h" }
  ]},
  { id: "turismo", title: "Turismo local", description: "Detalhes sobre o turismo na região (potencial para atrair turistas).", questions: [
    { id: "qualTurismo", label: "Qual tipo de turismo tem na região?", type: "multiselect", required: true, options: ["Rio", "Pesca", "Camping", "Praia", "Pousadas", "Cachoeira", "Trilhas", "Outro"] },
    { id: "turismoDescricao", label: "Descreva o turismo local e como pode atrair turistas", type: "textarea", required: true, placeholder: "Conte sobre os pontos turísticos e como seu mercado pode se beneficiar" },
    { id: "turismoPousadas", label: "Há pousadas ou hotéis próximos?", type: "textarea", placeholder: "Nomes ou quantidade aproximada" }
  ]},
  { id: "fotos_estabelecimento", title: "Fotos do estabelecimento", description: "Envie fotos atuais do seu negócio.", questions: [
    { id: "fotoFachada", label: "Foto da fachada", type: "image", required: true },
    { id: "fotoInterior", label: "Foto do interior", type: "image", required: true },
    { id: "fotoLanches", label: "Foto dos lanches", type: "image" },
    { id: "fotoMercado", label: "Foto do mercado (prateleiras/corredores)", type: "image" },
    { id: "fotoFuncionarios", label: "Foto dos funcionários / equipe", type: "image" }
  ]}
];

export const requiredQuestionIds = sections.flatMap(s => s.questions.filter(q => q.required).map(q => q.id));
export const questionById = Object.fromEntries(sections.flatMap(s => s.questions.map(q => [q.id, q])));
