import React from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, onSnapshot, updateDoc, deleteDoc, query, Timestamp, writeBatch } from 'firebase/firestore';
import { setLogLevel } from "firebase/firestore";

// --- Data & Configuration ---

// IMPORTANT: Replace this with your own Firebase config object!
// You can get this from your Firebase project settings.
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAITUuHlHnAYThILuV9udqfq_TY55ml1g4",
  authDomain: "performance-lab-peptide-app.firebaseapp.com",
  projectId: "performance-lab-peptide-app",
  storageBucket: "performance-lab-peptide-app.firebasestorage.app",
  messagingSenderId: "950131555055",
  appId: "1:950131555055:web:d1a80cde59a8652c13b91a",
  measurementId: "G-L9SCEH6S8L"
};

// This is a unique ID for the application's data in Firestore.
const appId = 'performance-lab-app';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setLogLevel('debug');

const PEPTIDE_LIBRARY = [
    // Peptide Blends
    { name: 'BPC-157 / TB-500 Blend', category: 'Peptide Blends', purpose: 'Research into combined regenerative and healing effects.' },
    { name: 'CJC-1295 / Ipamorelin Blend', category: 'Peptide Blends', purpose: 'Research into synergistic GH release.' },
    { name: 'Tesamorelin / Ipamorelin Blend', category: 'Peptide Blends', purpose: 'Research into combined GH release with a focus on visceral fat.' },
    // General Peptides
    { name: 'Adipotide (FTPP)', category: 'General Peptides', purpose: 'Research into pro-apoptotic agents for fat tissue.' },
    { name: 'AICAR', category: 'General Peptides', purpose: 'Research into AMPK activation and metabolic processes.' },
    { name: 'AOD9604', category: 'General Peptides', purpose: 'Fragment of hGH for fat metabolism research.' },
    { name: 'ARA-290', category: 'General Peptides', purpose: 'Research into innate repair receptors and neuropathic pain.' },
    { name: 'B7-33', category: 'General Peptides', purpose: 'Research into selective relaxin receptor agonists for organ protection.' },
    { name: 'BPC 157', category: 'General Peptides', purpose: 'Body Protective Compound research, focusing on healing and regeneration.' },
    { name: 'Cagrilintide', category: 'General Peptides', purpose: 'Long-acting amylin analogue research for metabolic control.' },
    { name: 'CJC-1295 no DAC (Mod GRF 1-29)', category: 'General Peptides', purpose: 'Growth Hormone Releasing Hormone (GHRH) analog research.' },
    { name: 'DSIP', category: 'General Peptides', purpose: 'Delta Sleep-Inducing Peptide research for sleep modulation.' },
    { name: 'Epithalon (Epitalon)', category: 'General Peptides', purpose: 'Synthetic peptide for telomerase activity and anti-aging research.' },
    { name: 'GHRP-2', category: 'General Peptides', purpose: 'Growth Hormone Releasing Peptide for GH secretion research.' },
    { name: 'GHRP-6', category: 'General Peptides', purpose: 'Growth Hormone Releasing Peptide for GH secretion and appetite research.' },
    { name: 'Gonadorelin', category: 'General Peptides', purpose: 'GnRH analogue for reproductive health research.' },
    { name: 'Hexarelin', category: 'General Peptides', purpose: 'Potent GHRP for cardiovascular and GH secretion research.' },
    { name: 'Ipamorelin', category: 'General Peptides', purpose: 'Selective GH-Secretagogue and ghrelin receptor agonist research.' },
    { name: 'Kisspeptin-10', category: 'General Peptides', purpose: 'Research into the regulation of the HPG axis and reproduction.' },
    { name: 'KPV', category: 'General Peptides', purpose: 'Tripeptide with potent anti-inflammatory properties research.' },
    { name: 'Liraglutide', category: 'General Peptides', purpose: 'GLP-1 analogue research for metabolic studies.' },
    { name: 'LL-37', category: 'General Peptides', purpose: 'Human cathelicidin antimicrobial peptide research.' },
    { name: 'MGF', category: 'General Peptides', purpose: 'Mechano Growth Factor research for tissue repair and muscle growth.' },
    { name: 'MOTS-c', category: 'General Peptides', purpose: 'Mitochondrial-derived peptide for metabolic regulation research.' },
    { name: 'N-Acetyl Epithalon Amidate', category: 'General Peptides', purpose: 'Modified Epithalon for enhanced stability and bioavailability research.' },
    { name: 'N-Acetyl Selank Amidate', category: 'General Peptides', purpose: 'Modified Selank with anxiolytic and nootropic research applications.' },
    { name: 'N-Acetyl Semax Amidate', category: 'General Peptides', purpose: 'Modified Semax for enhanced nootropic and neuroprotective research.' },
    { name: 'NAD+', category: 'General Peptides', purpose: 'Nicotinamide Adenine Dinucleotide research for cellular energy and longevity.' },
    { name: 'Oxytocin', category: 'General Peptides', purpose: 'Research into social bonding, empathy, and reproductive functions.' },
    { name: 'PE-22-28', category: 'General Peptides', purpose: 'A novel antidepressant and neurogenic compound (TRKB agonist) research.' },
    { name: 'PEG-MGF', category: 'General Peptides', purpose: 'Pegylated Mechano Growth Factor for extended half-life research.' },
    { name: 'PNC-27', category: 'General Peptides', purpose: 'Cancer research focusing on membrane-penetrating peptides that induce apoptosis.' },
    { name: 'PT-141 (Bremelanotide)', category: 'General Peptides', purpose: 'Melanocortin agonist research for sexual function.' },
    { name: 'P21 (P021)', category: 'General Peptides', purpose: 'Neurogenic and neuroprotective compound derived from CNTF research.' },
    { name: 'Retatrutide', category: 'General Peptides', purpose: 'GLP-1, GIP, and glucagon receptor agonist research for metabolic disease.' },
    { name: 'Selank', category: 'General Peptides', purpose: 'Anxiolytic peptide with immunomodulatory effects research.' },
    { name: 'Semaglutide', category: 'General Peptides', purpose: 'Long-acting GLP-1 analogue for metabolic and weight management research.' },
    { name: 'Semax', category: 'General Peptides', purpose: 'Nootropic peptide with neuroprotective properties research.' },
    { name: 'Sermorelin', category: 'General Peptides', purpose: 'GHRH fragment for growth hormone stimulation research.' },
    { name: 'TB-500', category: 'General Peptides', purpose: 'Synthetic version of Thymosin Beta-4 for healing and repair research.' },
    { name: 'Tesamorelin', category: 'General Peptides', purpose: 'Stabilized GHRH analogue research, particularly for visceral fat.' },
    { name: 'Thymosin Alpha-1', category: 'General Peptides', purpose: 'Immune modulator research, enhancing T-cell function.' },
    { name: 'Thymalin', category: 'General Peptides', purpose: 'Thymus extract research for immune system support.' },
    { name: 'Tirzepatide', category: 'General Peptides', purpose: 'Dual GIP and GLP-1 receptor agonist research for metabolic disease.' },
    { name: 'Thyrotropin (TRH)', category: 'General Peptides', purpose: 'Thyrotropin-releasing hormone research.' },
    { name: 'IGF-1 DES', category: 'IGF-1 Proteins', purpose: 'Potent, short-acting Insulin-like Growth Factor-1 variant research.' },
    { name: 'IGF-1 LR3', category: 'IGF-1 Proteins', purpose: 'Long-acting Insulin-like Growth Factor-1 analog research.' },
    { name: 'Melanotan 1', category: 'Melanotan Peptides', purpose: 'Alpha-melanocyte-stimulating hormone (α-MSH) analog for pigmentation research.' },
    { name: 'Melanotan 2', category: 'Melanotan Peptides', purpose: 'Alpha-MSH analog for pigmentation and sexual function research.' },
    { name: 'Bronchogen', category: 'Bioregulators', purpose: 'Research on bronchial tissue regulation.' },
    { name: 'Cardiogen', category: 'Bioregulators', purpose: 'Research on cardiac muscle tissue regulation.' },
    { name: 'Cartalax', category: 'Bioregulators', purpose: 'Research on cartilage and musculoskeletal system regulation.' },
    { name: 'Chonluten', category: 'Bioregulators', purpose: 'Research on bronchial and lung tissue regulation.' },
    { name: 'Cortagen', category: 'Bioregulators', purpose: 'Research on cerebral cortex regulation.' },
    { name: 'Glandokort', category: 'Bioregulators', purpose: 'Research on adrenal gland regulation.' },
    { name: 'Honluten', category: 'Bioregulators', purpose: 'Research on lung and bronchial tissue.' },
    { name: 'Libidon', category: 'Bioregulators', purpose: 'Research on prostate gland regulation.' },
    { name: 'Livagen', category: 'Bioregulators', purpose: 'Research on liver and gastrointestinal tract regulation.' },
    { name: 'Ovagen', category: 'Bioregulators', purpose: 'Research on liver function and detoxification pathways.' },
    { name: 'Pancragen', category: 'Bioregulators', purpose: 'Research on pancreas regulation.' },
    { name: 'Pinealon', category: 'Bioregulators', purpose: 'Research on brain cell and cognitive function regulation.' },
    { name: 'Prostamax', category: 'Bioregulators', purpose: 'Research on prostate function.' },
    { name: 'Stamakort', category: 'Bioregulators', purpose: 'Research on stomach and digestive system regulation.' },
    { name: 'Testagen', category: 'Bioregulators', purpose: 'Research on testicular function regulation.' },
    { name: 'Testalamin', category: 'Bioregulators', purpose: 'Research on testicular function regulation.' },
    { name: 'Thymagen', category: 'Bioregulators', purpose: 'Research on immune system function regulation.' },
    { name: 'Vesilute', category: 'Bioregulators', purpose: 'Research on bladder function.' },
    { name: 'Vesugen', category: 'Bioregulators', purpose: 'Research on blood vessel regulation.' },
    { name: 'Vilon', category: 'Bioregulators', purpose: 'Research on immune and anti-aging processes.' },
];

