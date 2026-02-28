import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout';
import {
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Download,
  Plus,
  Eye
} from 'lucide-react';
import { documentsAPI, getFileUrl } from '@/lib/api';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
}

const CandidateDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState('cv');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsAPI.getMyDocuments();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = await documentsAPI.upload(file, selectedType);
      setDocuments(prev => [...prev, data.document]);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload:', error);
      alert('Failed to upload document: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentsAPI.delete(docId);
      setDocuments(docs => docs.filter(d => d.id !== docId));
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handlePreview = (doc: Document) => {
    if (doc.fileUrl) {
      window.open(getFileUrl(doc.fileUrl), '_blank');
    } else {
      alert('Preview not available for this document.');
    }
  };

  const handleDownload = (doc: Document) => {
    if (doc.fileUrl) {
      const url = getFileUrl(doc.fileUrl);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Downloading ${doc.name}... (File URL not found)`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'passport': return 'border-red-500/30 bg-red-500/5';
      case 'cv': return 'border-blue-500/30 bg-blue-500/5';
      case 'certificate': return 'border-green-500/30 bg-green-500/5';
      case 'diploma': return 'border-purple-500/30 bg-purple-500/5';
      case 'reference': return 'border-orange-500/30 bg-orange-500/5';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const documentTypes = [
    { value: 'cv', label: 'CV / Resume' },
    { value: 'passport', label: 'Passport' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'reference', label: 'Reference Letter' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <DashboardLayout role="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">My Documents</h1>
            <p className="text-muted-foreground">
              Upload and manage your documents for verification
            </p>
          </div>
        </div>

        {/* Upload Section */}
        {/* Upload Section - Redesigned as Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-gold" /> Upload New Document
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Document Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {documentTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all text-left flex items-center justify-between group ${selectedType === type.value
                        ? 'bg-gold/10 border-gold text-foreground'
                        : 'bg-secondary border-transparent text-muted-foreground hover:border-gold/30 hover:text-foreground'
                        }`}
                    >
                      {type.label}
                      {selectedType === type.value && <div className="w-2 h-2 rounded-full bg-gold" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Select File
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${uploading
                    ? 'border-gold/50 bg-gold/5'
                    : 'border-border hover:border-gold/50 hover:bg-secondary/50'
                    }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      const event = { target: { files: e.dataTransfer.files } } as any;
                      handleUpload(event);
                    }
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleUpload}
                    className="hidden"
                  />

                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
                      <p className="text-sm font-medium text-gold">Uploading {selectedType.toUpperCase()}...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Click to upload or drag & drop</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOC, JPG (Max 10MB)</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-4 py-2 rounded-lg btn-outline-gold text-sm mt-2"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', count: documents.length, color: 'text-foreground' },
            { label: 'Verified', count: documents.filter(d => d.status === 'verified').length, color: 'text-success' },
            { label: 'Pending', count: documents.filter(d => d.status === 'pending').length, color: 'text-warning' },
          ].map((stat) => (
            <div key={stat.label} className="card-premium p-4">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Documents List */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 card-premium">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-1">No documents yet</h3>
            <p className="text-muted-foreground">
              Upload your documents to get them verified.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`card-premium p-4 border-l-4 ${getTypeColor(doc.type)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{doc.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground capitalize">{doc.type}</span>
                        <span className="text-xs text-muted-foreground">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                        {getStatusBadge(doc.status)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePreview(doc)}
                      className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {doc.status === 'pending' && (
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CandidateDocuments;
