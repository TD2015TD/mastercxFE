import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const RelationshipMapping = ({ relationships }) => {
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'tree'

  const getRelationshipIcon = (type) => {
    const iconMap = {
      'organization': 'Building',
      'family': 'Users',
      'business': 'Briefcase',
      'subsidiary': 'GitBranch',
      'partner': 'Handshake',
      'vendor': 'Truck',
      'customer': 'User'
    };
    return iconMap?.[type] || 'Link';
  };

  const getRelationshipColor = (type) => {
    const colorMap = {
      'organization': 'text-blue-600 bg-blue-50',
      'family': 'text-green-600 bg-green-50',
      'business': 'text-purple-600 bg-purple-50',
      'subsidiary': 'text-orange-600 bg-orange-50',
      'partner': 'text-indigo-600 bg-indigo-50',
      'vendor': 'text-red-600 bg-red-50',
      'customer': 'text-gray-600 bg-gray-50'
    };
    return colorMap?.[type] || 'text-muted-foreground bg-muted';
  };

  const handleRelationshipClick = (relationship) => {
    setSelectedRelationship(relationship);
  };

  const closeModal = () => {
    setSelectedRelationship(null);
  };

  const renderListView = () => (
    <div className="space-y-4">
      {relationships?.map((relationship) => {
        const colorClasses = getRelationshipColor(relationship?.type);
        const [textColor, bgColor] = colorClasses?.split(' ');
        
        return (
          <div
            key={relationship?.id}
            onClick={() => handleRelationshipClick(relationship)}
            className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              {/* Avatar/Icon */}
              <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0`}>
                {relationship?.avatar ? (
                  <Image
                    src={relationship?.avatar}
                    alt={relationship?.avatarAlt}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Icon name={getRelationshipIcon(relationship?.type)} size={20} className={textColor} />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {relationship?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {relationship?.relationshipType} • {relationship?.type}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${textColor} ${bgColor}`}>
                    {relationship?.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {relationship?.email && (
                    <div className="flex items-center gap-1">
                      <Icon name="Mail" size={12} />
                      <span>{relationship?.email}</span>
                    </div>
                  )}
                  {relationship?.phone && (
                    <div className="flex items-center gap-1">
                      <Icon name="Phone" size={12} />
                      <span>{relationship?.phone}</span>
                    </div>
                  )}
                  {relationship?.department && (
                    <div className="flex items-center gap-1">
                      <Icon name="Building" size={12} />
                      <span>{relationship?.department}</span>
                    </div>
                  )}
                  {relationship?.establishedDate && (
                    <div className="flex items-center gap-1">
                      <Icon name="Calendar" size={12} />
                      <span>Since {relationship?.establishedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTreeView = () => (
    <div className="space-y-6">
      {/* Organization Hierarchy */}
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Organization Structure</h3>
        <div className="space-y-3">
          {relationships?.filter(r => r?.type === 'organization' || r?.type === 'subsidiary')?.map((org, index) => (
              <div key={org?.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {index > 0 && <div className="w-4 h-px bg-border"></div>}
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{org?.name}</p>
                  <p className="text-xs text-muted-foreground">{org?.relationshipType}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
      
      {/* Personal Relationships */}
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Personal Connections</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {relationships?.filter(r => r?.type === 'family' || r?.type === 'customer')?.map((person) => (
              <div key={person?.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="User" size={14} color="white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{person?.name}</p>
                  <p className="text-xs text-muted-foreground">{person?.relationshipType}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Relationship Mapping</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {relationships?.length} connected entities
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === 'list' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="List" size={16} className="inline mr-1" />
              List
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                viewMode === 'tree' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="GitBranch" size={16} className="inline mr-1" />
              Tree
            </button>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-6">
        {relationships?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No relationships found</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? renderListView() : renderTreeView()}
          </>
        )}
      </div>
      {/* Relationship Detail Modal */}
      {selectedRelationship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Relationship Details</h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  {selectedRelationship?.avatar ? (
                    <Image
                      src={selectedRelationship?.avatar}
                      alt={selectedRelationship?.avatarAlt}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Icon name={getRelationshipIcon(selectedRelationship?.type)} size={24} color="white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {selectedRelationship?.name}
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    {selectedRelationship?.relationshipType} • {selectedRelationship?.type}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelationshipColor(selectedRelationship?.type)}`}>
                    {selectedRelationship?.status}
                  </span>
                </div>
              </div>
              
              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRelationship?.email && (
                    <div className="flex items-center gap-3">
                      <Icon name="Mail" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedRelationship?.email}</span>
                    </div>
                  )}
                  {selectedRelationship?.phone && (
                    <div className="flex items-center gap-3">
                      <Icon name="Phone" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedRelationship?.phone}</span>
                    </div>
                  )}
                  {selectedRelationship?.address && (
                    <div className="flex items-center gap-3">
                      <Icon name="MapPin" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedRelationship?.address}</span>
                    </div>
                  )}
                  {selectedRelationship?.department && (
                    <div className="flex items-center gap-3">
                      <Icon name="Building" size={16} className="text-muted-foreground" />
                      <span className="text-sm text-foreground">{selectedRelationship?.department}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Additional Details */}
              {selectedRelationship?.description && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedRelationship?.description}
                  </p>
                </div>
              )}
              
              {/* Timeline */}
              {selectedRelationship?.establishedDate && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Timeline</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Icon name="Calendar" size={16} />
                    <span>Established: {selectedRelationship?.establishedDate}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipMapping;