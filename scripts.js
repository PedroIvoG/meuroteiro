// Configurações da API (ofuscada)
const API_CONFIG = {
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    // Chave codificada em base64 (não é segurança real, apenas ofuscação básica)
    apiKey: atob("c2stb3ItdjEtYzQ2YzljZjE5NTk3MmVmOGZmYTY3Mjg5YzZkZGRhMTBkYzk4MzYyMWQ3ODU4ODgyYTcyMWViMGI5N2M3Y2YwMQ=="),
    model: "openai/gpt-3.5-turbo"
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
    const prompt = `Atue como um especialista em planejamento de viagens. 
    Crie um roteiro ULTRA DETALHADO para ${city} com ${days} dias de duração.
    
    DETALHES DO VIAJANTE:
    - Interesses: ${interests || 'história, cultura, gastronomia'}
    - Estilo de viagem: ${getTravelStyleName(travelStyle)}
    
    FORMATO REQUISITADO:
    1. Organize por dias (Dia 1, Dia 2, etc.)
    2. Para cada dia, inclua:
       - Manhã: Atividades detalhadas com horários
       - Tarde: Atividades detalhadas com horários
       - Noite: Atividades detalhadas com horários
    3. Para cada atração, inclua:
       - Nome do local
       - Descrição detalhada
       - Tempo médio de visita
       - Dicas específicas
    4. Inclua sugestões de restaurantes para cada refeição
    
    Retorne APENAS o conteúdo HTML formatado usando estas classes:
    - itinerary-card, day-title, time-slot, attraction, tips`;

    const response = await callOpenRouterAPI(prompt);
    return formatAIResponse(response, city, days);
}

async function callOpenRouterAPI(prompt) {
    try {
        const response = await fetch(API_CONFIG.endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_CONFIG.apiKey}`
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
            throw new Error(errorData.error?.message || "Erro na API");
        }
        
        return await response.json();
    } catch (error) {
        throw new Error("Falha ao conectar com o serviço de IA. Tente novamente.");
    }
}

function formatAIResponse(response, city, days) {
    if (!response.choices || !response.choices[0]?.message?.content) {
        throw new Error("A API não retornou um roteiro válido.");
    }
    
    let content = response.choices[0].message.content;
    
    // Sanitização básica
    content = content.replace(/<script.*?>.*?<\/script>/gi, '');
    
    // Adiciona título se não existir
    if (!content.includes('<h2') && !content.includes('<h1')) {
        content = `
        <div class="itinerary-card">
            <h2 style="color: var(--primary); text-align: center; margin-bottom: 1.5rem;">
                Roteiro para ${city} - ${days} dias
            </h2>
            ${content}
        </div>`;
    }
    
    return content;
}

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

function clearResult() {
    document.getElementById('result').style.display = 'none';
}

function toggleLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('generate-btn').disabled = show;
}

function getTravelStyleName(value) {
    const styles = {
        'relaxed': 'Relaxado (mais tempo em cada lugar)',
        'moderate': 'Moderado (equilíbrio entre atividades)',
        'intense': 'Intenso (muitas atividades e exploração)'
    };
    return styles[value] || value;
}