import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Invoice, Partner, Commercial, users } from '@/data/mockData';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const generateInvoicePDF = (invoice: Invoice, entity: Partner | Commercial | undefined) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Studya', 14, 22);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Yaoundé, Cameroun', 14, 30);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 200, 22, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`${invoice.number}`, 200, 30, { align: 'right' });

  // Recipient
  if (entity) {
    doc.setFontSize(10);
    doc.text('Facturé à:', 14, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('name' in entity ? entity.name : `${entity.firstName} ${entity.lastName}`, 14, 56);
    doc.setFont('helvetica', 'normal');
    doc.text(entity.email, 14, 62);
    doc.text(entity.phone, 14, 68);
  }

  // Invoice Details
  doc.autoTable({
    startY: 80,
    head: [['Date de facturation', 'Date d\'échéance', 'Montant total']],
    body: [
      [
        new Date(invoice.issueDate).toLocaleDateString('fr-CM'),
        new Date(invoice.dueDate).toLocaleDateString('fr-CM'),
        `${new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(invoice.amount)}`,
      ],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 34, 34] },
  });

  // Line Items
  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [['Description', 'Montant']],
    body: [
      [invoice.entityType === 'partner' ? 'Règlement de dette' : 'Paiement de commission', `${new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(invoice.amount)}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [34, 34, 34] },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(10);
      doc.text('Merci de votre confiance.', 14, doc.internal.pageSize.height - 10);
      doc.text(`Page ${data.pageNumber} sur ${pageCount}`, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: 'right' });
    }
  });

  doc.save(`Facture-${invoice.number}.pdf`);
};
