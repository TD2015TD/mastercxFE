import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PublicTicketSubmitForm from './components/PublicTicketSubmitForm';
import PublicTicketTrackForm from './components/PublicTicketTrackForm';

const CitizenSelfServicePortal = () => {
  const [activeTab, setActiveTab] = useState('submit');

  const tabs = [
    { id: 'submit', label: 'Submit Ticket', icon: 'Plus' },
    { id: 'track', label: 'Track Status', icon: 'Search' },
    { id: 'my-tickets', label: 'My Tickets', icon: 'List' },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: 'BookOpen' },
    { id: 'contact', label: 'Contact Us', icon: 'Phone' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'submit':
        return <PublicTicketSubmitForm />;
      
      case 'track':
        return <PublicTicketTrackForm />;
      
      case 'my-tickets':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="List" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">My Tickets</h3>
            <p className="text-muted-foreground mb-6">
              View all your submitted tickets and their current status.
            </p>
            <Button variant="outline" iconName="LogIn" iconPosition="left">
              Login to View Tickets
            </Button>
          </div>
        );
      
      case 'knowledge-base':
        return (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <Icon name="BookOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Knowledge Base</h3>
            <p className="text-muted-foreground mb-6">
              Browse frequently asked questions and helpful articles.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
              <div className="p-6 bg-muted/30 rounded-lg">
                <Icon name="FileText" size={32} className="mx-auto mb-2 text-primary" />
                <p className="font-medium text-foreground">Customs Declaration</p>
              </div>
              <div className="p-6 bg-muted/30 rounded-lg">
                <Icon name="DollarSign" size={32} className="mx-auto mb-2 text-primary" />
                <p className="font-medium text-foreground">Tax & Duties</p>
              </div>
              <div className="p-6 bg-muted/30 rounded-lg">
                <Icon name="Package" size={32} className="mx-auto mb-2 text-primary" />
                <p className="font-medium text-foreground">Import/Export</p>
              </div>
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="bg-card rounded-lg border border-border p-12">
            <div className="max-w-2xl mx-auto text-center">
              <Icon name="Phone" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Contact Us</h3>
              <p className="text-muted-foreground mb-8">
                Get in touch with our customer support team.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="p-6 bg-muted/30 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Icon name="Phone" size={20} className="mr-2 text-primary" />
                    <h4 className="font-semibold text-foreground">Phone</h4>
                  </div>
                  <p className="text-muted-foreground">+60 3-8000 8000</p>
                  <p className="text-sm text-muted-foreground mt-1">Mon-Fri: 9:00 AM - 5:00 PM</p>
                </div>
                
                <div className="p-6 bg-muted/30 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Icon name="Mail" size={20} className="mr-2 text-primary" />
                    <h4 className="font-semibold text-foreground">Email</h4>
                  </div>
                  <p className="text-muted-foreground">support@jkdm.gov.my</p>
                  <p className="text-sm text-muted-foreground mt-1">Response within 24 hours</p>
                </div>
                
                <div className="p-6 bg-muted/30 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Icon name="MapPin" size={20} className="mr-2 text-primary" />
                    <h4 className="font-semibold text-foreground">Office</h4>
                  </div>
                  <p className="text-muted-foreground">Jabatan Kastam Diraja Malaysia</p>
                  <p className="text-sm text-muted-foreground mt-1">Putrajaya, Malaysia</p>
                </div>
                
                <div className="p-6 bg-muted/30 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Icon name="Globe" size={20} className="mr-2 text-primary" />
                    <h4 className="font-semibold text-foreground">Website</h4>
                  </div>
                  <p className="text-muted-foreground">www.customs.gov.my</p>
                  <p className="text-sm text-muted-foreground mt-1">Visit our main website</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Citizen Self-Service Portal - JKDM</title>
        <meta name="description" content="Submit tickets, track status, and access support resources" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center">
                  <Icon name="Users" size={32} className="mr-3 text-primary" />
                  Citizen Self-Service Portal
                </h1>
                <p className="text-muted-foreground mt-2">
                  Submit tickets, track status, and access support resources
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" iconName="HelpCircle" iconPosition="left">
                  Help
                </Button>
                <Button variant="outline" iconName="LogIn" iconPosition="left">
                  Login
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-border">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Description */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6 border border-border">
            <p className="text-sm text-muted-foreground">
              {activeTab === 'submit' && 'Create a new support ticket for customs-related inquiries and issues.'}
              {activeTab === 'track' && 'Track the status of your submitted tickets using your ticket ID.'}
              {activeTab === 'my-tickets' && 'View all your submitted tickets and their current status.'}
              {activeTab === 'knowledge-base' && 'Browse articles and FAQs to find answers to common questions.'}
              {activeTab === 'contact' && 'Contact our support team through phone, email, or visit our office.'}
            </p>
          </div>

          {/* Tab Content */}
          <div className="mb-8">
            {renderTabContent()}
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Icon name="Zap" size={20} className="mr-2 text-primary" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start" iconName="Plus" iconPosition="left">
                Submit Ticket
              </Button>
              <Button variant="outline" className="justify-start" iconName="Search" iconPosition="left">
                Track Status
              </Button>
              <Button variant="outline" className="justify-start" iconName="BookOpen" iconPosition="left">
                Search KB
              </Button>
              <Button variant="outline" className="justify-start" iconName="Phone" iconPosition="left">
                Contact Support
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CitizenSelfServicePortal;
