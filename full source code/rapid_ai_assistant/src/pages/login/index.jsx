import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyLogo from './components/CompanyLogo';
import LoginForm from './components/LoginForm';
import SecurityBadges from './components/SecurityBadges';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      const session = JSON.parse(userSession);
      // Check if session is still valid (optional: add expiry logic)
      if (session.email) {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-card border border-border rounded-2xl shadow-modal p-8">
              <CompanyLogo />
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Right Side - Security Information (Desktop Only) */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-muted/30">
          <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Enterprise-Grade Security
              </h2>
              <p className="text-lg text-muted-foreground">
                Your documents are processed with the highest level of security and privacy protection.
              </p>
            </div>
            
            <SecurityBadges />
            
            {/* Additional Trust Elements */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                <span>System Status: Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Security Info */}
      <div className="lg:hidden px-6 pb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <SecurityBadges />
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Rapid AI Assistant. All rights reserved. | 
          <span className="mx-2">Privacy Policy</span> | 
          <span className="mx-2">Terms of Service</span>
        </p>
      </footer>
    </div>
  );
};

export default Login;