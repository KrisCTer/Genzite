/**
 * Ant Design Dark Theme — Genzite Stitch-Style
 *
 * Maps design tokens to Ant Design's token system.
 * Used in App.tsx ConfigProvider.
 */
import type { ThemeConfig } from 'antd';

export const genziteDarkTheme: ThemeConfig = {
  token: {
    // Brand
    colorPrimary: '#14B8A6',
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#0EA5E9',

    // Text
    colorTextBase: '#d4d4d8',
    colorTextSecondary: '#a1a1aa',

    // Background
    colorBgBase: '#0c0c0e',
    colorBgContainer: '#18181b',
    colorBgLayout: '#0c0c0e',
    colorBgElevated: '#1e1e22',

    // Border
    colorBorder: 'rgba(255, 255, 255, 0.08)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.04)',

    // Typography
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    borderRadius: 10,

    // Shadows (dark-optimized)
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.4)',
  },
  components: {
    Layout: {
      headerBg: '#111113',
      bodyBg: '#0c0c0e',
      siderBg: '#111113',
    },
    Menu: {
      itemBorderRadius: 10,
      activeBarBorderWidth: 0,
      itemHoverBg: 'rgba(255, 255, 255, 0.04)',
      itemSelectedBg: 'rgba(20, 184, 166, 0.12)',
      itemSelectedColor: '#14B8A6',
      itemColor: '#a1a1aa',
      itemHoverColor: '#d4d4d8',
      subMenuItemBg: 'transparent',
      darkItemBg: '#111113',
      darkItemSelectedBg: 'rgba(20, 184, 166, 0.12)',
      darkItemSelectedColor: '#14B8A6',
      darkItemColor: '#a1a1aa',
      darkItemHoverColor: '#d4d4d8',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.04)',
    },
    Card: {
      colorBgContainer: '#18181b',
      borderRadiusLG: 14,
      headerFontSize: 18,
      colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',
      paddingLG: 24,
    },
    Button: {
      borderRadius: 10,
      controlHeight: 40,
      controlHeightSM: 34,
      controlHeightLG: 48,
      paddingInline: 20,
      defaultBg: '#1e1e22',
      defaultColor: '#d4d4d8',
      defaultBorderColor: 'rgba(255, 255, 255, 0.08)',
    },
    Input: {
      borderRadius: 10,
      controlHeight: 44,
      paddingInline: 14,
      colorBorder: 'rgba(255, 255, 255, 0.08)',
      colorBgContainer: '#18181b',
      activeBorderColor: '#14B8A6',
      hoverBorderColor: 'rgba(255, 255, 255, 0.16)',
    },
    Select: {
      borderRadius: 10,
      controlHeight: 44,
      colorBgContainer: '#18181b',
      colorBgElevated: '#1e1e22',
      optionSelectedBg: 'rgba(20, 184, 166, 0.12)',
    },
    Table: {
      headerBg: '#111113',
      headerColor: '#a1a1aa',
      borderRadius: 10,
      borderColor: 'rgba(255, 255, 255, 0.06)',
      rowHoverBg: 'rgba(255, 255, 255, 0.03)',
      colorBgContainer: '#18181b',
    },
    Modal: {
      contentBg: '#1e1e22',
      headerBg: '#1e1e22',
      borderRadiusLG: 16,
      paddingLG: 28,
      paddingMD: 28,
    },
    Popover: {
      colorBgElevated: '#1e1e22',
    },
    Dropdown: {
      colorBgElevated: '#1e1e22',
    },
    Badge: {
      colorError: '#EF4444',
    },
    Spin: {
      colorPrimary: '#14B8A6',
    },
    Message: {
      contentBg: '#1e1e22',
    },
    Notification: {
      colorBgElevated: '#1e1e22',
    },
    Tabs: {
      colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',
      itemSelectedColor: '#14B8A6',
      inkBarColor: '#14B8A6',
    },
    Tag: {
      colorBgContainer: 'rgba(20, 184, 166, 0.1)',
      colorBorder: 'rgba(20, 184, 166, 0.2)',
      colorText: '#14B8A6',
    },
    Tooltip: {
      colorBgSpotlight: '#27272a',
      colorTextLightSolid: '#d4d4d8',
    },
  },
};
