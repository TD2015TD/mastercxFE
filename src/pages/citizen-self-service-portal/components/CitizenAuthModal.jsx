import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CitizenAuthModal = ({ isOpen, onClose, onAuthenticated, language }) => {
  const [authStep, setAuthStep] = useState('login'); // 'login', 'otp'
  const [icNumber, setIcNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const content = {
    en: {
      title: 'Citizen Authentication',
      subtitle: 'Secure login with OTP verification',
      icLabel: 'IC Number',
      icPlaceholder: 'Enter your IC number (e.g., 901234-56-7890)',
      phoneLabel: 'Mobile Number',
      phonePlaceholder: 'Enter your mobile number (+60)',
      otpLabel: 'OTP Code',
      otpPlaceholder: 'Enter 6-digit OTP code',
      sendOtp: 'Send OTP',
      verifyOtp: 'Verify & Login',
      resendOtp: 'Resend OTP',
      backToLogin: 'Back to Login',
      otpSent: 'OTP sent to your mobile number',
      otpExpiry: 'Code expires in 5 minutes',
      mockCredentials: 'Test IC: 901234-56-7890, Phone: +60123456789, OTP: 123456'
    },
    ms: {
      title: 'Pengesahan Warganegara',
      subtitle: 'Log masuk selamat dengan pengesahan OTP',
      icLabel: 'Nombor IC',
      icPlaceholder: 'Masukkan nombor IC anda (cth: 901234-56-7890)',
      phoneLabel: 'Nombor Telefon',
      phonePlaceholder: 'Masukkan nombor telefon (+60)',
      otpLabel: 'Kod OTP',
      otpPlaceholder: 'Masukkan kod OTP 6 digit',
      sendOtp: 'Hantar OTP',
      verifyOtp: 'Sahkan & Log Masuk',
      resendOtp: 'Hantar Semula OTP',
      backToLogin: 'Kembali ke Log Masuk',
      otpSent: 'OTP dihantar ke nombor telefon anda',
      otpExpiry: 'Kod tamat tempoh dalam 5 minit',
      mockCredentials: 'Ujian IC: 901234-56-7890, Telefon: +60123456789, OTP: 123456'
    }
  };

  const t = content?.[language];

  const handleSendOtp = async () => {
    setIsLoading(true);
    setErrors({});

    // Mock validation
    if (icNumber !== '901234-56-7890' || phoneNumber !== '+60123456789') {
      setErrors({ 
        general: language === 'en' ?'Invalid IC number or phone number. Use test credentials.' :'Nombor IC atau telefon tidak sah. Gunakan kelayakan ujian.'
      });
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setAuthStep('otp');
      setIsLoading(false);
    }, 1500);
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setErrors({});

    // Mock validation
    if (otpCode !== '123456') {
      setErrors({ 
        otp: language === 'en' ?'Invalid OTP code. Use: 123456' :'Kod OTP tidak sah. Gunakan: 123456'
      });
      setIsLoading(false);
      return;
    }

    // Simulate verification
    setTimeout(() => {
      const citizenData = {
        icNumber: '901234-56-7890',
        name: 'Ahmad bin Abdullah',
        phoneNumber: '+60123456789',
        email: 'ahmad.abdullah@email.com'
      };
      
      localStorage.setItem('citizen-auth', JSON.stringify(citizenData));
      onAuthenticated(citizenData);
      onClose();
      setIsLoading(false);
    }, 1500);
  };

  const resetAuth = () => {
    setAuthStep('login');
    setIcNumber('');
    setPhoneNumber('');
    setOtpCode('');
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t?.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t?.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
          >
            <Icon name="X" size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {authStep === 'login' ? (
            <div className="space-y-4">
              <Input
                label={t?.icLabel}
                type="text"
                placeholder={t?.icPlaceholder}
                value={icNumber}
                onChange={(e) => setIcNumber(e?.target?.value)}
                error={errors?.general}
                required
              />
              
              <Input
                label={t?.phoneLabel}
                type="tel"
                placeholder={t?.phonePlaceholder}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e?.target?.value)}
                required
              />

              {/* Mock Credentials Info */}
              <div className="bg-muted/50 border border-border rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Icon name="Info" size={16} className="text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">
                      {language === 'en' ? 'Test Credentials:' : 'Kelayakan Ujian:'}
                    </p>
                    <p className="text-xs text-muted-foreground">{t?.mockCredentials}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSendOtp}
                loading={isLoading}
                disabled={!icNumber || !phoneNumber}
                fullWidth
                className="mt-6"
              >
                {t?.sendOtp}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="MessageSquare" size={24} className="text-success" />
                </div>
                <p className="text-sm text-foreground font-medium">{t?.otpSent}</p>
                <p className="text-xs text-muted-foreground mt-1">{t?.otpExpiry}</p>
              </div>

              <Input
                label={t?.otpLabel}
                type="text"
                placeholder={t?.otpPlaceholder}
                value={otpCode}
                onChange={(e) => setOtpCode(e?.target?.value)}
                error={errors?.otp}
                maxLength={6}
                required
              />

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={resetAuth}
                  fullWidth
                >
                  {t?.backToLogin}
                </Button>
                <Button
                  onClick={handleVerifyOtp}
                  loading={isLoading}
                  disabled={otpCode?.length !== 6}
                  fullWidth
                >
                  {t?.verifyOtp}
                </Button>
              </div>

              <button
                onClick={() => setAuthStep('login')}
                className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors duration-200 mt-4"
              >
                {t?.resendOtp}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenAuthModal;