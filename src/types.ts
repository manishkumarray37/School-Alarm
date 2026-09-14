export interface CodeFile {
  id: string;
  name: string;
  path: string;
  language: string;
  description: string;
  specRequirement: string;
  content: string;
}

export interface SpecItem {
  id: number;
  category: string;
  title: string;
  description: string;
  status: 'implemented' | 'ready';
  relevantFiles: string[];
  keySnippets: string[];
}

export type SimulatorTab = 'simulator' | 'code' | 'specs';

export type DeviceModel = 'iPhone 16 Pro' | 'iPhone 15' | 'iPad Mini';

export interface DownloadModalData {
  isOpen: boolean;
  filename: string;
  size: string;
  fileType: 'pdf' | 'doc' | 'image';
  url: string;
}

export interface PermissionModalData {
  isOpen: boolean;
  type: 'camera' | 'microphone' | 'photo' | 'location';
  title: string;
  description: string;
}
