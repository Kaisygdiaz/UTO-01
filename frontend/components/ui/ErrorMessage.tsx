interface ErrorMessageProps {
  mensaje: string;
}

export default function ErrorMessage({ mensaje }: ErrorMessageProps) {
  if (!mensaje) return null;

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
      {mensaje}
    </div>
  );
}