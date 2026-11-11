import React from 'react';
import { useLang } from '../../i18n/LangContext';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { UpdateItem } from '../../types';

export const UPDATES_LIST: UpdateItem[] = [
  {
    version: 'v1.9',
    title: 'faster servers + speed boost',
    body: 'we reworked the network and server picking under the hood for lower, steadier ping. phantom also gets a new speed boost card — set your in-match move speed from 1.0 to 1.5x. these updates are still rolling out, so use them at your own risk for now.',
  },
  {
    version: 'v1.8',
    title: 'new app: Hiddify',
    body: 'we moved from Happ to Hiddify. open setup on the home screen — install Hiddify, add your key, turn it on. your key and your time are safe, and one key now works on one phone at a time.',
  },
  {
    version: 'v1.7',
    title: 'aim lag is back, next to aimpoint',
    body: 'aim lag is back, sitting under aimpoint. run it with aimpoint or on its own. every feature now carries a short description in your own language.',
  },
  {
    version: 'v1.6',
    title: 'aimpoint replaces aim lag',
    body: 'new aimpoint: your aim assist locks onto the neck instead of the chest, so shots that used to hit the body land as headshots. one switch, works on every gun, applies from the start of your next match.',
  },
  {
    version: 'v1.5',
    title: 'aim lag paused',
    body: 'aim lag is marked risk and switched off in the app while we fix it — the toggle is greyed out for everyone. every other feature is unaffected.',
  },
  {
    version: 'v1.4',
    title: 'fast revive + rebuilt aim lag',
    body: 'new fast revive: pick a knocked teammate up in about 100 ms instead of ~3 seconds. aim lag was rebuilt to freeze the targets position instead of dropping packets, so it no longer stutters your own movement.',
  },
  {
    version: 'v1.3',
    title: 'smarter server picking',
    body: 'your config now picks the node with the lowest real ping to your own match server, measured every 15 minutes, not the closest one on a map. failed key imports now show the reason right in the app.',
  },
  {
    version: 'v1.2',
    title: 'fast landing + europe node',
    body: 'added fast landing: drop straight onto a saved waypoint instead of following the flight path. a france node was added for europe, north africa and the middle east.',
  },
  {
    version: 'v1.1',
    title: 'device lock + stability',
    body: 'keys are locked to one device and each account gets its own tunnel. fixed markers dying after the first match and sessions colliding between accounts.',
  },
  {
    version: 'v1.0',
    title: 'initial release',
    body: 'key-based access, live marker and aim-lag toggles, and one-tap setup.',
  },
];

interface UpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  updates?: UpdateItem[];
}

export const UpdatesModal: React.FC<UpdatesModalProps> = ({
  isOpen,
  onClose,
  updates = UPDATES_LIST,
}) => {
  const { t } = useLang();

  if (!isOpen) return null;

  return (
    <div className="ph-scrim ph-scrim--center">
      <div className="ph-modal ph-cut-lg">
        <div className="ph-modal__head">
          <div className="ph-modal__title">{t.n_title}</div>
          <button type="button" className="ph-iconbtn" onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <div className="ph-modal__body">
          {updates.map((item, idx) => (
            <div
              key={item.version}
              className={`ph-notify ph-notify--${idx === 0 ? 'update' : 'warn'}`}
            >
              <div className="ph-notify__top">
                <span
                  className="ph-display"
                  dir="ltr"
                  style={{ fontSize: 16, color: 'var(--ph-accent)' }}
                >
                  {item.version}
                </span>
                <span className="ph-notify__title">{item.title}</span>
              </div>
              <div className="ph-notify__body">{item.body}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 8 }}>
          <Button variant="secondary" block onClick={onClose}>
            {t.n_close}
          </Button>
        </div>
      </div>
    </div>
  );
};
