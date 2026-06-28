import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { DocumentCard } from '@/components/DocumentCard';
import { EmptyState } from '@/components/EmptyState';
import { SearchBar } from '@/components/SearchBar';
import { api, type ApiDocument, formatLastUpdated } from '@/lib/api';

export function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ownedDocs, setOwnedDocs] = useState<ApiDocument[]>([]);
  const [sharedDocs, setSharedDocs] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const cachedUser = localStorage.getItem('user');
    if (!cachedUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(cachedUser);
    setCurrentUser(user);

    fetchWorkspace(user.id);
  }, [navigate]);

  useEffect(() => {
    const handleSearch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSearchQuery(customEvent.detail || '');
    };
    window.addEventListener('document-search', handleSearch);
    return () => {
      window.removeEventListener('document-search', handleSearch);
    };
  }, []);

  const fetchWorkspace = async (userId: string) => {
    setLoading(true);
    try {
      const data = await api.documents.listWorkspace(userId);
      setOwnedDocs(data.owned_documents || []);
      setSharedDocs(data.shared_documents || []);
    } catch (err) {
      console.error('Error fetching workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    if (!currentUser) return;
    setCreating(true);
    try {
      const newDoc = await api.documents.create('Untitled Document', currentUser.id);
      navigate(`/documents/${newDoc.id}`);
    } catch (err) {
      console.error('Failed to create document:', err);
    } finally {
      setCreating(false);
    }
  };

  const filterDocs = (docs: ApiDocument[]) => {
    if (!searchQuery) return docs;
    return docs.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const activeOwnedDocs = filterDocs(ownedDocs);
  const activeSharedDocs = filterDocs(sharedDocs);

  if (loading && !creating) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create, upload, and open collaborative documents.</p>
        </div>
      </section>

      <div className="w-full max-w-md lg:hidden">
        <SearchBar
          placeholder="Search documents by title..."
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            window.dispatchEvent(new CustomEvent('document-search', { detail: val }));
          }}
        />
      </div>

      {(filter === null || filter === 'owned') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Owned Documents</h2>
            <span className="text-sm text-muted-foreground">{activeOwnedDocs.length} files</span>
          </div>
          {activeOwnedDocs.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activeOwnedDocs.map((document) => {
                const mappedDoc = {
                  id: document.id,
                  title: document.title,
                  lastUpdated: formatLastUpdated(document.updated_at),
                  owner: 'You',
                };
                return <DocumentCard key={document.id} document={mappedDoc} />;
              })}
            </div>
          ) : (
            <EmptyState
              title={searchQuery ? 'No matching documents' : 'No documents yet'}
              description={
                searchQuery
                  ? 'Try adjusting your search keywords.'
                  : 'Create a document to start drafting with your team.'
              }
              action={
                searchQuery
                  ? undefined
                  : {
                      label: 'New Document',
                      onClick: handleCreateDocument,
                    }
              }
            />
          )}
        </section>
      )}

      {(filter === null || filter === 'shared') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shared With Me</h2>
            <span className="text-sm text-muted-foreground">{activeSharedDocs.length} files</span>
          </div>
          {activeSharedDocs.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {activeSharedDocs.map((document) => {
                const mappedDoc = {
                  id: document.id,
                  title: document.title,
                  lastUpdated: formatLastUpdated(document.updated_at),
                  owner: document.owner?.name || 'Collaborator',
                };
                return <DocumentCard key={document.id} document={mappedDoc} />;
              })}
            </div>
          ) : (
            <EmptyState
              title={searchQuery ? 'No matching shared documents' : 'No shared documents'}
              description={
                searchQuery
                  ? 'Try adjusting your search keywords.'
                  : 'Documents shared by teammates will appear here.'
              }
            />
          )}
        </section>
      )}
    </div>
  );
}
