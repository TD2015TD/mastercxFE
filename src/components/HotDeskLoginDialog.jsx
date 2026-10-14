import React, { useState } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';

/**
 * HotDeskLoginDialog Component
 *
 * Mirrors Mitel Ignite's own "Log in to a phone" dialog, shown right after
 * an agent connects their Mitel account — Ignite always asks which device
 * to use for voice calls at this point (Desk phone / MiCollab Softphone /
 * Integrated Softphone) before the account can actually go Available.
 *
 * Only "Integrated Softphone" is wired to anything real here — it's the
 * only device type this CRM's softphone (JsSIP/WebRTC) implements, and it's
 * also the only device type this Mitel tenant's agent accounts are actually
 * configured for (confirmed via their own saved hotDeskLoginSettings
 * profile: deviceType "integratedSoftphone", autoRegisterSoftphone true).
 * Desk phone and MiCollab Softphone are shown for visual parity with
 * Ignite, but disabled — the CRM has no call-handling path for either.
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onLogin - called with no args when the agent confirms
 *   Integrated Softphone login (activateOnLogin is implicit — this dialog
 *   only offers the login action, not a separate "save without logging in"
 *   since the CRM has no endpoint to persist that preference)
 * @param {string} extension - the agent's reporting number, shown in the
 *   dialog's question line to match Ignite's own copy
 * @param {boolean} isLoggingIn
 */
const HotDeskLoginDialog = ({ isOpen, onClose, onLogin, extension, isLoggingIn = false }) => {
  const [deviceType, setDeviceType] = useState('integratedSoftphone');
  const [activateOnLogin, setActivateOnLogin] = useState(true);

  if (!isOpen) return null;

  const handleLogin = () => {
    if (deviceType !== 'integratedSoftphone') return;
    onLogin();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg p-6 w-[480px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Log in to a phone</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="x" size={18} />
          </button>
        </div>

        <p className="text-sm font-medium text-foreground mb-4">
          Which extension are you using to accept voice calls{extension ? ` for user ${extension}` : ''}?
        </p>

        <div className="space-y-4">
          {/* Desk phone — visual parity only, not implemented */}
          <div className="opacity-50">
            <label className="flex items-center gap-2 cursor-not-allowed">
              <input type="radio" disabled className="accent-primary" />
              <span className="text-sm font-medium">Desk phone</span>
            </label>
            <div className="ml-6 mt-1 text-xs text-muted-foreground">Not available in the CRM</div>
          </div>

          {/* MiCollab Softphone — visual parity only, not implemented */}
          <div className="opacity-50">
            <label className="flex items-center gap-2 cursor-not-allowed">
              <input type="radio" disabled className="accent-primary" />
              <span className="text-sm font-medium">MiCollab Softphone</span>
            </label>
          </div>

          {/* Integrated Softphone — the only functional option */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={deviceType === 'integratedSoftphone'}
                onChange={() => setDeviceType('integratedSoftphone')}
                className="accent-primary"
              />
              <span className="text-sm font-medium">Integrated Softphone</span>
            </label>
            <label className="ml-6 mt-2 flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={activateOnLogin}
                onChange={(e) => setActivateOnLogin(e.target.checked)}
              />
              Activate on login
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} disabled={isLoggingIn}>
            Cancel
          </Button>
          <Button
            onClick={handleLogin}
            disabled={deviceType !== 'integratedSoftphone' || !activateOnLogin || isLoggingIn}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HotDeskLoginDialog;
