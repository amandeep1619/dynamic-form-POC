import { FormSection } from '@/types/form';

interface PreviewProps {
  formName: string;
  sections: FormSection[];
  formData: Record<string, any>;
  updateValue: (id: string, value: any) => void;
}

export default function FormPreview({ formName, sections, formData, updateValue }: PreviewProps) {
  const gridMap: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-1 md:grid-cols-2' };

  return (
    <div className="max-w-4xl mx-auto bg-white p-16 shadow-2xl rounded-2xl border border-slate-100 min-h-[80vh]">
      <div className="flex justify-between border-b-2 border-slate-900 pb-6 mb-10">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">{formName}</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight mt-2">EBS-101 EAP (EBS-101-TD-392)</p>
        </div>
        <div className="text-right"><span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-full tracking-widest">CONFIDENTIAL</span></div>
      </div>

      <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
        {sections.map((section) => (
          <div key={section.id} className="space-y-4">
            <div className="bg-slate-100 border-l-4 border-slate-900 px-4 py-2 mb-6">
              <h2 className="text-slate-900 font-black uppercase text-xs tracking-[0.2em]">{section.title}</h2>
            </div>
            <div className="space-y-6 px-1">
              {section.rows.map((row) => (
                <div key={row.id} className={`grid gap-x-12 gap-y-6 ${gridMap[row.fields.length] || 'grid-cols-1'}`}>
                  {row.fields.map((el) => {
                    const val = formData[el.id] || "";
                    return (
                      <div key={el.id} className="flex flex-col">
                        {el.type === 'header' && <p className="text-2xl text-blue-900 font-bold mb-2">{el.label}</p>}
                        {el.type === 'instruction' && <div className="bg-blue-50/50 border-l-2 border-blue-400 p-3 mb-2"><p className="text-[11px] italic text-blue-900">{el.label}</p></div>}
                        {['text', 'date', 'email', 'number', 'textarea'].includes(el.type) && (
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{el.label}</label>
                            {el.type === 'textarea' ? 
                              <textarea value={val} onChange={(e) => updateValue(el.id, e.target.value)} className="border-b border-slate-300 outline-none py-1.5 text-sm font-semibold" /> :
                              <input type={el.type} value={val} onChange={(e) => updateValue(el.id, e.target.value)} className="border-b border-slate-300 outline-none py-1.5 text-sm font-semibold" />
                            }
                          </div>
                        )}
                        {el.type === 'select' && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{el.label}</label>
                            <select value={val} onChange={(e) => updateValue(el.id, e.target.value)} className="w-full border border-slate-300 rounded px-3 py-2 text-[11px]">
                              <option value="">Select an option</option>
                              {el.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          </div>
                        )}
                        {['radio', 'checkbox_group'].includes(el.type) && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{el.label}</label>
                            <div className="flex gap-8 mt-1">
                              {el.options?.map(opt => (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                  <input type={el.type === 'radio' ? 'radio' : 'checkbox'} name={el.id} checked={val === opt} onChange={() => updateValue(el.id, opt)} className="w-3.5 h-3.5 cursor-pointer" />
                                  <span className="text-[11px] font-bold text-slate-800 uppercase ml-2">{opt}</span>
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
    </div>
  );
}