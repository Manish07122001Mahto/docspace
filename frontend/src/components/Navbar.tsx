import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, LogOut, Menu, Plus, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import { SearchBar } from '@/components/SearchBar';
import { UploadDialog } from '@/components/UploadDialog';
import { api } from '@/lib/api';

export function Navbar() {
  const navigate = useNavigate();
  const cachedUser = localStorage.getItem('user');
  const user = cachedUser ? JSON.parse(cachedUser) : null;
  const initials = user?.initials || 'US';
  
  const [searchVal, setSearchVal] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSearchVal(customEvent.detail || '');
    };
    window.addEventListener('document-search', handleSearch);
    return () => {
      window.removeEventListener('document-search', handleSearch);
    };
  }, []);

  const handleCreateDocument = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const newDoc = await api.documents.create('Untitled Document', user.id);
      navigate(`/documents/${newDoc.id}`);
    } catch (err) {
      console.error('Failed to create document:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
      <Button className="lg:hidden" size="icon" variant="ghost" aria-label="Open navigation">
        <Menu className="size-5" />
      </Button>
      <Link to="/dashboard" className="flex items-center gap-2 font-semibold lg:hidden">
        <FileText className="size-5 text-primary" />
        Docspace
      </Link>
      <div className="hidden max-w-md flex-1 md:block">
        <SearchBar
          placeholder="Search documents..."
          value={searchVal}
          onChange={(val) => {
            setSearchVal(val);
            window.dispatchEvent(new CustomEvent('document-search', { detail: val }));
          }}
        />
      </div>
      <div className="ml-auto flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleCreateDocument} disabled={creating} className="h-8 text-xs font-semibold px-2 sm:px-3">
              {creating ? (
                <Loader2 className="size-3.5 animate-spin sm:mr-1" />
              ) : (
                <Plus className="size-3.5 sm:mr-1" />
              )}
              <span className="hidden sm:inline">New Document</span>
              <span className="sm:hidden">New</span>
            </Button>
            <UploadDialog
              trigger={
                <Button size="sm" variant="outline" className="h-8 text-xs font-semibold px-2 sm:px-3">
                  <Upload className="size-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Upload File</span>
                  <span className="sm:hidden">Upload</span>
                </Button>
              }
            />
          </div>
        )}
        {user && (
          <span className="hidden text-sm font-medium text-slate-700 md:inline">
            {user.name}
          </span>
        )}
        <UserAvatar initials={initials} />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
          className="h-8 w-8"
        >
          <LogOut className="size-4.5 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </header>
  );
}
