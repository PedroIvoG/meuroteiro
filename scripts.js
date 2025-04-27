// Configurações da API (ofuscada)
const API_CONFIG = {
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    // SUA NOVA CHAVE DEEPSEEK (codificada em base64)
    apiKey: atob("c2stb3ItdjEtMDI1Mjk5NDgyMTQ3M2ZmODE4N2RkY2I0MGVlNTZjMjUyOWIyYmQ4MmMwYmJkYTcxZWY0MmNjNmVmMGI5ZDRlMw=="),
    model: "deepseek-chat"  // Modelo DeepSeek
};

document.getElementById('generate-btn').addEventListener('click', async function() {
    const city = document.getElementById('city').value.trim();
    const days = document.getElementById('days').value;
    const interests = document.getElementById('interests').value.trim();
    const travelStyle = document.getElementById('travel-style').value;
    
    if (!city) {
        showError('Por favor, informe a cidade de destino.');
        return;
    }
    
    toggleLoading(true);
    clearResult();
    
    try {
        const itinerary = await generateAIItinerary(city, days, interests, travelStyle);
        displayItinerary(itinerary);
    } catch (error) {
        console.error('Erro ao gerar roteiro:', error);
        showError('Ocorreu um erro ao gerar seu roteiro. ' + error.message);
    } finally {
        toggleLoading(false);
    }
});

async function generateAIItinerary(city, days, interests, travelStyle) {
    const prompt = `Atue como um especialista em planejamento de viagens da DeepSeek. 
    Crie um roteiro COMPLETO para ${city} com ${days} dias.

    DETALHES:
    - Interesses: ${interests || 'história, cultura, gastronomia'}
    - Estilo: ${getTravelStyleName(travelStyle)}
    - Formato:
      * Dias divididos em manhã/tarde/noite
      * Cada atividade com:
        - Nome do local
        - Descrição detalhada
        - Horário recomendado
        - Tempo estimado
        - Dicas práticas
      * Sugestões de restaurantes com:
        - Tipo de culinária
        - Faixa de preço
        - Especialidades

    RETORNE em HTML com classes:
    - itinerary-card, day-title, time-slot, attraction, tips`;

    const response = await callDeepSeekAPI(prompt);
    return formatAIResponse(response, city, days);
}

async function callDeepSeekAPI(prompt) {
    try {
        const response = await fetch(API_CONFIG.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_CONFIG.apiKey}`,
                "HTTP-Referer": window.location.href,  // Requerido pelo OpenRouter
                "X-Title": "TravelGenius"             // Identificação do app
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [{role: "user", content: prompt}],
                temperature: 0.7,
                max_tokens: 3000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Erro na API DeepSeek");
        }
        
        return await response.json();
    } catch (error) {
        throw new Error("Falha ao conectar com a DeepSeek. Tente novamente.");
    }
}

// ... (mantenha as demais funções como displayItinerary, showError, etc. do código anterior)
