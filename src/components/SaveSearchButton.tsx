import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface SaveSearchButtonProps {
  criteria: {
    q?: string;
    type?: string;
    category?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  className?: string;
}

export default function SaveSearchButton({ criteria, className }: SaveSearchButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const user = auth.currentUser;

  useEffect(() => {
    const checkIsSaved = async () => {
      if (!user) return;
      
      try {
        const q = query(
          collection(db, 'saved_searches'),
          where('uid', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        
        // Find if any saved search matches current criteria
        const match = snapshot.docs.find(doc => {
          const data = doc.data();
          return JSON.stringify(data.criteria) === JSON.stringify(criteria);
        });

        if (match) {
          setIsSaved(true);
          setSavedId(match.id);
        } else {
          setIsSaved(false);
          setSavedId(null);
        }
      } catch (error) {
        console.error('Error checking saved search:', error);
      }
    };

    checkIsSaved();
  }, [user, criteria]);

  const handleSave = async () => {
    if (!user) {
      toast.error('Faça login para salvar esta pesquisa.');
      return;
    }

    setLoading(true);
    try {
      if (isSaved && savedId) {
        await deleteDoc(doc(db, 'saved_searches', savedId));
        setIsSaved(false);
        setSavedId(null);
        toast.success('Pesquisa removida.');
      } else {
        const name = generateName(criteria);
        const docRef = await addDoc(collection(db, 'saved_searches'), {
          uid: user.uid,
          name,
          criteria,
          createdAt: serverTimestamp(),
        });
        setIsSaved(true);
        setSavedId(docRef.id);
        toast.success('Pesquisa salva! Você receberá notificações de novos imóveis.');
      }
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error('Erro ao salvar pesquisa.');
    } finally {
      setLoading(false);
    }
  };

  const generateName = (c: typeof criteria) => {
    const parts = [];
    if (c.type) parts.push(c.type === 'venda' ? 'Venda' : 'Aluguel');
    if (c.category) parts.push(c.category.charAt(0).toUpperCase() + c.category.slice(1));
    if (c.city) parts.push(`em ${c.city}`);
    if (c.q) parts.push(`"${c.q}"`);
    return parts.length > 0 ? parts.join(' ') : 'Minha Pesquisa';
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm",
        isSaved 
          ? "bg-orange-50 text-orange-600 border border-orange-200" 
          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSaved ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      <span>{isSaved ? 'Remover Alerta' : 'Salvar Pesquisa'}</span>
    </button>
  );
}
