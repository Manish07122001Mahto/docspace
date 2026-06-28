import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure interceptor to extract NestJS error/validation messages
client.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMsg = 'An error occurred';
    if (error.response && error.response.data) {
      const data = error.response.data;
      errorMsg = data.message || data.error || errorMsg;
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg.join(', ');
      }
    } else if (error.message) {
      errorMsg = error.message;
    }
    return Promise.reject(new Error(errorMsg));
  }
);

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  initials: string;
  created_at: string;
  updated_at: string;
};

export type ApiAttachment = {
  id: string;
  document_id: string;
  file_name: string;
  mime_type: string;
  size: number;
  content_text?: string;
  created_at: string;
};

export type ApiDocumentShare = {
  document_id: string;
  user_id: string;
  created_at: string;
  user: ApiUser;
};

export type ApiDocument = {
  id: string;
  title: string;
  content_html: string;
  owner_id: string;
  owner: ApiUser;
  created_at: string;
  updated_at: string;
  shares?: ApiDocumentShare[];
  attachments?: ApiAttachment[];
};

// Helper function to format dates nicely
export function formatLastUpdated(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1 && date.getDate() === now.getDate()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays <= 2 && date.getDate() === new Date(now.setDate(now.getDate() - 1)).getDate()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

export const api = {
  // Users APIs
  users: {
    list: () => client.get<ApiUser[]>('/users').then((res) => res.data),
    login: (email: string, name?: string) =>
      client.post<ApiUser>('/users/login', { email, name }).then((res) => res.data),
  },

  // Documents APIs
  documents: {
    listWorkspace: (userId: string) =>
      client
        .get<{ owned_documents: ApiDocument[]; shared_documents: ApiDocument[] }>(
          `/documents?user_id=${userId}`
        )
        .then((res) => res.data),
    
    create: (title: string, ownerId: string, contentHtml?: string) =>
      client
        .post<ApiDocument>('/documents', { title, owner_id: ownerId, content_html: contentHtml })
        .then((res) => res.data),

    get: (id: string, userId?: string) => {
      const query = userId ? `?user_id=${userId}` : '';
      return client.get<ApiDocument>(`/documents/${id}${query}`).then((res) => res.data);
    },

    update: (id: string, title?: string, contentHtml?: string) =>
      client
        .patch<ApiDocument>(`/documents/${id}`, { title, content_html: contentHtml })
        .then((res) => res.data),
    
    import: (ownerId: string, file: File, title?: string) => {
      const formData = new FormData();
      formData.append('owner_id', ownerId);
      if (title) {
        formData.append('title', title);
      }
      formData.append('file', file);

      return client
        .post<ApiDocument>('/documents/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => res.data);
    },

    // Shares APIs
    listShares: (id: string) => client.get<ApiDocumentShare[]>(`/documents/${id}/shares`).then((res) => res.data),
    
    addShare: (id: string, userId: string) =>
      client
        .post<ApiDocumentShare>(`/documents/${id}/shares`, { user_id: userId })
        .then((res) => res.data),

    removeShare: (id: string, userId: string) =>
      client.delete<{ removed: boolean }>(`/documents/${id}/shares/${userId}`).then((res) => res.data),

    // Attachments APIs
    uploadAttachment: (id: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      return client
        .post<ApiAttachment>(`/documents/${id}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => res.data);
    },
  },
};
