import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não está configurado');
    }

    const { description } = await req.json();

    if (!description) {
      throw new Error('Descrição é obrigatória');
    }

    console.log('Processing entry:', description);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente financeiro especializado em categorizar lançamentos financeiros. 
            
            Analise a descrição fornecida e retorne um JSON com os seguintes campos:
            - type: "entrada" ou "saida" 
            - amount: valor numérico estimado (se não especificado, retorne 0)
            - category: uma das categorias: "food", "transport", "health", "education", "entertainment", "utilities", "salary", "investment", "other"
            - paymentMethod: "cash", "credit", "debit", "pix", "transfer" ou "other"
            - status: "confirmed", "pending" ou "paid"
            - suggestedDescription: versão limpa e organizada da descrição original
            
            Seja preciso na análise e sempre retorne um JSON válido. Se algo não estiver claro, faça a melhor estimativa baseada no contexto.
            
            Exemplos:
            - "Comprei um lanche por R$ 15" -> {"type": "saida", "amount": 15, "category": "food", "paymentMethod": "other", "status": "confirmed", "suggestedDescription": "Lanche"}
            - "Recebi salário" -> {"type": "entrada", "amount": 0, "category": "salary", "paymentMethod": "transfer", "status": "confirmed", "suggestedDescription": "Salário"}
            - "Paguei conta de luz R$ 120" -> {"type": "saida", "amount": 120, "category": "utilities", "paymentMethod": "other", "status": "paid", "suggestedDescription": "Conta de Luz"}`
          },
          {
            role: 'user',
            content: description
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // Parse the JSON response from AI
    let processedEntry;
    try {
      processedEntry = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback response
      processedEntry = {
        type: 'saida',
        amount: 0,
        category: 'other',
        paymentMethod: 'other',
        status: 'pending',
        suggestedDescription: description
      };
    }

    // Add current date
    processedEntry.date = new Date().toISOString().split('T')[0];

    console.log('Processed entry:', processedEntry);

    return new Response(JSON.stringify(processedEntry), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-financial-entry function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: {
        type: 'saida',
        amount: 0,
        category: 'other',
        paymentMethod: 'other',
        status: 'pending',
        suggestedDescription: 'Lançamento não processado',
        date: new Date().toISOString().split('T')[0]
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});