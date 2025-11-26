import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SuccessModal = ({ isOpen, onClose, complaintData, language }) => {
  const content = {
    en: {
      title: 'Complaint Submitted Successfully',
      subtitle: 'Your complaint has been received and is being processed',
      complaintId: 'Complaint ID',
      keepRecord: 'Please keep this ID for tracking your case',
      estimatedResolution: 'Estimated Resolution Time',
      assignedDepartment: 'Assigned Department',
      nextSteps: 'What happens next?',
      step1: 'Your complaint will be reviewed within 24 hours',
      step2: 'You will receive email updates on progress',
      step3: 'Our team will contact you if additional information is needed',
      step4: 'You can track status anytime using your complaint ID',
      trackCase: 'Track Your Case',
      submitAnother: 'Submit Another Complaint',
      close: 'Close',
      emailNotification: 'Email notification sent to'
    },
    ms: {
      title: 'Aduan Berjaya Dihantar',
      subtitle: 'Aduan anda telah diterima dan sedang diproses',
      complaintId: 'ID Aduan',
      keepRecord: 'Sila simpan ID ini untuk menjejak kes anda',
      estimatedResolution: 'Anggaran Masa Penyelesaian',
      assignedDepartment: 'Jabatan Ditugaskan',
      nextSteps: 'Apa yang berlaku seterusnya?',
      step1: 'Aduan anda akan disemak dalam masa 24 jam',
      step2: 'Anda akan menerima kemaskini email mengenai kemajuan',
      step3: 'Pasukan kami akan menghubungi anda jika maklumat tambahan diperlukan',
      step4: 'Anda boleh menjejak status bila-bila masa menggunakan ID aduan anda',
      trackCase: 'Jejak Kes Anda',
      submitAnother: 'Hantar Aduan Lain',
      close: 'Tutup',
      emailNotification: 'Pemberitahuan email dihantar ke'
    }
  };

  const t = content?.[language];

  if (!isOpen || !complaintData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-modal w-full max-w-lg">
        {/* Header */}
        <div className="text-center p-6 border-b border-border">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-success" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">{t?.title}</h2>
          <p className="text-sm text-muted-foreground">{t?.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Complaint ID */}
          <div className="bg-success/5 border border-success/20 rounded-lg p-4 mb-6">
            <div className="text-center">
              <span className="text-sm font-medium text-foreground block mb-2">{t?.complaintId}</span>
              <div className="text-2xl font-mono font-bold text-success mb-2">{complaintData?.id}</div>
              <p className="text-xs text-muted-foreground">{t?.keepRecord}</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <span className="text-xs font-medium text-muted-foreground block mb-1">
                  {t?.estimatedResolution}
                </span>
                <p className="text-sm text-foreground">{complaintData?.estimatedResolution}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <span className="text-xs font-medium text-muted-foreground block mb-1">
                  {t?.assignedDepartment}
                </span>
                <p className="text-sm text-foreground">{complaintData?.assignedDepartment}</p>
              </div>
            </div>

            {/* Email Notification */}
            <div className="flex items-center space-x-2 text-sm">
              <Icon name="Mail" size={16} className="text-success" />
              <span className="text-muted-foreground">{t?.emailNotification}</span>
              <span className="text-foreground font-medium">{complaintData?.citizenData?.email}</span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-foreground mb-3">{t?.nextSteps}</h3>
            <div className="space-y-3">
              {[
                { icon: 'Clock', text: t?.step1 },
                { icon: 'Mail', text: t?.step2 },
                { icon: 'Phone', text: t?.step3 },
                { icon: 'Search', text: t?.step4 }
              ]?.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon name={step?.icon} size={12} className="text-primary" />
                  </div>
                  <p className="text-sm text-foreground">{step?.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              fullWidth
              iconName="Search"
              iconPosition="left"
            >
              {t?.trackCase}
            </Button>
            <Button
              onClick={onClose}
              fullWidth
              iconName="Plus"
              iconPosition="left"
            >
              {t?.submitAnother}
            </Button>
          </div>

          {/* Close Button */}
          <div className="text-center mt-4">
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {t?.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;