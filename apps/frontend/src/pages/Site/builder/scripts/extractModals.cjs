const fs = require('fs');
const path = require('path');

const toolbarPath = path.join(__dirname, '../CanvasToolbar.tsx');
const content = fs.readFileSync(toolbarPath, 'utf8');

const lines = content.split('\n');

const beforeModals = lines.slice(0, 406); // 0 to 405 (up to line 406)
const modals = lines.slice(406, 1405); // 406 to 1404
const afterModals = lines.slice(1405); // 1405 to end

// Find all the state variables to pass as props
const propsDefinition = `
export interface CanvasToolbarModalsProps {
  isRenameModalOpen: boolean;
  setIsRenameModalOpen: (val: boolean) => void;
  isChatSettingsOpen: boolean;
  setIsChatSettingsOpen: (val: boolean) => void;
  isBugReportOpen: boolean;
  setIsBugReportOpen: (val: boolean) => void;
  isCustomInstOpen: boolean;
  setIsCustomInstOpen: (val: boolean) => void;
  
  activeDrawerTab: any;
  setActiveDrawerTab: (val: any) => void;
  
  nameVal: string;
  setNameVal: (val: string) => void;
  descVal: string;
  setDescVal: (val: string) => void;
  promptVal: string;
  setPromptVal: (val: string) => void;
  
  handleSaveRename: () => void;
  onPublish?: () => void;
  
  selectedModel: string;
  setSelectedModel: (val: string) => void;
  micSource: string;
  setMicSource: (val: string) => void;
  shareAccess: string;
  setShareAccess: (val: string) => void;
  defaultFullscreen: boolean;
  setDefaultFullscreen: (val: boolean) => void;
  includeChatHistory: boolean;
  setIncludeChatHistory: (val: boolean) => void;
  bugReportText: string;
  setBugReportText: (val: string) => void;
}
`;

const modalsComponent = `
import React from 'react';
import { Modal, Drawer, Switch, Input, message } from 'antd';
import {
  GlobalOutlined, LockOutlined, LinkOutlined, SearchOutlined, ClockCircleOutlined, FlagOutlined,
  GithubOutlined, CloudUploadOutlined, DatabaseOutlined, CreditCardOutlined, MailOutlined,
  ApiOutlined, BarChartOutlined, SafetyCertificateOutlined, DownOutlined, CloseOutlined,
  PlayCircleOutlined, InfoCircleOutlined, CheckCircleOutlined, CopyOutlined, ShareAltOutlined
} from '@ant-design/icons';

${propsDefinition}

export const CanvasToolbarModals: React.FC<CanvasToolbarModalsProps> = ({
  isRenameModalOpen, setIsRenameModalOpen,
  isChatSettingsOpen, setIsChatSettingsOpen,
  isBugReportOpen, setIsBugReportOpen,
  isCustomInstOpen, setIsCustomInstOpen,
  activeDrawerTab, setActiveDrawerTab,
  nameVal, setNameVal,
  descVal, setDescVal,
  promptVal, setPromptVal,
  handleSaveRename, onPublish,
  selectedModel, setSelectedModel,
  micSource, setMicSource,
  shareAccess, setShareAccess,
  defaultFullscreen, setDefaultFullscreen,
  includeChatHistory, setIncludeChatHistory,
  bugReportText, setBugReportText
}) => {
  return (
    <>
${modals.join('\n')}
    </>
  );
};
`;

const modalsDir = path.join(__dirname, '../modals');
if (!fs.existsSync(modalsDir)) {
  fs.mkdirSync(modalsDir);
}
fs.writeFileSync(path.join(modalsDir, 'CanvasToolbarModals.tsx'), modalsComponent);

const propsCall = `
      <CanvasToolbarModals
        isRenameModalOpen={isRenameModalOpen} setIsRenameModalOpen={setIsRenameModalOpen}
        isChatSettingsOpen={isChatSettingsOpen} setIsChatSettingsOpen={setIsChatSettingsOpen}
        isBugReportOpen={isBugReportOpen} setIsBugReportOpen={setIsBugReportOpen}
        isCustomInstOpen={isCustomInstOpen} setIsCustomInstOpen={setIsCustomInstOpen}
        activeDrawerTab={activeDrawerTab} setActiveDrawerTab={setActiveDrawerTab}
        nameVal={nameVal} setNameVal={setNameVal}
        descVal={descVal} setDescVal={setDescVal}
        promptVal={promptVal} setPromptVal={setPromptVal}
        handleSaveRename={handleSaveRename} onPublish={onPublish}
        selectedModel={selectedModel} setSelectedModel={setSelectedModel}
        micSource={micSource} setMicSource={setMicSource}
        shareAccess={shareAccess} setShareAccess={setShareAccess}
        defaultFullscreen={defaultFullscreen} setDefaultFullscreen={setDefaultFullscreen}
        includeChatHistory={includeChatHistory} setIncludeChatHistory={setIncludeChatHistory}
        bugReportText={bugReportText} setBugReportText={setBugReportText}
      />
`;

// Also need to add import to CanvasToolbar
const finalToolbar = beforeModals.join('\n').replace(
  "import { updateSiteApi, deleteSiteApi } from '../../../api/sites';",
  "import { updateSiteApi, deleteSiteApi } from '../../../api/sites';\nimport { CanvasToolbarModals } from './modals/CanvasToolbarModals';"
) + propsCall + afterModals.join('\n');

fs.writeFileSync(toolbarPath, finalToolbar);

console.log("Successfully extracted modals.");
