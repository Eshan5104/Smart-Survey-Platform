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

// --- Icons & UI Elements ---
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
const IconShield = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2"}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IconRefresh = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "ml-2"}><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /><path d="M18 10h.01" /><path d="M12 21a6 6 0 0 0-9-9 9 9 0 0 1 9 9Z" /><path d="M6 14h.01" /><path d="M21 12a6 6 0 0 0-9-9 9 9 0 0 1 9 9Z" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
const IconMenu = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-4 cursor-pointer hover:text-blue-200"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;
const IconUser = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "cursor-pointer hover:text-blue-200"}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconChart = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2"}><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
const IconShare = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2"}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>;
const IconClose = ({ size = 24 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>;
const IconTarget = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline-block"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
const IconEye = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2"}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEdit = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className || "mr-2"}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const IconHistory = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconVerified = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="mr-1 text-blue-600"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;

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
            className="bg-black text-white text-[10px] font-bold py-1 px-2 rounded border border-slate-600 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
        >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
        </select>
    );
};

// ============================================================================
// --- GLOBAL GOVERNMENT UI COMPONENTS ---
// ============================================================================

function GovTopStrip({ toggleContrast }) {
    return (
        <div className="bg-[#2b2b2b] text-white text-[10px] sm:text-xs px-4 py-1.5 flex justify-between items-center z-50 relative html2pdf-ignore font-sans">
            <div className="flex items-center gap-3 font-semibold tracking-wider opacity-90">
                <span>भारत सरकार | GOVT OF INDIA</span>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={toggleContrast} className="bg-black text-yellow-400 px-2 py-0.5 rounded border border-yellow-400 font-bold hover:bg-yellow-400 hover:text-black transition-colors" title="High Contrast Accessibility">A± Contrast</button>
                <LanguageSelector />
                <div id="google_translate_element" className="hidden"></div>
            </div>
        </div>
    );
}

function GovHeader() {
    return (
        <div className="bg-white px-6 py-4 shadow-sm flex items-center justify-between border-b-4 border-[#FF9933] html2pdf-ignore z-40 relative">
            <div className="flex items-center gap-4">
               <img src="/emblem.png" alt="Satyameva Jayate" className="h-12 md:h-16 w-auto" />
                <div>
                    <h1 className="text-xl md:text-3xl font-black text-[#003366] tracking-tight">National Survey Platform</h1>
                    <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Public Opinion & Data Analytics</p>
                </div>
            </div>
        </div>
    );
}

function GovFooter() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-8 text-center text-xs font-semibold uppercase tracking-widest border-t-4 border-[#FF9933] mt-auto w-full html2pdf-ignore">
            <div className="max-w-6xl mx-auto px-6">
                <p className="mb-3 text-slate-300">National Survey Platform | Government of India</p>
                <div className="flex flex-wrap justify-center gap-4 text-[10px] opacity-70 mb-4">
                    <span className="hover:text-white cursor-pointer">Privacy Policy</span> | 
                    <span className="hover:text-white cursor-pointer">Terms of Service</span> | 
                    <span className="hover:text-white cursor-pointer">Disclaimer</span> | 
                    <span className="hover:text-white cursor-pointer">Web Information Manager</span>
                </div>
                <p className="opacity-50 font-mono text-[9px] normal-case">Content Owned & Maintained by Aniket, Eshan, Kanishk, Vedant. Designed & Developed for E-Governance.</p>
                <p className="mt-2 opacity-40 font-mono text-[9px] normal-case">Last Updated: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
        </footer>
    );
}

