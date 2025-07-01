import React, { ReactNode } from 'react';
import ThemeRegistry from "../share/ThemeRegistry";

interface AuthLayoutProps {
    children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <ThemeRegistry>
            <div className="bg-gray-100">
                {children}
            </div>
        </ThemeRegistry>
    );
};

export default AuthLayout;