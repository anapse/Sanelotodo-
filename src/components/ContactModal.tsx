import React, { useState } from "react";
import { Mail, Copy, Check, Send, X } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OFFICIAL_CONTACT_EMAIL = "anapse_video@hotmail.com";

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(OFFICIAL_CONTACT_EMAIL);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-[380px] bg-blue-950 border-2 border-amber-500 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,186,19,0.3)] text-white text-center relative overflow-hidden flex flex-col justify-between">
        {/* Botón X de Cierre */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-[10px] uppercase tracking-widest mb-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Contacto Oficial</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wide">
            CONTÁCTANOS
          </h2>
        </div>

        {/* Explicación del Propósito */}
        <div className="px-2 my-2">
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Si tienes alguna pregunta, sugerencia, encontraste un problema o quieres colaborar aportando ideas, preguntas o contenido educativo para mejorar el proyecto, puedes escribirnos directamente.
          </p>
        </div>

        {/* Caja de Correo Oficial */}
        <div className="my-3 p-3 bg-slate-900 border border-amber-500/60 rounded-2xl">
          <span className="block text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">
            Correo Oficial del Creador
          </span>
          <span className="text-sm font-black text-white select-all tracking-wide">
            {OFFICIAL_CONTACT_EMAIL}
          </span>
        </div>

        {/* Botones de Acción */}
        <div className="space-y-2.5 my-2">
          {/* Botón COPIAR CORREO */}
          <button
            onClick={handleCopyEmail}
            className="w-full py-3 px-4 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>✓ CORREO COPIADO</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950" />
                <span>📋 COPIAR CORREO</span>
              </>
            )}
          </button>

          {/* Botón ESCRIBIR CORREO (mailto:) */}
          <a
            href={`mailto:${OFFICIAL_CONTACT_EMAIL}?subject=%C2%BFSABELOTODO%3F%20-%20Contacto`}
            className="w-full py-3 px-4 rounded-2xl bg-blue-900/90 border-2 border-amber-500/80 text-amber-300 font-black text-xs uppercase tracking-wider hover:bg-blue-800 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4 text-amber-400" />
            <span>✉ ESCRIBIR CORREO</span>
          </a>
        </div>

        {/* Botón CERRAR */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-800 border border-slate-600 text-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-700 active:scale-95 transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
