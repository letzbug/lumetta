import { useStore } from '../store/AppStore';
import { Icon } from './Icon';

export function Toast() {
  const { toast } = useStore();
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <Icon name="check" size={18} />
          {toast.text}
        </div>
      )}
    </div>
  );
}
