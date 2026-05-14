import React, { useState, useEffect, useMemo, useRef } from 'react';
import { auth, db } from './firebase'; 
import { signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
    collection, addDoc, doc, getDoc, getDocs, deleteDoc,
    setDoc, updateDoc, onSnapshot, query, serverTimestamp, where 
} from 'firebase/firestore';

// --- IMPORTS FOR CHARTS ---
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend 
} from 'recharts';

// --- Icons ---
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
const IconShield = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconRefresh = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /><path d="M18 10h.01" /><path d="M12 21a6 6 0 0 0-9-9 9 9 0 0 1 9 9Z" /><path d="M6 14h.01" /><path d="M21 12a6 6 0 0 0-9-9 9 9 0 0 1 9 9Z" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
const IconMenu = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-4 cursor-pointer hover:text-blue-200"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:text-blue-200"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconChart = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2"}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
const IconShare = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2"}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>;
const IconClose = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>;
const IconTarget = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconEye = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2"}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEdit = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2"}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const IconHistory = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;

// Official Chart Colors
const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#6366f1', '#ec4899'];

// --- Skeleton Component ---
const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-slate-200 animate-pulse flex flex-col h-full">
        <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
        <div className="h-10 bg-slate-200 rounded mt-6 w-full"></div>
    </div>
);

