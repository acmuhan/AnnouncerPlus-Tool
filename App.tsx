
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CommandType, CommandState, HistoryItem, INITIAL_COMMAND_STATE } from './types';
import { parseMiniMessage } from './utils/miniMessageParser';
import { Accordion, Input, Select, ToolButton, ColorSwatch } from './components/EditorTools';

const MINECRAFT_COLORS = [
  { name: 'dark_red', hex: '#AA0000' },
  { name: 'red', hex: '#FF5555' },
  { name: 'gold', hex: '#FFAA00' },
  { name: 'yellow', hex: '#FFFF55' },
  { name: 'dark_green', hex: '#00AA00' },
  { name: 'green', hex: '#55FF55' },
  { name: 'aqua', hex: '#55FFFF' },
  { name: 'dark_aqua', hex: '#00AAAA' },
  { name: 'dark_blue', hex: '#0000AA' },
  { name: 'blue', hex: '#5555FF' },
  { name: 'light_purple', hex: '#FF55FF' },
  { name: 'dark_purple', hex: '#AA00AA' },
  { name: 'white', hex: '#FFFFFF' },
  { name: 'gray', hex: '#AAAAAA' },
  { name: 'dark_gray', hex: '#555555' },
  { name: 'black', hex: '#000000' },
];

const App: React.FC = () => {
  const [state, setState] = useState<CommandState>(INITIAL_COMMAND_STATE);
  const [generatedCommand, setGeneratedCommand] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeToolbarGroup, setActiveToolbarGroup] = useState<string | null>(null);
  
  const [gradStart, setGradStart] = useState('#FF0000');
  const [gradEnd, setGradEnd] = useState('#0000FF');
  
  const colorInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('announcerplus_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('announcerplus_history', JSON.stringify(history));
  }, [history]);

  const updateState = (key: keyof CommandState, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const insertText = (tag: string, targetField: 'text' | 'title' | 'subtitle' | 'description' = 'text') => {
    const textarea = textareaRef.current;
    if (textarea && targetField === 'text') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = state.text;
      const before = text.substring(0, start);
      const after = text.substring(end);
      updateState('text', before + tag + after);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    } else {
      updateState(targetField, (state as any)[targetField] + tag);
    }
  };

  const handleCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    insertText(`<color:${hex}>`);
    setActiveToolbarGroup(null);
  };

  const generate = useCallback(() => {
    let cmd = '/announcerplus ';
    switch (state.type) {
      case 'broadcast': cmd += `broadcast ${state.config} ${state.text}`; break;
      case 'send': cmd += `send ${state.player || '<player>'} ${state.config}`; break;
      case 'parse': cmd += `parse ${state.text}`; break;
      case 'parseanimation': cmd += `parseanimation ${state.seconds} ${state.text}`; break;
      case 'broadcasttitle': cmd += `broadcasttitle ${state.world} ${state.fadein} ${state.stay} ${state.fadeout} "${state.title}" "${state.subtitle}"`; break;
      case 'broadcasttoast': cmd += `broadcasttoast ${state.world} ${state.icon} ${state.frame} "${state.title}" "${state.description}"`; break;
      case 'broadcastactionbar': cmd += `broadcastactionbar ${state.world} ${state.seconds} ${state.text}`; break;
      case 'broadcastbossbar': cmd += `broadcastbossbar ${state.world} ${state.seconds} ${state.bossbarOverlay} ${state.bossbarFillMode} ${state.bossbarColor} ${state.text}`; break;
      case 'reload': cmd += 'reload'; break;
      case 'list': cmd += `list ${state.config}`; break;
    }
    setGeneratedCommand(cmd);
  }, [state]);

  useEffect(() => { generate(); }, [generate]);

  const addToHistory = () => {
    const newItem: HistoryItem = { id: Date.now().toString(), timestamp: Date.now(), command: generatedCommand, state: { ...state } };
    if (history.length > 0 && history[0].command === generatedCommand) return;
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const restoreHistoryItem = (item: HistoryItem) => {
    setState(item.state);
    setIsHistoryOpen(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCommand);
    setCopied(true);
    addToHistory();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#0b0e14] text-slate-200">
      <header className="h-20 px-10 flex items-center justify-between border-b border-white/5 bg-slate-900/40 backdrop-blur-xl z-40 shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-600/20 border border-emerald-400/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          </div>
          <h1 className="text-[11px] font-black tracking-[0.3em] uppercase text-white">
            Announcer<span className="text-emerald-500">Plus</span>
          </h1>
        </div>

        <div className="hidden md:flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
          {['editor', 'preview'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest ${activeTab === tab ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-slate-500 hover:text-white'}`}>
              {tab === 'editor' ? '编辑器' : '效果预览'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-3 text-[9px] font-black text-slate-300 hover:text-white transition-all bg-white/5 px-5 py-3 rounded-2xl border border-white/5 uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
            指令历史
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* History Panel */}
        <div className={`absolute inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity duration-500 ${isHistoryOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsHistoryOpen(false)}>
           <div className={`absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#0d111a] border-l border-white/5 shadow-2xl transition-transform duration-500 flex flex-col ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">指令历史</h2>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {history.map(item => (
                  <div key={item.id} onClick={() => restoreHistoryItem(item)} className="group bg-slate-900/40 border border-white/5 rounded-3xl p-6 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all cursor-pointer">
                    <div className="flex justify-between text-[8px] font-black uppercase text-slate-600 mb-3 group-hover:text-emerald-500/60 transition-colors"><span>{item.state.type}</span><span>{new Date(item.timestamp).toLocaleTimeString()}</span></div>
                    <div className="text-[10px] font-mono text-slate-500 line-clamp-2 leading-relaxed">{item.command}</div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Sidebar Config */}
        <div className={`w-[380px] border-r border-white/5 bg-slate-900/10 flex flex-col transition-all duration-300 shrink-0 ${activeTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-2">
            <Accordion title="核心设置">
              <Select label="指令类型" value={state.type} onChange={(v) => updateState('type', v)} options={[
                { label: '全体公告', value: 'broadcast' }, { label: '私发玩家', value: 'send' }, { label: '屏幕标题', value: 'broadcasttitle' },
                { label: '弹窗提示', value: 'broadcasttoast' }, { label: '动作栏', value: 'broadcastactionbar' }, { label: '血条公告', value: 'broadcastbossbar' },
                { label: '解析测试', value: 'parse' }, { label: '动画测试', value: 'parseanimation' }
              ]} />
              {['broadcast', 'send', 'list'].includes(state.type) && <Input label="配置组" value={state.config} onChange={(v) => updateState('config', v)} />}
              {state.type === 'send' && <Input label="玩家" value={state.player} onChange={(v) => updateState('player', v)} />}
              {['broadcasttitle', 'broadcasttoast', 'broadcastactionbar', 'broadcastbossbar'].includes(state.type) && <Input label="生效世界" value={state.world} onChange={(v) => updateState('world', v)} />}
            </Accordion>

            {['broadcasttitle', 'broadcasttoast'].includes(state.type) && (
              <Accordion title="文本详情">
                <Input label="主标题" value={state.title} onChange={(v) => updateState('title', v)} />
                <Input label={state.type === 'broadcasttitle' ? "副标题" : "描述文本"} value={state.type === 'broadcasttitle' ? state.subtitle : state.description} onChange={(v) => updateState(state.type === 'broadcasttitle' ? 'subtitle' : 'description', v)} />
              </Accordion>
            )}

            {state.type === 'broadcasttitle' && (
              <Accordion title="显示时间" defaultOpen={false}>
                <div className="grid grid-cols-3 gap-3">
                  <Input type="number" label="淡入" value={state.fadein} onChange={(v) => updateState('fadein', parseInt(v))} />
                  <Input type="number" label="停留" value={state.stay} onChange={(v) => updateState('stay', parseInt(v))} />
                  <Input type="number" label="淡出" value={state.fadeout} onChange={(v) => updateState('fadeout', parseInt(v))} />
                </div>
              </Accordion>
            )}

            {state.type === 'broadcastbossbar' && (
              <Accordion title="外观选项" defaultOpen={false}>
                <Select label="血条颜色" value={state.bossbarColor} onChange={(v) => updateState('bossbarColor', v)} options={['BLUE', 'GREEN', 'RED', 'YELLOW', 'PINK', 'PURPLE', 'WHITE'].map(c => ({ label: c, value: c }))} />
                <Select label="分段样式" value={state.bossbarOverlay} onChange={(v) => updateState('bossbarOverlay', v)} options={['PROGRESS', 'NOTCHED_6', 'NOTCHED_10', 'NOTCHED_12', 'NOTCHED_20'].map(o => ({ label: o, value: o }))} />
              </Accordion>
            )}
          </div>
        </div>

        {/* Main Editor */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${activeTab === 'editor' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex-1 p-10 overflow-y-auto space-y-10 custom-scrollbar pb-44">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]"></div>
                  编辑面板
                </h2>
                <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">基于 MINIMESSAGE 2.0 语法解析</span>
              </div>
              <button onClick={() => updateState('text', '')} className="text-[9px] font-black text-slate-600 hover:text-red-500 transition-colors uppercase tracking-[0.2em]">清空编辑器</button>
            </div>

            <div className="bg-slate-900/20 border border-white/5 rounded-[3rem] p-10 flex flex-col gap-8 shadow-inner overflow-visible">
              {/* Organized Toolsets */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <ToolButton label="颜色" active={activeToolbarGroup === 'color'} onClick={() => setActiveToolbarGroup(activeToolbarGroup === 'color' ? null : 'color')} />
                  {activeToolbarGroup === 'color' && (
                    <div className="absolute top-14 left-0 z-50 bg-[#121826] border border-white/10 rounded-[2rem] p-6 shadow-2xl w-[280px] animate-in slide-in-from-top-4 duration-300">
                       <div className="grid grid-cols-4 gap-3 mb-6">
                          {MINECRAFT_COLORS.map(c => <ColorSwatch key={c.name} hex={c.hex} label={c.name} onClick={() => insertText(`<${c.name}>`)} />)}
                       </div>
                       <div className="pt-6 border-t border-white/5">
                          <button onClick={() => colorInputRef.current?.click()} className="w-full flex items-center justify-center gap-4 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all border border-white/5 group">
                             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-2 border-white/20 shadow-xl group-hover:scale-110 transition-transform" />
                             <span className="text-[9px] font-black uppercase tracking-[0.2em]">调色盘</span>
                          </button>
                          <input type="color" ref={colorInputRef} className="hidden" onChange={handleCustomColor} />
                       </div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <ToolButton label="格式" active={activeToolbarGroup === 'format'} onClick={() => setActiveToolbarGroup(activeToolbarGroup === 'format' ? null : 'format')} />
                  {activeToolbarGroup === 'format' && (
                    <div className="absolute top-14 left-0 z-50 bg-[#121826] border border-white/10 rounded-[1.5rem] p-3 shadow-2xl w-48 flex flex-col gap-1.5 animate-in slide-in-from-top-4 duration-300">
                      {[
                        { l: '加粗', t: 'bold' }, { l: '斜体', t: 'italic' }, { l: '下划线', t: 'underlined' },
                        { l: '删除线', t: 'strikethrough' }, { l: '重置', t: 'reset' }, { l: '居中', t: 'center' }
                      ].map((item, idx) => (
                        <button key={idx} onClick={() => insertText(`<${item.t}>`)} className="px-5 py-3.5 hover:bg-white/5 rounded-xl text-[9px] font-black uppercase text-left tracking-[0.15em] text-slate-400 hover:text-emerald-400 transition-all">{item.l}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <ToolButton label="渐变" active={activeToolbarGroup === 'grad'} onClick={() => setActiveToolbarGroup(activeToolbarGroup === 'grad' ? null : 'grad')} />
                  {activeToolbarGroup === 'grad' && (
                    <div className="absolute top-14 left-0 z-50 bg-[#121826] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl w-[320px] animate-in slide-in-from-top-4 duration-300">
                       <div className="flex items-center justify-between mb-6 bg-black/40 p-3 rounded-2xl border border-white/5">
                          <input type="color" value={gradStart} onChange={e => setGradStart(e.target.value)} className="w-14 h-12 rounded-xl bg-transparent border-none p-0 cursor-pointer transition-transform hover:scale-105" />
                          <div className="h-0.5 flex-1 mx-6 bg-white/5 rounded-full" />
                          <input type="color" value={gradEnd} onChange={e => setGradEnd(e.target.value)} className="w-14 h-12 rounded-xl bg-transparent border-none p-0 cursor-pointer transition-transform hover:scale-105" />
                       </div>
                       <div className="h-8 w-full rounded-2xl mb-6 border border-white/10 shadow-inner" style={{ background: `linear-gradient(to right, ${gradStart}, ${gradEnd})` }} />
                       <button className="w-full py-4 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-emerald-500/10" onClick={() => insertText(`<gradient:${gradStart}:${gradEnd}>`)}>
                         应用渐变
                       </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <ToolButton label="动画" active={activeToolbarGroup === 'anim'} onClick={() => setActiveToolbarGroup(activeToolbarGroup === 'anim' ? null : 'anim')} />
                  {activeToolbarGroup === 'anim' && (
                    <div className="absolute top-14 left-0 z-50 bg-[#121826] border border-white/10 rounded-[1.5rem] p-3 shadow-2xl w-56 flex flex-col gap-1.5 animate-in slide-in-from-top-4 duration-300">
                      {[
                        { l: '闪烁动画', t: '{animate:flash:T1:T2:10}' }, { l: '打字动画', t: '{animate:type:内容:5}' },
                        { l: '脉冲动画', t: '<{animate:pulse:red:white:20}>' }, { l: '彩虹文本', t: '<rainbow>' }
                      ].map((item, idx) => (
                        <button key={idx} onClick={() => insertText(item.t)} className="px-5 py-3.5 hover:bg-white/5 rounded-xl text-[9px] font-black uppercase text-left tracking-[0.15em] text-slate-400 hover:text-emerald-400 transition-all">{item.l}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-6 w-[1px] bg-white/5 mx-2" />
                <ToolButton label="交互动作" color="bg-indigo-600/5 text-indigo-400 border-indigo-500/10 hover:bg-indigo-600/10" onClick={() => insertText('<click:run_command:/spawn><hover:show_text:\'内容\'>')} />
              </div>

              <textarea 
                ref={textareaRef} 
                value={state.text} 
                onChange={e => updateState('text', e.target.value)}
                onFocus={() => setActiveToolbarGroup(null)}
                className="w-full h-72 bg-black/40 border border-white/5 rounded-[2.5rem] p-10 text-sm font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none leading-[2] shadow-2xl placeholder:text-slate-800" 
                placeholder="在此输入您的文本内容..."
              />
            </div>

            {/* Preview */}
            <div className={`space-y-6 ${activeTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between px-2">
                <h2 className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">效果渲染层</h2>
              </div>
              <div className="relative bg-[#05070a] border border-white/5 rounded-[3.5rem] min-h-[360px] flex items-center justify-center overflow-hidden shadow-2xl group border-2 border-white/5">
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="mc-font text-2xl px-24 text-center w-full float-anim">
                  {state.type === 'broadcasttitle' ? (
                    <div className="space-y-10">
                      <div className="text-8xl font-black drop-shadow-[0_6px_0_rgba(0,0,0,0.9)]">{parseMiniMessage(state.title)}</div>
                      <div className="text-3xl opacity-70 drop-shadow-lg tracking-wide">{parseMiniMessage(state.subtitle)}</div>
                    </div>
                  ) : state.type === 'broadcasttoast' ? (
                    <div className="toast-bg border-[6px] border-[#2c2c2c] rounded-[1.75rem] p-8 flex gap-8 w-[30rem] shadow-2xl mx-auto scale-110">
                      <div className="w-20 h-20 bg-[#0a0a0a] border-2 border-[#444] rounded-[1.25rem] shrink-0 shadow-inner flex items-center justify-center text-[8px] font-black text-slate-700">ITEM</div>
                      <div className="flex flex-col text-left justify-center overflow-hidden">
                        <div className="text-xl font-black text-[#ffff55] tracking-widest">{parseMiniMessage(state.title)}</div>
                        <div className="text-sm text-white/80 leading-relaxed mt-2">{state.description}</div>
                      </div>
                    </div>
                  ) : state.type === 'broadcastbossbar' ? (
                    <div className="w-full max-w-2xl mx-auto space-y-8">
                      <div className="text-2xl font-black tracking-[0.1em] drop-shadow-xl">{parseMiniMessage(state.text)}</div>
                      <div className="h-6 w-full bg-[#0a0a0a] border-[3px] border-[#333] rounded-sm relative shadow-2xl overflow-hidden">
                         <div className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: '85%', backgroundColor: state.bossbarColor.toLowerCase() }} />
                      </div>
                    </div>
                  ) : <div className="max-w-5xl mx-auto drop-shadow-2xl leading-[1.8]">{parseMiniMessage(state.text)}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div className="px-10 pb-10 z-30 shrink-0">
             <div className="bg-[#121724]/90 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 shadow-[0_40px_80px_rgba(0,0,0,0.4)] flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex-1 w-full space-y-4">
                   <div className="flex items-center gap-4">
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] px-4 py-2 bg-emerald-400/5 rounded-full border border-emerald-400/10">READY FOR USE</span>
                   </div>
                   <div className="bg-black/60 rounded-[1.75rem] p-8 border border-white/5 font-mono text-emerald-300/90 text-sm break-all leading-relaxed shadow-inner">
                      {generatedCommand}
                   </div>
                </div>
                <button onClick={copyToClipboard} className={`h-24 shrink-0 flex items-center justify-center gap-5 px-14 rounded-[2rem] text-[11px] font-black transition-all active:scale-95 w-full md:w-auto shadow-2xl uppercase tracking-[0.3em] ${copied ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 border border-emerald-400/20'}`}>
                   {copied ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                   {copied ? 'COPIED' : 'COPY COMMAND'}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
