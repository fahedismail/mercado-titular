export type RefQuestionType = "text" | "textarea" | "multiselect" | "url" | "multi-url" | "image" | "rating" | "repeater";

export type RefQuestion = {
  id: string;
  label: string;
  type: RefQuestionType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
  initialCount?: number;
  repeaterFields?: { id: string; label: string; type: "text" | "url"; placeholder?: string }[];
};

export type RefSection = {
  id: string;
  title: string;
  description: string;
  questions: RefQuestion[];
};

export const referenceSections: RefSection[] = [
  {
    id: "instagram",
    title: "1. Instagram",
    description: "Perfis de mercados, restaurantes, bares ou lanchonetes que admira.",
    questions: [
      { id: "ref_ig_link1", label: "Perfil 1 — Link do Instagram", type: "url", placeholder: "https://instagram.com/..." },
      { id: "ref_ig_name1", label: "Perfil 1 — Nome do estabelecimento", type: "text" },
      { id: "ref_ig_type1", label: "Perfil 1 — Tipo (bar, mercado, lanchonete...)", type: "text" },
      { id: "ref_ig_link2", label: "Perfil 2 — Link do Instagram", type: "url", placeholder: "https://instagram.com/..." },
      { id: "ref_ig_name2", label: "Perfil 2 — Nome do estabelecimento", type: "text" },
      { id: "ref_ig_type2", label: "Perfil 2 — Tipo (bar, mercado, lanchonete...)", type: "text" },
      { id: "ref_ig_link3", label: "Perfil 3 — Link do Instagram", type: "url", placeholder: "https://instagram.com/..." },
      { id: "ref_ig_name3", label: "Perfil 3 — Nome do estabelecimento", type: "text" },
      { id: "ref_ig_type3", label: "Perfil 3 — Tipo (bar, mercado, lanchonete...)", type: "text" },
      {
        id: "ref_ig_attention",
        label: "O que chamou sua atenção?",
        type: "multiselect",
        required: true,
        options: [
          "Fotos dos pratos", "Cardápio visual", "Cores", "Logo", "Promoções",
          "Stories", "Reels", "Feed organizado", "Destaques", "Bio",
          "Linguagem", "Apetitoso", "Profissional", "Humanização", "Outro",
        ],
      },
      { id: "ref_ig_like", label: "O que você mais gosta?", type: "textarea", required: true },
      { id: "ref_ig_dislike", label: "O que você menos gosta?", type: "textarea" },
      { id: "ref_ig_similar", label: "O que você gostaria de ter parecido?", type: "textarea" },
      { id: "ref_ig_rating", label: "Dê uma nota", type: "rating" },
    ],
  },
  {
    id: "sites",
    title: "2. Sites",
    description: "Sites de restaurantes, mercados ou delivery que considera bons.",
    questions: [
      { id: "ref_site_links", label: "Links de sites", type: "multi-url", placeholder: "https://...", initialCount: 3 },
      { id: "ref_site_liked", label: "O que gostou?", type: "textarea", required: true },
      { id: "ref_site_disliked", label: "O que não gostou?", type: "textarea" },
      { id: "ref_site_copy", label: "O que copiaria?", type: "textarea" },
      { id: "ref_site_never", label: "O que jamais faria?", type: "textarea" },
    ],
  },
  {
    id: "logos",
    title: "3. Logos",
    description: "Logos de estabelecimentos que admira.",
    questions: [
      { id: "ref_logo_image", label: "Enviar imagem de logo", type: "image" },
      { id: "ref_logo_liked", label: "O que gostou?", type: "textarea", required: true },
      { id: "ref_logo_font", label: "Fonte?", type: "textarea" },
      { id: "ref_logo_symbol", label: "Símbolo?", type: "textarea" },
      {
        id: "ref_logo_style",
        label: "Estilo do logo",
        type: "multiselect",
        options: ["Minimalista", "Rústico", "Moderno", "Artesanal", "Colorido", "Retrô"],
      },
    ],
  },
  {
    id: "cores",
    title: "4. Cores",
    description: "Cores que combinam com o mercado/estabelecimento.",
    questions: [
      { id: "ref_color_image", label: "Enviar imagem de paleta", type: "image" },
      {
        id: "ref_color_attention",
        label: "Quais cores chamaram atenção?",
        type: "multiselect",
        required: true,
        options: ["Vermelho", "Amarelo", "Preto", "Branco", "Verde", "Laranja", "Marrom", "Dourado", "Azul", "Outra"],
      },
      { id: "ref_color_why", label: "Por quê?", type: "textarea", required: true },
    ],
  },
  {
    id: "fotografias",
    title: "5. Fotografias de comida",
    description: "Fotos de pratos, produtos ou ambientes que admira.",
    questions: [
      { id: "ref_photo_image1", label: "Enviar imagem 1", type: "image" },
      { id: "ref_photo_image2", label: "Enviar imagem 2", type: "image" },
      {
        id: "ref_photo_liked",
        label: "Gostou por causa de:",
        type: "multiselect",
        required: true,
        options: ["Iluminação", "Ângulo", "Apresentação do prato", "Fundo", "Cores", "Apetitoso", "Profissional", "Naturalidade", "Outro"],
      },
    ],
  },
  {
    id: "ambientes",
    title: "6. Ambientes e fachadas",
    description: "Fotos de fachadas, interiores de restaurantes ou mercados que admira.",
    questions: [
      { id: "ref_amb_image1", label: "Enviar foto 1", type: "image" },
      { id: "ref_amb_image2", label: "Enviar foto 2", type: "image" },
      {
        id: "ref_amb_liked",
        label: "Gostou de:",
        type: "multiselect",
        required: true,
        options: ["Fachada", "Letreiro", "Iluminação", "Mesas", "Balcão", "Decoração", "Organização", "Cores", "Madeira", "Industrial"],
      },
    ],
  },
  {
    id: "cardapios",
    title: "7. Cardápios e embalagens",
    description: "Referências de cardápios visuais e embalagens.",
    questions: [
      { id: "ref_menu_image1", label: "Enviar imagem 1", type: "image" },
      { id: "ref_menu_image2", label: "Enviar imagem 2", type: "image" },
      { id: "ref_menu_feeling", label: "O que mais gostou nesse cardápio/embalagem?", type: "textarea", required: true },
      {
        id: "ref_menu_style",
        label: "Estilo que combina",
        type: "multiselect",
        options: ["Simples", "Colorido", "Fotográfico", "Minimalista", "Rústico", "Premium"],
      },
    ],
  },
  {
    id: "tipografia",
    title: "8. Tipografia",
    description: "Fontes e letras que gosta.",
    questions: [
      { id: "ref_typo_image", label: "Enviar imagem", type: "image" },
      {
        id: "ref_typo_liked",
        label: "Gostou porque?",
        type: "multiselect",
        required: true,
        options: ["Moderna", "Rústica", "Negrito", "Minimalista", "Fácil leitura", "Artesanal"],
      },
    ],
  },
  {
    id: "videos",
    title: "9. Vídeos e Reels",
    description: "Vídeos de comida, bastidores ou marketing que admira.",
    questions: [
      { id: "ref_video_link", label: "Link do vídeo/Reel", type: "url", placeholder: "https://..." },
      { id: "ref_video_link2", label: "Link do vídeo/Reel 2 (opcional)", type: "url", placeholder: "https://..." },
      {
        id: "ref_video_liked",
        label: "Gostou de:",
        type: "multiselect",
        required: true,
        options: ["Edição", "Música", "Apresentação", "Bastidores", "Ritmo", "Conteúdo", "Promoção", "Humor"],
      },
    ],
  },
  {
    id: "publicidade",
    title: "10. Publicidade e promoções",
    description: "Artes, panfletos ou anúncios que chamaram sua atenção.",
    questions: [
      { id: "ref_ads_image1", label: "Enviar imagem 1", type: "image" },
      { id: "ref_ads_image2", label: "Enviar imagem 2", type: "image" },
      { id: "ref_ads_link", label: "Link de anúncio (opcional)", type: "url" },
      {
        id: "ref_ads_liked",
        label: "O que mais gostou?",
        type: "multiselect",
        required: true,
        options: ["Cores", "Texto", "Oferta", "Layout", "Foto", "Urgência", "Criatividade", "Simplicidade"],
      },
      { id: "ref_ads_why", label: "Por que funcionou pra você?", type: "textarea" },
    ],
  },
  {
    id: "whatsapp",
    title: "11. WhatsApp e delivery",
    description: "Referências de cardápios digitais, catálogos e atendimento por WhatsApp.",
    questions: [
      { id: "ref_wpp_image1", label: "Print de referência 1", type: "image" },
      { id: "ref_wpp_image2", label: "Print de referência 2", type: "image" },
      {
        id: "ref_wpp_liked",
        label: "O que gostou:",
        type: "multiselect",
        required: true,
        options: ["Organização", "Cardápio digital", "Atendimento rápido", "Catálogo", "Mensagens automáticas", "Visual bonito"],
      },
      { id: "ref_wpp_notes", label: "Alguma observação?", type: "textarea" },
    ],
  },
  {
    id: "reflexao",
    title: "Perguntas gerais",
    description: "Reflexões finais que ajudam a definir o estilo do mercado.",
    questions: [
      { id: "ref_gen_copy_one", label: "Se pudesse copiar apenas uma dessas referências, qual seria?", type: "textarea", required: true },
      { id: "ref_gen_common", label: "O que todas essas referências têm em comum?", type: "textarea", required: true },
      { id: "ref_gen_repeat", label: "O que você percebe que se repete nas imagens que escolheu?", type: "textarea", required: true },
      { id: "ref_gen_feeling", label: "Qual sentimento você quer que um cliente tenha ao entrar no seu estabelecimento ou ver seu Instagram?", type: "textarea", required: true },
      { id: "ref_gen_3words", label: "Quais três palavras definem o estilo que você procura?", type: "textarea", required: true },
      { id: "ref_gen_admire_not_copy", label: "Existe alguma referência que você admira, mas não gostaria de copiar? Por quê?", type: "textarea" },
      { id: "ref_gen_avoid", label: "O que você quer evitar na sua marca?", type: "textarea", required: true },
      { id: "ref_gen_compare", label: "Se o seu mercado fosse um restaurante famoso, qual seria? E por quê?", type: "textarea", required: true },
      { id: "ref_gen_level", label: "Se a sua marca fosse um nível, qual seria? (popular, acessível, premium ou gourmet)", type: "textarea", required: true },
      { id: "ref_gen_style", label: "Qual estilo resume o que você quer? (rústico, moderno, colorido, minimalista...)", type: "textarea", required: true },
    ],
  },
];

export const refRequiredQuestionIds = referenceSections.flatMap(s =>
  s.questions.filter(q => q.required).map(q => q.id)
);

export const refQuestionById = Object.fromEntries(
  referenceSections.flatMap(s => s.questions.map(q => [q.id, q]))
);
