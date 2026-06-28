import type React from 'react';
import { useState } from 'react';
import { Plus, Trash2, Loader2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserAvatar } from '@/components/UserAvatar';
import { api, type ApiDocumentShare, type ApiUser } from '@/lib/api';

type ShareDialogProps = {
  trigger: React.ReactNode;
  documentId?: string;
  ownerId?: string;
};

export function ShareDialog({ trigger, documentId, ownerId }: ShareDialogProps) {
  const [shares, setShares] = useState<ApiDocumentShare[]>([]);
  const [allUsers, setAllUsers] = useState<ApiUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadSharingData = async () => {
    if (!documentId) return;
    setLoading(true);
    try {
      const [sharesData, usersData] = await Promise.all([
        api.documents.listShares(documentId),
        api.users.list(),
      ]);
      setShares(sharesData);
      setAllUsers(usersData);
    } catch (err) {
      console.error('Failed to load sharing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShare = async (userId: string) => {
    if (!documentId) return;
    setActionId(userId);
    try {
      await api.documents.addShare(documentId, userId);
      // Reload shares
      const sharesData = await api.documents.listShares(documentId);
      setShares(sharesData);
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to add share:', err);
    } finally {
      setActionId(null);
    }
  };

  const handleRemoveShare = async (userId: string) => {
    if (!documentId) return;
    setActionId(userId);
    try {
      await api.documents.removeShare(documentId, userId);
      // Reload shares
      const sharesData = await api.documents.listShares(documentId);
      setShares(sharesData);
    } catch (err) {
      console.error('Failed to remove share:', err);
    } finally {
      setActionId(null);
    }
  };

  // Find users that do NOT have access (not owner, not currently shared)
  const usersWithoutAccess = allUsers.filter((user) => {
    if (user.id === ownerId) return false;
    if (shares.some((share) => share.user_id === user.id)) return false;
    return true;
  });

  const filteredUsers = usersWithoutAccess.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog onOpenChange={(open) => { if (open) loadSharingData(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="size-5 text-primary" />
            Share document
          </DialogTitle>
          <DialogDescription>Invite collaborators and manage access permissions.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Search Input for Sharing */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Add collaborators</label>
              <Input
                placeholder="Search teammates by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Teammates search results list */}
            {searchQuery && (
              <div className="max-h-[160px] overflow-y-auto rounded-md border bg-slate-50/50 p-1 divide-y">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 hover:bg-slate-100/80 rounded-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <UserAvatar initials={user.initials} />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800">{user.name}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleAddShare(user.id)}
                        disabled={actionId !== null}
                      >
                        {actionId === user.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <>
                            <Plus className="size-3 mr-1" /> Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="p-3 text-center text-xs text-muted-foreground">No matches found.</p>
                )}
              </div>
            )}

            {/* List of current shares */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Collaborators with access</label>
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                {shares.length > 0 ? (
                  shares.map((share) => (
                    <div key={share.user.id} className="flex items-center gap-3 rounded-md border p-3 bg-white">
                      <UserAvatar initials={share.user.initials} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{share.user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{share.user.email}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveShare(share.user.id)}
                        disabled={actionId !== null}
                      >
                        {actionId === share.user.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">
                    Only you have access to this document. Use the search above to share it.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="button" className="w-full sm:w-auto" asChild>
            <DialogTrigger>Done</DialogTrigger>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
