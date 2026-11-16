export const invoiceMessages = {
  en: {
    selection: 'Invoice actions', selectAll: 'Select all visible invoices',
    select: (id: string) => `Select ${id}`,
    selected: (count: number) => `${count} selected`, statusHeading: 'Status',
    markAwaiting: 'Awaiting payment', markPaid: 'Mark paid', clear: 'Clear selection',
    saved: (count: number, status: string) => `Updated ${count} invoice${count === 1 ? '' : 's'} to ${status}.`,
    client: 'Client',
    statuses: { awaiting: 'Awaiting payment', paid: 'Paid' },
  },
  fr: {
    selection: 'Actions sur les factures', selectAll: 'Sélectionner toutes les factures visibles',
    select: (id: string) => `Sélectionner ${id}`,
    selected: (count: number) => `${count} sélectionnée(s)`, statusHeading: 'Statut',
    markAwaiting: 'En attente de paiement', markPaid: 'Marquer comme payées', clear: 'Effacer la sélection',
    saved: (count: number, status: string) => `${count} facture(s) mise(s) à jour : ${status}.`,
    client: 'Client',
    statuses: { awaiting: 'En attente de paiement', paid: 'Payée' },
  },
};
export type InvoiceLocale = keyof typeof invoiceMessages;
