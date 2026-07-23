export default function ConfirmDialog({ title, message, confirmLabel = "確定", onConfirm, onCancel }: {
  title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void;
}) {
  return <div className="overlay"><section className="modal" role="alertdialog" aria-modal="true">
    <div className="modal-head"><h2>{title}</h2><button className="close" onClick={onCancel}>×</button></div>
    <p>{message}</p>
    <div className="segmented"><button className="chip" onClick={onCancel}>キャンセル</button><button className="confirm" onClick={onConfirm}>{confirmLabel}</button></div>
  </section></div>;
}
