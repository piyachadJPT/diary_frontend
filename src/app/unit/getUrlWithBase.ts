export const getUrlWithBase = (url: string) => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    return `${base}${url}`;
};