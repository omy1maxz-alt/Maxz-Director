import React, { useState, useEffect } from 'react';
import { ApiKeys, ApiKeySource } from '@/types';
import { X, Key, Shield, Check, AlertCircle } from 'lucide-react';

interface ApiKeyVaultProps {
  isOpen: boolean;
  onClose: () => void;
  currentKeys: ApiKeys;
  currentSource: ApiKeySource;
  currentTextModel: string;
  currentImageModel: string;
  onSave: (keys: ApiKeys, source: ApiKeySource, textModel: string, imageModel: string) => void;
}

export const ApiKeyVault: React.FC<ApiKeyVaultProps> = ({ isOpen, onClose, currentKeys, currentSource, currentTextModel, currentImageModel, onSave }) => {
  const [source, setSource] = useState<ApiKeySource>(currentSource);
  const [keys, setKeys] = useState<ApiKeys>(currentKeys);
  const [textModel, setTextModel] = useState<string>(currentTextModel);
  const [imageModel, setImageModel] = useState<string>(currentImageModel);

  useEffect(() => {
    if (isOpen) {
      setSource(currentSource);
      setKeys(currentKeys);
      setTextModel(currentTextModel);
      setImageModel(currentImageModel);
    }
  }, [isOpen, currentKeys, currentSource, currentTextModel, currentImageModel]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(keys, source, textModel, imageModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">API Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
              <input 
                type="radio" 
                name="apiSource" 
                checked={source === 'builtin'} 
                onChange={() => setSource('builtin')}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-white">Use Built-in API Key</div>
                <div className="text-xs text-white/50 mt-1">Use the default platform-provided API key. Some advanced features (like Veo video generation) may require your own paid key.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
              <input 
                type="radio" 
                name="apiSource" 
                checked={source === 'custom'} 
                onChange={() => setSource('custom')}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-white">Use Custom API Key</div>
                <div className="text-xs text-white/50 mt-1">Provide your own API keys to bypass limits and access paid models.</div>
              </div>
            </label>
          </div>

          {source === 'custom' && (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Google Gemini API Key</label>
                <input 
                  type="password" 
                  value={keys.google || ''} 
                  onChange={(e) => setKeys({ ...keys, google: e.target.value })}
                  placeholder="AIzaSy..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70">Kie AI API Key (For KIE Chat Models & Suno AI Covers)</label>
                <input 
                  type="password" 
                  value={keys.kie || ''} 
                  onChange={(e) => setKeys({ ...keys, kie: e.target.value })}
                  placeholder="sk-..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="text-sm font-medium text-white flex items-center gap-2">
                  <span>Custom OpenAI-Compatible Provider (Optional)</span>
                </div>
                <div className="text-xs text-white/50">
                  Use community free APIs (like those from awesome-freellm-apis) instead of Gemini. Leave blank to use Gemini.
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">Base URL</label>
                  <input 
                    type="text" 
                    value={keys.openaiBaseUrl || ''} 
                    onChange={(e) => setKeys({ ...keys, openaiBaseUrl: e.target.value })}
                    placeholder="https://api.example.com/v1"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/70">API Key</label>
                  <input 
                    type="password" 
                    value={keys.openaiApiKey || ''} 
                    onChange={(e) => setKeys({ ...keys, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-white/40">
                <Shield className="w-3 h-3" />
                <span>Keys are stored locally in your browser and never sent to our servers.</span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-white/70">Text Generation Model</label>
              {textModel.startsWith('kie:') && (
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-medium">
                  KIE AI Routing Active
                </span>
              )}
            </div>
            <select
              value={textModel}
              onChange={(e) => setTextModel(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <optgroup label="Google Gemini Models (Direct / Native)" className="bg-[#1a1a1a] text-white font-semibold">
                <option value="gemini-3.8-pro" className="bg-[#1a1a1a] text-white">Gemini 3.8 Pro (Next Gen Reasoning)</option>
                <option value="gemini-3.8-flash" className="bg-[#1a1a1a] text-white">Gemini 3.8 Flash (Next Gen Fast)</option>
                <option value="gemini-3.7-pro" className="bg-[#1a1a1a] text-white">Gemini 3.7 Pro (Ultimate Reasoning)</option>
                <option value="gemini-3.7-flash" className="bg-[#1a1a1a] text-white">Gemini 3.7 Flash (Latest Fast)</option>
                <option value="gemini-3.6-flash" className="bg-[#1a1a1a] text-white">Gemini 3.6 Flash</option>
                <option value="gemini-3.5-flash" className="bg-[#1a1a1a] text-white">Gemini 3.5 Flash (Balanced)</option>
                <option value="gemini-3.1-pro-preview" className="bg-[#1a1a1a] text-white">Gemini 3.1 Pro (Legacy Reasoning)</option>
                <option value="gemini-3.1-flash-lite" className="bg-[#1a1a1a] text-white">Gemini 3.1 Flash Lite (Highest Quota)</option>
              </optgroup>

              <optgroup label="KIE AI — Anthropic Claude" className="bg-[#1a1a1a] text-indigo-300 font-semibold">
                <option value="kie:claude-sonnet-5" className="bg-[#1a1a1a] text-white">KIE Claude Sonnet 5 (Frontier Reasoning & Nuance)</option>
                <option value="kie:claude-opus-5" className="bg-[#1a1a1a] text-white">KIE Claude Opus 5 (Deep Thought & Prose)</option>
                <option value="kie:claude-sonnet-4-6" className="bg-[#1a1a1a] text-white">KIE Claude Sonnet 4.6 (Clear Writing & Code)</option>
                <option value="kie:claude-haiku-4-5" className="bg-[#1a1a1a] text-white">KIE Claude Haiku 4.5 (Ultra Fast)</option>
                <option value="kie:claude-fable-5" className="bg-[#1a1a1a] text-white">KIE Claude Fable 5 (Creative & Scripting)</option>
              </optgroup>

              <optgroup label="KIE AI — OpenAI & Codex" className="bg-[#1a1a1a] text-indigo-300 font-semibold">
                <option value="kie:gpt-5-2" className="bg-[#1a1a1a] text-white">KIE GPT-5.2 (Multimodal Reasoning)</option>
                <option value="kie:gpt-6-astra" className="bg-[#1a1a1a] text-white">KIE GPT-6 Astra (Frontier Codex)</option>
                <option value="kie:gpt-5-6-sol" className="bg-[#1a1a1a] text-white">KIE GPT-5.6 Sol (Codex Flagship Tier)</option>
                <option value="kie:gpt-5-6-terra" className="bg-[#1a1a1a] text-white">KIE GPT-5.6 Terra (Balanced Scale)</option>
                <option value="kie:gpt-5-6-luna" className="bg-[#1a1a1a] text-white">KIE GPT-5.6 Luna (Fast & Affordable)</option>
                <option value="kie:gpt-5-5" className="bg-[#1a1a1a] text-white">KIE GPT-5.5 (High Intelligence)</option>
                <option value="kie:gpt-5-4" className="bg-[#1a1a1a] text-white">KIE GPT-5.4 (Multimodal Reasoning)</option>
                <option value="kie:codex" className="bg-[#1a1a1a] text-white">KIE OpenAI Codex (Code Synthesis)</option>
              </optgroup>

              <optgroup label="KIE AI — Google Gemini" className="bg-[#1a1a1a] text-indigo-300 font-semibold">
                <option value="kie:gemini-3.5-flash" className="bg-[#1a1a1a] text-white">KIE Gemini 3.5 Flash (Fast Agentic)</option>
                <option value="kie:gemini-3.8-flash" className="bg-[#1a1a1a] text-white">KIE Gemini 3.8 Flash (Advanced Coding)</option>
                <option value="kie:gemini-3.7-flash" className="bg-[#1a1a1a] text-white">KIE Gemini 3.7 Flash (Hybrid Reasoning)</option>
                <option value="kie:gemini-3.6-flash" className="bg-[#1a1a1a] text-white">KIE Gemini 3.6 Flash (High Throughput)</option>
                <option value="kie:gemini-3.1-pro" className="bg-[#1a1a1a] text-white">KIE Gemini 3.1 Pro (Deep Analysis)</option>
                <option value="kie:gemini-2.5-pro" className="bg-[#1a1a1a] text-white">KIE Gemini 2.5 Pro (Massive Context)</option>
              </optgroup>

              <optgroup label="KIE AI — xAI, DeepSeek & Moonshot" className="bg-[#1a1a1a] text-indigo-300 font-semibold">
                <option value="kie:grok-4-7" className="bg-[#1a1a1a] text-white">KIE Grok 4.7 (xAI Reasoning)</option>
                <option value="kie:grok-4-6" className="bg-[#1a1a1a] text-white">KIE Grok 4.6 (Fast Interactive)</option>
                <option value="kie:deepseek-v4-1-flash" className="bg-[#1a1a1a] text-white">KIE DeepSeek V4.1 Flash (Fast Open Reasoning)</option>
                <option value="kie:deepseek-r1" className="bg-[#1a1a1a] text-white">KIE DeepSeek R1 (Reasoning Engine)</option>
                <option value="kie:deepseek-v3" className="bg-[#1a1a1a] text-white">KIE DeepSeek V3 (671B MoE)</option>
                <option value="kie:kimi-k3" className="bg-[#1a1a1a] text-white">KIE Moonshot Kimi K3 (1M Context)</option>
                <option value="kie:custom" className="bg-[#1a1a1a] text-indigo-400">KIE Custom Model (Specify below)</option>
              </optgroup>

              <optgroup label="Custom Provider" className="bg-[#1a1a1a] text-white font-semibold">
                <option value="custom-openai" className="bg-[#1a1a1a] text-indigo-400">Custom OpenAI Provider (Set above)</option>
              </optgroup>
            </select>

            {textModel.startsWith('kie:') && (
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2 mt-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-300">KIE AI API Key</span>
                  <span className="text-[10px] text-white/50">Required for KIE models</span>
                </div>
                <input 
                  type="password" 
                  value={keys.kie || ''} 
                  onChange={(e) => setKeys({ ...keys, kie: e.target.value })}
                  placeholder="sk-..."
                  className="w-full bg-black/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-400 transition-colors"
                />
                <div className="text-[10px] text-white/50">
                  This model will be used across Story Mode director plans, prompt enhancements, Studio chat, and translations via KIE's high-speed API.
                </div>

                {textModel === 'kie:custom' && (
                  <div className="pt-2 border-t border-indigo-500/20 space-y-1">
                    <label className="text-xs font-medium text-indigo-200">Custom KIE Model ID</label>
                    <input 
                      type="text" 
                      value={keys.kieCustomModel || ''} 
                      onChange={(e) => setKeys({ ...keys, kieCustomModel: e.target.value })}
                      placeholder="e.g. meta-llama/llama-3.3-70b-instruct or mistral-large"
                      className="w-full bg-black/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                )}
              </div>
            )}

            {textModel === 'custom-openai' && (
                <div className="space-y-2 mt-2 animate-in fade-in">
                  <label className="text-xs font-medium text-white/70">Custom Model Name</label>
                  <input 
                    type="text" 
                    value={keys.openaiModel || ''} 
                    onChange={(e) => setKeys({ ...keys, openaiModel: e.target.value })}
                    placeholder="e.g. meta-llama/llama-3-8b-instruct"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
            )}

            <div className="text-[10px] text-white/40 mb-4">
              Select the model used for director plans, chat, prompt enhancement, and subtitle translation.
            </div>
            
            <label className="text-xs font-medium text-white/70">Image Generation Model</label>
            <select
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="gemini-3.1-flash-image" className="bg-[#1a1a1a] text-white">Gemini 3.1 Flash Image (High Quality)</option>
              <option value="gemini-2.5-flash-image" className="bg-[#1a1a1a] text-white">Gemini 2.5 Flash (Legacy)</option>
              <option value="pollinations" className="bg-[#1a1a1a] text-white">Pollinations (Free Public API, No Key)</option>
            </select>
            <div className="text-[10px] text-white/40">
              Select the model used for generating scene images. Pollinations does not support advanced image-to-image features like character swapping.
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-2 bg-black/20 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2">
            <Check className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
