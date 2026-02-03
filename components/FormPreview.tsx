import { FormElement } from '@/types/form';

interface PreviewProps {
  elements: FormElement[];
  formData: Record<string, any>;
  updateValue: (id: string, value: any) => void;
}

export default function FormPreview({ elements, formData, updateValue }: PreviewProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white p-16 shadow-2xl rounded-2xl border border-slate-100 min-h-[80vh]">
      <div className="flex justify-between border-b-2 border-slate-900 pb-6 mb-10">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Clinical Record</h1>
          <p className="text-sm text-slate-500 font-medium">WEP Connect Portal Export</p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full">CONFIDENTIAL</span>
        </div>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {elements.map((el) => {
          const val = formData[el.id] || "";

          return (
            <div key={el.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {el.type === 'header' && (
                <h2 className="bg-slate-900 text-white p-3 font-bold uppercase text-xs tracking-widest mt-10 mb-4 rounded">
                  {el.label}
                </h2>
              )}

              {el.type === 'instruction' && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="text-sm italic text-blue-800">{el.label}</p>
                </div>
              )}

              {(el.type === 'text' || el.type === 'date') && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{el.label}</label>
                  <input 
                    type={el.type} 
                    value={val}
                    onChange={(e) => updateValue(el.id, e.target.value)}
                    className="border-b-2 border-slate-200 focus:border-blue-600 outline-none py-2 bg-transparent text-lg font-medium transition-all"
                    placeholder="Type here..."
                  />
                </div>
              )}

              {el.type === 'select' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{el.label}</label>
                  <select 
                    value={val}
                    onChange={(e) => updateValue(el.id, e.target.value)}
                    className="border-b-2 border-slate-200 py-2 outline-none focus:border-blue-600 bg-transparent text-lg font-medium"
                  >
                    <option value="">-- Choose Option --</option>
                    {el.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              )}

              {el.type === 'radio' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{el.label}</label>
                  <div className="flex gap-8">
                    {el.options?.map(opt => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name={el.id} 
                          checked={val === opt}
                          onChange={() => updateValue(el.id, opt)}
                          className="w-5 h-5 accent-blue-600" 
                        /> 
                        <span className="text-slate-700 font-medium group-hover:text-blue-600">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </form>
    </div>
  );
}