// ============================================================================
// --- LANDING PAGE ---
// ============================================================================
function LandingPage({ setAppState }) {
    return (
        <div className="min-h-screen flex flex-col font-sans">
            <GovHeader />
            
            <div className="bg-[#FF9933] text-white text-sm font-bold py-2 overflow-hidden whitespace-nowrap flex items-center shadow-md border-b-2 border-white">
                <span className="bg-[#003366] px-4 py-1.5 mx-2 rounded text-xs uppercase tracking-widest animate-pulse shadow-sm z-10 relative">LATEST</span>
                <marquee behavior="scroll" direction="left" scrollamount="6" className="flex-1 tracking-wide">
                    📢 Welcome to the Official E-Governance National Survey Platform. 🚨 Active surveys are now available for Pune District and all Maharashtra regions. 👉 Your voice matters—Register as a Citizen today!
                </marquee>
            </div>

            <div className="flex-grow flex flex-col items-center justify-center px-4 py-16 w-full max-w-6xl mx-auto relative">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl md:text-6xl font-black text-[#003366] mb-6 tracking-tight leading-[1.1] uppercase">
                        Voice Your Opinion.<br/>
                        <span className="text-[#FF9933]">Shape The Future.</span>
                    </h1>
                    <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
                        The official gateway for citizens to participate in government surveys, local audits, and public polls. Your input directly drives democratic change.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {/* Citizen Card */}
                    <div onClick={() => setAppState('citizen_auth')} className="bg-white rounded-3xl p-8 shadow-xl border-t-8 border-green-600 cursor-pointer group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                            <IconUser className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-[#003366] mb-3">Take a Survey</h2>
                        <p className="text-slate-500 font-medium leading-relaxed mb-6">Register securely with Aadhaar. Share feedback on local infrastructure, health camps, and governance.</p>
                        <div className="text-green-700 font-bold flex items-center group-hover:gap-3 transition-all">
                            Enter Citizen Portal <span className="ml-2">→</span>
                        </div>
                    </div>

                    {/* Admin Card */}
                    <div onClick={() => setAppState('auth')} className="bg-white rounded-3xl p-8 shadow-xl border-t-8 border-[#003366] cursor-pointer group hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                        <div className="w-16 h-16 bg-blue-100 text-[#003366] rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-[#003366] group-hover:text-white transition-colors duration-300">
                            <IconShield className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-[#003366] mb-3">Create a Survey</h2>
                        <p className="text-slate-500 font-medium leading-relaxed mb-6">Authorized portal for government officials. Generate AI surveys, collect data, and view real-time NLP analytics.</p>
                        <div className="text-[#003366] font-bold flex items-center group-hover:gap-3 transition-all">
                            Admin Login <span className="ml-2">→</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <GovFooter />
        </div>
    );
}

// ============================================================================
// --- CITIZEN COMPONENTS ---
// ============================================================================

function CitizenAuth({ onAuthenticated, setAppState }) {
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
                    setIsLoading(false); return;
                }
                const citizenData = citizenSnap.data();
                setExpectedOtp(citizenData.otp || "123456");
                setStep(2);
            } else {
                if (citizenSnap.exists()) {
                    alert('Already registered. Please login.');
                    setAuthMode('login'); setIsLoading(false); return;
                }
                if (!name || phone.length !== 10) return alert('Fill details correctly');
                const defaultDummyOtp = "123456";
                await setDoc(citizenRef, { name, phone, otp: defaultDummyOtp, registeredAt: serverTimestamp() });
                setExpectedOtp(defaultDummyOtp);
                setStep(2);
            }
        } catch (e) { console.error(e); alert("Database Error"); }
        setIsLoading(false);
    };

    const handleVerifyOTP = async () => {
        if (otp === expectedOtp) {
            localStorage.setItem('citizenAadhaar', aadhaar);
            await signInAnonymously(auth);
            onAuthenticated();
        } else alert("Invalid OTP!");
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <GovHeader />
            <div className="flex-grow flex flex-col justify-center py-12 px-4 relative">
                <button onClick={() => setAppState('landing')} className="absolute top-6 left-6 text-slate-500 hover:text-slate-800 font-bold transition-colors">← Back to Main Menu</button>
                <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-6 shadow-lg rounded-xl border-t-4 border-green-600">
                    <div className="flex justify-center mb-4 text-green-700"><IconShield className="mr-2" /></div>
                    <h2 className="text-center text-2xl font-black mb-2 text-[#003366]">Citizen Portal</h2>
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
            <GovFooter />
        </div>
    );
}

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
                    citizenResponses.push({ ...rSnap.docs[0].data(), surveyId: survey.id, surveyTitle: survey.title, surveyCode: survey.surveyCode });
                }
            }
            
            const takenSurveyIds = citizenResponses.map(r => r.surveyId);
            const availableSurveys = allSurveys.filter(s => !takenSurveyIds.includes(s.id));
            setSurveys(availableSurveys); setHistory(citizenResponses);
        };
        loadCitizenData();
    }, [appId, citizenAadhaar]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try { await updateDoc(doc(db, "citizens", citizenAadhaar), profile); alert("Profile updated successfully!"); } 
        catch (e) { console.error(e); alert("Failed to update profile."); }
        setIsSaving(false);
    };

    const handleLogout = () => { localStorage.removeItem('citizenAadhaar'); setAppState('landing'); };

    return (
        <div className="w-full flex flex-col min-h-screen">
            <GovHeader />
            <header className="bg-green-800 text-white p-4 shadow-lg flex justify-between items-center z-30">
                <div className="flex items-center">
                    <div onClick={() => setIsMenuOpen(true)}><IconMenu /></div>
                    <div className="flex items-center cursor-pointer" onClick={() => setView('home')}>
                        <h1 className="text-xl font-bold ml-2 tracking-wide hidden sm:block">Citizen Control Panel</h1>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium hidden sm:block">Namaskar, {profile?.name?.split(' ')[0] || 'Citizen'}</span>
                    <div className="p-2 rounded-full hover:bg-green-700 transition-colors cursor-pointer" onClick={() => setView('profile')}><IconUser className="" /></div>
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
                            <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold flex items-center ${view === 'home' ? 'bg-green-50 text-green-800' : 'text-slate-600 hover:bg-slate-100'}`}><IconSearch /> Active Surveys</button>
                            <button onClick={() => { setView('history'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold flex items-center ${view === 'history' ? 'bg-green-50 text-green-800' : 'text-slate-600 hover:bg-slate-100'}`}><IconHistory /> My Impact History</button>
                            <button onClick={() => { setView('profile'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold flex items-center ${view === 'profile' ? 'bg-green-50 text-green-800' : 'text-slate-600 hover:bg-slate-100'}`}><IconUser className="mr-2" /> My Profile</button>
                        </nav>
                        <div className="p-4 border-t border-slate-200">
                            <button onClick={handleLogout} className="w-full bg-red-100 text-red-700 p-3 rounded-lg font-bold hover:bg-red-200 transition-colors">Log Out</button>
                        </div>
                    </div>
                </div>
            )}

            <main className="container mx-auto p-6 flex-grow">
                {view === 'home' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-xl shadow-md border-t-4 border-[#003366]">
                            <h2 className="text-3xl font-black text-[#003366] mb-2">Public Notice Board</h2>
                            <p className="text-slate-600 font-medium">Participate in active government surveys to shape policies and improve your community.</p>
                        </div>
                        <h3 className="text-xl font-black text-slate-700">Open Public Surveys</h3>
                        {surveys.length === 0 ? (
                            <div className="text-center py-20 text-slate-500 font-bold bg-white rounded-xl border border-slate-200">You are all caught up! No new surveys available.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {surveys.map(s => (
                                    <div key={s.id} className="bg-white p-6 rounded-xl shadow border border-slate-200 flex flex-col h-full hover:shadow-lg transition-all relative">
                                        <div className="absolute top-4 right-4"><IconVerified /></div>
                                        <h4 className="text-xl font-bold text-[#003366] leading-tight pr-6 mb-2">{s.title}</h4>
                                        <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-4 border border-slate-200">ID: {s.surveyCode}</span>
                                        <p className="text-slate-600 text-sm mb-6 flex-grow line-clamp-3">{s.description}</p>
                                        <button onClick={() => { setCitizenSurveyId(s.surveyCode || s.id); setAppState('take_survey'); }} className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow-sm">
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
                        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#003366] flex justify-between items-center">
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
                    <div className="max-w-2xl mx-auto bg-white p-10 rounded-2xl shadow-xl border-t-8 border-[#FF9933] animate-in fade-in duration-300">
                        <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-orange-100 scale-125"><IconUser className="w-10 h-10" /></div>
                        <h2 className="text-3xl font-black mb-8 text-center text-[#003366] uppercase tracking-tighter italic">Citizen Identity</h2>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 flex justify-between items-center">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Aadhaar Number</label>
                                <span className="font-mono text-xl font-bold text-slate-700">XXXX - XXXX - {citizenAadhaar.slice(-4)}</span>
                            </div>
                            <IconShield className="text-green-600 opacity-50 w-10 h-10 mr-2" />
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
                        </div>
                        <button onClick={handleSaveProfile} disabled={isSaving} className="w-full bg-[#FF9933] text-white py-5 rounded-xl font-black text-xl shadow-lg hover:bg-orange-600 transition-all uppercase tracking-widest mt-10">
                            {isSaving ? 'Updating Registry...' : 'Update Citizen Profile'}
                        </button>
                    </div>
                )}
            </main>
            <GovFooter />
        </div>
    );
}

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
                    if (sSnap.exists()) setSurvey({ id: sSnap.id, ...sSnap.data() });
                    else { setIsLoading(false); return; }
                }

                const checkResponse = await getDocs(query(collection(db, `/artifacts/${appId}/public/data/surveys/${targetSurveyId}/responses`), where("citizenId", "==", citizenAadhaar)));
                if (!checkResponse.empty) { setSurveyStep('submitted'); setIsLoading(false); return; }

                const qQuery = query(collection(db, `/artifacts/${appId}/public/data/surveys/${targetSurveyId}/questions`));
                onSnapshot(qQuery, (snap) => {
                    const fetchedQuestions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    fetchedQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
                    setQuestions(fetchedQuestions);
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
                citizenId: citizenAadhaar, answers, submittedAt: serverTimestamp()
            });
            sessionStorage.removeItem(`survey_cache_${surveyId}`);
            setSurveyStep('submitted');
        } catch (e) { console.error(e); alert("Error submitting survey."); }
    };

    if (isLoading) return <div className="py-20 flex items-center justify-center font-bold text-slate-500 w-full">Loading Official Survey...</div>;
    if (!survey) return <div className="py-20 flex items-center justify-center font-bold text-red-500 text-xl w-full">404: Survey Not Found</div>;

    if (surveyStep === 'submitted') {
        return (
            <div className="py-12 flex flex-col justify-center items-center p-6 text-center w-full min-h-screen bg-slate-50">
                <div className="bg-white p-10 rounded-2xl shadow-xl border-t-8 border-green-500 max-w-md w-full">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                    <h2 className="text-3xl font-bold text-[#003366] mb-2">Thank You!</h2>
                    <p className="text-slate-500 mb-6 font-medium">Your response has been securely and officially recorded by the system.</p>
                    <button onClick={() => setAppState('citizen_dashboard')} className="text-blue-600 font-bold hover:underline">Return to My Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <GovHeader />
            <div className="py-12 px-4 w-full flex-grow">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-[#003366] p-8 text-white text-center border-b-8 border-[#FF9933] relative">
                        <button onClick={() => setAppState('citizen_dashboard')} className="absolute top-4 left-4 text-white/70 hover:text-white font-bold text-sm">← Back</button>
                        {surveyStep === 'preview' && <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Preview Mode</div>}
                        <h1 className="text-3xl font-bold mb-2">{survey.title}</h1>
                        <p className="text-blue-200 mb-2">{survey.description}</p>
                        {survey.surveyCode && <span className="inline-block bg-white/10 px-3 py-1 rounded text-xs font-bold tracking-widest border border-white/20">ID: {survey.surveyCode}</span>}
                    </div>
                    
                    <div className="p-8 space-y-8">
                        {surveyStep === 'fill' ? (
                            <>
                                {questions.map((q, i) => (
                                    <div key={q.id} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                        <p className="font-bold text-lg text-slate-800 mb-4">{i + 1}. {q.text}</p>
                                        {q.type === 'text' && <textarea className="w-full border-2 rounded-lg p-4 focus:border-blue-500 outline-none text-slate-700" rows="3" placeholder="Type your answer here..." value={answers[q.id] || ''} onChange={e => updateAnswer(q.id, e.target.value)}></textarea>}
                                        {q.type === 'multiple-choice' && (
                                            <div className="space-y-3">
                                                {q.options?.map((opt, oIdx) => (
                                                    <label key={oIdx} className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${answers[q.id] === opt ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-white hover:bg-slate-100 border-slate-200'}`}>
                                                        <input type="radio" name={q.id} value={opt} onChange={() => updateAnswer(q.id, opt)} className="w-5 h-5 text-blue-600" />
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
                                                        <label key={oIdx} className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${isChecked ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-white hover:bg-slate-100 border-slate-200'}`}>
                                                            <input type="checkbox" checked={isChecked} onChange={() => {
                                                                const currentAns = answers[q.id] || [];
                                                                if (currentAns.includes(opt)) updateAnswer(q.id, currentAns.filter(item => item !== opt));
                                                                else updateAnswer(q.id, [...currentAns, opt]);
                                                            }} className="w-5 h-5 text-blue-600 rounded" />
                                                            <span className="font-medium">{opt}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <button onClick={handlePreview} className="w-full bg-[#003366] text-white font-bold text-xl py-4 rounded-xl mt-8 hover:bg-blue-900 shadow-lg transition-transform transform hover:scale-[1.02]">Review & Proceed</button>
                            </>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-orange-50 border-l-4 border-[#FF9933] p-4 rounded text-orange-900 text-sm font-bold mb-6">Please review your answers carefully before final submission.</div>
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
            <GovFooter/>
        </div>
    );
}

// ============================================================================
// --- ADMIN COMPONENTS ---
// ============================================================================

function AadhaarAuth({ onAuthenticated, setAppState }) {
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

                await setDoc(adminRef, { 
                    name, phone, otp: defaultDummyOtp, adminId: generatedAdminId,
                    orgId: "PMC_01", orgName: "Pune Municipal Corporation"
                });
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
        <div className="py-12 px-4 flex flex-col justify-center w-full relative min-h-screen bg-slate-50">
            <button onClick={() => setAppState('landing')} className="absolute top-6 left-6 text-slate-500 hover:text-[#003366] font-bold transition-colors">
                ← Back to Main Menu
            </button>
            <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-6 shadow-2xl rounded-xl border-t-8 border-[#003366]">
                <div className="flex justify-center mb-4 text-[#003366]"><IconShield className="mr-2 w-10 h-10" /></div>
                <h2 className="text-center text-2xl font-black mb-6 text-slate-800">{authMode === 'login' ? 'Admin Login' : 'Admin Registration'}</h2>
                {step === 1 ? (
                    <div className="space-y-4">
                        {authMode === 'login' ? (
                            <input className="w-full border-2 p-3 rounded-lg outline-none focus:border-[#FF9933] font-mono tracking-widest text-center text-xl bg-slate-50" placeholder="ENTER ADMIN ID" value={adminInputId} onChange={e => setAdminInputId(e.target.value.replace(/\D/g, ''))} maxLength={6}/>
                        ) : (
                            <>
                                <input className="w-full border-2 p-3 rounded-lg outline-none focus:border-[#003366]" placeholder="Aadhaar Number" value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))} maxLength={12}/>
                                <input className="w-full border-2 p-3 rounded-lg outline-none focus:border-[#003366]" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}/>
                                <input className="w-full border-2 p-3 rounded-lg outline-none focus:border-[#003366]" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10}/>
                            </>
                        )}
                        <div className="bg-slate-50 p-4 rounded-lg border-2 border-dashed border-slate-300">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-mono font-black tracking-widest text-xl bg-slate-200 px-4 py-1 rounded select-none italic line-through decoration-slate-500 text-slate-700">{captchaCode}</span>
                                <button onClick={generateCaptcha} type="button" className="text-blue-600 text-xs flex items-center hover:underline font-bold"><IconRefresh /> Refresh</button>
                            </div>
                            <input className="w-full border-2 p-2 rounded outline-none focus:border-blue-500" placeholder="Enter code shown above" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)}/>
                        </div>
                        <button onClick={handleSendOTP} disabled={isLoading} className="w-full bg-[#003366] text-white p-3 rounded-lg font-bold hover:bg-blue-900 transition-all text-lg">{isLoading ? 'Processing...' : (authMode === 'login' ? 'Login to Portal' : 'Generate OTP')}</button>
                        <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-[#FF9933] font-bold text-sm w-full text-center hover:underline transition-all mt-4">{authMode === 'login' ? 'New Admin? Register' : 'Already registered? Login'}</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-green-600 text-center font-bold">Secure OTP sent to Registered Mobile</p>
                        <input className="w-full border-2 p-4 rounded-lg text-center tracking-[1em] text-2xl font-mono outline-none focus:border-[#003366] bg-slate-50" placeholder="••••••" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} maxLength={6}/>
                        <button onClick={handleVerifyOTP} className="w-full bg-green-700 text-white p-3 rounded-lg font-bold hover:bg-green-800 transition-all text-lg shadow-md">Verify & Login</button>
                        <button onClick={() => setStep(1)} className="text-slate-500 font-bold text-sm w-full text-center hover:text-slate-800 mt-2">← Back</button>
                    </div>
                )}
            </div>
        </div>
    );
}

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
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-[#003366]">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="h-16 w-16 bg-blue-100 text-[#003366] rounded-full flex items-center justify-center text-2xl font-bold">
                        {adminData?.name?.charAt(0) || <IconUser className="" />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800">{adminData?.name || 'Admin'}</h2>
                        <div className="flex gap-4 text-sm mt-1">
                            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-1 rounded font-bold">ID: {adminData?.adminId || 'Pending'}</span>
                            <span className="text-slate-500 flex items-center font-mono bg-slate-50 border border-slate-200 px-2 py-1 rounded">Aadhaar: **** {adminData?.id?.slice(-4) || 'XXXX'}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-800 border-b pb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                            <input className="w-full border-2 p-3 rounded-lg outline-none focus:border-[#003366]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                            <input className="w-full border-2 p-3 rounded-lg outline-none focus:border-[#003366]" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} maxLength={10} />
                        </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-800 border-b pb-2 pt-4">Professional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Official Email</label>
                            <input className="w-full border-2 p-3 rounded-lg outline-none focus:border-[#003366]" placeholder="admin@gov.in" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                            <input className="w-full border-2 p-3 rounded-lg outline-none focus:border-[#003366]" placeholder="e.g., Public Health" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-700 mb-1">Designation</label>
                            <input className="w-full border-2 p-3 rounded-lg outline-none focus:border-[#003366]" placeholder="e.g., Chief Medical Officer" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
                        </div>
                    </div>

                    <div className="pt-8 flex justify-end">
                        <button onClick={handleSave} disabled={isSaving} className="bg-[#FF9933] text-white px-8 py-3 rounded-lg font-black tracking-wide hover:bg-orange-600 transition-all shadow-md">
                            {isSaving ? 'Saving...' : 'Save Profile Details'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SurveyCreator({ setView, appId, currentAdmin, editingSurvey, setEditingSurvey }) {
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
                const loadedQs = qSnap.docs.map(d => ({ ...d.data(), firestoreId: d.id }));
                loadedQs.sort((a, b) => (a.order || 0) - (b.order || 0));
                setQuestions(loadedQs);
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
                
                let orderIndex = 0; 
                for (const q of questions) {
                    const { firestoreId, ...cleanQ } = q; 
                    await addDoc(collection(db, `/artifacts/${appId}/public/data/surveys/${editingSurvey.id}/questions`), { ...cleanQ, order: orderIndex++ });
                }
            } else {
                const surveyCode = generateSurveyCode(title);
                const surveyRef = await addDoc(collection(db, `/artifacts/${appId}/public/data/surveys`), { 
                    title, description, 
                    creatorId: currentAdmin?.adminId || currentAdmin?.id || 'Unknown', 
                    creatorName: currentAdmin?.name || 'Admin', 
                    orgId: currentAdmin?.orgId || "PMC_01",
                    targetAudience: targetAudience || 'General Public', 
                    createdAt: serverTimestamp(), surveyCode: surveyCode 
                });
                
                let orderIndex = 0;
                for (const q of questions) {
                    await addDoc(collection(db, `/artifacts/${appId}/public/data/surveys/${surveyRef.id}/questions`), { ...q, order: orderIndex++ });
                }
            }
            setEditingSurvey(null); setView('list');
        } catch (e) { console.error(e); } setIsSaving(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <button onClick={() => { setEditingSurvey(null); setView('list'); }} className="text-blue-800 font-bold hover:underline">← Back to Dashboard</button>
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-8 border-[#003366]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-black text-slate-800">{editingSurvey ? 'Modify Survey' : 'Create Official Survey'}</h2>
                    {editingSurvey && editingSurvey.surveyCode && (
                        <span className="bg-slate-100 px-3 py-1 rounded text-sm font-mono font-bold text-slate-500 border border-slate-200">ID: {editingSurvey.surveyCode}</span>
                    )}
                </div>
                
                <div className="bg-blue-50 p-8 rounded-xl border-2 border-dashed border-blue-300 mb-8">
                    <h3 className="text-xl font-bold text-[#003366] flex items-center mb-4"><IconSparkles /> Generate Draft with AI</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-[#003366] mb-1">Target Audience (Demographic)</label>
                        <input className="w-full p-3 rounded-lg border-2 focus:ring-0 focus:border-[#003366] outline-none bg-white" placeholder="e.g., Farmers in Maharashtra, Students in SPPU..." value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
                    </div>
                    <label className="block text-sm font-bold text-[#003366] mb-1">Survey Topic / Prompt</label>
                    <textarea className="w-full p-4 rounded-lg border-2 mb-4 focus:ring-0 focus:border-[#003366] outline-none" rows="3" placeholder="e.g., A feedback form for public health camp in Pune..." value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
                    <button onClick={generateWithAI} disabled={isGenerating} className="w-full bg-[#003366] text-white py-3 rounded-lg font-bold hover:bg-blue-900 disabled:opacity-50 transition-all text-lg shadow-md">{isGenerating ? "AI is working..." : "Generate Draft"}</button>
                </div>
                <div className="space-y-6 border-t pt-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Survey Title</label>
                        <input className="text-2xl font-bold w-full border-b-2 pb-2 outline-none focus:border-[#FF9933] transition-colors" placeholder="Enter Official Survey Title" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description / Purpose</label>
                        <textarea className="w-full text-slate-600 font-medium outline-none border-b-2 focus:border-[#FF9933] transition-colors" placeholder="Enter a brief description..." value={description} onChange={e => setDescription(e.target.value)} rows="2" />
                    </div>
                    <div className="space-y-6 pt-4">
                        <h3 className="text-xl font-bold text-slate-700 flex justify-between items-center">Questions Configuration</h3>
                        {questions.map((q, idx) => (
                            <div key={idx} className="p-5 bg-slate-50 rounded-xl border border-slate-200 relative group transition-all shadow-sm">
                                <button className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} title="Delete Question"><IconTrash /></button>
                                <div className="pr-8 mb-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Question {idx + 1}</label>
                                    <input className="font-bold text-lg w-full bg-transparent outline-none border-b-2 focus:border-[#003366] pb-1 mt-1" placeholder="Type your question..." value={q.text} onChange={e => { const newQ = [...questions]; newQ[idx].text = e.target.value; setQuestions(newQ); }} />
                                </div>
                                <div className="mb-4">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mr-3">Response Type:</label>
                                    <select className="bg-white border-2 rounded-lg px-3 py-2 text-sm font-bold text-[#003366] outline-none focus:border-[#FF9933] cursor-pointer shadow-sm" value={q.type} onChange={e => { const newQ = [...questions]; newQ[idx].type = e.target.value; if ((e.target.value === 'multiple-choice' || e.target.value === 'checkbox') && (!newQ[idx].options || newQ[idx].options.length === 0)) { newQ[idx].options = ['Option 1']; } setQuestions(newQ); }}>
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
                                                <input className="flex-1 outline-none border-b border-transparent focus:border-blue-500 py-1 transition-colors text-slate-700 font-medium" value={opt} placeholder={`Option ${oIdx + 1}`} onChange={e => { const newQ = [...questions]; newQ[idx].options[oIdx] = e.target.value; setQuestions(newQ); }} />
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
                    <button onClick={saveSurvey} disabled={isSaving || questions.length === 0} className="w-full bg-[#FF9933] text-white py-4 rounded-xl font-black tracking-wider text-xl hover:bg-orange-600 shadow-xl transition-all mt-8 disabled:opacity-50">{isSaving ? "Publishing to Platform..." : (editingSurvey ? "Update Survey Live" : "Publish Survey Live")}</button>
                </div>
            </div>
        </div>
    );
}

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
            } else throw new Error("Empty response from AI.");
        } catch (e) { console.error(e); alert("AI Error: " + e.message); } finally { setIsAnalyzing(false); }
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

function ResponsesView({ survey, setView, appId }) {
    const [questions, setQuestions] = useState([]);
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportTab, setReportTab] = useState('summary'); 
    const dashboardRef = useRef(null);

    useEffect(() => {
        if (!survey) return;
        const fetchResponsesData = async () => {
            try {
                const qSnap = await getDocs(query(collection(db, `/artifacts/${appId}/public/data/surveys/${survey.id}/questions`)));
                const qList = qSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                qList.sort((a, b) => (a.order || 0) - (b.order || 0));
                setQuestions(qList);

                const rSnap = await getDocs(query(collection(db, `/artifacts/${appId}/public/data/surveys/${survey.id}/responses`)));
                const rList = rSnap.docs.map(d => d.data());
                setResponses(rList);
                setLoading(false);
            } catch (e) { console.error(e); setLoading(false); }
        };
        fetchResponsesData();
    }, [survey, appId]);

    const downloadCSV = () => {
        if (responses.length === 0) return alert("No data to export.");
        const headers = ['Citizen_Auth_ID', 'Submitted_At', ...questions.map(q => `"${q.text.replace(/"/g, '""')}"`)];
        const csvRows = responses.map(r => {
            const dateStr = r.submittedAt?.toDate ? r.submittedAt.toDate().toLocaleString('en-IN') : 'Unknown';
            const citizenId = `****${r.citizenId ? r.citizenId.slice(-4) : 'XXXX'}`;
            const rowData = [citizenId, dateStr];
            questions.forEach(q => {
                let ans = r.answers?.[q.id] || 'No Answer';
                if (Array.isArray(ans)) ans = ans.join('; '); 
                rowData.push(`"${ans.replace(/"/g, '""')}"`); 
            });
            return rowData.join(',');
        });
        const csvString = [headers.join(','), ...csvRows].join('\n');
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
            
            <div ref={dashboardRef} className="bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-[#003366]" id="analytics-dashboard">
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

                {!loading && responses.length > 0 && (
                    <div className="flex space-x-6 border-b-2 border-slate-100 mb-8 html2pdf-ignore">
                        <button onClick={() => setReportTab('summary')} className={`py-3 px-2 font-bold text-sm border-b-4 transition-colors ${reportTab === 'summary' ? 'border-blue-600 text-blue-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Executive Summary (Charts)</button>
                        <button onClick={() => setReportTab('individual')} className={`py-3 px-2 font-bold text-sm border-b-4 transition-colors ${reportTab === 'individual' ? 'border-blue-600 text-blue-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Individual Responses (Raw Data)</button>
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
                        {reportTab === 'summary' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 border-l-4 border-l-[#003366]">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Participants</p>
                                        <p className="text-4xl font-black text-slate-800">{responses.length}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 border-l-4 border-l-emerald-500">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Questions Analyzed</p>
                                        <p className="text-4xl font-black text-slate-800">{questions.length}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 border-l-4 border-l-[#FF9933]">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Data Status</p>
                                        <p className="text-2xl font-black text-slate-800 mt-2 text-orange-600">Active Collection</p>
                                    </div>
                                </div>

                                {quantQuestions.length > 0 && (
                                    <div className="mb-12">
                                        <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Quantitative Metrics</h3>
                                        <div className="space-y-8">
                                            {quantQuestions.map((q, idx) => {
                                                const answersForQ = responses.map(r => r.answers?.[q.id]).filter(a => a !== undefined && a !== '');
                                                let chartData = [];
                                                const dataMap = {};
                                                (q.options || []).forEach(opt => dataMap[opt] = 0);
                                                answersForQ.forEach(ans => {
                                                    if (Array.isArray(ans)) { ans.forEach(a => { if (dataMap[a] !== undefined) dataMap[a]++; }); } 
                                                    else { if (dataMap[ans] !== undefined) dataMap[ans]++; }
                                                });
                                                chartData = Object.keys(dataMap).map(key => ({ name: key, count: dataMap[key], percentage: answersForQ.length > 0 ? Math.round((dataMap[key] / answersForQ.length) * 100) : 0 }));

                                                return (
                                                    <div key={q.id} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm break-inside-avoid">
                                                        <h4 className="font-bold text-xl text-[#003366] mb-8 border-b border-slate-100 pb-4">Q{idx + 1}: {q.text}</h4>
                                                        <div className="flex flex-col md:flex-row gap-8 items-center">
                                                            <div className="w-full md:w-1/2 h-72">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    {q.type === 'multiple-choice' ? (
                                                                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                                                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                                                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                                                            <Bar dataKey="count" isAnimationActive={false} fill="#003366" radius={[4, 4, 0, 0]} maxBarSize={60}>
                                                                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                                                            </Bar>
                                                                        </BarChart>
                                                                    ) : (
                                                                        <PieChart>
                                                                            <Pie data={chartData} isAnimationActive={false} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="count">
                                                                                {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                                                            </Pie>
                                                                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                                                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                                                                        </PieChart>
                                                                    )}
                                                                </ResponsiveContainer>
                                                            </div>
                                                            <div className="w-full md:w-1/2">
                                                                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                                                                    <table className="min-w-full text-sm">
                                                                        <thead className="bg-[#003366] text-white">
                                                                            <tr><th className="py-3 px-4 text-left font-bold">Selection</th><th className="py-3 px-4 text-right font-bold">Votes</th><th className="py-3 px-4 text-right font-bold">%</th></tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-slate-200">
                                                                            {chartData.map((row, i) => (
                                                                                <tr key={i} className="bg-white">
                                                                                    <td className="py-3 px-4 font-bold text-slate-700 flex items-center"><span className="w-3 h-3 rounded-full mr-3" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>{row.name}</td>
                                                                                    <td className="py-3 px-4 text-right text-slate-600 font-medium">{row.count}</td>
                                                                                    <td className="py-3 px-4 text-right font-bold text-slate-800">{row.percentage}%</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        </div>
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
                                                        <h4 className="font-bold text-xl text-[#003366] mb-4 border-b border-slate-100 pb-4">{q.text}</h4>
                                                        <AIInsightsBox answers={answersForQ} questionText={q.text} />
                                                        <div className="mt-8">
                                                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Individual Written Responses</h5>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-2">
                                                                {answersForQ.map((ans, aIdx) => (
                                                                    <div key={aIdx} className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 italic relative">
                                                                        <span className="text-slate-300 font-serif text-2xl absolute top-2 left-2">"</span>
                                                                        <span className="relative z-10 pl-4 block font-medium">{ans}</span>
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

                        {reportTab === 'individual' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Individual Citizen Records</h3>
                                {responses.map((r, index) => {
                                    let dateStr = "Unknown Date";
                                    if (r.submittedAt?.toDate) dateStr = r.submittedAt.toDate().toLocaleString('en-IN');
                                    return (
                                        <div key={index} className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm break-inside-avoid">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-200 pb-4">
                                                <div>
                                                    <h4 className="font-bold text-xl text-[#003366]">Response #{index + 1}</h4>
                                                    <p className="text-xs text-slate-500 font-mono mt-1">Citizen Auth ID: **** {r.citizenId ? r.citizenId.slice(-4) : 'XXXX'}</p>
                                                </div>
                                                <div className="bg-blue-100 text-[#003366] text-xs font-bold px-3 py-1 rounded-full mt-2 sm:mt-0">{dateStr}</div>
                                            </div>
                                            <div className="space-y-4">
                                                {questions.map((q, qIdx) => {
                                                    const ans = r.answers?.[q.id];
                                                    const displayAns = Array.isArray(ans) ? ans.join(', ') : (ans || 'No answer provided');
                                                    return (
                                                        <div key={q.id} className="bg-white p-4 rounded-lg border border-slate-100">
                                                            <p className="text-sm font-bold text-slate-500 mb-2">Q{qIdx + 1}: {q.text}</p>
                                                            <p className="text-base font-bold text-slate-800">{displayAns}</p>
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
            </div>
        </div>
    );
}

function AdminPreviewView({ survey, setView, appId }) {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!survey) return;
        const fetchQuestions = async () => {
            try {
                const qQuery = query(collection(db, `/artifacts/${appId}/public/data/surveys/${survey.id}/questions`));
                onSnapshot(qQuery, (snap) => {
                    const fetchedQuestions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    fetchedQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
                    setQuestions(fetchedQuestions);
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
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 border-[#003366]">
                <div className="bg-slate-100 p-8 text-center border-b border-slate-200">
                    <span className="bg-[#FF9933] text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block shadow-sm">Admin Preview Mode</span>
                    <h2 className="text-3xl font-black text-[#003366] mb-2">{survey.title}</h2>
                    <p className="text-slate-600 font-medium">{survey.description}</p>
                    {survey.surveyCode && <div className="mt-4 inline-block bg-white px-3 py-1 rounded border border-slate-200 font-mono text-sm font-bold text-slate-500">Code: {survey.surveyCode}</div>}
                </div>
                
                <div className="p-10 space-y-8">
                    {isLoading ? <div className="text-center text-slate-400 font-bold">Loading questions...</div> : questions.map((q, i) => (
                        <div key={q.id} className="bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="font-bold text-xl text-slate-800 mb-6 flex items-start"><span className="mr-3 opacity-30">{i + 1}.</span> {q.text}</p>
                            {q.type === 'text' && <textarea disabled className="w-full border-2 p-4 rounded-xl outline-none bg-slate-100 font-medium text-slate-500 cursor-not-allowed" rows="3" placeholder="Citizen text response will go here..."></textarea>}
                            {(q.type === 'multiple-choice' || q.type === 'checkbox') && (
                                <div className="space-y-3">
                                    {q.options?.map((opt, oIdx) => (
                                        <label key={oIdx} className="flex items-center space-x-4 p-4 border-2 rounded-xl bg-white border-slate-100 opacity-70 cursor-not-allowed">
                                            <input type={q.type === 'checkbox' ? 'checkbox' : 'radio'} disabled className="w-5 h-5 text-blue-600" />
                                            <span className="font-bold text-slate-700">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- ADMIN: Survey Card Component ---
function AdminSurveyCard({ s, appId, setActiveSurvey, setView, setShareModal, setEditingSurvey }) {
    const [responseCount, setResponseCount] = useState(0);

    // REAL-TIME LISTENER: Updates instantly when a citizen submits a survey
    useEffect(() => {
        const q = query(collection(db, `/artifacts/${appId}/public/data/surveys/${s.id}/responses`));
        const unsubscribe = onSnapshot(q, (snap) => {
            setResponseCount(snap.size);
        }, (error) => {
            console.error("Error fetching response count:", error);
        });
        
        return () => unsubscribe(); // Cleanup listener
    }, [s.id, appId]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#003366] flex flex-col h-full hover:shadow-lg transition-all relative">
            <div className="absolute top-4 right-4"><IconVerified /></div>
            
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800 pr-8 leading-tight">{s.title}</h3>
            </div>
            
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                {/* HIGH VISIBILITY RESPONSE BADGE */}
                <div className="bg-green-600 text-white text-xs font-black px-3 py-1.5 rounded shadow-sm flex items-center gap-1.5 animate-in fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    {responseCount} {responseCount === 1 ? 'Response' : 'Responses'}
                </div>

                {s.targetAudience && (
                    <div className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded inline-flex items-center w-fit">
                        <IconTarget /> {s.targetAudience}
                    </div>
                )}
            </div>

            <div className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-1 rounded-md inline-flex items-center w-fit shadow-sm mb-3">
                👤 Owner: {s.creatorName || 'Admin'} | ID: {s.creatorId ? String(s.creatorId).slice(-6) : 'XXXXXX'}
            </div>
            
            <p className="text-slate-500 text-sm mb-6 flex-grow line-clamp-3">{s.description}</p>
            
            <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-100">
                <button onClick={() => { setActiveSurvey(s); setView('responses'); }} className="bg-slate-100 text-[#003366] py-2 rounded-lg font-bold hover:bg-blue-100 transition-all text-xs border border-blue-200">
                    Analytics
                </button>
                <button onClick={() => setShareModal(s)} className="bg-[#003366] text-white py-2 rounded-lg font-bold hover:bg-blue-900 transition-all text-xs shadow-sm">
                    Share SMS
                </button>
                <button onClick={() => { setActiveSurvey(s); setView('preview'); }} className="bg-slate-100 text-slate-700 py-2 rounded-lg font-bold hover:bg-slate-200 transition-all text-xs border border-slate-200">
                    Preview
                </button>
                <button onClick={() => { setEditingSurvey(s); setView('create'); }} className="bg-orange-100 text-orange-800 py-2 rounded-lg font-bold hover:bg-orange-200 transition-all text-xs border border-orange-200">
                    Modify
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// --- MAIN APP ENTRY POINT ---
// ============================================================================
export default function App() {
    const [appState, setAppState] = useState('landing'); 
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

    // Dashboard Filter & Accessibility State
    const [dashboardMode, setDashboardMode] = useState('mine'); 
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [isHighContrast, setIsHighContrast] = useState(false);

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
                        { pageLanguage: 'en', autoDisplay: false },
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
                    } catch (err) { setAppState('landing'); }
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
                    setCitizenSurveyId(null); 
                    setAppState('citizen_dashboard');
                    return;
                }
            }
            setAppState('landing');
        };

        const unsubscribe = onAuthStateChanged(auth, checkRouteAndAuth);
        const handleHashChange = () => checkRouteAndAuth(auth.currentUser);
        window.addEventListener('hashchange', handleHashChange);
        
        return () => { unsubscribe(); window.removeEventListener('hashchange', handleHashChange); };
    }, []);

    useEffect(() => {
        if (appState !== 'main' || !currentAdmin) return;
        const q = query(collection(db, `/artifacts/${appId}/public/data/surveys`));
        return onSnapshot(q, (snap) => { 
            const fetchedSurveys = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            fetchedSurveys.sort((a, b) => {
                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return timeB - timeA;
            });
            setSurveys(fetchedSurveys); 
            setIsDataLoaded(true); 
        });
    }, [appId, appState, currentAdmin]);

    const handleLogout = () => { 
        signOut(auth).then(() => { 
            localStorage.removeItem('adminAadhaar'); 
            setCurrentAdmin(null); 
            setAppState('landing');
            setView('list'); 
        }); 
    };

    const handleSendSMS = async () => {
        if (!shareModal) return; 
        alert(`Successfully deployed bulk Official E-Governance SMS alert to ${bulkRegion}. Check your phone!`);
        setShareModal(null);
    };

    const handlePinSubmit = () => {
        if (pinInput === "4030") {
            setDashboardMode('all');
            setView('list');
            setShowPinModal(false);
            setPinInput('');
            setIsMenuOpen(false);
        } else {
            alert("SECURITY ALERT: Invalid Organization PIN.");
            setPinInput('');
        }
    };

    if (appState === 'loading') return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><IconRefresh className="animate-spin text-white w-12 h-12" /></div>;

    const displayedSurveys = dashboardMode === 'mine' 
        ? surveys.filter(s => {
            if (!currentAdmin) return false;
            const cid = String(s.creatorId);
            const adminIdStr = String(currentAdmin.id);
            const adminPinStr = String(currentAdmin.adminId);
            const adminName = String(currentAdmin.name);
            if (cid === adminIdStr || cid === adminPinStr || String(s.creatorName) === adminName) return true;
            return false;
          }) 
        : surveys;

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isHighContrast ? 'bg-black text-yellow-400 !border-yellow-400' : 'bg-slate-50 text-slate-800'}`}>
            <style>{`
                .goog-te-banner-frame { display: none !important; }
                body { top: 0px !important; }
                .goog-logo-link { display: none !important; }
                #google_translate_element { display: none !important; }
                .pdf-include-only[style*="display: none"] { display: block !important; }
                ${isHighContrast ? `
                    * { border-color: #fbbf24 !important; color: #fbbf24 !important; background-color: #000 !important; }
                    svg { stroke: #fbbf24 !important; fill: none !important; }
                    img { filter: grayscale(100%) sepia(100%) hue-rotate(90deg) brightness(200%) contrast(200%) !important; }
                ` : ''}
            `}</style>

            <GovTopStrip toggleContrast={() => setIsHighContrast(!isHighContrast)} />

            {/* ROUTING LOGIC */}
            {appState === 'landing' && <LandingPage setAppState={setAppState} />}
            {appState === 'citizen_auth' && <CitizenAuth onAuthenticated={() => { if (citizenSurveyId) { setAppState('take_survey'); } else { setAppState('citizen_dashboard'); } }} setAppState={setAppState} />}
            {appState === 'citizen_dashboard' && <CitizenDashboard appId={appId} setAppState={setAppState} setCitizenSurveyId={setCitizenSurveyId} />}
            {appState === 'take_survey' && <TakeSurveyView surveyId={citizenSurveyId} appId={appId} setAppState={setAppState} />}
            {appState === 'auth' && <AadhaarAuth onAuthenticated={() => setAppState('main')} setAppState={setAppState} />}

            {appState === 'main' && (
                <div className="flex flex-col flex-grow">
                    <GovHeader />
                    <header className="bg-[#003366] text-white p-4 shadow-lg flex justify-between items-center sticky top-0 z-30 html2pdf-ignore">
                        <div className="flex items-center">
                            <div onClick={() => setIsMenuOpen(true)}>
                                <IconMenu />
                            </div>
                            <div className="flex items-center cursor-pointer" onClick={() => { setView('list'); setDashboardMode('mine'); }}>
                                <IconShield />
                                <h1 className="text-xl font-bold ml-2 tracking-wide hidden sm:block">Admin Portal Dashboard</h1>
                            </div>
                        </div>
                        
                        <div className="relative group cursor-pointer">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-bold hidden sm:block tracking-wide">Welcome, {currentAdmin?.name?.split(' ')[0] || 'Admin'}</span>
                                <div className="p-2 rounded-full hover:bg-blue-800 transition-colors bg-white/10">
                                    <IconUser />
                                </div>
                            </div>
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-slate-200">
                                <button onClick={() => setView('profile')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 border-b">Update Profile</button>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">Log Out</button>
                            </div>
                        </div>
                    </header>

                    {/* Organization PIN Security Modal */}
                    {showPinModal && (
                        <div className="fixed inset-0 bg-slate-900 bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-[60] p-4 html2pdf-ignore animate-in fade-in">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border-t-8 border-red-600">
                                <div className="p-8 text-center">
                                    <IconShield className="w-16 h-16 mx-auto text-red-600 mb-4" />
                                    <h2 className="text-2xl font-black text-slate-800 mb-2">Restricted Access</h2>
                                    <p className="text-sm text-slate-500 mb-6 font-medium">Enter the 4-digit Organization Code to view all PMC surveys.</p>
                                    <input 
                                        type="password" 
                                        maxLength={4}
                                        value={pinInput}
                                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                                        className="w-full text-center tracking-[1em] font-mono text-3xl p-4 border-2 rounded-xl focus:border-red-600 outline-none bg-slate-50 mb-6"
                                        placeholder="••••"
                                        autoFocus
                                    />
                                    <div className="flex gap-4">
                                        <button onClick={() => { setShowPinModal(false); setPinInput(''); }} className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300">Cancel</button>
                                        <button onClick={handlePinSubmit} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md">Verify</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isMenuOpen && (
                        <div className="fixed inset-0 z-50 flex html2pdf-ignore">
                            <div className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity" onClick={() => setIsMenuOpen(false)}></div>
                            <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                                <div className="bg-[#003366] p-6 flex justify-between items-center text-white border-b-4 border-[#FF9933]">
                                    <span className="font-black text-lg tracking-wide uppercase">Menu</span>
                                    <button onClick={() => setIsMenuOpen(false)}><IconClose /></button>
                                </div>
                                <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
                                    <button onClick={() => { setView('list'); setDashboardMode('mine'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold flex items-center gap-3 ${dashboardMode === 'mine' && view === 'list' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}>
                                        <IconUser /> My Personal Surveys
                                    </button>
                                    
                                    <button onClick={() => setShowPinModal(true)} className={`w-full text-left p-3 rounded-lg font-bold flex items-center gap-3 ${dashboardMode === 'all' && view === 'list' ? 'bg-red-50 text-red-800 border border-red-200' : 'text-slate-600 hover:bg-slate-100'}`}>
                                        <IconShield /> Org Master Dashboard
                                        <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded">SECURE</span>
                                    </button>

                                    <div className="border-t border-slate-200 my-2"></div>

                                    <button onClick={() => { setEditingSurvey(null); setView('create'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold flex items-center gap-3 ${view === 'create' && !editingSurvey ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                                        <IconPlus /> Create New Survey
                                    </button>
                                    <button onClick={() => { setView('profile'); setIsMenuOpen(false); }} className={`w-full text-left p-3 rounded-lg font-bold flex items-center gap-3 ${view === 'profile' ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-100'}`}>
                                        <IconEye /> My Profile Settings
                                    </button>
                                </nav>
                                <div className="p-4 border-t border-slate-200">
                                    <button onClick={handleLogout} className="w-full bg-red-50 text-red-700 p-3 rounded-lg font-bold hover:bg-red-100 border border-red-200 transition-colors">
                                        Log Out System
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <main className="container mx-auto p-6 relative flex-grow">
                        {view === 'list' && (
                            <>
                                <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-[#003366] mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 mb-1">Welcome, {currentAdmin?.name || 'Admin'}!</h2>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 font-medium">
                                            {currentAdmin?.adminId && (
                                                <p><span className="font-bold text-slate-700">Admin ID:</span> <span className="bg-blue-50 text-[#003366] border border-blue-200 px-2 py-0.5 rounded font-mono">{currentAdmin.adminId}</span></p>
                                            )}
                                            <p><span className="font-bold text-slate-700">Phone:</span> +91 {currentAdmin?.phone}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setEditingSurvey(null); setView('create'); }} className="bg-[#FF9933] text-white px-6 py-3 rounded-lg font-black tracking-wide flex items-center shadow-lg hover:bg-orange-600 transition-all whitespace-nowrap">
                                        <IconPlus /> Create New Survey
                                    </button>
                                </div>

                                {surveys.length > 0 && (
                                    <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 mb-8 flex items-center gap-4">
                                        <IconSearch />
                                        <span className="font-bold text-sm text-slate-600 whitespace-nowrap">Global Survey Lookup:</span>
                                        <select 
                                            className="flex-1 bg-slate-50 border border-slate-200 p-2 rounded-lg font-bold text-[#003366] outline-none focus:border-[#FF9933]"
                                            onChange={(e) => {
                                                if (!e.target.value) return;
                                                const selected = surveys.find(s => s.surveyCode === e.target.value || s.id === e.target.value);
                                                if (selected) { setActiveSurvey(selected); setView('responses'); }
                                                e.target.value = ""; 
                                            }}
                                        >
                                            <option value="">Jump to Analytics by Code...</option>
                                            {surveys.map(s => (
                                                <option key={s.id} value={s.surveyCode || s.id}>
                                                    {s.surveyCode ? `${s.surveyCode} : ` : ''}{s.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-6 border-b-2 border-slate-200 pb-2">
                                    <h3 className={`text-xl font-black uppercase tracking-wider ${dashboardMode === 'all' ? 'text-red-700' : 'text-[#003366]'}`}>
                                        {dashboardMode === 'all' ? '🏢 Master Dashboard: PMC Surveys' : '👤 My Authored Surveys'}
                                    </h3>
                                    {dashboardMode === 'all' && (
                                        <button onClick={() => setDashboardMode('mine')} className="text-xs font-bold bg-slate-200 text-slate-700 px-3 py-1 rounded hover:bg-slate-300">
                                            Return to My Surveys
                                        </button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {!isDataLoaded ? <><SkeletonCard/><SkeletonCard/><SkeletonCard/></> : 
                                        displayedSurveys.map(s => (
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
                                    {displayedSurveys.length === 0 && isDataLoaded && (
                                        <div className="col-span-full text-center py-20 text-slate-500 font-bold bg-white rounded-xl border-2 border-slate-200 border-dashed shadow-sm">
                                            {dashboardMode === 'all' ? 'No surveys have been published yet.' : 'You haven\'t authored any surveys yet.'}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                        
                        {view === 'create' && <SurveyCreator setView={setView} appId={appId} currentAdmin={currentAdmin} editingSurvey={editingSurvey} setEditingSurvey={setEditingSurvey} />}
                        {view === 'responses' && <ResponsesView survey={activeSurvey} setView={setView} appId={appId} />}
                        {view === 'profile' && <AdminProfile adminData={currentAdmin} setAdminData={setCurrentAdmin} />}
                        {view === 'preview' && <AdminPreviewView survey={activeSurvey} setView={setView} appId={appId} />}

                        {shareModal && shareModal.title && (
                            <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200 html2pdf-ignore">
                                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border-t-8 border-[#FF9933]">
                                    <div className="bg-[#003366] p-4 flex justify-between items-center text-white">
                                        <h3 className="font-bold text-lg flex items-center"><IconShare /> Bulk SMS Dispatch</h3>
                                        <button onClick={() => setShareModal(null)} className="hover:text-[#FF9933] transition-colors"><IconClose /></button>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message Preview</label>
                                            <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 border-l-4 border-[#003366] font-medium font-sans whitespace-pre-wrap shadow-sm">
                                                {`JG-NSP-GOV\nभारत सरकार: नागरिकांना विनंती आहे की "${shareModal.title}" या अधिकृत सर्वेक्षणात आपला सहभाग नोंदवावा. आपला अभिप्राय महत्त्वाचा आहे.\nप्रतिसाद लिंक: ${window.location.origin}/#/survey/${shareModal.surveyCode || shareModal.id}\n- राष्ट्रीय सर्वेक्षण मंच (NSP), मंत्रालय.`}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Target Region</label>
                                            <select 
                                                className="w-full border-2 p-3 rounded-lg outline-none focus:border-[#FF9933] transition-colors font-bold text-[#003366] bg-slate-50" 
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
                                        <button onClick={handleSendSMS} id="bulk-btn" className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-800 transition-all shadow-lg flex justify-center items-center">
                                            Execute Regional Broadcast
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                    <GovFooter />
                </div>
            )}
        </div>
    );
}