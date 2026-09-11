// The Library's own token. Its contract address lives in the PROJECT_TOKEN_ADDRESS environment
// variable (never in a page field, so visitors can't change it). Anything that isn't a
// well-formed address counts as "not deployed".
export function projectTokenAddress(): string | null {
  const value = process.env.PROJECT_TOKEN_ADDRESS?.trim() ?? "";
  return /^0x[0-9a-fA-F]{40}$/.test(value) ? value : null;
}