// --- SVG Icons ---
const PerformanceLabLogo = () => (
    <div className="flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="miami-gradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#06b6d4"/>
                    <stop offset="1" stopColor="#ec4899"/>
                </linearGradient>
            </defs>
            <path d="M40 15C20 35 80 65 60 85" stroke="url(#miami-gradient)" strokeWidth="12" strokeLinecap="round"/>
            <path d="M60 15C80 35 20 65 40 85" stroke="url(#miami-gradient)" strokeWidth="12" strokeLinecap="round"/>
            <line x1="48" y1="32" x2="52" y2="32" stroke="#ec4899" strokeWidth="10" strokeLinecap="round"/>
            <line x1="41" y1="50" x2="59" y2="50" stroke="#834d9b" strokeWidth="10" strokeLinecap="round"/>
            <line x1="48" y1="68" x2="52" y2="68" stroke="#06b6d4" strokeWidth="10" strokeLinecap="round"/>
        </svg>
        <span className="font-black text-xl tracking-wider" style={{ fontFamily: `'Arial Black', 'Impact', sans-serif`, background: 'linear-gradient(to right, #06b6d4, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            PERFORMANCE LAB
        </span>
    </div>
);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>);
const BookOpenIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>);
const Trash2Icon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>);
const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const AlertTriangleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>);
const LibraryIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 17h.01"/><path d="M7 17h.01"/><path d="M12 17h.01"/></svg>);
const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const CalculatorIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><line x1="16" y1="10" x2="12" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="8" y1="14" x2="8" y2="18"></line><line x1="8" y1="10" x2="8" y2="10"></line></svg>);
const CalendarIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);
const CheckCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>);
const ChevronLeftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
const ChevronRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);
const LayoutDashboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>);
const LogOutIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);

