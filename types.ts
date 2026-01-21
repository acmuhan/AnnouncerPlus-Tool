
export type CommandType = 
  | 'broadcast' 
  | 'send' 
  | 'parse' 
  | 'parseanimation'
  | 'broadcasttitle'
  | 'broadcasttoast'
  | 'broadcastactionbar'
  | 'broadcastbossbar'
  | 'reload'
  | 'list';

export interface CommandState {
  type: CommandType;
  player: string;
  config: string;
  world: string;
  text: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  frame: 'task' | 'goal' | 'challenge';
  fadein: number;
  stay: number;
  fadeout: number;
  seconds: number;
  bossbarColor: string;
  bossbarStyle: string;
  bossbarOverlay: string;
  bossbarFillMode: string;
  bossbarProgress: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  command: string;
  state: CommandState;
}

export const INITIAL_COMMAND_STATE: CommandState = {
  type: 'broadcast',
  player: '',
  config: 'all',
  world: '*',
  text: '<green>你好，世界！',
  title: '<gold>欢迎',
  subtitle: '<yellow>来到我们的服务器',
  description: '这是一条提示消息',
  icon: 'minecraft:diamond',
  frame: 'task',
  fadein: 10,
  stay: 70,
  fadeout: 20,
  seconds: 5,
  bossbarColor: 'BLUE',
  bossbarStyle: 'PROGRESS',
  bossbarOverlay: 'PROGRESS',
  bossbarFillMode: 'NATURAL',
  bossbarProgress: 1.0,
};
