export function resolveEndpoint(url: string, params: Record<string, string>) {
    return url.replace(/\{(\w+)}/g, ($0, key) => params[key] || `[undefined parameter ${ key }]`);
}