// --- Components ---

const AuthScreen = () => {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(err.message);
        }
    };
    
    return (
        <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex justify-center mb-8">
                    <PerformanceLabLogo />
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p className="text-gray-500 text-center mb-6">{isLogin ? 'Sign in to continue.' : 'Get started with your peptide journey.'}</p>
                    <form onSubmit={handleAuth} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            required
                        />
                        {error && <p className="text-pink-600 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full px-6 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors shadow-lg">
                            {isLogin ? 'Login' : 'Sign Up'}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold">
                            {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Modal = ({ children, onClose, size = 'lg' }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-${size} relative m-4 animate-fade-in max-h-[90vh] flex flex-col`}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors z-10"><XIcon /></button>
            {children}
        </div>
    </div>
);

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
    <Modal onClose={onCancel}>
        <div className="p-6 md:p-8 flex flex-col items-center text-center">
            <div className="bg-pink-100 p-3 rounded-full mb-4"><AlertTriangleIcon className="text-pink-500 h-8 w-8" /></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-center pt-4 space-x-4 w-full">
                <button onClick={onCancel} className="w-full px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">Cancel</button>
                <button onClick={onConfirm} className="w-full px-6 py-2 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors shadow-lg">Confirm</button>
            </div>
        </div>
    </Modal>
);

const LogForm = ({ onSave, onClose }) => {
    const [dosageTaken, setDosageTaken] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const handleSubmit = (e) => { e.preventDefault(); onSave({ dosageTaken, notes }); onClose(); };
    return (
        <Modal onClose={onClose}>
            <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Log Administration</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500" type="text" value={dosageTaken} onChange={e => setDosageTaken(e.target.value)} placeholder="Dosage Taken (e.g., 250mcg)" />
                    <textarea className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-green-500" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes on effects, side-effects, feeling..."></textarea>
                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors shadow-lg">Save Log</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

const PeptideDetails = ({ peptide, onBack, onAddLog, logs, onDeleteLog }) => {
    const [showLogForm, setShowLogForm] = React.useState(false);
    const sortedLogs = logs.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="mb-6 text-cyan-600 hover:text-cyan-700 transition-colors font-semibold">&larr; Back to Dashboard</button>
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{peptide.name}</h2>
                <p className="text-gray-600 mt-2">{peptide.purpose}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <span className="bg-gray-100 rounded-full px-3 py-1 text-gray-800">Dosage: {peptide.dosage || 'N/A'}</span>
                    <span className="bg-gray-100 rounded-full px-3 py-1 text-gray-800">Schedule: {peptide.schedule || 'N/A'}</span>
                </div>
            </div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Administration Log</h3>
                <button onClick={() => setShowLogForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors shadow-lg"><PlusIcon />Log Entry</button>
            </div>
            <div className="space-y-4">
                {sortedLogs.length > 0 ? (
                    sortedLogs.map(log => (
                        <div key={log.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start animate-slide-up">
                            <div>
                                <p className="font-semibold text-gray-900">{log.createdAt?.toDate().toLocaleString() || 'Invalid Date'}</p>
                                <p className="text-gray-700 mt-1">Dosage: {log.dosageTaken || 'N/A'}</p>
                                <p className="text-gray-500 mt-2 whitespace-pre-wrap">{log.notes}</p>
                            </div>
                            <button onClick={() => onDeleteLog(log.id)} className="text-gray-400 hover:text-pink-500 transition-colors p-2 flex-shrink-0 ml-4"><Trash2Icon /></button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 px-4 bg-gray-100 rounded-2xl"><p className="text-gray-500">No logs yet.</p></div>
                )}
            </div>
            {showLogForm && <LogForm onSave={onAddLog} onClose={() => setShowLogForm(false)} />}
        </div>
    );
};

const PeptideLibraryModal = ({ onSelect, onClose, existingPeptideNames }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const filteredPeptides = PEPTIDE_LIBRARY.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const groupedPeptides = filteredPeptides.reduce((acc, p) => {
        const cat = p.category || 'General';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
    }, {});

    return (
        <Modal onClose={onClose}>
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Peptide Library</h2>
                <div className="relative"><input type="text" placeholder="Search peptides..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500" /><div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div></div>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
                {Object.keys(groupedPeptides).sort().map(cat => (
                    <div key={cat}><h3 className="text-lg font-semibold text-cyan-600 mb-3">{cat}</h3><div className="space-y-2">
                        {groupedPeptides[cat].map(p => {
                            const isAdded = existingPeptideNames.includes(p.name);
                            return (
                                <button key={p.name} onClick={() => !isAdded && onSelect(p)} disabled={isAdded} className={`w-full text-left p-4 rounded-lg transition-colors ${isAdded ? 'bg-gray-100 opacity-50 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                    <div className="flex justify-between items-center"><span className="font-semibold text-gray-900">{p.name}</span>{isAdded && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Added</span>}</div>
                                    <p className="text-sm text-gray-600">{p.purpose}</p>
                                </button>
                            );
                        })}
                    </div></div>
                ))}
            </div>
        </Modal>
    );
};

