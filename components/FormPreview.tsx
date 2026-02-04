import { FormSection } from '@/types/form';

interface PreviewProps {
  sections: FormSection[];
  formData: Record<string, any>;
  updateValue: (id: string, value: any) => void;
}

export default function FormPreview({ sections, formData, updateValue }: PreviewProps) {
  // Map column counts to static Tailwind classes so the compiler detects them
  const gridMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-16 shadow-2xl rounded-2xl border border-slate-100 min-h-[80vh]">
      {/* PDF Style Header */}
      <div className="flex justify-between border-b-2 border-slate-900 pb-6 mb-10">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">
            Participant Eligibility Form (PEF)
          </h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight mt-2">EBS-101 EAP (EBS-101-TD-392)</p>
        </div>
        <div className="text-right">
          <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-full tracking-widest">CONFIDENTIAL</span>
        </div>
      </div>

      <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
        {sections.map((section) => (
          <div key={section.id} className="space-y-4">
            {/* Clinical Section Header */}
            <div className="bg-slate-100 border-l-4 border-slate-900 px-4 py-2 mb-6">
              <h2 className="text-slate-900 font-black uppercase text-xs tracking-[0.2em]">
                {section.title}
              </h2>
            </div>

            <div className="space-y-6 px-1">
              {section.rows.map((row) => (
                <div 
                  key={row.id} 
                  // Use the gridMap to ensure classes are correctly applied
                  className={`grid gap-x-12 gap-y-6 ${gridMap[row.fields.length] || 'grid-cols-1'}`}
                >
                  {row.fields.map((el) => {
                    const val = formData[el.id] || "";

                    return (
                      <div key={el.id} className="flex flex-col">
                        {/* Instruction Styling */}
                        {el.type === 'instruction' && (
                          <div className="bg-blue-50/50 border-l-2 border-blue-400 p-3 mb-2">
                            <p className="text-[11px] italic text-blue-900 leading-relaxed">{el.label}</p>
                          </div>
                        )}

                        {/* Text & Date Styling */}
                        {(el.type === 'text' || el.type === 'date') && (
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                              {el.label}
                            </label>
                            <input 
                              type={el.type} 
                              value={val}
                              onChange={(e) => updateValue(el.id, e.target.value)}
                              className="border-b border-slate-300 focus:border-slate-900 outline-none py-1.5 bg-transparent text-sm font-semibold transition-colors"
                            />
                          </div>
                        )}

                          {/* Email */}
                        {(el.type === 'email') && (
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                              {el.label}
                            </label>
                             <input 
                              type={el.type} 
                              value={val}
                              onChange={(e) => updateValue(el.id, e.target.value)}
                              className="border-b border-slate-300 focus:border-slate-900 outline-none py-1.5 bg-transparent text-sm font-semibold transition-colors"
                            />
                          </div>
                        )}

                       {/* Number */}
                        {(el.type === 'number') && (
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                              {el.label}
                            </label>
                             <input 
                              type={el.type} 
                              value={val}
                              onChange={(e) => updateValue(el.id, e.target.value)}
                              className="border-b border-slate-300 focus:border-slate-900 outline-none py-1.5 bg-transparent text-sm font-semibold transition-colors"
                            />
                          </div>
                        )}

                         {/* Textarea */}
                        {(el.type === 'textarea') && (
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                              {el.label}
                            </label>
                            <textarea 
                              // type={el.type} 
                              value={val}
                              onChange={(e) => updateValue(el.id, e.target.value)}
                              className="border-b border-slate-300 focus:border-slate-900 outline-none py-1.5 bg-transparent text-sm font-semibold transition-colors"
                            />
                          </div>
                        )}


                        {/* Select Styling */}
                            {el.type === "select" && (
                            <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                  {el.label}
                            </label>
                            
                                <select
                                  name={el.id}
                                  value={val || ""}
                                  onChange={(e) => updateValue(el.id, e.target.value)}
                                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-[11px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            >
                            <option value="" disabled>
                                    Select an option
                            </option>
                            
                                  {el.options?.map((opt) => (
                            <option key={opt} value={opt}>
                                      {opt}
                            </option>
                                  ))}
                            </select>
                            </div>
                            )}


                        {/* Radio Styling */}
                        {el.type === 'radio' && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                              {el.label}
                            </label>
                            <div className="flex gap-8 mt-1">
                              {el.options?.map(opt => (
                                <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                                  <input 
                                    type="radio" 
                                    name={el.id} 
                                    checked={val === opt}
                                    onChange={() => updateValue(el.id, opt)}
                                    className="w-3.5 h-3.5 border-slate-300 text-slate-900 focus:ring-slate-900" 
                                  /> 
                                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{opt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Checkbox/Select Styling */}
                        {(el.type === 'checkbox_group' || el.type === 'checkbox_group') && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                              {el.label}
                            </label>
                            <div className="flex gap-8 mt-1">
                              {el.options?.map(opt => (
                                <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    name={el.id} 
                                    checked={val === opt}
                                    onChange={() => updateValue(el.id, opt)}
                                    className="w-3.5 h-3.5 border-slate-300 text-slate-900 focus:ring-slate-900" 
                                  /> 
                                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{opt}</span>
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
            </div>
          </div>
        ))}
      </form>

      {/* Versioning Footer */}
      <div className="mt-24 pt-6 border-t border-slate-200 flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em]">
        <span>Version: 0.2</span>
        <span>Page 1 of 1</span>
        <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
      </div>
    </div>
  );
}