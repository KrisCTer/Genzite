export interface PropSchema {
  type: 'string' | 'number' | 'boolean' | 'enum' | 'ReactNode'
  required?: boolean
  default?: unknown
  values?: string[]
  description?: string
}

export interface ComponentSchema {
  type: string
  description: string
  category: 'primitive' | 'composite' | 'layout'
  source: 'custom' | 'radix'
  props: Record<string, PropSchema>
}

export const componentSchemas: Record<string, ComponentSchema> = {
  Button: {
    type: 'Button',
    description: 'Interactive button for user actions and form submissions',
    category: 'primitive',
    source: 'custom',
    props: {
      children: { type: 'string', required: true, description: 'Button label text' },
      variant: { type: 'enum', values: ['primary', 'secondary', 'ghost', 'danger'], default: 'primary' },
      size: { type: 'enum', values: ['sm', 'md', 'lg'], default: 'md' },
      disabled: { type: 'boolean', default: false },
      loading: { type: 'boolean', default: false, description: 'Shows spinner and disables button' },
      leftIcon: { type: 'ReactNode', description: 'Icon element before label' },
      rightIcon: { type: 'ReactNode', description: 'Icon element after label' },
    },
  },

  Input: {
    type: 'Input',
    description: 'Text input field with label, validation, and icon support',
    category: 'primitive',
    source: 'custom',
    props: {
      label: { type: 'string', description: 'Label text above the input' },
      placeholder: { type: 'string' },
      error: { type: 'string', description: 'Error message shown below input' },
      hint: { type: 'string', description: 'Hint text shown when no error' },
      type: { type: 'enum', values: ['text', 'email', 'password', 'number', 'url', 'tel'], default: 'text' },
      disabled: { type: 'boolean', default: false },
      leftIcon: { type: 'ReactNode' },
      rightIcon: { type: 'ReactNode' },
    },
  },

  Textarea: {
    type: 'Textarea',
    description: 'Multi-line text input with optional auto-resize',
    category: 'primitive',
    source: 'custom',
    props: {
      label: { type: 'string' },
      placeholder: { type: 'string' },
      error: { type: 'string' },
      hint: { type: 'string' },
      rows: { type: 'number', default: 3 },
      autoResize: { type: 'boolean', default: false, description: 'Auto-expand height as user types' },
      disabled: { type: 'boolean', default: false },
    },
  },

  Badge: {
    type: 'Badge',
    description: 'Small label for status, category, or tag display',
    category: 'primitive',
    source: 'custom',
    props: {
      children: { type: 'string', required: true },
      variant: { type: 'enum', values: ['solid', 'outline', 'soft'], default: 'soft' },
      color: { type: 'enum', values: ['teal', 'amber', 'rose', 'stone', 'blue'], default: 'teal' },
      size: { type: 'enum', values: ['sm', 'md'], default: 'sm' },
    },
  },

  Spinner: {
    type: 'Spinner',
    description: 'Animated loading indicator',
    category: 'primitive',
    source: 'custom',
    props: {
      size: { type: 'enum', values: ['sm', 'md', 'lg'], default: 'md' },
    },
  },

  Card: {
    type: 'Card',
    description: 'Content container with optional header, body, and footer sections',
    category: 'primitive',
    source: 'custom',
    props: {
      hoverable: { type: 'boolean', default: false, description: 'Adds hover shadow effect' },
      children: { type: 'ReactNode', required: true, description: 'Use Card.Header, Card.Body, Card.Footer' },
    },
  },

  EmptyState: {
    type: 'EmptyState',
    description: 'Placeholder for empty lists or pages with icon, message, and action',
    category: 'primitive',
    source: 'custom',
    props: {
      title: { type: 'string', required: true },
      description: { type: 'string' },
      icon: { type: 'ReactNode' },
      action: { type: 'ReactNode', description: 'CTA button or link' },
    },
  },

  Modal: {
    type: 'Modal',
    description: 'Dialog overlay with focus trap, ESC close, and animations',
    category: 'composite',
    source: 'radix',
    props: {
      open: { type: 'boolean', required: true },
      onOpenChange: { type: 'string', required: true, description: 'Callback: (open: boolean) => void' },
      title: { type: 'string', required: true },
      description: { type: 'string' },
      size: { type: 'enum', values: ['sm', 'md', 'lg'], default: 'md' },
      children: { type: 'ReactNode', required: true },
    },
  },

  Select: {
    type: 'Select',
    description: 'Dropdown select with keyboard navigation and search',
    category: 'composite',
    source: 'radix',
    props: {
      label: { type: 'string' },
      placeholder: { type: 'string', default: 'Select...' },
      options: { type: 'string', required: true, description: 'Array of { value, label, disabled? }' },
      value: { type: 'string' },
      onValueChange: { type: 'string', description: 'Callback: (value: string) => void' },
      error: { type: 'string' },
      disabled: { type: 'boolean', default: false },
    },
  },

  Tooltip: {
    type: 'Tooltip',
    description: 'Hover tooltip with auto-positioning and collision detection',
    category: 'composite',
    source: 'radix',
    props: {
      content: { type: 'string', required: true, description: 'Tooltip text' },
      side: { type: 'enum', values: ['top', 'right', 'bottom', 'left'], default: 'top' },
      delayDuration: { type: 'number', description: 'Delay in ms before showing' },
      children: { type: 'ReactNode', required: true, description: 'Trigger element' },
    },
  },

  DropdownMenu: {
    type: 'DropdownMenu',
    description: 'Context menu with keyboard navigation and nested items',
    category: 'composite',
    source: 'radix',
    props: {
      trigger: { type: 'ReactNode', required: true, description: 'Button or element that opens menu' },
      align: { type: 'enum', values: ['start', 'center', 'end'], default: 'end' },
      children: { type: 'ReactNode', required: true, description: 'DropdownItem, DropdownSeparator, DropdownLabel' },
    },
  },

  Toast: {
    type: 'Toast',
    description: 'Notification toast with auto-dismiss and swipe-to-close',
    category: 'composite',
    source: 'radix',
    props: {
      title: { type: 'string', required: true },
      description: { type: 'string' },
      variant: { type: 'enum', values: ['success', 'error', 'info'], default: 'info' },
    },
  },

  SearchInput: {
    type: 'SearchInput',
    description: 'Search field with icon, debounce, and clear button',
    category: 'layout',
    source: 'custom',
    props: {
      placeholder: { type: 'string', default: 'Search...' },
      value: { type: 'string' },
      onChange: { type: 'string', description: 'Callback: (value: string) => void' },
      debounceMs: { type: 'number', default: 300 },
    },
  },

  PageWrapper: {
    type: 'PageWrapper',
    description: 'Page content wrapper with title, description, and action buttons',
    category: 'layout',
    source: 'custom',
    props: {
      title: { type: 'string' },
      description: { type: 'string' },
      actions: { type: 'ReactNode', description: 'Action buttons in the header area' },
      maxWidth: { type: 'enum', values: ['sm', 'md', 'lg', 'xl', 'full'], default: 'xl' },
      children: { type: 'ReactNode', required: true },
    },
  },

  AppShell: {
    type: 'AppShell',
    description: 'Top-level application layout with sidebar and header slots',
    category: 'layout',
    source: 'custom',
    props: {
      sidebar: { type: 'ReactNode', description: 'Left sidebar navigation' },
      header: { type: 'ReactNode', description: 'Top header bar' },
      children: { type: 'ReactNode', required: true, description: 'Main content area' },
    },
  },
}

export const schemaRegistry = {
  version: '0.1.0',
  designSystem: 'genzite-cozy',
  tailwindVersion: '4',
  totalComponents: Object.keys(componentSchemas).length,
  categories: {
    primitive: Object.values(componentSchemas).filter((s) => s.category === 'primitive').length,
    composite: Object.values(componentSchemas).filter((s) => s.category === 'composite').length,
    layout: Object.values(componentSchemas).filter((s) => s.category === 'layout').length,
  },
  components: componentSchemas,
}