const DosageCalculatorModal = ({ onClose }) => {
    const [peptideAmount, setPeptideAmount] = React.useState('10');
    const [waterAmount, setWaterAmount] = React.useState('1');
    const [desiredDosage, setDesiredDosage] = React.useState('250');
    const { syringeVolumeML, syringeVolumeIU } = React.useMemo(() => {
        const [p, w, d] = [parseFloat(peptideAmount), parseFloat(waterAmount), parseFloat(desiredDosage)];
        if (isNaN(p) || isNaN(w) || isNaN(d) || p <= 0 || w <= 0 || d <= 0) return { syringeVolumeML: 0, syringeVolumeIU: 0 };
        const concentration = p / w;
        const volumeML = d / (concentration * 1000);
        return { syringeVolumeML: volumeML.toFixed(3), syringeVolumeIU: (volumeML * 100).toFixed(2) };
    }, [peptideAmount, waterAmount, desiredDosage]);

    const InputField = ({ l, u, v, sV }) => (<div><label className="block text-sm font-medium text-gray-700 mb-1">{l}</label><div className="relative"><input type="number" value={v} onChange={(e) => sV(e.target.value)} className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500" /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{u}</span></div></div>);
    const ResultDisplay = ({ l, v, u }) => (<div className="bg-gray-50 p-4 rounded-lg"><p className="text-sm text-gray-500">{l}</p><p className="text-2xl font-bold text-gray-900">{v} <span className="text-lg font-normal text-gray-700">{u}</span></p></div>);
    
    return (
        <Modal onClose={onClose}>
            <div className="p-6"><h2 className="text-2xl font-bold text-gray-900 mb-6">Dosage Calculator</h2><div className="space-y-4"><InputField l="Amount of Peptide in Vial" u="mg" v={peptideAmount} sV={setPeptideAmount} /><InputField l="Amount of Water to Add" u="ml" v={waterAmount} sV={setWaterAmount} /><InputField l="Your Desired Dosage" u="mcg" v={desiredDosage} sV={setDesiredDosage} /></div></div>
            <div className="p-6 bg-gray-100 border-t border-gray-200 space-y-4"><h3 className="text-lg font-semibold text-gray-900">Your Results:</h3><ResultDisplay l="Amount to Draw" v={syringeVolumeML} u="ml" /><ResultDisplay l="Amount to Draw (on Insulin Syringe)" v={syringeVolumeIU} u="IU" /></div>
        </Modal>
    );
};

const CycleSchedulerModal = ({ peptide, onClose, onSave }) => {
    const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = React.useState(new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Default to 1 week
    const [frequency, setFrequency] = React.useState('daily'); // daily, everyXdays, specificDays
    const [everyXDays, setEveryXDays] = React.useState(2);
    const [specificDays, setSpecificDays] = React.useState({ 0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: false }); // Mon-Fri default
    const [doses, setDoses] = React.useState([{ time: '08:00', amount: peptide.dosage || '250mcg' }]);

    const handleDoseChange = (index, field, value) => {
        const newDoses = [...doses];
        newDoses[index][field] = value;
        setDoses(newDoses);
    };

    const addDose = () => setDoses([...doses, { time: '20:00', amount: peptide.dosage || '250mcg' }]);
    const removeDose = (index) => setDoses(doses.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ startDate, endDate, frequency, everyXDays, specificDays, doses });
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <div className="p-6 md:p-8 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Dosing Cycle</h2>
                <p className="text-lg text-cyan-600 mb-6">{peptide.name}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                    </div>

                    <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        <option value="daily">Daily</option>
                        <option value="everyXdays">Every 'X' Days</option>
                        <option value="specificDays">Specific Days of the Week</option>
                    </select>

                    {frequency === 'everyXdays' && <input type="number" value={everyXDays} onChange={e => setEveryXDays(e.target.value)} className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" />}
                    {frequency === 'specificDays' && <div className="flex justify-around bg-gray-100 rounded-lg p-2">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <button type="button" key={i} onClick={() => setSpecificDays(p => ({ ...p, [i]: !p[i] }))} className={`w-8 h-8 rounded-full font-bold transition-colors ${specificDays[i] ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-800'}`}>{day}</button>)}</div>}
                    
                    <div>
                        <h3 className="text-lg text-gray-900 mb-2">Daily Doses</h3>
                        {doses.map((dose, index) => (
                            <div key={index} className="flex gap-2 mb-2 items-center">
                                <input type="time" value={dose.time} onChange={e => handleDoseChange(index, 'time', e.target.value)} className="w-full bg-gray-100 text-gray-900 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                <input type="text" value={dose.amount} onChange={e => handleDoseChange(index, 'amount', e.target.value)} placeholder="Amount" className="w-full bg-gray-100 text-gray-900 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                                <button type="button" onClick={() => removeDose(index)} className="p-2 rounded-lg bg-pink-400 hover:bg-pink-500 text-white"><Trash2Icon className="h-5 w-5"/></button>
                            </div>
                        ))}
                        <button type="button" onClick={addDose} className="w-full mt-2 p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800">Add Time</button>
                    </div>

                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors shadow-lg">Schedule Cycle</button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};


const EditDoseModal = ({ dose, onClose, onSave, onDelete }) => {
    const [date, setDate] = React.useState(dose.scheduledAt.toDate().toISOString().split('T')[0]);
    const [time, setTime] = React.useState(dose.scheduledAt.toDate().toTimeString().substring(0, 5));
    const [dosage, setDosage] = React.useState(dose.dosage);

    const handleSubmit = (e) => {
        e.preventDefault();
        const [year, month, day] = date.split('-').map(Number);
        const [hour, minute] = time.split(':').map(Number);
        const scheduledAt = Timestamp.fromDate(new Date(year, month - 1, day, hour, minute));
        onSave(dose.id, { dosage, scheduledAt });
    };

    return (
        <Modal onClose={onClose}>
            <div className="p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Edit Scheduled Dose</h2>
                <p className="text-lg text-cyan-600 mb-6">{dose.peptideName}</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" type="date" value={date} onChange={e => setDate(e.target.value)} />
                    <input className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" type="time" value={time} onChange={e => setTime(e.target.value)} />
                    <input className="w-full bg-gray-100 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500" type="text" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="Dosage (e.g., 250mcg)" required />
                    <div className="flex justify-between pt-4">
                        <button type="button" onClick={() => onDelete('dose', dose.id)} className="px-6 py-2 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-600 transition-colors shadow-lg">Delete</button>
                        <div className="space-x-3">
                            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors shadow-lg">Save</button>
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};


const CalendarView = ({ scheduledDoses, onMarkAsComplete, onDoseSelect }) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const changeMonth = (offset) => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    const calendarGrid = React.useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid = [];
        let dayCounter = 1;
        for (let i = 0; i < 6; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDayOfMonth) || dayCounter > daysInMonth) { week.push(null); } 
                else {
                    const d = new Date(year, month, dayCounter);
                    const doses = scheduledDoses.filter(dose => {
                        const doseDate = dose.scheduledAt.toDate();
                        return doseDate.getDate() === d.getDate() && doseDate.getMonth() === month && doseDate.getFullYear() === year;
                    });
                    week.push({ date: d, doses });
                    dayCounter++;
                }
            }
            grid.push(week);
            if (dayCounter > daysInMonth) break;
        }
        return grid;
    }, [currentDate, scheduledDoses]);

    const today = new Date();

    return (
        <div className="animate-fade-in"><div className="flex justify-between items-center mb-6"><button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeftIcon /></button><h2 className="text-2xl font-bold text-gray-800">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2><button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200"><ChevronRightIcon /></button></div><div className="grid grid-cols-7 gap-1 bg-gray-100 rounded-lg p-2">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center font-semibold text-gray-500 py-2">{day}</div>)}{calendarGrid.flat().map((day, index) => (<div key={index} className={`h-36 rounded-lg p-2 overflow-y-auto ${day ? 'bg-white' : 'bg-transparent'}`}>{day && <><p className={`text-sm font-semibold ${day.date.toDateString() === today.toDateString() ? 'text-pink-500' : 'text-gray-800'}`}>{day.date.getDate()}</p><div className="space-y-1 mt-1">{day.doses.sort((a,b) => a.scheduledAt.toDate() - b.scheduledAt.toDate()).map(dose => (<div key={dose.id} onClick={() => onDoseSelect(dose)} className={`p-1.5 rounded-md text-xs cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all ${dose.status === 'taken' ? 'bg-green-100 text-green-800' : 'bg-cyan-100 text-cyan-800'}`}><p className="font-bold">{dose.peptideName}</p><div className="flex justify-between items-center"><span>{dose.scheduledAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - {dose.dosage}</span>{dose.status !== 'taken' && <button onClick={(e) => { e.stopPropagation(); onMarkAsComplete(dose);}} className="p-1 -mr-1 rounded-full hover:bg-green-200"><CheckCircleIcon className="h-4 w-4"/></button>}</div></div>))}</div></>}</div>))}</div></div>
    );
};

