/**
 * Templates per target tool.
 * Each receives an array of formatted claim strings and returns the full file content.
 */

export type Formatter = (claims: string[]) => string;

export const CLAUDE_MD_TEMPLATE: Formatter = (claims) => {
  if (claims.length === 0) {
    return '# Project Context\n\nNo stored instructions.';
  }
  return `# Project Context

> This file is managed by Contrail (deterministic temporal memory).
> Edits will be overwritten on next \`contrail instructions generate\`.

${claims.join('\n\n')}
`;
};

export const AGENTS_MD_TEMPLATE: Formatter = (claims) => {
  if (claims.length === 0) {
    return '# Agent Context\n\nNo stored instructions.';
  }
  return `# Agent Context

> Managed by Contrail. Edits will be overwritten on next \`contrail instructions generate\`.

${claims.join('\n\n')}
`;
};

export const GENERIC_MD_TEMPLATE: Formatter = (claims) => {
  if (claims.length === 0) {
    return 'No stored instructions.';
  }
  return `## Project Memory (Contrail)

${claims.join('\n\n')}
`;
};