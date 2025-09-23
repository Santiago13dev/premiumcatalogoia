import axios from 'axios';

class AIService {
  constructor() {
    this.openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    this.huggingfaceKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    this.replicateKey = import.meta.env.VITE_REPLICATE_API_KEY;
  }

  // OpenAI Integration
  async callOpenAI(prompt, model = 'gpt-4') {
    if (!this.openaiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  // Anthropic Claude Integration
  async callClaude(prompt, model = 'claude-3-opus-20240229') {
    if (!this.anthropicKey) {
      throw new Error('Anthropic API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000
        },
        {
          headers: {
            'x-api-key': this.anthropicKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  // Hugging Face Integration
  async callHuggingFace(inputs, model = 'gpt2') {
    if (!this.huggingfaceKey) {
      throw new Error('Hugging Face API key not configured');
    }

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { inputs },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingfaceKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Hugging Face API error:', error);
      throw error;
    }
  }

  // Replicate Integration
  async callReplicate(model, input) {
    if (!this.replicateKey) {
      throw new Error('Replicate API key not configured');
    }

    try {
      // Create prediction
      const createResponse = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: model,
          input
        },
        {
          headers: {
            'Authorization': `Token ${this.replicateKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const predictionId = createResponse.data.id;

      // Poll for result
      let prediction;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const getResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${this.replicateKey}`
            }
          }
        );
        prediction = getResponse.data;
      } while (prediction.status !== 'succeeded' && prediction.status !== 'failed');

      if (prediction.status === 'failed') {
        throw new Error('Replicate prediction failed');
      }

      return prediction.output;
    } catch (error) {
      console.error('Replicate API error:', error);
      throw error;
    }
  }

  // Stability AI Integration for image generation
  async generateImage(prompt, style = 'photorealistic') {
    const stabilityKey = import.meta.env.VITE_STABILITY_API_KEY;
    
    if (!stabilityKey) {
      throw new Error('Stability API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
          text_prompts: [{ text: prompt, weight: 1 }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          samples: 1,
          steps: 30,
          style_preset: style
        },
        {
          headers: {
            'Authorization': `Bearer ${stabilityKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data.artifacts[0].base64;
    } catch (error) {
      console.error('Stability AI error:', error);
      throw error;
    }
  }

  // Cohere Integration
  async callCohere(text, model = 'command') {
    const cohereKey = import.meta.env.VITE_COHERE_API_KEY;
    
    if (!cohereKey) {
      throw new Error('Cohere API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api.cohere.ai/v1/generate',
        {
          model,
          prompt: text,
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${cohereKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.generations[0].text;
    } catch (error) {
      console.error('Cohere API error:', error);
      throw error;
    }
  }

  // Universal prompt testing
  async testPrompt(prompt, provider = 'openai', model = null) {
    switch(provider) {
      case 'openai':
        return this.callOpenAI(prompt, model || 'gpt-4');
      case 'anthropic':
        return this.callClaude(prompt, model || 'claude-3-opus-20240229');
      case 'huggingface':
        return this.callHuggingFace(prompt, model || 'gpt2');
      case 'cohere':
        return this.callCohere(prompt, model || 'command');
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }

  // Batch processing
  async batchProcess(items, processor, concurrency = 3) {
    const results = [];
    const batches = [];
    
    for (let i = 0; i < items.length; i += concurrency) {
      batches.push(items.slice(i, i + concurrency));
    }

    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(item => processor(item).catch(err => ({ error: err.message })))
      );
      results.push(...batchResults);
    }

    return results;
  }

  // Compare models
  async compareModels(prompt, providers = ['openai', 'anthropic']) {
    const results = await Promise.allSettled(
      providers.map(provider => this.testPrompt(prompt, provider))
    );

    return providers.map((provider, index) => ({
      provider,
      response: results[index].status === 'fulfilled' ? results[index].value : null,
      error: results[index].status === 'rejected' ? results[index].reason.message : null
    }));
  }
}

export default new AIService();