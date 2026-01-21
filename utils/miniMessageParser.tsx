
import React from 'react';

export const parseMiniMessage = (text: string): React.ReactNode => {
  if (!text) return null;

  let html = text;

  // Minecraft Color Mapping
  const colorMap: Record<string, string> = {
    black: '#000000',
    dark_blue: '#0000AA',
    dark_green: '#00AA00',
    dark_aqua: '#00AAAA',
    dark_red: '#AA0000',
    dark_purple: '#AA00AA',
    gold: '#FFAA00',
    gray: '#AAAAAA',
    dark_gray: '#555555',
    blue: '#5555FF',
    green: '#55FF55',
    aqua: '#55FFFF',
    red: '#FF5555',
    light_purple: '#FF55FF',
    yellow: '#FFFF55',
    white: '#FFFFFF',
  };

  // 1. Placeholder replacements for common placeholders
  html = html.replace(/%player_name%|%player%|<player_name>|<player>/gi, 'Steve');
  html = html.replace(/%online%|<online>/gi, '42');

  // 2. Formatting tags
  html = html.replace(/<bold>/gi, '<span style="font-weight: 800; text-shadow: 3px 3px 0px rgba(0,0,0,0.5)">');
  html = html.replace(/<italic>/gi, '<span style="font-style: italic;">');
  html = html.replace(/<underlined>/gi, '<span style="text-decoration: underline;">');
  html = html.replace(/<strikethrough>/gi, '<span style="text-decoration: line-through;">');
  html = html.replace(/<obfuscated>/gi, '<span class="animate-pulse opacity-50 bg-white/20">');
  
  // Closing formatting tags
  html = html.replace(/<\/(bold|italic|underlined|strikethrough|obfuscated)>/gi, '</span>');

  // 3. Simple Minecraft color tags
  Object.entries(colorMap).forEach(([name, hex]) => {
    const reg = new RegExp(`<${name}>`, 'gi');
    html = html.replace(reg, `<span style="color: ${hex}">`);
    const closeReg = new RegExp(`</${name}>`, 'gi');
    html = html.replace(closeReg, `</span>`);
  });

  // 4. Hex colors <color:#xxxxxx>
  html = html.replace(/<color:(#[0-9a-fA-F]{6})>/gi, '<span style="color: $1">');
  html = html.replace(/<\/color>/gi, '</span>');

  // 5. Gradients <gradient:#xxxxxx:#yyyyyy>
  html = html.replace(/<gradient:([^>]+)>/gi, (match, colors) => {
    const colorList = colors.split(':').map((c: string) => c.startsWith('#') ? c : colorMap[c] || c);
    return `<span style="background: linear-gradient(to right, ${colorList.join(', ')}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;">`;
  });
  html = html.replace(/<\/gradient>/gi, '</span>');

  // 6. Rainbow <rainbow>
  html = html.replace(/<rainbow>/gi, '<span style="background: linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;">');
  html = html.replace(/<\/rainbow>/gi, '</span>');

  // 7. Reset tag
  html = html.replace(/<reset>/gi, '</span><span style="color: inherit; font-weight: normal; font-style: normal; text-decoration: none;">');

  // 8. Animation tags {animate:...}
  html = html.replace(/\{animate:([^}]+)\}/gi, '<span class="px-2 py-0.5 mx-1 bg-white/5 rounded border border-white/10 text-[10px] font-sans font-black tracking-widest uppercase opacity-70 animate-pulse" title="Animation: $1">[$1]</span>');

  // 9. Center tag
  html = html.replace(/<center>/gi, '<div style="text-align: center; width: 100%;">');
  html = html.replace(/<\/center>/gi, '</div>');

  // 10. Click/Hover tags (just visual indicators)
  html = html.replace(/<click:[^>]+>/gi, '<span class="border-b border-dashed border-white/40 cursor-pointer">');
  html = html.replace(/<\/click>/gi, '</span>');
  html = html.replace(/<hover:[^>]+>/gi, '<span class="bg-white/5 rounded px-1 group-hover:bg-white/10 transition-colors">');
  html = html.replace(/<\/hover>/gi, '</span>');

  return <div dangerouslySetInnerHTML={{ __html: html }} className="inline" />;
};