// --- Custom Indian Language Selector ---
const LanguageSelector = () => {
    const [lang, setLang] = useState('en');

    useEffect(() => {
        const match = document.cookie.match(/googtrans=\/en\/([a-z]{2})/);
        if (match) setLang(match[1]);
    }, []);

    const handleLangChange = (newLang) => {
        setLang(newLang);
        if (newLang === 'en') {
            document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        } else {
            document.cookie = `googtrans=/en/${newLang}; path=/;`;
            document.cookie = `googtrans=/en/${newLang}; path=/; domain=${window.location.hostname};`;
        }
        window.location.reload(); 
    };

    return (
        <select 
            value={lang} 
            onChange={(e) => handleLangChange(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs font-bold py-1 px-2 rounded border border-slate-600 outline-none cursor-pointer hover:bg-slate-700 transition-colors"
        >
            <option value="en">English (Default)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="gu">ગુજરાતી (Gujarati)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
            <option value="ml">മലയാളം (Malayalam)</option>
            <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
            <option value="or">ଓଡ଼ିଆ (Odia)</option>
            <option value="ur">اردو (Urdu)</option>
        </select>
    );
};

// --- CITIZEN: Secure Authentication Portal ---
function CitizenAuth({ onAuthenticated }) {
    const [authMode, setAuthMode] = useState('login'); 
    const [aadhaar, setAadhaar] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [expectedOtp, setExpectedOtp] = useState(''); 
    const [step, setStep] = useState(1); 
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async () => {
        if (aadhaar.length !== 12) return alert('Enter a valid 12-digit Aadhaar Number');
        setIsLoading(true);
        try {
            const citizenRef = doc(db, "citizens", aadhaar);
            const citizenSnap = await getDoc(citizenRef);

            if (authMode === 'login') {
                if (!citizenSnap.exists()) {
                    alert('Aadhaar not registered. Please Register first.');
                    setIsLoading(false); 
                    return;
                }
                const citizenData = citizenSnap.data();
                setExpectedOtp(citizenData.otp || "123456");
                setStep(2);
            } else {
                if (citizenSnap.exists()) {
                    alert('Already registered. Please login.');
                    setAuthMode('login'); 
                    setIsLoading(false); 
                    return;
                }
                if (!name || phone.length !== 10) return alert('Fill details correctly');
                
                const defaultDummyOtp = "123456";
                await setDoc(citizenRef, { 
                    name, 
                    phone, 
                    otp: defaultDummyOtp,
                    registeredAt: serverTimestamp()
                });
                setExpectedOtp(defaultDummyOtp);
                setStep(2);
            }
        } catch (e) { 
            console.error(e); 
            alert("Database Error");
        }
        setIsLoading(false);
    };

    const handleVerifyOTP = async () => {
        if (otp === expectedOtp) {
            localStorage.setItem('citizenAadhaar', aadhaar);
            await signInAnonymously(auth);
            onAuthenticated();
        } else {
            alert("Invalid OTP!");
        }
    };

    return (
        <div className="py-12 px-4 flex flex-col justify-center w-full">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-6 shadow-lg rounded-xl border-t-4 border-green-600">
                <div className="flex justify-center mb-4 text-green-700"><IconShield /></div>
                <h2 className="text-center text-2xl font-bold mb-2 text-slate-800">Citizen Portal</h2>
                <p className="text-center text-slate-500 mb-6 font-medium text-sm">Secure Authentication Required</p>
                {step === 1 ? (
                    <div className="space-y-4">
                        <input className="w-full border p-2 rounded outline-none focus:border-green-500" placeholder="12-Digit Aadhaar Number" value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))} maxLength={12}/>
                        {authMode === 'register' && (
                            <>
                                <input className="w-full border p-2 rounded outline-none focus:border-green-500" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}/>
                                <input className="w-full border p-2 rounded outline-none focus:border-green-500" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10}/>
                            </>
                        )}
                        <button onClick={handleSendOTP} disabled={isLoading} className="w-full bg-green-700 text-white py-2 rounded font-bold hover:bg-green-800 transition-all mt-2">{isLoading ? 'Processing...' : 'Request OTP'}</button>
                        <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-slate-600 text-sm w-full text-center hover:underline mt-2">{authMode === 'login' ? 'New Citizen? Register Here' : 'Already registered? Login'}</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-green-600 text-center font-bold">Secure OTP sent to Mobile</p>
                        <input className="w-full border p-2 rounded text-center tracking-widest text-xl font-mono outline-none focus:border-green-500" placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={6}/>
                        <button onClick={handleVerifyOTP} className="w-full bg-green-700 text-white py-2 rounded font-bold hover:bg-green-800 transition-all">Verify Identity</button>
                        <button onClick={() => setStep(1)} className="text-slate-500 text-xs w-full text-center hover:underline mt-2">← Back</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- CITIZEN: Main Dashboard ---
function CitizenDashboard({ appId, setAppState, setCitizenSurveyId }) {
    const [view, setView] = useState('home'); 
    const [surveys, setSurveys] = useState([]);
    const [history, setHistory] = useState([]);
    const [profile, setProfile] = useState({});
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const citizenAadhaar = localStorage.getItem('citizenAadhaar');

    useEffect(() => {
        const loadCitizenData = async () => {
            const profileSnap = await getDoc(doc(db, "citizens", citizenAadhaar));
            if (profileSnap.exists()) setProfile({ id: profileSnap.id, ...profileSnap.data() });

            const sSnap = await getDocs(collection(db, `/artifacts/${appId}/public/data/surveys`));
            const allSurveys = sSnap.docs.map(d => ({ id: d.id, ...d.data() }));

            const citizenResponses = [];
            for (const survey of allSurveys) {
                const rSnap = await getDocs(query(collection(db, `/artifacts/${appId}/public/data/surveys/${survey.id}/responses`), where("citizenId", "==", citizenAadhaar)));
                if (!rSnap.empty) {
                    citizenResponses.push({
                        ...rSnap.docs[0].data(),
                        surveyId: survey.id,
                        surveyTitle: survey.title,
                        surveyCode: survey.surveyCode
                    });
                }
            }
            
            const takenSurveyIds = citizenResponses.map(r => r.surveyId);
            const availableSurveys = allSurveys.filter(s => !takenSurveyIds.includes(s.id));

            setSurveys(availableSurveys);
            setHistory(citizenResponses);
        };
        loadCitizenData();
    }, [appId, citizenAadhaar]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateDoc(doc(db, "citizens", citizenAadhaar), profile);
            alert("Profile updated successfully! This helps us provide better e-governance services.");
        } catch (e) { console.error(e); alert("Failed to update profile."); }
        setIsSaving(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('citizenAadhaar');
        setAppState('citizen_auth');
    };

    return (
        <div className="w-full">
            <header className="bg-green-800 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-30 border-b-4 border-orange-500">
                <div className="flex items-center">
                    <div onClick={() => setIsMenuOpen(true)}><IconMenu /></div>
                    <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
                        <IconShield />
                        <h1 className="text-xl font-bold ml-2 tracking-wide hidden sm:block">National Survey Platform <span className="text-green-300 font-normal">| Citizen Portal</span></h1>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium hidden sm:block">Namaskar, {profile?.name?.split(' ')[0] || 'Citizen'}</span>
                    <div className="p-2 rounded-full hover:bg-green-700 transition-colors cursor-pointer" onClick={() => setView('profile')}><IconUser /></div>
                </div>
            </header>

            {isMenuOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
                    <div className="relative w-64 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                        <div className="bg-green-800 p-6 flex justify-between items-center text-white border-b-4 border-orange-500">
                            <span className="font-bold text-lg">Citizen Menu</span>
                            <button onClick={() => setIsMenuOpen(false)}><IconClose /></button>
                        </div>
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold flex items-center ${view === 'home' ? 'bg-green-50 text-green-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                                <IconSearch /> Active Surveys
                            </button>
                            <button onClick={() => { setView('history'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold flex items-center ${view === 'history' ? 'bg-green-50 text-green-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                                <IconHistory /> My Impact History
                            </button>
                            <button onClick={() => { setView('profile'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold flex items-center ${view === 'profile' ? 'bg-green-50 text-green-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                                <IconUser /> My Profile
                            </button>
                        </nav>
                        <div className="p-4 border-t border-slate-200">
                            <button onClick={handleLogout} className="w-full bg-red-100 text-red-700 p-3 rounded-lg font-bold hover:bg-red-200 transition-colors">Log Out</button>
                        </div>
                    </div>
                </div>
            )}

            <main className="container mx-auto p-6">
                {view === 'home' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-green-600">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Voice Matters</h2>
                            <p className="text-slate-600">Participate in active government surveys to shape policies and improve your community.</p>
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">Open Public Surveys</h3>
                        {surveys.length === 0 ? (
                            <div className="text-center py-20 text-slate-500 font-bold bg-white rounded-xl border border-slate-200">You are all caught up! No new surveys available.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {surveys.map(s => (
                                    <div key={s.id} className="bg-white p-6 rounded-xl shadow border border-slate-200 flex flex-col h-full hover:shadow-lg transition-all">
                                        <h4 className="text-xl font-bold text-slate-800 leading-tight pr-4 mb-4">{s.title}</h4>
                                        <p className="text-slate-500 text-sm mb-6 flex-grow line-clamp-3">{s.description}</p>
                                        <button onClick={() => { setCitizenSurveyId(s.surveyCode || s.id); setAppState('take_survey'); }} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm">
                                            Participate Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {view === 'history' && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">My Impact History</h2>
                                <p className="text-slate-600 text-sm">Surveys you have successfully completed.</p>
                            </div>
                            <div className="bg-blue-50 text-blue-800 font-black text-2xl px-4 py-2 rounded-lg border border-blue-200">
                                {history.length} <span className="text-xs uppercase block font-bold tracking-widest text-blue-600">Contributions</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <div className="text-center py-20 text-slate-500 font-bold bg-white rounded-xl border border-slate-200">You haven't participated in any surveys yet.</div>
                            ) : (
                                history.map((h, i) => (
                                    <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-800">{h.surveyTitle}</h4>
                                            <p className="text-xs text-slate-400 font-mono mt-1">ID: {h.surveyCode || h.surveyId}</p>
                                        </div>
                                        <div className="bg-green-50 text-green-700 font-bold text-xs px-3 py-1 rounded-full border border-green-200 flex items-center">
                                            <IconSparkles /> Completed
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {view === 'profile' && (
                    <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-xl border-t-8 border-orange-500 animate-in fade-in duration-300">
                        <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-orange-100 scale-125"><IconUser /></div>
                        <h2 className="text-3xl font-black mb-8 text-center text-slate-800 uppercase tracking-tighter italic">Citizen Identity</h2>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 flex justify-between items-center">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Aadhaar Number</label>
                                <span className="font-mono text-xl font-bold text-slate-700">XXXX - XXXX - {citizenAadhaar.slice(-4)}</span>
                            </div>
                            <IconShield className="text-green-600 opacity-50 w-10 h-10" />
                        </div>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Full Legal Name</label>
                                <input className="w-full border-2 border-slate-100 p-4 rounded-xl font-bold bg-white outline-none focus:border-green-500 transition-all shadow-sm" value={profile.name || ''} onChange={e => setProfile({...profile, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Mobile Number</label>
                                    <input className="w-full border-2 border-slate-100 p-4 rounded-xl font-bold bg-slate-50 outline-none text-slate-500" value={profile.phone || ''} readOnly disabled title="Linked to Aadhaar" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Age</label>
                                    <input type="number" className="w-full border-2 border-slate-100 p-4 rounded-xl font-bold bg-white outline-none focus:border-green-500 transition-all shadow-sm" value={profile.age || ''} onChange={e => setProfile({...profile, age: e.target.value})} placeholder="e.g. 35" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Occupation</label>
                                <input className="w-full border-2 border-slate-100 p-4 rounded-xl font-bold bg-white outline-none focus:border-green-500 transition-all shadow-sm" value={profile.occupation || ''} onChange={e => setProfile({...profile, occupation: e.target.value})} placeholder="e.g. Farmer, Student, Business" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Residential District / PIN Code</label>
                                <input className="w-full border-2 border-slate-100 p-4 rounded-xl font-bold bg-white outline-none focus:border-green-500 transition-all shadow-sm" value={profile.location || ''} onChange={e => setProfile({...profile, location: e.target.value})} placeholder="e.g. Pune 411046" />
                            </div>
                        </div>
                        <button onClick={handleSaveProfile} disabled={isSaving} className="w-full bg-orange-600 text-white py-5 rounded-xl font-black text-xl shadow-lg hover:bg-orange-700 transition-all uppercase tracking-widest mt-10">
                            {isSaving ? 'Updating Registry...' : 'Update Citizen Profile'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

// --- CITIZEN: Take Survey Component ---
function TakeSurveyView({ surveyId, appId, setAppState }) {
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [surveyStep, setSurveyStep] = useState('fill'); 
    const [isLoading, setIsLoading] = useState(true);
    const citizenAadhaar = localStorage.getItem('citizenAadhaar');

    const [answers, setAnswers] = useState(() => {
        const cached = sessionStorage.getItem(`survey_cache_${surveyId}`);
        return cached ? JSON.parse(cached) : {};
    });

    const updateAnswer = (qId, value) => {
        const newAnswers = { ...answers, [qId]: value };
        setAnswers(newAnswers);
        sessionStorage.setItem(`survey_cache_${surveyId}`, JSON.stringify(newAnswers));
    };

    useEffect(() => {
        const fetchSurveyData = async () => {
            try {
                let targetSurveyId = surveyId;
                const qCode = query(collection(db, `/artifacts/${appId}/public/data/surveys`), where("surveyCode", "==", surveyId));
                const codeSnap = await getDocs(qCode);
                
                if (!codeSnap.empty) {
                    const docData = codeSnap.docs[0];
                    targetSurveyId = docData.id;
                    setSurvey({ id: docData.id, ...docData.data() });
                } else {
                    const sRef = doc(db, `/artifacts/${appId}/public/data/surveys`, surveyId);
                    const sSnap = await getDoc(sRef);
                    if (sSnap.exists()) {
                        setSurvey({ id: sSnap.id, ...sSnap.data() });
                    } else {
                        setIsLoading(false); return;
                    }
                }

                const checkResponse = await getDocs(query(collection(db, `/artifacts/${appId}/public/data/surveys/${targetSurveyId}/responses`), where("citizenId", "==", citizenAadhaar)));
                if (!checkResponse.empty) {
                    setSurveyStep('submitted'); setIsLoading(false); return;
                }

                const qQuery = query(collection(db, `/artifacts/${appId}/public/data/surveys/${targetSurveyId}/questions`));
                onSnapshot(qQuery, (snap) => {
                    setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                    setIsLoading(false);
                });
            } catch (e) { console.error(e); setIsLoading(false); }
        };
        fetchSurveyData();
    }, [surveyId, appId, citizenAadhaar]);

    const handlePreview = () => {
        if (Object.keys(answers).length < questions.length) return alert("Please answer all questions before proceeding.");
        setSurveyStep('preview');
    };

    const handleFinalSubmit = async () => {
        const confirmed = window.confirm("Are you sure you want to submit your final responses?\n\nThis action cannot be undone.");
        if (!confirmed) return;
        try {
            await addDoc(collection(db, `/artifacts/${appId}/public/data/surveys/${survey.id}/responses`), {
                citizenId: citizenAadhaar, 
                answers,
                submittedAt: serverTimestamp()
            });
            sessionStorage.removeItem(`survey_cache_${surveyId}`);
            setSurveyStep('submitted');
        } catch (e) { console.error(e); alert("Error submitting survey."); }
    };

    if (isLoading) return <div className="py-20 flex items-center justify-center font-bold text-slate-500 w-full">Loading Official Survey...</div>;
    if (!survey) return <div className="py-20 flex items-center justify-center font-bold text-red-500 text-xl w-full">404: Survey Not Found</div>;

    if (surveyStep === 'submitted') {
        return (
            <div className="py-12 flex flex-col justify-center items-center p-6 text-center w-full">
                <div className="bg-white p-10 rounded-2xl shadow-xl border-t-8 border-green-500 max-w-md w-full">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Thank You!</h2>
                    <p className="text-slate-500 mb-6 font-medium">Your response has been securely and officially recorded by the system.</p>
                    <button onClick={() => setAppState('citizen_dashboard')} className="text-blue-600 font-bold hover:underline">Return to My Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 px-4 w-full">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-green-800 p-8 text-white text-center border-b-8 border-orange-500 relative">
                    <button onClick={() => setAppState('citizen_dashboard')} className="absolute top-4 left-4 text-white/70 hover:text-white font-bold text-sm">← Back</button>
                    {surveyStep === 'preview' && <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Preview Mode</div>}
                    <div className="flex justify-center mb-4 mt-4"><IconShield /></div>
                    <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
                    <p className="text-green-200 mb-2">{survey.description}</p>
                    {survey.surveyCode && <span className="inline-block bg-white/20 px-3 py-1 rounded text-xs font-bold tracking-widest border border-white/30">ID: {survey.surveyCode}</span>}
                </div>
                
                <div className="p-8 space-y-8">
                    {surveyStep === 'fill' ? (
                        <>
                            {questions.map((q, i) => (
                                <div key={q.id} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <p className="font-bold text-lg text-slate-800 mb-4">{i + 1}. {q.text}</p>
                                    
                                    {q.type === 'text' && <textarea className="w-full border-2 rounded-lg p-4 focus:border-green-500 outline-none text-slate-700" rows="3" placeholder="Type your answer here..." value={answers[q.id] || ''} onChange={e => updateAnswer(q.id, e.target.value)}></textarea>}
                                    
                                    {q.type === 'multiple-choice' && (
                                        <div className="space-y-3">
                                            {q.options?.map((opt, oIdx) => (
                                                <label key={oIdx} className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${answers[q.id] === opt ? 'bg-green-50 border-green-500 text-green-900' : 'bg-white hover:bg-slate-100 border-slate-200'}`}>
                                                    <input type="radio" name={q.id} value={opt} onChange={() => updateAnswer(q.id, opt)} className="w-5 h-5 text-green-600" />
                                                    <span className="font-medium">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                    
                                    {q.type === 'checkbox' && (
                                        <div className="space-y-3">
                                            {q.options?.map((opt, oIdx) => {
                                                const isChecked = (answers[q.id] || []).includes(opt);
                                                return (
                                                    <label key={oIdx} className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${isChecked ? 'bg-green-50 border-green-500 text-green-900' : 'bg-white hover:bg-slate-100 border-slate-200'}`}>
                                                        <input type="checkbox" checked={isChecked} onChange={() => {
                                                            const currentAns = answers[q.id] || [];
                                                            if (currentAns.includes(opt)) updateAnswer(q.id, currentAns.filter(item => item !== opt));
                                                            else updateAnswer(q.id, [...currentAns, opt]);
                                                        }} className="w-5 h-5 text-green-600 rounded" />
                                                        <span className="font-medium">{opt}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button onClick={handlePreview} className="w-full bg-blue-800 text-white font-bold text-xl py-4 rounded-xl mt-8 hover:bg-blue-900 shadow-lg transition-transform transform hover:scale-[1.02]">Review & Proceed</button>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded text-orange-800 text-sm font-bold mb-6">Please review your answers carefully before final submission.</div>
                            {questions.map((q, i) => {
                                const ans = answers[q.id];
                                const displayAns = Array.isArray(ans) ? ans.join(', ') : (ans || 'No answer provided');
                                return (
                                    <div key={q.id} className="border-b border-slate-200 pb-4">
                                        <p className="text-sm font-bold text-slate-500 mb-1">Q{i + 1}: {q.text}</p>
                                        <p className="text-lg font-medium text-slate-800 bg-white p-3 rounded border border-slate-100">{displayAns}</p>
                                    </div>
                                );
                            })}
                            <div className="flex gap-4 pt-6">
                                <button onClick={() => setSurveyStep('fill')} className="flex-1 bg-slate-200 text-slate-700 font-bold text-lg py-4 rounded-xl hover:bg-slate-300 transition-colors">Edit Responses</button>
                                <button onClick={handleFinalSubmit} className="flex-1 bg-green-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-green-700 shadow-lg transition-transform transform hover:scale-[1.02]">Confirm & Submit</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Auth Component (Aadhaar + CAPTCHA) FOR ADMINS ---
function AadhaarAuth({ onAuthenticated }) {
    const [authMode, setAuthMode] = useState('login'); 
    const [aadhaar, setAadhaar] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [expectedOtp, setExpectedOtp] = useState(''); 
    const [step, setStep] = useState(1); 
    const [isLoading, setIsLoading] = useState(false);
    const [captchaCode, setCaptchaCode] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [adminInputId, setAdminInputId] = useState('');

    const generateCaptcha = () => {
        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let code = "";
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
        setCaptchaCode(code); setCaptchaInput('');
    };

    useEffect(() => { generateCaptcha(); }, []);

    const handleSendOTP = async () => {
        if (authMode === 'register' && aadhaar.length !== 12) return alert('Enter valid 12-digit Aadhaar');
        if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode) {
            alert('Invalid CAPTCHA'); generateCaptcha(); return;
        }

        setIsLoading(true);
        try {
            if (authMode === 'login') {
                const q = query(collection(db, "admins"), where("adminId", "==", adminInputId.trim()));
                const snap = await getDocs(q);
                if (snap.empty) {
                    alert('Invalid Admin ID. Please Register.'); setIsLoading(false); return;
                }
                const adminDoc = snap.docs[0];
                localStorage.setItem('adminAadhaar', adminDoc.id); 
                await signInAnonymously(auth);
                onAuthenticated();
            } else {
                const adminRef = doc(db, "admins", aadhaar);
                const adminSnap = await getDoc(adminRef);
                if (adminSnap.exists()) {
                    alert('Already registered. Please login.'); setAuthMode('login'); setIsLoading(false); return;
                }
                if (!name || phone.length !== 10) return alert('Fill details correctly');
                
                const defaultDummyOtp = "123456";
                const generatedAdminId = Math.floor(100000 + Math.random() * 900000).toString();

                await setDoc(adminRef, { name, phone, otp: defaultDummyOtp, adminId: generatedAdminId });
                setExpectedOtp(defaultDummyOtp);
                setStep(2);
            }
        } catch (e) { console.error(e); alert("Database Error"); }
        setIsLoading(false);
    };

    const handleVerifyOTP = async () => {
        if (otp === expectedOtp) {
            localStorage.setItem('adminAadhaar', aadhaar);
            await signInAnonymously(auth);
            onAuthenticated();
        } else alert("Invalid OTP!");
    };

    return (
        <div className="py-12 px-4 flex flex-col justify-center w-full">
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-6 shadow-lg rounded-xl border-t-4 border-blue-900">
                <div className="flex justify-center mb-4 text-blue-800"><IconShield /></div>
                <h2 className="text-center text-2xl font-bold mb-6">{authMode === 'login' ? 'Admin Login' : 'Admin Registration'}</h2>
                {step === 1 ? (
                    <div className="space-y-4">
                        {authMode === 'login' ? (
                            <input className="w-full border p-2 rounded outline-none focus:border-blue-500 font-mono tracking-widest text-center text-xl bg-slate-50" placeholder="ENTER ADMIN ID" value={adminInputId} onChange={e => setAdminInputId(e.target.value.replace(/\D/g, ''))} maxLength={6}/>
                        ) : (
                            <>
                                <input className="w-full border p-2 rounded outline-none focus:border-blue-500" placeholder="Aadhaar Number" value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))} maxLength={12}/>
                                <input className="w-full border p-2 rounded outline-none focus:border-blue-500" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}/>
                                <input className="w-full border p-2 rounded outline-none focus:border-blue-500" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10}/>
                            </>
                        )}
                        <div className="bg-slate-50 p-3 rounded border border-dashed border-slate-300">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-mono font-bold tracking-widest text-lg bg-slate-200 px-3 py-1 rounded select-none italic line-through decoration-slate-400">{captchaCode}</span>
                                <button onClick={generateCaptcha} type="button" className="text-blue-600 text-xs flex items-center hover:underline"><IconRefresh /> Refresh</button>
                            </div>
                            <input className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500" placeholder="Enter code shown above" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)}/>
                        </div>
                        <button onClick={handleSendOTP} disabled={isLoading} className="w-full bg-blue-800 text-white p-2 rounded font-bold hover:bg-blue-900 transition-all">{isLoading ? 'Processing...' : (authMode === 'login' ? 'Login' : 'Generate OTP')}</button>
                        <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-orange-600 text-sm w-full text-center hover:underline transition-all">{authMode === 'login' ? 'New Admin? Register' : 'Already registered? Login'}</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-green-600 text-center font-semibold">OTP sent to Registered Mobile</p>
                        <input className="w-full border p-2 rounded text-center tracking-widest text-xl font-mono outline-none focus:border-blue-500" placeholder="0 0 0 0 0 0" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={6}/>
                        <button onClick={handleVerifyOTP} className="w-full bg-green-700 text-white p-2 rounded font-bold hover:bg-green-800 transition-all">Verify & Login</button>
                        <button onClick={() => setStep(1)} className="text-blue-800 text-xs w-full text-center hover:underline mt-2">Back</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- ADMIN: Profile View Component ---
function AdminProfile({ adminData, setAdminData }) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: adminData?.name || '',
        phone: adminData?.phone || '',
        email: adminData?.email || '',
        department: adminData?.department || '',
        designation: adminData?.designation || ''
    });

    useEffect(() => { if (adminData) setFormData({...adminData}); }, [adminData]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateDoc(doc(db, "admins", adminData.id), formData);
            setAdminData({ ...adminData, ...formData });
            alert("Profile updated successfully!");
        } catch (e) { console.error(e); }
        setIsSaving(false);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-800">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="h-16 w-16 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-2xl font-bold">
                        {adminData?.name?.charAt(0) || <IconUser />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{adminData?.name || 'Admin'}</h2>
                        <div className="flex gap-4 text-sm mt-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">ID: {adminData?.adminId || 'Pending'}</span>
                            <span className="text-slate-500 flex items-center">Aadhaar: **** {adminData?.id?.slice(-4) || 'XXXX'}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-700 border-b pb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                            <input className="w-full border p-3 rounded outline-none focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                            <input className="w-full border p-3 rounded outline-none focus:border-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} maxLength={10} />
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-700 border-b pb-2 pt-4">Professional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Official Email</label>
                            <input className="w-full border p-3 rounded outline-none focus:border-blue-500" placeholder="admin@gov.in" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                            <input className="w-full border p-3 rounded outline-none focus:border-blue-500" placeholder="e.g., Public Health" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Designation</label>
                            <input className="w-full border p-3 rounded outline-none focus:border-blue-500" placeholder="e.g., Chief Medical Officer" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button onClick={handleSave} disabled={isSaving} className="bg-blue-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-900 transition-all shadow-md">
                            {isSaving ? 'Saving...' : 'Save Profile Details'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Survey Creator Component ---
function SurveyCreator({ setView, appId, adminId, editingSurvey, setEditingSurvey }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([]);
    const [aiPrompt, setAiPrompt] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (editingSurvey) {
            setTitle(editingSurvey.title || '');
            setDescription(editingSurvey.description || '');
            setTargetAudience(editingSurvey.targetAudience || '');
            const fetchQuestions = async () => {
                const qSnap = await getDocs(query(collection(db, `/artifacts/${appId}/public/data/surveys/${editingSurvey.id}/questions`)));
                setQuestions(qSnap.docs.map(d => ({ ...d.data(), firestoreId: d.id })));
            };
            fetchQuestions();
        }
    }, [editingSurvey, appId]);

    const generateWithAI = async () => {
        if (!aiPrompt.trim()) return alert("Please enter a prompt");
        setIsGenerating(true);
        try {
            const rawKey = import.meta.env.VITE_GEMINI_API_KEY || "";
            const apiKey = rawKey.replace(/['"]/g, '');
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const safePrompt = aiPrompt.replace(/"/g, "'");
            const safeAudience = targetAudience.replace(/"/g, "'");
            const promptText = `Generate a survey JSON based on: "${safePrompt}" for audience: "${safeAudience}". Return EXACTLY this JSON structure: {"title": "string", "description": "string", "questions": [{"text": "string", "type": "multiple-choice", "options": ["opt1", "opt2"]} or {"text": "string", "type": "text"}]}`;

            const response = await fetch(apiUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }], generationConfig: { responseMimeType: "application/json", maxOutputTokens: 2048, temperature: 0.7 } })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || "Failed to reach Gemini API");

            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                let rawText = data.candidates[0].content.parts[0].text;
                rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
                const cleanJson = JSON.parse(rawText);
                setTitle(cleanJson.title || ''); setDescription(cleanJson.description || ''); setQuestions(cleanJson.questions || []);
            } else throw new Error("Gemini returned an empty response.");
        } catch (e) { alert("AI Error: " + e.message); } finally { setIsGenerating(false); }
    };

    const handleAddQuestion = () => setQuestions([...questions, { text: 'New Question', type: 'text', options: [] }]);

    const generateSurveyCode = (titleText) => {
        const d = new Date();
        const yr = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const snippet = titleText.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6) || "GOV";
        const rand = Math.floor(100 + Math.random() * 900);
        return `NSP-${yr}-${mo}-${snippet}-${rand}`;
    };

    const saveSurvey = async () => {
        if (!title) return alert("Survey must have a title");
        if (questions.length === 0) return alert("Survey must have at least one question.");
        setIsSaving(true);
        try {
            if (editingSurvey) {
                const surveyRef = doc(db, `/artifacts/${appId}/public/data/surveys`, editingSurvey.id);
                await updateDoc(surveyRef, { title, description, targetAudience: targetAudience || 'General Public' });
                const qSnap = await getDocs(query(collection(db, `/artifacts/${appId}/public/data/surveys/${editingSurvey.id}/questions`)));
                for (const d of qSnap.docs) await deleteDoc(d.ref);
                for (const q of questions) {
                    const { firestoreId, ...cleanQ } = q; 
                    await addDoc(collection(db, `/artifacts/${appId}/public/data/surveys/${editingSurvey.id}/questions`), cleanQ);
                }
            } else {
                const surveyCode = generateSurveyCode(title);
                const surveyRef = await addDoc(collection(db, `/artifacts/${appId}/public/data/surveys`), { title, description, creatorId: adminId, targetAudience: targetAudience || 'General Public', createdAt: serverTimestamp(), surveyCode: surveyCode });
                for (const q of questions) await addDoc(collection(db, `/artifacts/${appId}/public/data/surveys/${surveyRef.id}/questions`), q);
            }
            setEditingSurvey(null); setView('list');
        } catch (e) { console.error(e); } setIsSaving(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <button onClick={() => { setEditingSurvey(null); setView('list'); }} className="text-blue-800 font-bold hover:underline">← Back to Dashboard</button>
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-slate-800">{editingSurvey ? 'Modify Survey' : 'Create New Survey'}</h2>
                    {editingSurvey && editingSurvey.surveyCode && (
                        <span className="bg-slate-100 px-3 py-1 rounded text-sm font-mono font-bold text-slate-500">ID: {editingSurvey.surveyCode}</span>
                    )}
                </div>
                
                <div className="bg-blue-50 p-8 rounded-xl border-2 border-dashed border-blue-300 mb-8">
                    <h3 className="text-xl font-bold text-blue-900 flex items-center mb-4"><IconSparkles /> Generate with AI</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-blue-900 mb-1">Target Audience (For which people?)</label>
                        <input className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder="e.g., Farmers in Maharashtra, Students in SPPU..." value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
                    </div>
                    <label className="block text-sm font-bold text-blue-900 mb-1">Survey Topic Prompt</label>
                    <textarea className="w-full p-4 rounded-lg border-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none" rows="3" placeholder="e.g., A feedback form for public health camp in Pune..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                    <button onClick={generateWithAI} disabled={isGenerating} className="w-full bg-blue-800 text-white py-3 rounded-lg font-bold hover:bg-blue-900 disabled:opacity-50 transition-all">{isGenerating ? "AI is working..." : "Generate Draft"}</button>
                </div>
                <div className="space-y-6 border-t pt-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Survey Title</label>
                        <input className="text-2xl font-bold w-full border-b pb-2 outline-none focus:border-blue-800" placeholder="Enter Survey Title" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea className="w-full text-slate-500 outline-none border-b" placeholder="Enter a brief description..." value={description} onChange={e => setDescription(e.target.value)} rows="2" />
                    </div>
                    <div className="space-y-6 pt-4">
                        <h3 className="text-xl font-bold text-slate-700 flex justify-between items-center">Questions Configuration</h3>
                        {questions.map((q, idx) => (
                            <div key={idx} className="p-5 bg-slate-50 rounded-xl border border-slate-200 relative group transition-all shadow-sm">
                                <button className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} title="Delete Question"><IconTrash /></button>
                                <div className="pr-8 mb-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Question {idx + 1}</label>
                                    <input className="font-bold text-lg w-full bg-transparent outline-none border-b focus:border-blue-500 pb-1 mt-1" placeholder="Type your question..." value={q.text} onChange={e => { const newQ = [...questions]; newQ[idx].text = e.target.value; setQuestions(newQ); }} />
                                </div>
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mr-3">Response Type:</label>
                                    <select className="bg-white border rounded px-3 py-1.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm" value={q.type} onChange={e => { const newQ = [...questions]; newQ[idx].type = e.target.value; if ((e.target.value === 'multiple-choice' || e.target.value === 'checkbox') && (!newQ[idx].options || newQ[idx].options.length === 0)) { newQ[idx].options = ['Option 1']; } setQuestions(newQ); }}>
                                        <option value="text">Short Answer (Text)</option>
                                        <option value="multiple-choice">Multiple Choice (Radio)</option>
                                        <option value="checkbox">Checkboxes (Tick)</option>
                                    </select>
                                </div>
                                {(q.type === 'multiple-choice' || q.type === 'checkbox') && (
                                    <div className="space-y-2 mt-2 bg-white p-4 rounded-lg border">
                                        {q.options?.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center space-x-3 group/opt">
                                                {q.type === 'multiple-choice' ? <input type="radio" disabled className="w-4 h-4 text-blue-600" /> : <input type="checkbox" disabled className="w-4 h-4 rounded text-blue-600" />}
                                                <input className="flex-1 outline-none border-b border-transparent focus:border-blue-500 py-1 transition-colors text-slate-700" value={opt} placeholder={`Option ${oIdx + 1}`} onChange={e => { const newQ = [...questions]; newQ[idx].options[oIdx] = e.target.value; setQuestions(newQ); }} />
                                                <button className="opacity-0 group-hover/opt:opacity-100 text-slate-300 hover:text-red-500 transition-all p-1" onClick={() => { const newQ = [...questions]; newQ[idx].options = newQ[idx].options.filter((_, i) => i !== oIdx); setQuestions(newQ); }}><IconClose size={16} /></button>
                                            </div>
                                        ))}
                                        <button className="text-blue-600 font-bold text-sm mt-3 flex items-center hover:text-blue-800 transition-colors" onClick={() => { const newQ = [...questions]; if (!newQ[idx].options) newQ[idx].options = []; newQ[idx].options.push(`Option ${newQ[idx].options.length + 1}`); setQuestions(newQ); }}><IconPlus /> Add Option</button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="pt-4 flex justify-center">
                            <button onClick={handleAddQuestion} className="bg-slate-100 text-slate-700 border-2 border-dashed border-slate-300 px-6 py-3 rounded-xl font-bold flex items-center hover:bg-slate-200 hover:border-slate-400 transition-all"><IconPlus /> Add New Question Manually</button>
                        </div>
                    </div>
                    <button onClick={saveSurvey} disabled={isSaving || questions.length === 0} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-xl transition-all mt-8 disabled:opacity-50">{isSaving ? "Publishing to Platform..." : (editingSurvey ? "Update Survey Live" : "Publish Survey Live")}</button>
                </div>
            </div>
        </div>
    );
}

// --- AI ANALYSIS ENGINE COMPONENT ---
function AIInsightsBox({ answers, questionText }) {
    const [insights, setInsights] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const generateInsights = async () => {
        if (answers.length === 0) return alert("No answers to analyze.");
        setIsAnalyzing(true);
        try {
            const rawKey = import.meta.env.VITE_GEMINI_API_KEY || "";
            const apiKey = rawKey.replace(/['"]/g, '');
            
            if (!apiKey) throw new Error("Missing API Key in .env file!");

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`; 
            
            const promptText = `Act as an advanced NLP data analyst. Read these raw survey responses for the question: "${questionText}". \nResponses: ${JSON.stringify(answers)} \n\nProvide a concise analysis including: 1. Overall sentiment (Positive/Neutral/Negative). 2. Top 3 recurring keywords or themes. 3. A 2-sentence summary of what citizens are saying. Use plain text formatting.`;

            const response = await fetch(apiUrl, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || "Gemini API Error");
            if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
                setInsights(data.candidates[0].content.parts[0].text);
            } else {
                throw new Error("Empty response from AI.");
            }
        } catch (e) {
            console.error(e);
            alert("AI Error: " + e.message); 
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="mt-4 border-t border-slate-100 pt-4 html2pdf-ignore">
            {!insights ? (
                <button onClick={generateInsights} disabled={isAnalyzing} className="flex items-center text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors">
                    <IconSparkles /> {isAnalyzing ? "Running NLP Analysis..." : "Analyze Text Responses with AI"}
                </button>
            ) : (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-2 pdf-include">
                    <h5 className="font-bold text-blue-900 text-sm mb-2 flex items-center"><IconSparkles /> AI Insight Summary</h5>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{insights}</p>
                </div>
            )}
        </div>
    );
}

// --- ACTUAL Responses Viewer Component (WITH TABS FOR INDIVIDUAL & SUMMARY) ---
function ResponsesView({ survey, setView, appId }) {
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // NEW: Tab System State
    const [reportTab, setReportTab] = useState('summary'); 
    
    const dashboardRef = useRef(null);

    useEffect(() => {
        if (!survey) return;
        const fetchResponsesData = async () => {
            try {
                const qSnap = await getDocs(query(collection(db, `/artifacts/${appId}/public/data/surveys/${survey.id}/questions`)));
                const qList = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                setQuestions(qList);

                const rSnap = await getDocs(query(collection(db, `/artifacts/${appId}/public/data/surveys/${survey.id}/responses`)));
                const rList = rSnap.docs.map(d => d.data());
                setResponses(rList);
                setLoading(false);
            } catch (e) { console.error(e); setLoading(false); }
        };
        fetchResponsesData();
    }, [survey, appId]);

    // --- CSV EXPORT LOGIC ---
    const downloadCSV = () => {
        if (responses.length === 0) return alert("No data to export.");

        // 1. Create the Headers (Question texts)
        const headers = ['Citizen_Auth_ID', 'Submitted_At', ...questions.map(q => `"${q.text.replace(/"/g, '""')}"`)];
        
        // 2. Map the responses into rows
        const csvRows = responses.map(r => {
            const dateStr = r.submittedAt?.toDate ? r.submittedAt.toDate().toLocaleString('en-IN') : 'Unknown';
            const citizenId = `****${r.citizenId ? r.citizenId.slice(-4) : 'XXXX'}`;
            
            const rowData = [citizenId, dateStr];
            
            questions.forEach(q => {
                let ans = r.answers?.[q.id] || 'No Answer';
                if (Array.isArray(ans)) ans = ans.join('; '); // Handle checkboxes
                rowData.push(`"${ans.replace(/"/g, '""')}"`); // Escape quotes for CSV
            });
            
            return rowData.join(',');
        });

        // 3. Combine headers and rows
        const csvString = [headers.join(','), ...csvRows].join('\n');
        
        // 4. Trigger the download to your computer
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${survey.title.replace(/[^a-zA-Z0-9 ]/g, '_')}_Dataset.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!survey) return null;

    const quantQuestions = questions.filter(q => q.type === 'multiple-choice' || q.type === 'checkbox');
    const qualQuestions = questions.filter(q => q.type === 'text');

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center html2pdf-ignore">
                <button onClick={() => setView('list')} className="text-blue-800 font-bold hover:underline">← Back to Dashboard</button>
                <div className="flex gap-4">
                    <button onClick={downloadCSV} disabled={loading || responses.length === 0} className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-md">
                        Download Raw Data (.CSV)
                    </button>
                </div>
            </div>
            
            <div ref={dashboardRef} className="bg-white p-10 rounded-2xl shadow-2xl" id="analytics-dashboard">
                
                {/* Header */}
                <div className="border-b-4 border-slate-800 pb-6 mb-8 flex justify-between items-end">
                    <div className="max-w-3xl">
                        <div className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-2 pdf-include-only" style={{ display: 'none' }}>OFFICIAL E-GOVERNANCE ANALYTICS REPORT</div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{survey.title}</h1>
                        <p className="text-lg text-slate-500 mt-2">{survey.description}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Report ID</p>
                        <p className="text-lg text-slate-800 font-mono mt-1 font-bold">{survey.surveyCode}</p>
                    </div>
                </div>

                {/* NEW: TABS SYSTEM */}
                {!loading && responses.length > 0 && (
                    <div className="flex space-x-6 border-b-2 border-slate-100 mb-8 html2pdf-ignore">
                        <button 
                            onClick={() => setReportTab('summary')}
                            className={`py-3 px-2 font-bold text-sm border-b-4 transition-colors ${reportTab === 'summary' ? 'border-blue-600 text-blue-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            Executive Summary (Charts)
                        </button>
                        <button 
                            onClick={() => setReportTab('individual')}
                            className={`py-3 px-2 font-bold text-sm border-b-4 transition-colors ${reportTab === 'individual' ? 'border-blue-600 text-blue-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            Individual Responses (Raw Data)
                        </button>
                    </div>
                )}

                {loading ? <div className="py-20 text-center text-slate-400 font-bold">Aggregating secure citizen data...</div> : responses.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-12 text-center html2pdf-ignore">
                        <IconChart className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-xl font-bold text-slate-600">No responses yet</h3>
                        <p className="text-slate-500 mt-2">Share this survey link with citizens to populate the dashboard.</p>
                    </div>
                ) : (
                    <>
                        {/* ----------------------------------------------------- */}
                        {/* TAB 1: SUMMARY DASHBOARD                              */}
                        {/* ----------------------------------------------------- */}
                        {reportTab === 'summary' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 border-l-4 border-l-blue-500">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Participants</p>
                                        <p className="text-4xl font-black text-slate-800">{responses.length}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 border-l-4 border-l-emerald-500">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Questions Analyzed</p>
                                        <p className="text-4xl font-black text-slate-800">{questions.length}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 border-l-4 border-l-orange-500">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Data Status</p>
                                        <p className="text-2xl font-black text-slate-800 mt-2 text-orange-600">Active Collection</p>
                                    </div>
                                </div>

                                {/* Quantitative Charts */}
                                {quantQuestions.length > 0 && (
                                    <div className="mb-12">
                                        <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Quantitative Metrics</h3>
                                        <div className="space-y-8">
                                            {quantQuestions.map((q, idx) => {
                                                const answersForQ = responses.map(r => r.answers?.[q.id]).filter(a => a !== undefined && a !== '');
                                                let chartData = [];
                                                const dataMap = {};
                                                
                                                // FIXED: Safe optional chaining to prevent crashes
                                                (q.options || []).forEach(opt => dataMap[opt] = 0);
                                                
                                                answersForQ.forEach(ans => {
                                                    if (Array.isArray(ans)) {
                                                        ans.forEach(a => { if (dataMap[a] !== undefined) dataMap[a]++; });
                                                    } else {
                                                        if (dataMap[ans] !== undefined) dataMap[ans]++;
                                                    }
                                                });
                                                
                                                chartData = Object.keys(dataMap).map(key => ({
                                                    name: key,
                                                    count: dataMap[key],
                                                    percentage: answersForQ.length > 0 ? Math.round((dataMap[key] / answersForQ.length) * 100) : 0
                                                }));

                                                return (
                                                    <div key={q.id} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm break-inside-avoid">
                                                        <h4 className="font-bold text-xl text-slate-800 mb-8 border-b border-slate-100 pb-4">Q{idx + 1}: {q.text}</h4>
                                                        
                                                        {q.type === 'multiple-choice' ? (
                                                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                                                <div className="w-full md:w-1/2 h-72">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                                                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                                                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                                                            <Bar dataKey="count" isAnimationActive={false} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                                                                {chartData.map((entry, index) => (
                                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                                ))}
                                                                            </Bar>
                                                                        </BarChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                                <div className="w-full md:w-1/2">
                                                                    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                                                        <table className="min-w-full text-sm">
                                                                            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                                                                                <tr>
                                                                                    <th className="py-3 px-4 text-left font-bold">Response Option</th>
                                                                                    <th className="py-3 px-4 text-right font-bold">Votes</th>
                                                                                    <th className="py-3 px-4 text-right font-bold">%</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-slate-100">
                                                                                {chartData.map((row, i) => (
                                                                                    <tr key={i} className="bg-white">
                                                                                        <td className="py-3 px-4 font-medium text-slate-700 flex items-center">
                                                                                            <span className="w-3 h-3 rounded-full mr-3" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                                                                                            {row.name}
                                                                                        </td>
                                                                                        <td className="py-3 px-4 text-right text-slate-600 font-medium">{row.count}</td>
                                                                                        <td className="py-3 px-4 text-right font-bold text-slate-800">{row.percentage}%</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                                                <div className="w-full md:w-1/2 h-80 flex items-center justify-center">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <PieChart>
                                                                            <Pie data={chartData} isAnimationActive={false} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="count">
                                                                                {chartData.map((entry, index) => (
                                                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                                                ))}
                                                                            </Pie>
                                                                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                                                                        </PieChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                                <div className="w-full md:w-1/2">
                                                                    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                                                        <table className="min-w-full text-sm">
                                                                            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                                                                                <tr>
                                                                                    <th className="py-3 px-4 text-left font-bold">Selection</th>
                                                                                    <th className="py-3 px-4 text-right font-bold">Votes</th>
                                                                                    <th className="py-3 px-4 text-right font-bold">%</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-slate-100">
                                                                                {chartData.map((row, i) => (
                                                                                    <tr key={i} className="bg-white">
                                                                                        <td className="py-3 px-4 font-medium text-slate-700 flex items-center">
                                                                                            <span className="w-3 h-3 rounded-full mr-3" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                                                                                            {row.name}
                                                                                        </td>
                                                                                        <td className="py-3 px-4 text-right text-slate-600 font-medium">{row.count}</td>
                                                                                        <td className="py-3 px-4 text-right font-bold text-slate-800">{row.percentage}%</td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Qualitative Text AI */}
                                {qualQuestions.length > 0 && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Qualitative Insights</h3>
                                        <div className="space-y-8">
                                            {qualQuestions.map((q, idx) => {
                                                const answersForQ = responses.map(r => r.answers?.[q.id]).filter(a => a !== undefined && a !== '');
                                                return (
                                                    <div key={q.id} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm break-inside-avoid">
                                                        <h4 className="font-bold text-xl text-slate-800 mb-4 border-b border-slate-100 pb-4">
                                                            {q.text}
                                                        </h4>
                                                        <AIInsightsBox answers={answersForQ} questionText={q.text} />
                                                        <div className="mt-8">
                                                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Individual Written Responses</h5>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
                                                                {answersForQ.map((ans, aIdx) => (
                                                                    <div key={aIdx} className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 italic relative">
                                                                        <span className="text-slate-300 font-serif text-2xl absolute top-2 left-2">"</span>
                                                                        <span className="relative z-10 pl-4 block">{ans}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ----------------------------------------------------- */}
                        {/* TAB 2: INDIVIDUAL RAW RESPONSES                       */}
                        {/* ----------------------------------------------------- */}
                        {reportTab === 'individual' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Individual Citizen Records</h3>
                                {responses.map((r, index) => {
                                    let dateStr = "Unknown Date";
                                    if (r.submittedAt?.toDate) {
                                        dateStr = r.submittedAt.toDate().toLocaleString('en-IN');
                                    }
                                    return (
                                        <div key={index} className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm break-inside-avoid">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-200 pb-4">
                                                <div>
                                                    <h4 className="font-bold text-xl text-slate-800">Response #{index + 1}</h4>
                                                    <p className="text-xs text-slate-500 font-mono mt-1">Citizen Auth ID: **** {r.citizenId ? r.citizenId.slice(-4) : 'XXXX'}</p>
                                                </div>
                                                <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mt-2 sm:mt-0">
                                                    {dateStr}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {questions.map((q, qIdx) => {
                                                    const ans = r.answers?.[q.id];
                                                    const displayAns = Array.isArray(ans) ? ans.join(', ') : (ans || 'No answer provided');
                                                    return (
                                                        <div key={q.id} className="bg-white p-4 rounded-lg border border-slate-100">
                                                            <p className="text-sm font-bold text-slate-500 mb-2">Q{qIdx + 1}: {q.text}</p>
                                                            <p className="text-base font-medium text-slate-800">{displayAns}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
                
                {/* PDF Footer Watermark (Only visible in PDF) */}
                <div className="mt-12 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pdf-include-only" style={{ display: 'none' }}>
                    Generated by National Survey Platform | E-Governance India | {new Date().toLocaleDateString('en-IN')}
                </div>
            </div>
        </div>
    );
}

// --- ADMIN PREVIEW VIEW ---
function AdminPreviewView({ survey, setView, appId }) {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!survey) return;
        const fetchQuestions = async () => {
            try {
                const qQuery = query(collection(db, `/artifacts/${appId}/public/data/surveys/${survey.id}/questions`));
                onSnapshot(qQuery, (snap) => {
                    setQuestions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                    setIsLoading(false);
                });
            } catch (e) {
                console.error("Preview fetch error", e);
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [survey, appId]);

    if (!survey) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <button onClick={() => setView('list')} className="text-blue-800 font-bold hover:underline html2pdf-ignore">← Back to Dashboard</button>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 border-blue-900">
                <div className="bg-slate-100 p-8 text-center border-b border-slate-200">
                    <span className="bg-orange-100 text-orange-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">Admin Preview Mode</span>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">{survey.title}</h2>
                    <p className="text-slate-500 font-medium">{survey.description}</p>
                    {survey.surveyCode && (
                        <div className="mt-4 inline-block bg-white px-3 py-1 rounded border border-slate-200 font-mono text-sm font-bold text-slate-500">
                            Code: {survey.surveyCode}
                        </div>
                    )}
                </div>
                
                <div className="p-10 space-y-8">
                    {isLoading ? (
                        <div className="text-center text-slate-400 font-bold">Loading questions...</div>
                    ) : questions.length === 0 ? (
                        <div className="text-center text-slate-400 font-bold">No questions found.</div>
                    ) : (
                        questions.map((q, i) => (
                            <div key={q.id} className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <p className="font-bold text-xl text-slate-800 mb-6 flex items-start">
                                    <span className="mr-3 opacity-30">{i + 1}.</span> {q.text}
                                </p>
                                
                                {q.type === 'text' && (
                                    <textarea disabled className="w-full border-2 p-4 rounded-xl outline-none bg-slate-100 font-medium text-slate-500 cursor-not-allowed" rows="3" placeholder="Citizen text response will go here..."></textarea>
                                )}

                                {q.type === 'multiple-choice' && (
                                    <div className="space-y-3">
                                        {q.options?.map((opt, oIdx) => (
                                            <label key={oIdx} className="flex items-center space-x-4 p-4 border-2 rounded-xl bg-white border-slate-100 opacity-70 cursor-not-allowed">
                                                <input type="radio" disabled className="w-5 h-5 text-blue-600" />
                                                <span className="font-bold text-slate-700">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'checkbox' && (
                                    <div className="space-y-3">
                                        {q.options?.map((opt, oIdx) => (
                                            <label key={oIdx} className="flex items-center space-x-4 p-4 border-2 rounded-xl bg-white border-slate-100 opacity-70 cursor-not-allowed">
                                                <input type="checkbox" disabled className="w-5 h-5 rounded text-blue-600" />
                                                <span className="font-bold text-slate-700">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

// --- ADMIN: Survey Card Component with Live Response Badge ---
function AdminSurveyCard({ s, appId, setActiveSurvey, setView, setShareModal, setEditingSurvey }) {
    const [responseCount, setResponseCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const rSnap = await getDocs(query(collection(db, `/artifacts/${appId}/public/data/surveys/${s.id}/responses`)));
                setResponseCount(rSnap.size);
            } catch(e) {}
        };
        fetchCount();
    }, [s.id, appId]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-800 flex flex-col h-full hover:shadow-lg transition-all relative">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-800 pr-2 leading-tight">{s.title}</h3>
                {/* THIS IS THE NEW BADGE SHOWING HOW MANY PEOPLE ANSWERED */}
                <div className="bg-green-100 text-green-800 text-xs font-black px-3 py-1 rounded-full border border-green-200 whitespace-nowrap shadow-sm">
                    {responseCount} Responses
                </div>
            </div>
            
            {s.targetAudience && (
                <div className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded inline-flex items-center w-fit mb-2">
                    <IconTarget /> {s.targetAudience}
                </div>
            )}
            
            <p className="text-slate-500 text-sm mb-6 flex-grow line-clamp-3">{s.description}</p>
            
            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-slate-100">
                <button onClick={() => { setActiveSurvey(s); setView('responses'); }} className="bg-slate-100 text-blue-800 py-2.5 rounded-lg font-bold hover:bg-blue-200 flex justify-center items-center transition-all text-sm border border-blue-200">
                    <IconChart /> Analytics
                </button>
                <button onClick={() => setShareModal(s)} className="bg-green-700 text-white py-2.5 rounded-lg font-bold hover:bg-green-800 flex justify-center items-center transition-all text-sm shadow-sm">
                    <IconShare /> Share SMS
                </button>
                <button onClick={() => { setActiveSurvey(s); setView('preview'); }} className="bg-slate-100 text-slate-700 py-2.5 rounded-lg font-bold hover:bg-slate-200 flex justify-center items-center transition-all text-sm border border-slate-200">
                    <IconEye /> Preview
                </button>
                <button onClick={() => { setEditingSurvey(s); setView('create'); }} className="bg-orange-100 text-orange-800 py-2.5 rounded-lg font-bold hover:bg-orange-200 flex justify-center items-center transition-all text-sm border border-orange-200">
                    <IconEdit /> Modify
                </button>
            </div>
        </div>
    );
}

// --- Main App Component ---
export default function App() {
    const [appState, setAppState] = useState('loading'); 
    const [view, setView] = useState('list'); 
    const [surveys, setSurveys] = useState([]);
    const [activeSurvey, setActiveSurvey] = useState(null); 
    const [shareModal, setShareModal] = useState(null); 
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    
    const [editingSurvey, setEditingSurvey] = useState(null);
    const [bulkRegion, setBulkRegion] = useState('All Maharashtra');
    const [currentAdmin, setCurrentAdmin] = useState(null); 
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [citizenSurveyId, setCitizenSurveyId] = useState(null);

    const appId = useMemo(() => (typeof __app_id !== 'undefined' ? __app_id : 'default-app-id').replace(/[\/.]/g, '_'), []);

    useEffect(() => {
        if (!document.getElementById('google-translate-script')) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);

            window.googleTranslateElementInit = () => {
                if (window.google && window.google.translate) {
                    new window.google.translate.TranslateElement(
                        {
                            pageLanguage: 'en',
                            autoDisplay: false
                        },
                        'google_translate_element' 
                    );
                }
            };
        }
    }, []);

    useEffect(() => {
        const checkRouteAndAuth = async (user) => {
            const hash = window.location.hash;
            
            if (hash.startsWith('#/survey/')) {
                const extractedId = hash.split('#/survey/')[1];
                if (extractedId) {
                    try {
                        const savedCitizen = localStorage.getItem('citizenAadhaar');
                        if (savedCitizen) {
                            if (!user) await signInAnonymously(auth);
                            setCitizenSurveyId(extractedId);
                            setAppState('take_survey');
                        } else {
                            setCitizenSurveyId(extractedId);
                            setAppState('citizen_auth');
                        }
                    } catch (err) {
                        console.error(err);
                        setAppState('auth');
                    }
                    return; 
                }
            }

            if (user) {
                const savedAadhaar = localStorage.getItem('adminAadhaar');
                if (savedAadhaar) {
                    const adminSnap = await getDoc(doc(db, "admins", savedAadhaar));
                    if (adminSnap.exists()) {
                        setCurrentAdmin({ id: savedAadhaar, ...adminSnap.data() });
                        setAppState('main');
                        return;
                    }
                }
                const savedCitizen = localStorage.getItem('citizenAadhaar');
                if (savedCitizen) {
                    setAppState('citizen_dashboard');
                    return;
                }
            }
            
            setAppState('auth');
        };

        const unsub = onAuthStateChanged(auth, checkRouteAndAuth);
        const handleHashChange = () => checkRouteAndAuth(auth.currentUser);
        window.addEventListener('hashchange', handleHashChange);
        
        return () => {
            unsub();
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    useEffect(() => {
        if (appState !== 'main' || !currentAdmin) return;
        const q = query(collection(db, `/artifacts/${appId}/public/data/surveys`), where("creatorId", "==", currentAdmin.id));
        return onSnapshot(q, (snap) => { setSurveys(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setIsDataLoaded(true); });
    }, [appId, appState, currentAdmin]);

    const handleLogout = () => { signOut(auth).then(() => { localStorage.removeItem('adminAadhaar'); setCurrentAdmin(null); setAppState('auth'); setView('list'); }); };

    const handleSendSMS = async () => {
        if (!shareModal) return; 
        alert(`Successfully deployed bulk Official E-Governance SMS alert to ${bulkRegion}. Check your phone!`);
        setShareModal(null);
    };

    if (appState === 'loading') return null; 

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
            <style>{`
                .goog-te-banner-frame { display: none !important; }
                body { top: 0px !important; }
                .goog-logo-link { display: none !important; }
                #google_translate_element { display: none !important; }
                .pdf-include-only[style*="display: none"] { display: block !important; }
            `}</style>

            <div className="bg-slate-900 text-slate-300 text-[10px] sm:text-xs px-4 py-2 flex justify-between items-center z-50 relative border-b border-slate-800 html2pdf-ignore">
                <div className="font-bold tracking-widest uppercase flex items-center gap-2 sm:gap-4">
                    <span>E-Governance</span>
                    <span className="hidden sm:inline">|</span>
                    <span className="hidden sm:inline">Govt. of India</span>
                </div>
                <LanguageSelector />
                <div id="google_translate_element"></div>
            </div>
            
            {appState === 'citizen_auth' && <CitizenAuth onAuthenticated={() => setAppState('take_survey')} appId={appId} />}
            {appState === 'citizen_dashboard' && <CitizenDashboard appId={appId} setAppState={setAppState} setCitizenSurveyId={setCitizenSurveyId} />}
            {appState === 'take_survey' && <TakeSurveyView surveyId={citizenSurveyId} appId={appId} setAppState={setAppState} />}
            {appState === 'auth' && <AadhaarAuth onAuthenticated={() => setAppState('main')} />}

            {appState === 'main' && (
                <>
                    <div className="h-1 w-full flex html2pdf-ignore"><div className="w-1/3 bg-orange-500"></div><div className="w-1/3 bg-white"></div><div className="w-1/3 bg-green-600"></div></div>
                    
                    <header className="bg-blue-900 text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-30 html2pdf-ignore">
                        <div className="flex items-center">
                            <div onClick={() => setIsMenuOpen(true)}>
                                <IconMenu />
                            </div>
                            <div className="flex items-center cursor-pointer" onClick={() => setView('list')}>
                                <IconShield />
                                <h1 className="text-xl font-bold ml-2 tracking-wide hidden sm:block">National Survey Platform <span className="text-blue-300 font-normal">| Admin Portal</span></h1>
                            </div>
                        </div>
                        
                        <div className="relative group cursor-pointer">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium hidden sm:block">Welcome, {currentAdmin?.name?.split(' ')[0] || 'Admin'}</span>
                                <div className="p-2 rounded-full hover:bg-blue-800 transition-colors">
                                    <IconUser />
                                </div>
                            </div>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-slate-200">
                                <button onClick={() => setView('profile')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 border-b">Update Profile</button>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-red-600 hover:text-white transition-colors">Log Out</button>
                            </div>
                        </div>
                    </header>

                    {isMenuOpen && (
                        <div className="fixed inset-0 z-50 flex html2pdf-ignore">
                            <div className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
                            <div className="relative w-64 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                                <div className="bg-blue-900 p-6 flex justify-between items-center text-white">
                                    <span className="font-bold text-lg">Admin Menu</span>
                                    <button onClick={() => setIsMenuOpen(false)}><IconClose /></button>
                                </div>
                                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                    <button onClick={() => { setView('list'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold ${view === 'list' ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                                        Dashboard
                                    </button>
                                    <button onClick={() => { setEditingSurvey(null); setView('create'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold flex items-center ${view === 'create' && !editingSurvey ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                                        <IconPlus /> Create Survey
                                    </button>
                                    <button onClick={() => { setView('profile'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold ${view === 'profile' ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                                        My Profile
                                    </button>
                                </nav>
                                <div className="p-4 border-t border-slate-200">
                                    <button onClick={handleLogout} className="w-full bg-red-100 text-red-700 p-3 rounded-lg font-bold hover:bg-red-200 transition-colors">
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <main className="container mx-auto p-6 relative">
                        {view === 'list' && (
                            <>
                                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-800 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome, {currentAdmin?.name || 'Admin'}!</h2>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                                            {currentAdmin?.adminId && (
                                                <p><span className="font-bold text-slate-700">Admin ID:</span> <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">{currentAdmin.adminId}</span></p>
                                            )}
                                            <p><span className="font-bold text-slate-700">Aadhaar No:</span> **** {currentAdmin?.id?.slice(-4) || 'XXXX'}</p>
                                            <p><span className="font-bold text-slate-700">Phone:</span> +91 {currentAdmin?.phone}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setEditingSurvey(null); setView('create'); }} className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold flex items-center shadow hover:bg-orange-700 transition-all whitespace-nowrap">
                                        <IconPlus /> Create New Survey
                                    </button>
                                </div>

                                {surveys.length > 0 && (
                                    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 mb-8 flex items-center gap-4">
                                        <IconSearch />
                                        <span className="font-bold text-sm text-slate-600 whitespace-nowrap">Quick Finder:</span>
                                        <select 
                                            className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-lg font-medium text-slate-700 outline-none focus:border-blue-500"
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                const selected = surveys.find(s => s.surveyCode === e.target.value || s.id === e.target.value);
                                                if (selected) { setActiveSurvey(selected); setView('responses'); }
                                                e.target.value = ""; 
                                            }}
                                        >
                                            <option value="">Jump to Campaign Analytics by Code...</option>
                                            {surveys.map(s => (
                                                <option key={s.id} value={s.surveyCode || s.id}>
                                                    {s.surveyCode ? `${s.surveyCode} : ` : ''}{s.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-slate-700 mb-4">Your Active Surveys</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {!isDataLoaded ? <><SkeletonCard/><SkeletonCard/><SkeletonCard/></> : 
                                        surveys.map(s => (
                                            <AdminSurveyCard 
                                                key={s.id} 
                                                s={s} 
                                                appId={appId} 
                                                setActiveSurvey={setActiveSurvey} 
                                                setView={setView} 
                                                setShareModal={setShareModal} 
                                                setEditingSurvey={setEditingSurvey} 
                                            />
                                        ))
                                    }
                                    {surveys.length === 0 && isDataLoaded && (
                                        <div className="col-span-full text-center py-20 text-slate-400">No surveys generated yet.</div>
                                    )}
                                </div>
                            </>
                        )}
                        
                        {view === 'create' && <SurveyCreator setView={setView} appId={appId} adminId={currentAdmin?.id} editingSurvey={editingSurvey} setEditingSurvey={setEditingSurvey} />}
                        {view === 'responses' && <ResponsesView survey={activeSurvey} setView={setView} appId={appId} />}
                        {view === 'profile' && <AdminProfile adminData={currentAdmin} setAdminData={setCurrentAdmin} />}
                        {view === 'preview' && <AdminPreviewView survey={activeSurvey} setView={setView} appId={appId} />}

                        {shareModal && shareModal.title && (
                            <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200 html2pdf-ignore">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                                    <div className="bg-blue-900 p-4 flex justify-between items-center text-white">
                                        <h3 className="font-bold text-lg flex items-center"><IconShare /> Bulk SMS Dispatch</h3>
                                        <button onClick={() => setShareModal(null)} className="hover:text-red-400 transition-colors"><IconClose /></button>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message Preview</label>
                                            <div className="bg-slate-100 p-4 rounded-lg text-sm text-slate-700 border-l-4 border-green-500 font-medium font-sans whitespace-pre-wrap">
                                                {`JG-NSP-GOV\nभारत सरकार: नागरिकांना विनंती आहे की "${shareModal.title}" या अधिकृत सर्वेक्षणात आपला सहभाग नोंदवावा. आपला अभिप्राय महत्त्वाचा आहे.\nप्रतिसाद लिंक: ${window.location.origin}/#/survey/${shareModal.surveyCode || shareModal.id}\n- राष्ट्रीय सर्वेक्षण मंच (NSP), मंत्रालय.`}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Target Region</label>
                                            <select 
                                                className="w-full border-2 p-3 rounded-lg outline-none focus:border-blue-500 transition-colors font-bold text-slate-700" 
                                                value={bulkRegion} 
                                                onChange={e => setBulkRegion(e.target.value)}
                                            >
                                                <option>All Maharashtra</option>
                                                <option>Pune District</option>
                                                <option>Mumbai City & Suburbs</option>
                                                <option>Raigad</option>
                                                <option>Sindhudurg</option>
                                            </select>
                                        </div>
                                        <button onClick={handleSendSMS} id="bulk-btn" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg flex justify-center items-center">
                                            Execute Regional Broadcast
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </>
            )}
        </div>
    );
}