// Configurações atualizadas para DeepSeek
const API_CONFIG = {
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: "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", // Sua chave direta (não use em produção)
    model: "deepseek-ai/deepseek-chat" // Modelo correto para DeepSeek via OpenRouter
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
        showError('Erro: ' + error.message);
    } finally {
        toggleLoading(false);
    }
});

async function generateAIItinerary(city, days, interests, travelStyle) {
    const prompt = `Atue como um especialista em planejamento de viagens. 
    Crie um roteiro detalhado para ${city} com ${days} dias.
    
    REQUISITOS:
    - Interesses: ${interests || 'gerais'}
    - Estilo: ${travelStyle}
    - Formato HTML com classes: itinerary-card, day-title, time-slot, attraction
    - Inclua horários, dicas locais e sugestões de restaurantes`;

    const response = await callDeepSeekAPI(prompt);
    return formatAIResponse(response, city, days);
}

async function callDeepSeekAPI(prompt) {
    try {
        const response = await fetch(API_CONFIG.endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_CONFIG.apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.href, // Necessário para OpenRouter
                "X-Title": "TravelPlanner" // Identificação do seu app
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [{role: "user", content: prompt}],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Erro na API");
        }
        
        return await response.json();
    } catch (error) {
        throw new Error("Falha na conexão com a API");
    }
}

// Funções auxiliares (mantenha as mesmas)
function displayItinerary(content) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = content;
    resultDiv.style.display = 'block';
}

function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<div class="error">${message}</div>`;
    resultDiv.style.display = 'block';
}

function toggleLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('generate-btn').disabled = show;
}

function clearResult() {
    document.getElementById('result').innerHTML = '';
}
