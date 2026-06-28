import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import Heading from '@tiptap/extension-heading';
import OrderedList from '@tiptap/extension-ordered-list';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Save, Share2, Upload, Loader2, Paperclip, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShareDialog } from '@/components/ShareDialog';
import { Toolbar } from '@/components/Toolbar';
import { UploadDialog } from '@/components/UploadDialog';
import { api, type ApiDocument } from '@/lib/api';

export function DocumentEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [doc, setDoc] = useState<ApiDocument | null>(null);
  const [title, setTitle] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('All changes saved');
  
  const isInitialLoaded = useRef(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        heading: false,
        orderedList: false,
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none px-8 py-10 text-slate-900 prose-headings:font-semibold prose-p:text-base prose-p:leading-7 focus:outline-none min-h-[500px]',
      },
    },
  });

  // Fetch document details on mount/ID change
  useEffect(() => {
    if (!id) return;
    const cachedUser = localStorage.getItem('user');
    if (!cachedUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(cachedUser);
    setCurrentUser(user);

    isInitialLoaded.current = false;
    setLoading(true);
    setDoc(null);
    fetchDoc(id, user.id);
  }, [id, navigate]);

  const fetchDoc = async (docId: string, userId: string) => {
    try {
      const documentData = await api.documents.get(docId, userId);
      setDoc(documentData);
      setTitle(documentData.title);
    } catch (err) {
      console.error('Failed to load document:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Set editor content once both editor and doc are ready
  useEffect(() => {
    if (editor && doc && !isInitialLoaded.current) {
      editor.commands.setContent(doc.content_html || '<p></p>');
      setContentHtml(doc.content_html || '<p></p>');
      setTimeout(() => {
        isInitialLoaded.current = true;
      }, 150);
    }
  }, [editor, doc]);

  const refreshAttachments = async () => {
    if (!id || !currentUser) return;
    try {
      const documentData = await api.documents.get(id, currentUser.id);
      setDoc(documentData);
    } catch (err) {
      console.error('Failed to refresh attachments:', err);
    }
  };

  // Perform saving action
  const handleSave = async (customTitle?: string, customContent?: string) => {
    if (!id) return;
    setSaving(true);
    setSaveStatus('Saving changes...');
    try {
      const activeTitle = customTitle !== undefined ? customTitle : title;
      const activeContent = customContent !== undefined ? customContent : contentHtml;
      await api.documents.update(id, activeTitle, activeContent);
      setSaveStatus(`Saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);
    } catch (err) {
      console.error('Failed to save document:', err);
      setSaveStatus('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Set visual unsaved indicator on editor keystrokes
  useEffect(() => {
    if (!editor || !doc) return;

    const handleUpdate = () => {
      if (!isInitialLoaded.current) return;
      setSaveStatus('Unsaved changes');
      setContentHtml(editor.getHTML());
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, doc]);

  // Debounced auto-save effect for editor and title updates
  useEffect(() => {
    if (!editor || !doc || !isInitialLoaded.current) return;

    const timer = setTimeout(() => {
      handleSave(title, contentHtml);
    }, 1500);

    return () => clearTimeout(timer);
  }, [contentHtml, title]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="ghost">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 size-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <Input
            aria-label="Document title"
            className="h-auto border-0 bg-transparent px-0 text-2xl font-bold shadow-none focus-visible:ring-0 sm:text-3xl placeholder:text-slate-300"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSaveStatus('Unsaved changes');
            }}
            placeholder="Untitled Document"
          />
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            {saving && <Loader2 className="size-3.5 animate-spin text-primary" />}
            {saveStatus}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => handleSave()} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : <Save className="size-4 mr-1" />}
            Save
          </Button>
          <ShareDialog
            documentId={id}
            ownerId={doc?.owner_id}
            trigger={
              <Button variant="outline">
                <Share2 className="size-4 mr-1" />
                Share
              </Button>
            }
          />
          <UploadDialog
            documentId={id}
            onUploadComplete={refreshAttachments}
            trigger={
              <Button variant="outline">
                <Upload className="size-4 mr-1" />
                Upload Attachment
              </Button>
            }
          />
          <Button
            variant={showSidebar ? "secondary" : "outline"}
            onClick={() => setShowSidebar(!showSidebar)}
            title="Toggle Attachments Sidebar"
            className="relative h-9 w-9 p-0"
          >
            <Paperclip className="size-4" />
            {doc?.attachments && doc.attachments.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                {doc.attachments.length}
              </span>
            )}
          </Button>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch lg:items-start">
        {/* Editor Container */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <Toolbar editor={editor} />
          <section className="min-h-[640px] rounded-lg border bg-white shadow-sm overflow-hidden">
            <EditorContent editor={editor} />
          </section>
        </div>

        {/* Collapsible Attachments Sidebar */}
        {showSidebar && (
          <aside className="w-full lg:w-80 shrink-0 border bg-white rounded-lg p-5 shadow-sm lg:sticky lg:top-20 flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Paperclip className="size-4.5 text-primary" />
                Attachments {doc?.attachments ? `(${doc.attachments.length})` : '(0)'}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 hover:bg-slate-100"
                onClick={() => setShowSidebar(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {doc?.attachments && doc.attachments.length > 0 ? (
                doc.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex flex-col gap-2 rounded-md border p-3 bg-slate-50 hover:bg-slate-100 transition shadow-xs"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-800" title={att.file_name}>
                        {att.file_name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {(att.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    {att.content_text && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-[10px] h-7 hover:bg-primary/10 mt-1"
                        onClick={() => {
                          editor?.commands.insertContent(`<p></p><p>--- Imported from ${att.file_name} ---</p><p>${att.content_text}</p><p></p>`);
                          handleSave(title, editor?.getHTML());
                        }}
                        title="Insert text content into editor"
                      >
                        Insert Content
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  No files attached to this document yet.
                </p>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
