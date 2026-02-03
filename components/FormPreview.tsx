import { FormRow } from '@/types/form';

interface PreviewProps {
  rows: FormRow[];
  formData: Record<string, any>;
  updateValue: (id: string, value: any) => void;
}

export default function FormPreview({ rows, formData, updateValue }: PreviewProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-16 shadow-2xl rounded-2xl border border-slate-100 min-h-[80vh]">
      {/* PDF Style Header */}
      <div className="flex justify-between border-b-2 border-slate-900 pb-6 mb-10">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
            Participant Eligibility Form (PEF)
          </h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">EBS-101 EAP (EBS-101-TD-392)</p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full">CONFIDENTIAL</span>
        </div>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {rows.map((row) => (
          <div 
            key={row.id} 
            className={`grid gap-6 grid-cols-${row.fields.length}`}
          >
            {row.fields.map((el) => {
              const val = formData[el.id] || "";

              return (
                <div key={el.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Section Headers (Full Width) */}
                  {el.type === 'header' && (
                    <h2 className="bg-slate-100 text-slate-900 p-3 font-bold uppercase text-xs tracking-widest mt-6 mb-2 border-l-4 border-slate-900">
                      {el.label}
                    </h2>
                  )}

                  {/* Instructions */}
                  {el.type === 'instruction' && (
                    <div className="bg-blue-50/50 border border-blue-100 p-4 mb-2 rounded-lg">
                      <p className="text-xs italic text-blue-800 leading-relaxed">{el.label}</p>
                    </div>
                  )}

                  {/* Text & Date Inputs */}
                  {(el.type === 'text' || el.type === 'date') && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        {el.label}
                      </label>
                      <input 
                        type={el.type} 
                        value={val}
                        onChange={(e) => updateValue(el.id, e.target.value)}
                        className="border-b-2 border-slate-200 focus:border-indigo-600 outline-none py-2 bg-transparent text-sm font-medium transition-all"
                      />
                    </div>
                  )}

                  {/* Select / Radio Groups */}
                  {(el.type === 'select' || el.type === 'radio') && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        {el.label}
                      </label>
                      <div className="flex gap-6 mt-1">
                        {el.options?.map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name={el.id} 
                              checked={val === opt}
                              onChange={() => updateValue(el.id, opt)}
                              className="w-4 h-4 accent-indigo-600" 
                            /> 
                            <span className="text-xs font-bold text-slate-700 uppercase">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </form>

      {/* Footer Info matches PDF Versioning */}
      <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between text-[9px] text-slate-400 font-medium uppercase tracking-widest">
        <span>Version: 0.2</span>
        <span>Page 1 of 4</span>
        <span>Version Date: 23-Oct-2025</span>
      </div>
    </div>
  );
}