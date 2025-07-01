export const fetchWithBase = (url: string, options?: RequestInit) => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    return fetch(`${base}${url}`, options);
};