const EditableField = ({ label, value, onSave }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [text, setText] = React.useState(value || '');
    const inputRef = React.useRef(null);
    React.useEffect(() => { if (isEditing) { inputRef.current?.focus(); inputRef.current?.select(); } }, [isEditing]);
    const handleSave = () => { setIsEditing(false); if (text !== value) onSave(text); };
    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSave(); else if (e.key === 'Escape') { setIsEditing(false); setText(value || ''); } };
    return isEditing ? (<div><label className="text-xs text-gray-500">{label}</label><input ref={inputRef} type="text" value={text} onChange={(e) => setText(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className="w-full bg-gray-200 text-gray-900 rounded p-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div>) : (<div onClick={() => setIsEditing(true)} className="w-full p-1 rounded cursor-pointer hover:bg-gray-200/50 transition-colors border border-transparent hover:border-gray-300"><span className="text-xs text-gray-500">{label}</span><p className="text-sm text-gray-800 truncate">{value || 'N/A'}</p></div>);
};

const PeptideCard = ({ peptide, onSelect, onDelete, onUpdate, onSchedule }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between hover:shadow-cyan-500/10 hover:shadow-lg transition-shadow duration-300 animate-slide-up">
            <div><h3 className="text-xl font-bold text-gray-900">{peptide.name}</h3><p className="text-gray-600 mt-2 h-12 text-sm overflow-hidden text-ellipsis">{peptide.purpose}</p></div>
            <div className="space-y-3 mt-4">
                <EditableField label="Dosage" value={peptide.dosage} onSave={(newValue) => onUpdate(peptide.id, { dosage: newValue })} />
                <EditableField label="Schedule" value={peptide.schedule} onSave={(newValue) => onUpdate(peptide.id, { schedule: newValue })} />
            </div>
            <div className="mt-6 flex justify-between items-center">
                <button onClick={() => onSelect(peptide)} className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold"><BookOpenIcon /> View Logs</button>
                <div className="flex items-center gap-1">
                    <button onClick={() => onSchedule(peptide)} className="text-gray-500 hover:text-cyan-600 p-2"><CalendarIcon className="h-5 w-5"/></button>
                    <button onClick={() => onDelete(peptide.id)} className="text-gray-500 hover:text-pink-500 p-2"><Trash2Icon /></button>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [user, setUser] = React.useState(null);
    const [peptides, setPeptides] = React.useState([]);
    const [logs, setLogs] = React.useState({});
    const [scheduledDoses, setScheduledDoses] = React.useState([]);
    const [selectedPeptide, setSelectedPeptide] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAuthReady, setIsAuthReady] = React.useState(false);
    const [view, setView] = React.useState('dashboard');
    
    const [showLibrary, setShowLibrary] = React.useState(false);
    const [showCalculator, setShowCalculator] = React.useState(false);
    const [showScheduleModal, setShowScheduleModal] = React.useState(false);
    const [showEditDoseModal, setShowEditDoseModal] = React.useState(false);
    const [editingDose, setEditingDose] = React.useState(null);
    const [schedulingPeptide, setSchedulingPeptide] = React.useState(null);
    const [confirmation, setConfirmation] = React.useState({ isOpen: false });

    React.useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => {
            setUser(u);
            setIsAuthReady(true);
        });
        return () => unsub();
    }, []);

    React.useEffect(() => {
        if (!isAuthReady || !user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const qPeptides = query(collection(db, `artifacts/${appId}/users/${user.uid}/peptides`));
        const qDoses = query(collection(db, `artifacts/${appId}/users/${user.uid}/scheduledDoses`));
        const unsubPeptides = onSnapshot(qPeptides, (snap) => { setPeptides(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setIsLoading(false); });
        const unsubDoses = onSnapshot(qDoses, (snap) => setScheduledDoses(snap.docs.map(d => ({ id: d.id, ...d.data() }))) );
        return () => { unsubPeptides(); unsubDoses(); };
    }, [isAuthReady, user]);

    React.useEffect(() => {
        if (!selectedPeptide || !user) return;
        const qLogs = query(collection(db, `artifacts/${appId}/users/${user.uid}/peptides/${selectedPeptide.id}/logs`));
        const unsub = onSnapshot(qLogs, (snap) => setLogs(prev => ({ ...prev, [selectedPeptide.id]: snap.docs.map(d => ({ id: d.id, ...d.data() })) })));
        return () => unsub();
    }, [selectedPeptide, user]);

    const handleUpdatePeptide = async (peptideId, data) => { if (user) await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/peptides`, peptideId), data); };
    const handleSignOut = () => signOut(auth);
    const handleDelete = (type, id, subId = null) => {
        if (!user) return;
        setConfirmation({ isOpen: true, title: `Delete ${type}?`, message: `This is permanent.`, onConfirm: async () => {
            let docRef;
            if (type === 'peptide') { if (selectedPeptide?.id === id) setSelectedPeptide(null); docRef = doc(db, `artifacts/${appId}/users/${user.uid}/peptides`, id); }
            else if (type === 'dose') { docRef = doc(db, `artifacts/${appId}/users/${user.uid}/scheduledDoses`, id); } 
            else { docRef = doc(db, `artifacts/${appId}/users/${user.uid}/peptides/${id}/logs`, subId); }
            await deleteDoc(docRef);
            setConfirmation({ isOpen: false });
            setEditingDose(null);
            setShowEditDoseModal(false);
        }});
    };
    
    const handleAddLog = async (logData) => { if (user && selectedPeptide) await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/peptides/${selectedPeptide.id}/logs`), { ...logData, createdAt: new Date() }); };

    const handleOpenScheduler = (peptide) => { setSchedulingPeptide(peptide); setShowScheduleModal(true); };

    const handleScheduleCycle = async ({ startDate, endDate, frequency, everyXDays, specificDays, doses }) => {
        if (!user || !schedulingPeptide) return;
        const batch = writeBatch(db);
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T00:00:00');
        let currentDay = new Date(start);

        while (currentDay <= end) {
            let shouldDose = false;
            if (frequency === 'daily') { shouldDose = true; } 
            else if (frequency === 'everyXdays') {
                const diffTime = Math.abs(currentDay - start);
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                if (parseInt(everyXDays, 10) > 0 && diffDays % parseInt(everyXDays, 10) === 0) shouldDose = true;
            } else if (frequency === 'specificDays') {
                if (specificDays[currentDay.getDay()]) shouldDose = true;
            }
            if (shouldDose) {
                doses.forEach(dose => {
                    const [hour, minute] = dose.time.split(':').map(Number);
                    const doseTimestamp = new Date(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate(), hour, minute);
                    const newDoseRef = doc(collection(db, `artifacts/${appId}/users/${user.uid}/scheduledDoses`));
                    batch.set(newDoseRef, {
                        peptideId: schedulingPeptide.id,
                        peptideName: schedulingPeptide.name,
                        status: 'scheduled',
                        dosage: dose.amount,
                        scheduledAt: Timestamp.fromDate(doseTimestamp)
                    });
                });
            }
            currentDay.setDate(currentDay.getDate() + 1);
        }
        await batch.commit();
        setShowScheduleModal(false);
    };

    const handleMarkDoseAsComplete = async (dose) => {
        if (!user) return;
        await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/scheduledDoses`, dose.id), { status: 'taken' });
        await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/peptides/${dose.peptideId}/logs`), {
            dosageTaken: dose.dosage, notes: `Dose marked complete from calendar schedule.`, createdAt: dose.scheduledAt.toDate()
        });
    };
    
    const handleAddPeptide = async (peptideData) => { if (user) await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/peptides`), { ...peptideData, createdAt: new Date() }); };

    const handleDoseSelect = (dose) => { setEditingDose(dose); setShowEditDoseModal(true); };
    
    const handleUpdateDose = async (doseId, data) => {
        if (!user) return;
        await updateDoc(doc(db, `artifacts/${appId}/users/${user.uid}/scheduledDoses`, doseId), data);
        setShowEditDoseModal(false);
        setEditingDose(null);
    };
    
    if (!isAuthReady) return <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center"><PerformanceLabLogo /><p className="mt-4 text-lg">Initializing...</p></div>;
    if (!user) return <AuthScreen />;
    if (isLoading) return <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center"><PerformanceLabLogo /><p className="mt-4 text-lg">Loading Data...</p></div>;

    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen font-sans">
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
            <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 p-4 sticky top-0 z-40">
                <div className="container mx-auto flex justify-between items-center"><PerformanceLabLogo />
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><button onClick={() => setView('dashboard')} className={`p-2 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}><LayoutDashboardIcon/></button><button onClick={() => setView('calendar')} className={`p-2 rounded-lg transition-colors ${view === 'calendar' ? 'bg-cyan-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}><CalendarIcon/></button></div>
                    <button onClick={handleSignOut} className="p-2 text-gray-500 hover:text-pink-500"><LogOutIcon /></button>
                </div>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                {selectedPeptide ? ( <PeptideDetails peptide={selectedPeptide} onBack={() => setSelectedPeptide(null)} onAddLog={handleAddLog} logs={logs[selectedPeptide.id] || []} onDeleteLog={(logId) => handleDelete('log', selectedPeptide.id, logId)} /> ) : view === 'calendar' ? ( <CalendarView scheduledDoses={scheduledDoses} onMarkAsComplete={handleMarkDoseAsComplete} onDoseSelect={handleDoseSelect} /> ) : (
                    <div>
                         <div className="flex flex-wrap gap-4 justify-between items-center mb-8"><h2 className="text-3xl font-bold text-gray-900">My Peptides</h2><div className="flex gap-2"><button onClick={() => setShowCalculator(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors"><CalculatorIcon />Calculator</button><button onClick={() => setShowLibrary(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors shadow-lg"><LibraryIcon />Library</button></div></div>
                        {peptides.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {peptides.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                                    <PeptideCard key={p.id} peptide={p} onSelect={setSelectedPeptide} onDelete={(id) => handleDelete('peptide', id)} onUpdate={handleUpdatePeptide} onSchedule={handleOpenScheduler} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 px-6 bg-gray-100 rounded-2xl">
                                <h3 className="text-2xl font-semibold text-gray-900">Welcome, {user.email}!</h3><p className="text-gray-600 mt-2 max-w-md mx-auto">Get started by adding a peptide from the library.</p>
                                <button onClick={() => setShowLibrary(true)} className="mt-6 flex items-center gap-2 px-5 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors shadow-lg mx-auto"><LibraryIcon />Add From Library</button>
                            </div>
                        )}
                    </div>
                )}
            </main>
            {showLibrary && <PeptideLibraryModal onSelect={(peptide) => handleAddPeptide({name: peptide.name, purpose: peptide.purpose, dosage: '', schedule: ''})} onClose={() => setShowLibrary(false)} existingPeptideNames={peptides.map(p => p.name)} />}
            {showCalculator && <DosageCalculatorModal onClose={() => setShowCalculator(false)} />}
            {showScheduleModal && <CycleSchedulerModal peptide={schedulingPeptide} onClose={() => setShowScheduleModal(false)} onSave={handleScheduleCycle}/>}
            {showEditDoseModal && <EditDoseModal dose={editingDose} onClose={() => { setShowEditDoseModal(false); setEditingDose(null); }} onSave={handleUpdateDose} onDelete={handleDelete} />}
            {confirmation.isOpen && <ConfirmModal title={confirmation.title} message={confirmation.message} onConfirm={() => { confirmation.onConfirm(); setConfirmation({ isOpen: false }); }} onCancel={() => setConfirmation({ isOpen: false })} />}
        </div>
    );
}
