export const getUrlWithBase = (url: string) => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    return `${base}${url}`;
};