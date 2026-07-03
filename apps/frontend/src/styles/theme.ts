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
    colorPrimary: '#06B6D4',
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorInfo: '#0EA5E9',

    // Text
    colorTextBase: '#F8FAF8',
    colorTextSecondary: '#94A3B8',

    // Background
    colorBgBase: '#0B0F19',
    colorBgContainer: '#111827',
    colorBgLayout: '#0B0F19',
    colorBgElevated: '#172033',

    // Border
    colorBorder: '#1E293B',
    colorBorderSecondary: 'rgba(30, 41, 59, 0.5)',

    // Typography
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    borderRadius: 10,

    // Shadows (dark-optimized)
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    boxShadowSecondary: '0 2px 8px rgba(0, 0, 0, 0.4)',
  },
  components: {
    Layout: {
      headerBg: '#111827',
      bodyBg: '#0B0F19',
      siderBg: '#111827',
    },
    Menu: {
      itemBorderRadius: 10,
      activeBarBorderWidth: 0,
      itemHoverBg: 'rgba(255, 255, 255, 0.04)',
      itemSelectedBg: 'rgba(6, 182, 212, 0.12)',
      itemSelectedColor: '#06B6D4',
      itemColor: '#94A3B8',
      itemHoverColor: '#F8FAF8',
      subMenuItemBg: 'transparent',
      darkItemBg: '#111827',
      darkItemSelectedBg: 'rgba(6, 182, 212, 0.12)',
      darkItemSelectedColor: '#06B6D4',
      darkItemColor: '#94A3B8',
      darkItemHoverColor: '#F8FAF8',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.04)',
    },
    Card: {
      colorBgContainer: '#111827',
      borderRadiusLG: 14,
      headerFontSize: 18,
      colorBorderSecondary: '#1E293B',
      paddingLG: 24,
    },
    Button: {
      borderRadius: 10,
      controlHeight: 40,
      controlHeightSM: 34,
      controlHeightLG: 48,
      paddingInline: 20,
      defaultBg: '#172033',
      defaultColor: '#F8FAF8',
      defaultBorderColor: '#1E293B',
      primaryColor: '#0B0F19', // Text color on primary buttons
    },
    Input: {
      borderRadius: 10,
      controlHeight: 44,
      paddingInline: 14,
      colorBorder: '#1E293B',
      colorBgContainer: '#111827',
      activeBorderColor: '#06B6D4',
      hoverBorderColor: 'rgba(255, 255, 255, 0.16)',
    },
    Select: {
      borderRadius: 10,
      controlHeight: 44,
      colorBgContainer: '#111827',
      colorBgElevated: '#172033',
      optionSelectedBg: 'rgba(6, 182, 212, 0.12)',
    },
    Table: {
      headerBg: '#172033',
      headerColor: '#94A3B8',
      borderRadius: 10,
      borderColor: '#1E293B',
      rowHoverBg: 'rgba(255, 255, 255, 0.03)',
      colorBgContainer: '#111827',
    },
    Modal: {
      contentBg: '#172033',
      headerBg: '#172033',
      borderRadiusLG: 16,
      paddingLG: 28,
      paddingMD: 28,
    },
    Popover: {
      colorBgElevated: '#172033',
    },
    Dropdown: {
      colorBgElevated: '#172033',
    },
    Badge: {
      colorError: '#EF4444',
    },
    Spin: {
      colorPrimary: '#06B6D4',
    },
    Message: {
      contentBg: '#172033',
    },
    Notification: {
      colorBgElevated: '#172033',
    },
    Tabs: {
      colorBorderSecondary: '#1E293B',
      itemSelectedColor: '#06B6D4',
      inkBarColor: '#06B6D4',
    },
    Tag: {
      colorBgContainer: 'rgba(6, 182, 212, 0.1)',
      colorBorder: 'rgba(6, 182, 212, 0.2)',
      colorText: '#06B6D4',
    },
    Tooltip: {
      colorBgSpotlight: '#1E293B',
      colorTextLightSolid: '#F8FAF8',
    },
  },
};
