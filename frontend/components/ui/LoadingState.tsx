import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  mensaje: string;
}

export default function LoadingState({ mensaje }: LoadingStateProps) {
  return (
    <div className="p-8 flex items-center gap-3 text-slate-600">
      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      {mensaje}
    </div>
  );
}