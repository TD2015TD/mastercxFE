import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const CustomerProfileHeader = ({ customer, customerContacts = [], onEdit, onCreateTicket, onScheduleCallback }) => {
  const getStatusColor = (status) => {
    const statusColors = {
      'Active': 'bg-success text-success-foreground',
      'Inactive': 'bg-muted text-muted-foreground',
      'Suspended': 'bg-error text-error-foreground',
      'Pending': 'bg-warning text-warning-foreground'
    };
    return statusColors?.[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Profile Information */}
        <div className="flex flex-col sm:flex-row gap-6 flex-1">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              {customer?.avatar ? (
                <Image
                  src={customer.avatar}
                  alt={customer?.avatarAlt || customer?.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-border"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-border flex items-center justify-center">
                  <Icon name="User" size={40} className="text-primary" />
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-card flex items-center justify-center ${getStatusColor(customer?.status)}`}>
                <Icon name="Circle" size={12} />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-1">
                  {customer?.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="Hash" size={14} />
                    {customer?.customerId}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="CreditCard" size={14} />
                    {customer?.icNumber}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer?.status)}`}>
                    {customer?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon name="Mail" size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{customer?.email}</p>
                    <p className="text-xs text-muted-foreground">Primary Email</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Phone" size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    {customerContacts.length > 0 ? (
                      <div className="space-y-1">
                        {customerContacts.slice(0, 3).map((contact) => (
                          <p key={contact.id} className="text-sm font-medium text-foreground truncate">
                            {(contact.contactType?.name_en || contact.contactType?.name_ms || 'Contact')}: {contact.value}
                            {contact.is_primary ? ' (Primary)' : ''}
                          </p>
                        ))}
                        {customerContacts.length > 3 && (
                          <p className="text-xs text-muted-foreground">+{customerContacts.length - 3} more contacts</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-foreground">No contacts added</p>
                        <p className="text-xs text-muted-foreground">Add contact methods from Edit Profile</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon name="MapPin" size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{customer?.address}</p>
                    <p className="text-xs text-muted-foreground">Registered Address</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Building" size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{customer?.organization}</p>
                    <p className="text-xs text-muted-foreground">Organization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
          <Button
            variant="default"
            iconName="Plus"
            iconPosition="left"
            onClick={onCreateTicket}
            className="w-full"
          >
            Create Ticket
          </Button>
          <Button
            variant="outline"
            iconName="Calendar"
            iconPosition="left"
            onClick={onScheduleCallback}
            className="w-full"
          >
            Schedule Callback
          </Button>
          <Button
            variant="ghost"
            iconName="Edit"
            iconPosition="left"
            onClick={onEdit}
            className="w-full"
          >
            Edit Profile
          </Button>
        </div>
      </div>
      {/* Additional Information */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Customer Since</h3>
            <p className="text-sm text-muted-foreground">{customer?.customerSince}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Preferred Language</h3>
            <p className="text-sm text-muted-foreground">{customer?.preferredLanguage}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Last Contact</h3>
            <p className="text-sm text-muted-foreground">{customer?.lastContact}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfileHeader;