export const getUrlWithBase = (url: string) => {
    const base = process.env.NEXT_PUBLIC_URL || "";
    return `${base}${url}`;
};