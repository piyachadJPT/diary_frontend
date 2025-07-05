export const withBasePath = (path: string) => {
    return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}${path}`;
};
