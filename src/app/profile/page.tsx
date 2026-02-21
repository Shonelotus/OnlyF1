"use client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getCurrentUser, getProfile, updateProfile, uploadAvatar, deleteAvatarByUrl, logout } from "@/core/supabase/auth"
import { Profile } from "@/core/supabase/interfaces/profile"
import Logout from "@/components/logout"
import { deleteUserAccount } from "@/core/supabase/auth"
import { getCodes } from "country-list"

// Creiamo un Set di paesi in italiano in modo nativo da JS
const regionNamesInItalian = new Intl.DisplayNames(['it'], { type: 'region' });
const italianCountries = Array.from(
    new Set(
        getCodes()
            .map(code => {
                try { return regionNamesInItalian.of(code) as string } catch { return null }
            })
            .filter(Boolean)
    )
).sort((a, b) => a!.localeCompare(b!));

export default function ProfilePage() {
    const router = useRouter();

    const f1Drivers = [
        { id: 3, name: "Max Verstappen" },
        { id: 17, name: "Isack Hadjar" },
        { id: 16, name: "Charles Leclerc" },
        { id: 44, name: "Lewis Hamilton" },
        { id: 1, name: "Lando Norris" },
        { id: 81, name: "Oscar Piastri" },
        { id: 63, name: "George Russell" },
        { id: 12, name: "Andrea Kimi Antonelli" },
        { id: 14, name: "Fernando Alonso" },
        { id: 18, name: "Lance Stroll" },
        { id: 10, name: "Pierre Gasly" },
        { id: 7, name: "Jack Doohan" },
        { id: 23, name: "Alexander Albon" },
        { id: 55, name: "Carlos Sainz" },
        { id: 30, name: "Liam Lawson" },
        { id: 40, name: "Arvid Lindblad" },
        { id: 27, name: "Nico Hülkenberg" },
        { id: 5, name: "Gabriel Bortoleto" },
        { id: 87, name: "Oliver Bearman" },
        { id: 31, name: "Esteban Ocon" },
        { id: 11, name: "Sergio Pérez" },
        { id: 77, name: "Valtteri Bottas" }
    ];

    const f1Teams = [
        "Oracle Red Bull Racing",
        "Scuderia Ferrari HP",
        "McLaren Mastercard",
        "Mercedes-AMG PETRONAS Formula One Team",
        "Aston Martin Aramco Formula One Team",
        "BWT Alpine F1 Team",
        "Williams Racing",
        "Visa Cash App RB Formula One Team",
        "Audi F1 Team",
        "MoneyGram Haas F1 Team",
        "Cadillac F1 Team"
    ];

    // Stati per gestire i dati
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null); // Aggiunto per salvare l'email
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false); // Per far vedere che stiamo salvando
    const [editMode, setEditMode] = useState(false); // Alterna tra vista e modifica
    const [uploadingAvatar, setUploadingAvatar] = useState(false); // Feedback per l'upload dell'immagine
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]); // URLs di immagini caricate ma scartate
    const [deleting, setDeleting] = useState(false); // Stato per eliminazione account

    // Stato temporaneo per le modifiche (copia del profilo)
    const [formData, setFormData] = useState<Partial<Profile>>({});

    useEffect(() => {
        async function loadData() {
            const user = await getCurrentUser();
            if (user) {
                setUserEmail(user.email ?? null); // Salviamo l'email fornita da Supabase Auth
                const data = await getProfile(user.id);
                setProfile(data);
                if (data) setFormData(data); // Inizializza i dati del form
            } else {
                router.push("/login");
            }
            setLoading(false);
        }
        loadData();
    }, [router]);

    // Gestione del salvataggio
    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);
        const success = await updateProfile(profile.id, formData);

        if (success) {
            // Se l'avatar è stato cambiato o rimosso, cancella quello vecchio da Supabase
            const toDelete = [...filesToDelete];
            if (profile.avatar_url && profile.avatar_url !== formData.avatar_url) {
                toDelete.push(profile.avatar_url);
            }

            // Esegui la pulizia dello storage
            for (const url of toDelete) {
                await deleteAvatarByUrl(url);
            }
            setFilesToDelete([]);

            // Aggiorna il profilo mostrato con i nuovi dati salvati
            setProfile({ ...profile, ...formData });
            setEditMode(false); // Esce dalla modalità modifica
        } else {
            alert("Errore durante il salvataggio.");
        }
        setSaving(false);
    };

    // Gestione caricamento foto
    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            if (!profile) return;

            const file = event.target.files[0];
            setUploadingAvatar(true);

            // Chiama la nuova funzione in auth.ts per caricare su Supabase Storage
            const publicUrl = await uploadAvatar(profile.id, file);

            if (publicUrl) {
                // Se c'era già un file "nuovo" caricato in questa sessione ma non salvato, segnamolo per l'eliminazione
                if (formData.avatar_url && formData.avatar_url !== profile.avatar_url) {
                    setFilesToDelete(prev => [...prev, formData.avatar_url!]);
                }
                // Aggiorna subito l'anteprima (url pubblico restituito) e salva nel formData
                setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            } else {
                alert("Si è verificato un errore durante il caricamento dell'immagine.");
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploadingAvatar(false);
        }
    };

    // Gestione rimozione foto (svuota l'url locale)
    const handleRemoveAvatar = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (formData.avatar_url && formData.avatar_url !== profile?.avatar_url) {
            setFilesToDelete(prev => [...prev, formData.avatar_url!]);
        }

        setFormData(prev => ({ ...prev, avatar_url: null }));
    };

    // Gestione annulla
    const handleCancel = async () => {
        if (profile) setFormData(profile); // Ripristina i dati originali
        setEditMode(false);

        // Cancella eventuali file nuovi caricati in questa sessione e poi annullati
        const toDelete = [...filesToDelete];
        if (formData.avatar_url && formData.avatar_url !== profile?.avatar_url) {
            toDelete.push(formData.avatar_url);
        }
        for (const url of toDelete) {
            await deleteAvatarByUrl(url);
        }
        setFilesToDelete([]);
    };

    // Gestione eliminazione account
    const handleDeleteAccount = async () => {
        if (!profile) return;
        const confirmDelete = window.confirm(
            "ATTENZIONE: Stai per eliminare definitivamente il tuo account OpenPaddock, il tuo profilo e tutte le tue impostazioni.\n\nQuesta azione NON può essere annullata. Vuoi procedere?"
        );
        if (!confirmDelete) return;

        setDeleting(true);
        const res = await deleteUserAccount(profile.id);

        if (res.success) {
            // Finiamo la sessione forzatamente anche sul client per staccarlo
            await logout();
            router.push("/login?message=Account%20eliminato%20con%20successo.%20Ci%20dispiace%20vederti%20andare%20via!");
        } else {
            alert("Errore durante l'eliminazione: " + res.error);
            setDeleting(false);
        }
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
            <span className="animate-pulse">Caricamento profilo...</span>
        </div>
    );

    return (
        /* 
           Contenitore principale:
           min-h-screen: Altezza minima 100% dello schermo
           bg-black: Sfondo nero profondo
           text-white: Testo bianco di default
           py-12 px-4: Padding verticale (sopra/sotto) di 3rem e orizzontale di 1rem
        */
        <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">

            {/* 
               Card centrale del profilo:
               max-w-3xl: Larghezza massima limitata (circa 768px) per non espandersi troppo
               mx-auto: Margine orizzontale automatico (centra l'elemento)
               bg-neutral-900/50: Grigio molto scuro con 50% di trasparenza
               border border-white/10: Bordo sottile bianco quasi trasparente (effetto vetro)
               rounded-3xl: Bordi molto arrotondati
               overflow-hidden: Taglia tutto ciò che esce dai bordi della card
            */}
            <div className="max-w-3xl mx-auto bg-neutral-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

                {/* 
                   Fascia Header della Card (Rosso F1):
                   h-32 o h-48: Altezza fissa
                   bg-gradient-to-r: Sfumatura da sinistra a destra
                   from-red-600 to-red-900: Colori F1
                */}
                <div className="h-32 sm:h-48 bg-linear-to-r from-red-600 to-red-900 relative">
                    {/* Pulsante edit in alto a destra */}
                    <button
                        onClick={() => editMode ? handleCancel() : setEditMode(true)}
                        className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm transition-all text-sm font-medium"
                    >
                        {editMode ? "Avnulla Modifiche" : "Modifica Profilo"}
                    </button>
                </div>

                {/* 
                   Contenuto sotto la fascia colorata:
                   px-6 sm:px-12: Padding laterale reattivo (più grande su schermi medi)
                   pb-12: Padding in basso
                */}
                <div className="px-6 sm:px-12 pb-12">

                    {/* 
                       Sezione Avatar e Nome (spostata verso l'alto per sovrapporsi alla fascia rossa):
                       -mt-16 sm:-mt-24: Margine superiore negativo (tira l'elemento in su)
                       flex items-end: Allinea gli elementi in basso
                    */}
                    <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 sm:-mt-24 mb-8">

                        {/* 
                           Immagine Profilo:
                           relative: Serve per posizionare l'input file invisibile sopra l'immagine
                           w-32 h-32: Dimensioni fisse 128x128 pixel
                           rounded-full: Cerchio perfetto
                           border-4 border-neutral-900: Bordo spesso dello stesso colore dello sfondo per "staccare" l'immagine
                           bg-neutral-800: Colore di sfondo se l'immagine non c'è
                        */}
                        <div className="relative w-32 h-32 sm:w-48 sm:h-48 rounded-full border-4 border-neutral-900 bg-neutral-800 shrink-0 overflow-hidden flex items-center justify-center">
                            {formData.avatar_url ? (
                                <img
                                    src={formData.avatar_url}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                /* Seleziona la prima lettera dell'username se non c'è foto */
                                <span className="text-5xl sm:text-7xl font-bold text-neutral-500 uppercase">
                                    {profile?.username?.charAt(0) || "?"}
                                </span>
                            )}

                            {/* Overlay per modificare la foto (visibile solo in editMode) */}
                            {editMode && (
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center transition-colors group">
                                    <label htmlFor="avatar-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-black/80">
                                        {uploadingAvatar ? (
                                            <span className="text-xs uppercase font-bold tracking-wider text-red-500 animate-pulse">Caricamento...</span>
                                        ) : (
                                            <span className="text-xs text-center uppercase font-bold tracking-wider px-2">Cambia Foto</span>
                                        )}
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            disabled={uploadingAvatar}
                                        />
                                    </label>

                                    {/* Pulsante rimuovi foto (solo se c'è una foto attualmente nel form) */}
                                    {formData.avatar_url && !uploadingAvatar && (
                                        <button
                                            onClick={handleRemoveAvatar}
                                            className="absolute bottom-2 text-xs text-white/70 hover:text-red-500 font-bold uppercase tracking-wider bg-black/50 px-2 py-1 rounded transition-colors"
                                        >
                                            Rimuovi
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Nome Palese e Username */}
                        <div className="flex-1 pb-2">
                            {editMode ? (
                                <input
                                    type="text"
                                    value={formData.display_name || ""}
                                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                    placeholder="Il tuo nome visualizzato"
                                    className="w-full text-3xl font-bold bg-transparent border-b-2 border-red-500 focus:outline-none focus:border-red-400 mb-2 py-1"
                                />
                            ) : (
                                <h1 className="text-3xl sm:text-4xl font-black mb-1">
                                    {profile?.display_name || profile?.username}
                                </h1>
                            )}
                            <p className="text-red-500 font-mono text-sm sm:text-base">{userEmail}</p>
                        </div>
                    </div>

                    {/* -- GRIGLIA INFORMAZIONI -- */}
                    {/* 
                       grid grid-cols-1 md:grid-cols-2: 
                       1 colonna sui telefoni, 2 colonne sui tablet/pc 
                       gap-6: spazio tra i blocchi
                    */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                        {/* Campo Paese */}
                        <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Nazionalità</label>
                            {editMode ? (
                                <select
                                    value={formData.country || ""}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-600 focus:border-red-500 rounded p-2 text-white focus:outline-none"
                                >
                                    <option value="">-- Seleziona Paese --</option>
                                    {italianCountries.map(country => (
                                        <option key={country} value={country!}>
                                            {country}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="font-medium text-lg">{profile?.country || "Non specificato"}</p>
                            )}
                        </div>

                        {/* Campo Pilota Preferito */}
                        <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Pilota Preferito</label>
                            {editMode ? (
                                <select
                                    value={formData.favorite_driver || ""}
                                    onChange={(e) => setFormData({ ...formData, favorite_driver: parseInt(e.target.value) || null })}
                                    className="w-full bg-black/50 border border-gray-600 focus:border-red-500 rounded p-2 text-white focus:outline-none"
                                >
                                    <option value="">-- Seleziona un Pilota --</option>
                                    {f1Drivers.map(driver => (
                                        <option key={driver.id} value={driver.id}>
                                            {driver.name} (#{driver.id})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="font-medium text-lg">
                                    {/* Cerca il nome del pilota in base all'ID salvato */}
                                    {profile?.favorite_driver
                                        ? f1Drivers.find(d => d.id === profile.favorite_driver)?.name || `ID: #${profile.favorite_driver}`
                                        : "Non specificato"
                                    }
                                </p>
                            )}
                        </div>

                        {/* Campo Scuderia Preferita */}
                        <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                            <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2">Scuderia Preferita</label>
                            {editMode ? (
                                <select
                                    value={formData.favorite_team || ""}
                                    onChange={(e) => setFormData({ ...formData, favorite_team: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-600 focus:border-red-500 rounded p-2 text-white focus:outline-none"
                                >
                                    <option value="">-- Seleziona una Scuderia --</option>
                                    {f1Teams.map(team => (
                                        <option key={team} value={team}>
                                            {team}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="font-medium text-lg">{profile?.favorite_team || "Non specificato"}</p>
                            )}
                        </div>

                        {/* Dati di sola lettura (Ruolo e Creazione) */}
                        <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400 uppercase tracking-wider">Ruolo</span>
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${profile?.role === 'admin' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {profile?.role}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400 uppercase tracking-wider">Membro dal</span>
                                <span className="text-sm font-mono text-gray-300">
                                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* Pulsanti Azione (Salva/Logout) */}
                    <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                        {editMode ? (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl transition-colors disabled:opacity-50 w-full sm:w-auto"
                            >
                                {saving ? "Salvataggio..." : "Salva Profilo"}
                            </button>
                        ) : (
                            <>
                                <Logout className="text-gray-400 hover:text-red-500 transition-colors font-medium border border-transparent hover:border-red-500/30 py-2 px-4 rounded-lg">
                                    Esci dall'account (Logout)
                                </Logout>

                                {/* Pulsante Elimina Account in rosso sbiadito */}
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleting}
                                    className="text-gray-600 hover:text-red-600 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                                >
                                    {deleting ? (
                                        <span className="animate-pulse">Eliminazione in corso...</span>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                            Elimina account
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
