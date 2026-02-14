export const demoContent = {
  product: {
    name: "LoveCard",
    tagline: "Um cartão interativo para oferecer a alguém especial.",
  },
  reasons: [
    "Porque contigo eu sinto-me em casa.",
    "Porque me fazes rir mesmo quando estou cansada.",
    "Porque gosto do nosso jeito — só nosso.",
    "Porque eu escolho-te, todos os dias.",
    "Porque tu és o meu lugar seguro.",
    "Porque contigo tudo fica mais leve.",
  ],
  timeline: [
    { date: "2024-01-01", title: "Um começo bonito", text: "Exemplo de momento.", emoji: "✨" },
    { date: "2024-06-10", title: "Um dia leve", text: "Outro exemplo de momento.", emoji: "🌿" },
    { date: "2025-02-14", title: "Dia dos Namorados", text: "Exemplo de celebração.", emoji: "💝" },
  ],
  gallery: Array.from({ length: 9 }, (_, i) => ({
    src: `/demo-photos/${String(i + 1).padStart(2, "0")}.svg`,
    alt: `Foto demo ${i + 1}`,
  })),
  quiz: [
    {
      question: "Qual é a vibe perfeita?",
      options: ["Aventura", "Conforto + mimo", "Festa", "Roadtrip"],
      correctIndex: 1,
    },
    {
      question: "O que é mais importante aqui?",
      options: ["Código", "Design", "Carinho", "Tudo junto"],
      correctIndex: 3,
    },
  ],
  connections: {
    title: "Connections (DEMO)",
    subtitle: "Create four groups of four!",
    groups: [
      {
        id: "feelings",
        title: "CARINHO",
        color: "yellow",
        words: ["Abraço", "Beijo", "Mimo", "Saudade"],
      },
      {
        id: "tech",
        title: "TECH",
        color: "blue",
        words: ["React", "Vite", "Router", "Capacitor"],
      },
      {
        id: "cozy",
        title: "COZY",
        color: "green",
        words: ["Sofá", "Filme", "Chá", "Cobertor"],
      },
      {
        id: "treats",
        title: "TREATS",
        color: "purple",
        words: ["Matcha", "Gomas", "Pizza", "Sushi"],
      },
    ],
  },
  strands: {
    title: "Strands (DEMO)",
    theme: "XOXOXO",
    hint: "Diz com carinho",
    spangram: "xoxoxo",
    words: ["Love", "Heart", "Hug", "Kiss", "Cozy", "Matcha", "Rose"],
  },
  final: {
    title: "Surpresa (DEMO) 💝",
    message:
      "Isto é uma demonstração. Faz login para ver o conteúdo real (privado) para a Sofia.",
  },
};
