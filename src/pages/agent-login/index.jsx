import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import LanguageToggle from './components/LanguageToggle';
import SecurityBadges from './components/SecurityBadges';
import LoginHeader from './components/LoginHeader';
import cxLogo from '../../assets/cxlogo.png';

const AgentLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem('jwt_token');
    const userSession = localStorage.getItem('user-session');
    
    if (authToken && userSession) {
      try {
        const session = JSON.parse(userSession);
        // Navigate based on user role
        if (session?.role === 'supervisor') {
          navigate('/supervisor-dashboard');
        } else if (session?.role === 'admin') {
          navigate('/system-administration');
        } else {
          navigate('/agent-dashboard');
        }
      } catch (error) {
        // Clear invalid session data
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user-session');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding and Security */}
          <div className="hidden lg:block space-y-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
                <div className="w-20 h-20 flex items-center justify-center">
                  <img src={cxLogo} alt="CRM Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    JKDM CRM Portal
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Jabatan Kastam Diraja Malaysia
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 text-left">
                <h2 className="text-xl font-semibold text-foreground">
                  Secure Government Portal
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Access the comprehensive customer relationship management system 
                  designed for Malaysian government agencies. Manage tickets, track SLAs, 
                  and provide exceptional citizen services through our secure platform.
                </p>
              </div>
            </div>

            <SecurityBadges />

            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 text-success"
                  >
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground">System Features</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Real-time ticket management and SLA tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Integrated knowledge base and citizen portal</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Advanced analytics and reporting dashboard</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Multi-language support (English & Bahasa Malaysia)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-xl">
              {/* Language Toggle */}
              {/* <div className="flex justify-end mb-6">
                <LanguageToggle />
              </div> */}

              {/* Mobile Header */}
              <div className="lg:hidden mb-8">
                <LoginHeader />
              </div>

              {/* Login Form */}
              <LoginForm />

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  © 2025 CX CRM Solution Suite. All Right Reserved
                </p>
                <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-muted-foreground">
                  <span>Privacy Policy</span>
                  <span>•</span>
                  <span>Terms of Service</span>
                  <span>•</span>
                  <span>Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;