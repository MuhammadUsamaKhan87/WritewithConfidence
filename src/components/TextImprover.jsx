import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Copy, Check, Wand2, MessageCircle, Briefcase, Heart, Smile, Zap, BookOpen, AlertCircle } from 'lucide-react';

const TextImprover = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('professional');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const outputRef = useRef(null);

  const categories = [
    { id: 'professional', label: 'Professional', icon: Briefcase, color: 'blue' },
    { id: 'casual', label: 'Casual', icon: MessageCircle, color: 'green' },
    { id: 'friendly', label: 'Friendly', icon: Heart, color: 'pink' },
    { id: 'emoji', label: 'With Emojis', icon: Smile, color: 'yellow' },
    { id: 'confident', label: 'Confident', icon: Zap, color: 'purple' },
    { id: 'academic', label: 'Academic', icon: BookOpen, color: 'indigo' }
  ];

  const getColorClasses = (color, selected = false) => {
    const colors = {
      blue: selected ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-blue-50',
      green: selected ? 'bg-green-500 text-white' : 'text-green-600 hover:bg-green-50',
      pink: selected ? 'bg-pink-500 text-white' : 'text-pink-600 hover:bg-pink-50',
      yellow: selected ? 'bg-yellow-500 text-white' : 'text-yellow-600 hover:bg-yellow-50',
      purple: selected ? 'bg-purple-500 text-white' : 'text-purple-600 hover:bg-purple-50',
      indigo: selected ? 'bg-indigo-500 text-white' : 'text-indigo-600 hover:bg-indigo-50'
    };
    return colors[color] || colors.blue;
  };

  const getPrompt = (text, category) => {
    const prompts = {
      professional: `Please rewrite this text in a professional, polished manner with perfect grammar and formal tone and please rewrite only this text and don't include any other text: "${text}"`,
      casual: `Please rewrite this text in a casual, friendly manner with perfect grammar and  please rewrite only this text and don't include any other tex: "${text}"`,
      friendly: `Please rewrite this text in a warm, friendly tone with perfect grammar and  please rewrite only this text and don't include any other tex: "${text}"`,
      emoji: `Please rewrite this text with perfect grammar and add appropriate emojis to make it more engaging and  please rewrite only this text and don't include any other tex: "${text}"`,
      confident: `Please rewrite this text with a confident, assertive tone and perfect grammar and  please rewrite only this text and don't include any other tex: "${text}"`,
      academic: `Please rewrite this text in an academic, scholarly manner with perfect grammar and  please rewrite only this text and don't include any other tex: "${text}"`
    };
    return prompts[category] || prompts.professional;
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setOutputText('');
    setError('');

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          'Authorization': 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
          messages:[
            {
              "role": "user",
              "content": getPrompt(inputText, selectedCategory)
            }
          ],
          "stream": true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                setOutputText(prev => prev + content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      setError('Please add your OpenRouter API key to use this feature. Replace "YOUR_API_KEY_HERE" with your actual API key.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputText]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            AI Text <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Improver</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Transform your text with perfect grammar and professional style using AI
          </p>
        </div>

        {/* Category Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Choose Your Writing Style</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 transform hover:scale-105 ${
                    isSelected 
                      ? `${getColorClasses(category.color, true)} border-transparent shadow-lg` 
                      : `${getColorClasses(category.color)} border-slate-600 bg-slate-800/50 backdrop-blur-sm`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Your Text</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter your text here... It can have mistakes, wrong grammar, or informal language. I'll make it perfect!"
                      className="w-full h-64 p-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      disabled={isLoading}
                    />
                    <div className="absolute bottom-4 right-4 text-sm text-slate-400">
                      {inputText.length} characters
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSubmit}
                    disabled={!inputText.trim() || isLoading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Improving...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Improve Text
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-6">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Improved Text</h2>
                  </div>
                  
                  {outputText && (
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                <div className="relative">
                  <div
                    ref={outputRef}
                    className="w-full h-64 p-4 bg-slate-900/50 border border-slate-600 rounded-xl text-white overflow-y-auto"
                  >
                    {error ? (
                      <div className="flex items-center gap-2 text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                      </div>
                    ) : outputText ? (
                      <div className="whitespace-pre-wrap">{outputText}</div>
                    ) : (
                      <div className="text-slate-400 italic">Your improved text will appear here...</div>
                    )}
                    
                    {isLoading && (
                      <div className="flex items-center gap-2 text-purple-400 mt-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                        <span>AI is working on your text...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="p-3 bg-blue-500 rounded-lg w-fit mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Perfect Grammar</h4>
              <p className="text-slate-300">Automatically fixes grammar mistakes and improves sentence structure.</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="p-3 bg-green-500 rounded-lg w-fit mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Real-time Streaming</h4>
              <p className="text-slate-300">See your text being improved in real-time with streaming responses.</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="p-3 bg-purple-500 rounded-lg w-fit mb-4">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Multiple Styles</h4>
              <p className="text-slate-300">Choose from professional, casual, friendly, and more writing styles.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextImprover;