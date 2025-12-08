import React, { useState } from 'react';
import axios from 'axios';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ComplaintSubmissionForm = ({ language, citizenData, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    category: '',
    subcategory: '',
    priority: '',
    subject: '',
    description: '',
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const content = {
    en: {
      title: 'Submit New Complaint',
      subtitle: 'Describe your issue and we\'ll route it to the appropriate department',
      categoryLabel: 'Category',
      categoryPlaceholder: 'Select complaint category',
      subcategoryLabel: 'Subcategory',
      subcategoryPlaceholder: 'Select specific issue type',
      priorityLabel: 'Priority Level',
      priorityPlaceholder: 'How urgent is this issue?',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'Brief summary of your complaint',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Provide detailed information about your complaint...',
      attachmentsLabel: 'Attachments',
      attachmentsDesc: 'Upload supporting documents (Max 5MB each, PDF/JPG/PNG)',
      submitButton: 'Submit Complaint',
      draftButton: 'Save as Draft',
      estimatedResolution: 'Estimated Resolution Time',
      departmentRouting: 'Will be routed to'
    },
    ms: {
      title: 'Hantar Aduan Baru',
      subtitle: 'Terangkan isu anda dan kami akan salurkan ke jabatan yang berkaitan',
      categoryLabel: 'Kategori',
      categoryPlaceholder: 'Pilih kategori aduan',
      subcategoryLabel: 'Subkategori',
      subcategoryPlaceholder: 'Pilih jenis isu khusus',
      priorityLabel: 'Tahap Keutamaan',
      priorityPlaceholder: 'Sejauh mana isu ini mendesak?',
      subjectLabel: 'Subjek',
      subjectPlaceholder: 'Ringkasan ringkas aduan anda',
      descriptionLabel: 'Penerangan',
      descriptionPlaceholder: 'Berikan maklumat terperinci tentang aduan anda...',
      attachmentsLabel: 'Lampiran',
      attachmentsDesc: 'Muat naik dokumen sokongan (Maksimum 5MB setiap satu, PDF/JPG/PNG)',
      submitButton: 'Hantar Aduan',
      draftButton: 'Simpan sebagai Draf',
      estimatedResolution: 'Anggaran Masa Penyelesaian',
      departmentRouting: 'Akan disalurkan ke'
    }
  };

  const t = content?.[language];

  const categoryOptions = [
    { value: 'customs_clearance', label: language === 'en' ? 'Customs Clearance' : 'Pelepasan Kastam' },
    { value: 'tax_duties', label: language === 'en' ? 'Tax & Duties' : 'Cukai & Duti' },
    { value: 'import_export', label: language === 'en' ? 'Import/Export Issues' : 'Isu Import/Eksport' },
    { value: 'documentation', label: language === 'en' ? 'Documentation' : 'Dokumentasi' },
    { value: 'enforcement', label: language === 'en' ? 'Enforcement Actions' : 'Tindakan Penguatkuasaan' },
    { value: 'general_inquiry', label: language === 'en' ? 'General Inquiry' : 'Pertanyaan Am' }
  ];

  const subcategoryOptions = {
    customs_clearance: [
      { value: 'delayed_clearance', label: language === 'en' ? 'Delayed Clearance' : 'Kelewatan Pelepasan' },
      { value: 'missing_documents', label: language === 'en' ? 'Missing Documents' : 'Dokumen Hilang' },
      { value: 'incorrect_assessment', label: language === 'en' ? 'Incorrect Assessment' : 'Penilaian Salah' }
    ],
    tax_duties: [
      { value: 'overcharged', label: language === 'en' ? 'Overcharged Duties' : 'Duti Terlebih Caj' },
      { value: 'refund_request', label: language === 'en' ? 'Refund Request' : 'Permintaan Bayaran Balik' },
      { value: 'calculation_error', label: language === 'en' ? 'Calculation Error' : 'Ralat Pengiraan' }
    ]
  };

  const priorityOptions = [
    { value: 'low', label: language === 'en' ? 'Low - General inquiry' : 'Rendah - Pertanyaan am' },
    { value: 'medium', label: language === 'en' ? 'Medium - Business impact' : 'Sederhana - Kesan perniagaan' },
    { value: 'high', label: language === 'en' ? 'High - Urgent resolution needed' : 'Tinggi - Penyelesaian segera diperlukan' },
    { value: 'critical', label: language === 'en' ? 'Critical - Immediate attention required' : 'Kritikal - Perhatian segera diperlukan' }
  ];

  const getEstimatedResolution = (priority) => {
    const resolutionTimes = {
      low: language === 'en' ? '5-7 business days' : '5-7 hari bekerja',
      medium: language === 'en' ? '3-5 business days' : '3-5 hari bekerja',
      high: language === 'en' ? '1-2 business days' : '1-2 hari bekerja',
      critical: language === 'en' ? '4-8 hours' : '4-8 jam'
    };
    return resolutionTimes?.[priority] || '';
  };

  const getDepartmentRouting = (category) => {
    const departments = {
      customs_clearance: language === 'en' ? 'Customs Operations Department' : 'Jabatan Operasi Kastam',
      tax_duties: language === 'en' ? 'Assessment & Collection Department' : 'Jabatan Taksiran & Kutipan',
      import_export: language === 'en' ? 'Trade Facilitation Department' : 'Jabatan Pemudahan Perdagangan',
      documentation: language === 'en' ? 'Documentation Services' : 'Perkhidmatan Dokumentasi',
      enforcement: language === 'en' ? 'Enforcement Division' : 'Bahagian Penguatkuasaan',
      general_inquiry: language === 'en' ? 'Customer Service Department' : 'Jabatan Khidmat Pelanggan'
    };
    return departments?.[category] || '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear related errors
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e?.target?.files);
    const validFiles = files?.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      return validTypes?.includes(file?.type) && file?.size <= maxSize;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev?.attachments, ...validFiles]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev?.attachments?.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.category) {
      newErrors.category = language === 'en' ? 'Please select a category' : 'Sila pilih kategori';
    }
    if (!formData?.subject?.trim()) {
      newErrors.subject = language === 'en' ? 'Subject is required' : 'Subjek diperlukan';
    }
    if (!formData?.description?.trim()) {
      newErrors.description = language === 'en' ? 'Description is required' : 'Penerangan diperlukan';
    }
    if (formData?.description?.trim()?.length < 20) {
      newErrors.description = language === 'en' ?'Description must be at least 20 characters' :'Penerangan mestilah sekurang-kurangnya 20 aksara';
    }
    if (!formData?.priority) {
      newErrors.priority = language === 'en' ? 'Please select priority level' : 'Sila pilih tahap keutamaan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Prepare form data for API
      const submitData = new FormData();
      submitData.append('category', formData.category);
      submitData.append('priority', formData.priority.toLowerCase());
      submitData.append('subject', formData.subject);
      submitData.append('description', formData.description);
      submitData.append('customer_name', citizenData.name);
      submitData.append('customer_email', citizenData.email);
      submitData.append('customer_phone', citizenData.phone || '');
      submitData.append('customer_id_type', citizenData.idType || '');
      submitData.append('customer_id_number', citizenData.idNumber || '');
      
      // Add attachments if any
      formData.attachments.forEach((file) => {
        submitData.append('attachments[]', file);
      });

      // Call API
      const response = await axios.post('/api/v1/public/tickets', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Success - pass real data to parent
      const complaintData = {
        id: response.data.ticket_id,
        ticket_number: response.data.ticket_number,
        ...formData,
        citizenData,
        submittedAt: new Date(),
        status: 'submitted',
        estimatedResolution: response.data.estimated_resolution,
        assignedDepartment: response.data.assigned_department
      };

      onSubmitSuccess(complaintData);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Ticket submission failed:', error);
      
      // Show error to user
      setErrors({
        submit: error.response?.data?.message || 'Failed to submit complaint. Please try again.'
      });
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">{t?.title}</h2>
        <p className="text-sm text-muted-foreground">{t?.subtitle}</p>
      </div>
      <div className="space-y-6">
        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label={t?.categoryLabel}
            placeholder={t?.categoryPlaceholder}
            options={categoryOptions}
            value={formData?.category}
            onChange={(value) => handleInputChange('category', value)}
            error={errors?.category}
            required
          />

          {formData?.category && subcategoryOptions?.[formData?.category] && (
            <Select
              label={t?.subcategoryLabel}
              placeholder={t?.subcategoryPlaceholder}
              options={subcategoryOptions?.[formData?.category]}
              value={formData?.subcategory}
              onChange={(value) => handleInputChange('subcategory', value)}
            />
          )}
        </div>

        {/* Priority Selection */}
        <Select
          label={t?.priorityLabel}
          placeholder={t?.priorityPlaceholder}
          options={priorityOptions}
          value={formData?.priority}
          onChange={(value) => handleInputChange('priority', value)}
          error={errors?.priority}
          required
        />

        {/* Routing Information */}
        {formData?.category && formData?.priority && (
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-foreground">{t?.departmentRouting}:</span>
                <p className="text-muted-foreground mt-1">{getDepartmentRouting(formData?.category)}</p>
              </div>
              <div>
                <span className="font-medium text-foreground">{t?.estimatedResolution}:</span>
                <p className="text-muted-foreground mt-1">{getEstimatedResolution(formData?.priority)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Subject */}
        <Input
          label={t?.subjectLabel}
          type="text"
          placeholder={t?.subjectPlaceholder}
          value={formData?.subject}
          onChange={(e) => handleInputChange('subject', e?.target?.value)}
          error={errors?.subject}
          required
        />

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t?.descriptionLabel} <span className="text-error">*</span>
          </label>
          <textarea
            placeholder={t?.descriptionPlaceholder}
            value={formData?.description}
            onChange={(e) => handleInputChange('description', e?.target?.value)}
            rows={6}
            className={`w-full px-3 py-2 border rounded-md text-sm transition-colors duration-200 resize-none ${
              errors?.description
                ? 'border-error focus:border-error focus:ring-error/20' :'border-border focus:border-ring focus:ring-ring/20'
            } bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2`}
          />
          {errors?.description && (
            <p className="text-xs text-error mt-1">{errors?.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formData?.description?.length}/1000 {language === 'en' ? 'characters' : 'aksara'}
          </p>
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t?.attachmentsLabel}
          </label>
          <p className="text-xs text-muted-foreground mb-3">{t?.attachmentsDesc}</p>
          
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Icon name="Upload" size={32} className="text-muted-foreground" />
              <span className="text-sm text-foreground">
                {language === 'en' ? 'Click to upload files' : 'Klik untuk muat naik fail'}
              </span>
            </label>
          </div>

          {/* Uploaded Files */}
          {formData?.attachments?.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData?.attachments?.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <Icon name="File" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{file?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({(file?.size / 1024 / 1024)?.toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="p-1 rounded-md hover:bg-muted transition-colors duration-200"
                  >
                    <Icon name="X" size={16} className="text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{errors.submit}</p>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => {/* Save as draft logic */}}
            className="sm:w-auto"
          >
            {t?.draftButton}
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!formData?.category || !formData?.subject || !formData?.description || !formData?.priority}
            className="sm:flex-1"
          >
            {t?.submitButton}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintSubmissionForm;