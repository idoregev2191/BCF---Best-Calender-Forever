import React, { useState } from 'react';
import { MicrofeedbackData } from '../types';
import { X, Check, ArrowRight, Frown, Smile, Meh } from 'lucide-react';

interface MicrofeedbackFormProps {
  eventId: string;
  onClose: () => void;
  onSubmit: (data: MicrofeedbackData) => void;
}

const MicrofeedbackForm: React.FC<MicrofeedbackFormProps> = ({ eventId, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<MicrofeedbackData>>({
    nationality: '',
    gender: '',
    enjoyability: 3,
    difficulty: 3,
    zone: '',
    neededHelp: '',
    prideProject: '',
    prideCS: ''
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
        ...formData,
        eventId,
        submittedAt: new Date().toISOString()
    } as MicrofeedbackData);
  };

  const renderScale = (label: string, field: 'enjoyability' | 'difficulty') => (
    <div className="space-y-3">
       <label className="block text-sm font-bold text-slate-700">{label} <span className="text-red-500">*</span></label>
       <div className="flex justify-between items-center px-2">
         <span className="text-xs font-bold text-slate-400">Low</span>
         <span className="text-xs font-bold text-slate-400">High</span>
       </div>
       <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5].map(val => (
             <button
               key={val}
               type="button"
               onClick={() => setFormData({...formData, [field]: val})}
               className={`w-12 h-12 rounded-xl font-black text-lg transition-all ${
                 formData[field] === val 
                   ? 'bg-slate-900 text-white shadow-lg scale-110' 
                   : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-400'
               }`}
             >
               {val}
             </button>
          ))}
       </div>
    </div>
  );

  const renderRadio = (label: string, field: keyof MicrofeedbackData, options: string[]) => (
    <div className="space-y-3">
       <label className="block text-sm font-bold text-slate-700">{label} <span className="text-red-500">*</span></label>
       <div className="flex flex-wrap gap-2">
          {options.map(opt => (
             <button
               key={opt}
               type="button"
               onClick={() => setFormData({...formData, [field]: opt})}
               className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                 formData[field] === opt 
                   ? 'bg-blue-600 text-white shadow-md' 
                   : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
               }`}
             >
               {opt}
             </button>
          ))}
       </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
       
       <div className="relative w-full max-w-md bg-slate-50 rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-black text-slate-900">MicroFeedback</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Group B Session Check-in</p>
             </div>
             <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={18}/></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Step 1: Demographics */}
            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                       <label className="block text-sm font-bold text-slate-700">Full Name (Optional)</label>
                       <input 
                         className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                         placeholder="Your name"
                         value={formData.fullName || ''}
                         onChange={e => setFormData({...formData, fullName: e.target.value})}
                       />
                    </div>
                    {renderRadio("Nationality", "nationality", ["Israeli", "Palestinian"])}
                    {renderRadio("Gender", "gender", ["Male", "Female", "Other"])}
                </div>
            )}

            {/* Step 2: Session Feels */}
            {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    {renderScale("How enjoyable was today's session?", "enjoyability")}
                    {renderScale("How difficult was today's session?", "difficulty")}
                    
                    <div className="space-y-3">
                       <label className="block text-sm font-bold text-slate-700">Which zone are you in? <span className="text-red-500">*</span></label>
                       <div className="grid grid-cols-3 gap-3">
                          {[
                             { label: 'Comfort', color: 'bg-green-100 text-green-700 border-green-200', icon: <Smile size={20}/> },
                             { label: 'Stretch', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: <Meh size={20}/> },
                             { label: 'Panic', color: 'bg-red-100 text-red-700 border-red-200', icon: <Frown size={20}/> }
                          ].map(z => (
                             <button
                                key={z.label}
                                type="button"
                                onClick={() => setFormData({...formData, zone: z.label as any})}
                                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-1 ${
                                   formData.zone === z.label ? `${z.color} ring-2 ring-offset-2 ring-slate-200` : 'bg-white border-slate-100 text-slate-400 grayscale hover:grayscale-0'
                                }`}
                             >
                                {z.icon}
                                <span className="text-xs font-bold uppercase">{z.label}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                </div>
            )}

            {/* Step 3: Help & Pride */}
            {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    {renderRadio("Did you need/get help?", "neededHelp", ["Yes", "No"])}
                    
                    {formData.neededHelp === 'Yes' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                           <label className="block text-sm font-bold text-slate-700">How did you get help?</label>
                           <input 
                             className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold"
                             placeholder="e.g. Mentor, Peer, AI..."
                             value={formData.howGotHelp || ''}
                             onChange={e => setFormData({...formData, howGotHelp: e.target.value})}
                           />
                        </div>
                    )}

                    {renderRadio("Pride in Group Project?", "prideProject", ["Very Proud", "Proud", "Neutral", "Not Proud", "Not Proud at all"])}
                    {renderRadio("Pride in CS Progress?", "prideCS", ["Very Proud", "Proud", "Neutral", "Not Proud", "Not Proud at all"])}
                </div>
            )}

            {/* Step 4: Final Comments */}
            {step === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                       <label className="block text-sm font-bold text-slate-700">Comments / Suggestions</label>
                       <textarea 
                         className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium h-32 resize-none"
                         placeholder="How can we make tomorrow even more awesome?"
                         value={formData.comments || ''}
                         onChange={e => setFormData({...formData, comments: e.target.value})}
                       />
                    </div>
                </div>
            )}

          </form>

          {/* Footer Controls */}
          <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
             {step > 1 ? (
               <button onClick={handlePrev} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Back</button>
             ) : (
                <div></div>
             )}

             {step < 4 ? (
               <button onClick={handleNext} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg">
                 Next <ArrowRight size={16} />
               </button>
             ) : (
               <button onClick={handleSubmit} className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20">
                 Submit <Check size={16} strokeWidth={3} />
               </button>
             )}
          </div>
       </div>
    </div>
  );
};

export default MicrofeedbackForm;