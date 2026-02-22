import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocumentsByPatientId, uploadDocument, updateDocument } from '@/services/document.service';
import type { Patient } from '@/types/patient';
import type { Document } from '@/types/document';
import { Plus, FileText, Download, Edit } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/components/organisms/Modal';
import UploadDocumentForm from '@/components/patients/forms/UploadDocumentForm';
import EditDocumentForm from '@/components/patients/forms/EditDocumentForm'; // Import EditDocumentForm
import type { UpdateDocumentInput } from '@/types/document.update.schema'; // Import the update schema type
import { useAuthStore } from '@/store/auth.store';

const DocumentItem = ({ doc, onEditClick }: { doc: Document, onEditClick: (d: Document) => void }) => (
  <div className="p-4 bg-gray-50 rounded-lg shadow-sm flex items-center justify-between">
    <div className="flex items-center">
      <FileText className="w-5 h-5 mr-3 text-primary" />
      <div>
        <h4 className="font-bold text-gray-800">{doc.fileName}</h4>
        <p className="text-sm text-gray-600">{doc.description || 'No description'}</p>
        <p className="text-xs text-gray-500">Uploaded by {doc.uploadedByUser.firstName} {doc.uploadedByUser.lastName} on {new Date(doc.uploadedAt).toLocaleDateString()}</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-md bg-primary text-white hover:bg-primary-dark">
        <Download className="w-5 h-5" />
      </a>
      <button 
        onClick={(e) => { e.stopPropagation(); onEditClick(doc); }}
        className="p-2 rounded-md bg-secondary text-white hover:bg-secondary-dark"
      >
        <Edit className="w-5 h-5" />
      </button>
    </div>
  </div>
);

export default function AttachedDocumentsTab({ patient }: { patient: Patient }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents', patient.id],
    queryFn: () => getDocumentsByPatientId(patient.id),
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', patient.id] });
      setIsUploadModalOpen(false);
      // Success toast
    },
    onError: (err) => {
      console.error("Error uploading document:", err);
      // Error toast
    }
  });

  const updateDocumentMutation = useMutation({
    mutationFn: ({ documentId, data }: { documentId: string; data: UpdateDocumentInput }) => updateDocument(documentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', patient.id] });
      setIsEditModalOpen(false);
      // Success toast
    },
    onError: (err) => {
      console.error("Error updating document:", err);
      // Error toast
    }
  });


  const handleUploadDocument = (formData: { file: File; description?: string }) => {
    if (!user) return; // Should not happen if protected
    uploadDocumentMutation.mutate({
      patientId: patient.id,
      medicalRecordId: patient.medicalRecord?.id, // Optional, depending on backend
      file: formData.file,
      description: formData.description,
    });
  };

  const handleUpdateDocument = (formData: UpdateDocumentInput) => {
    if (!selectedDocument) return;
    updateDocumentMutation.mutate({
      documentId: selectedDocument.id,
      data: formData,
    });
  };

  const handleEditDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Attached Documents</h3>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center px-3 py-1 text-sm text-white rounded-md bg-primary hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4 mr-1" />
          Upload Document
        </button>
      </div>

      {isLoading && <p>Loading documents...</p>}
      {error && <p className="text-red-500">Could not load documents.</p>}

      {documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map(doc => (
            <DocumentItem 
                key={doc.id} 
                doc={doc} 
                onEditClick={handleEditDocumentClick}
            />
          ))}
        </div>
      ) : (
        documents && <p className="text-gray-500">No documents attached for this patient.</p>
      )}

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title={`Upload Document for ${patient.user.firstName} ${patient.user.lastName}`}
      >
        <UploadDocumentForm
          onSubmit={handleUploadDocument}
          onCancel={() => setIsUploadModalOpen(false)}
          isLoading={uploadDocumentMutation.isPending}
        />
      </Modal>

      {selectedDocument && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Document: ${selectedDocument.fileName}`}
        >
          <EditDocumentForm
            document={selectedDocument}
            onSubmit={handleUpdateDocument}
            onCancel={() => setIsEditModalOpen(false)}
            isLoading={updateDocumentMutation.isPending}
          />
        </Modal>
      )}
    </div>
  );
}
