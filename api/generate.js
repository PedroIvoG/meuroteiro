import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { city, days, interests, budget, notes } = req.body;

    if (!city) {
      return res.status(400).json({ error: "Cidade é obrigatória" });
    }

    const prompt = `Você é um especialista em planejamento de viagens. Crie um roteiro detalhado para ${city} com ${days} dias de duração.

Detalhes do viajante:
- Interesses: ${interests || "gerais"}
- Orçamento: ${budget || "não especificado"}
- Observações: ${notes || "nenhuma"}

Formato de resposta: HTML dividido por dias, manhã/tarde/noite, com classes CSS conforme frontend.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || `Erro na API: ${response.status}`;
      return res.status(500).json({ error: errorMessage });
    }

    const data = await response.json();
    res.status(200).json({ content: data.choices[0].message.content });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
