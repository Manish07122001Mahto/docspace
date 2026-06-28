import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Loader2, FileCode, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';

type UploadDialogProps = {
  trigger: React.ReactNode;
  documentId?: string;
  onUploadComplete?: () => void;
};

export function UploadDialog({ trigger, documentId, onUploadComplete }: UploadDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension !== 'txt' && extension !== 'md') {
        setError('Only .txt and .md files are supported');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      setSuccess(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (documentId) {
        // Upload attachment to existing document
        await api.documents.uploadAttachment(documentId, file);
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setFile(null);
          setSuccess(false);
          onUploadComplete?.();
        }, 1000);
      } else {
        // Import file as new document
        const cachedUser = localStorage.getItem('user');
        if (!cachedUser) {
          setError('User not logged in');
          return;
        }
        const user = JSON.parse(cachedUser);
        const newDoc = await api.documents.import(user.id, file);
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setFile(null);
          setSuccess(false);
          navigate(`/documents/${newDoc.id}`);
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload/import file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setFile(null);
          setError('');
          setSuccess(false);
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{documentId ? 'Upload attachment' : 'Upload file'}</DialogTitle>
          <DialogDescription>
            {documentId
              ? 'Associate a text/markdown file as an attachment to this draft.'
              : 'Import a .txt or .md file into a brand new document.'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="size-12 text-green-500 mb-2 animate-bounce" />
            <h4 className="text-sm font-semibold text-slate-800">Success!</h4>
            <p className="text-xs text-muted-foreground mt-1">
              File uploaded and parsed successfully.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive">
                {error}
              </div>
            )}

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center transition hover:bg-slate-50">
              {file ? (
                <div className="flex flex-col items-center">
                  <FileCode className="mb-3 size-10 text-primary" />
                  <span className="text-sm font-medium text-slate-800 truncate max-w-[280px]">
                    {file.name}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="mb-3 size-10 text-primary" />
                  <span className="text-sm font-medium">Drop a file here or choose from your device</span>
                  <span className="mt-1 text-xs text-muted-foreground">Supported formats: .txt, .md</span>
                </div>
              )}
              <input
                className="sr-only"
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                onChange={handleFileChange}
                disabled={loading}
              />
            </label>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          {!success && (
            <Button onClick={handleImport} disabled={loading || !file}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-1" /> uploading...
                </>
              ) : (
                'Import'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
