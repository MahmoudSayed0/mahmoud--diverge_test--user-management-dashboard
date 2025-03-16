import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import type { User } from '@/lib/mockApi';
import i18n from '@/plugins/i18n';

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

/**
 * Export users data to CSV
 * @param users - Array of users to export
 * @param fileName - Name of the file to download
 */
export const exportToCSV = (users: User[], fileName: string = 'users-export'): void => {
  const { t } = i18n.global;
  
  // Define CSV headers
  const headers = [
    t('userFields.id'),
    t('userFields.name'),
    t('userFields.email'),
    t('userFields.role'),
    t('userFields.status'),
    t('userFields.department'),
    t('userFields.location'),
    t('userFields.phone'),
    t('userFields.createdAt'),
    t('userFields.lastLogin')
  ].join(',');
  
  // Map user data to CSV rows
  const rows = users.map(user => {
    return [
      user.id,
      `"${user.name}"`, // Wrap in quotes to handle commas in names
      `"${user.email}"`,
      t(`roles.${user.role}`),
      t(`statuses.${user.status}`),
      `"${user.department || ''}"`,
      `"${user.location || ''}"`,
      `"${user.phone || ''}"`,
      formatDate(user.createdAt),
      formatDate(user.lastLogin || '')
    ].join(',');
  });
  
  // Combine headers and rows
  const csvContent = [headers, ...rows].join('\n');
  
  // Create a Blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  // Set up download
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export users data to PDF
 * @param users - Array of users to export
 * @param fileName - Name of the file to download
 */
export const exportToPDF = (users: User[], fileName: string = 'users-export'): void => {
  const { t } = i18n.global;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(t('userManagement.userList'), 14, 15);
  doc.setFontSize(10);
  doc.text(`${t('common.exportDate')}: ${new Date().toLocaleDateString()}`, 14, 22);
  
  // Define table headers
  const headers = [
    t('userFields.id'),
    t('userFields.name'),
    t('userFields.email'),
    t('userFields.role'),
    t('userFields.status'),
    t('userFields.department'),
    t('userFields.createdAt')
  ];
  
  // Map user data to table rows
  const data = users.map(user => [
    user.id.toString(),
    user.name,
    user.email,
    t(`roles.${user.role}`),
    t(`statuses.${user.status}`),
    user.department || '',
    formatDate(user.createdAt)
  ]);
  
  // Generate table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 30,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [66, 66, 66] }
  });
  
  // Save PDF
  doc.save(`${fileName}-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export a single user's data to PDF
 * @param user - User to export
 */
export const exportUserToPDF = (user: User): void => {
  const { t } = i18n.global;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text(t('userManagement.userDetails'), 14, 15);
  
  // Add user name as subtitle
  doc.setFontSize(14);
  doc.text(user.name, 14, 25);
  
  // Add export date
  doc.setFontSize(10);
  doc.text(`${t('common.exportDate')}: ${new Date().toLocaleDateString()}`, 14, 32);
  
  // Define user details
  const details = [
    [t('userFields.id'), user.id.toString()],
    [t('userFields.name'), user.name],
    [t('userFields.email'), user.email],
    [t('userFields.role'), t(`roles.${user.role}`)],
    [t('userFields.status'), t(`statuses.${user.status}`)],
    [t('userFields.department'), user.department || ''],
    [t('userFields.location'), user.location || ''],
    [t('userFields.phone'), user.phone || ''],
    [t('userFields.createdAt'), formatDate(user.createdAt)],
    [t('userFields.lastLogin'), formatDate(user.lastLogin || '')]
  ];
  
  // Generate table
  autoTable(doc, {
    body: details,
    startY: 40,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 100 }
    }
  });
  
  // Save PDF
  doc.save(`user-${user.id}-${new Date().toISOString().split('T')[0]}.pdf`);
}; 