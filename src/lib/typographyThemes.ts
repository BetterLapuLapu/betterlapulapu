/**
 * Typography theme configuration for markdown content
 */

export interface TypographyTheme {
  name: string;
  components: {
    h1?: string;
    h2?: string;
    h3?: string;
    h4?: string;
    h5?: string;
    h6?: string;
    p?: string;
    small?: string;
    ul?: string;
    ol?: string;
    li?: string;
    'li.task-list-item'?: string; // Checklist items
    blockquote?: string;
    code?: string;
    pre?: string;
    a?: string;
    strong?: string;
    em?: string;
    hr?: string;
    table?: string;
    thead?: string;
    tbody?: string;
    tr?: string;
    th?: string;
    td?: string;
  };
}

// Default theme: the site's typography (see the type-* utilities
// in src/index.css)
export const defaultTheme: TypographyTheme = {
  name: 'default',
  components: {
    h1: 'type-xl mb-[30px] tablet:mb-[50px]',
    h2: 'type-l mt-[30px] mb-[15px] tablet:mt-[45px] tablet:mb-[20px]',
    h3: 'type-m mt-[25px] mb-[15px] tablet:mt-[30px] tablet:mb-[20px]',
    h4: 'type-s mt-[20px] mb-[15px] tablet:mt-[25px] tablet:mb-[20px]',
    h5: 'type-s mt-[20px] mb-[15px] tablet:mb-[20px]',
    h6: 'type-s mt-[20px] mb-[15px] tablet:mb-[20px]',
    p: 'type-body mb-[15px] tablet:mb-[20px]',
    small: 'type-small',
    ul: 'type-body mb-[15px] list-disc space-y-[5px] pl-5 tablet:mb-[20px] [&_ul]:mt-[5px] [&_ul]:mb-0',
    ol: 'type-body mb-[15px] list-decimal space-y-[5px] pl-5 tablet:mb-[20px] [&_ol]:mt-[5px] [&_ol]:mb-0',
    li: '[&>p]:mb-[5px]',
    'li.task-list-item': 'type-body',
    blockquote:
      'my-[20px] border-l-[10px] border-rule p-[15px] tablet:my-[30px] [&>p:last-child]:mb-0',
    code: 'bg-surface px-1 font-mono text-[0.9em]',
    pre: 'mb-[20px] overflow-x-auto bg-surface p-[15px] font-mono type-small',
    a: 'link',
    strong: 'font-bold',
    em: 'italic',
    hr: 'my-[30px] border-t border-rule tablet:my-10',
    table: 'type-small w-full border-collapse',
    thead: '',
    tbody: '',
    tr: '',
    th: 'border-b border-rule py-2.5 pr-5 text-left align-top font-bold',
    td: 'border-b border-rule py-2.5 pr-5 text-left align-top',
  },
};

// Available themes
export const typographyThemes: Record<string, TypographyTheme> = {
  default: defaultTheme,
};

/**
 * Get a typography theme by name
 */
export function getTypographyTheme(
  themeName: string = 'default'
): TypographyTheme {
  return typographyThemes[themeName] || defaultTheme;
}
