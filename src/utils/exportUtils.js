// Utility functions for exporting catalog data

export const exportToJSON = (data, filename = 'catalog-export.json') => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = filename;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const exportToCSV = (data, filename = 'catalog-export.csv') => {
  if (!data || data.length === 0) return;
  
  // Extract headers
  const headers = ['ID', 'Name', 'Type', 'Description', 'Tags'];
  
  // Convert data to CSV format
  const csvContent = [
    headers.join(','),
    ...data.map(item => [
      item.id,
      `"${item.name}"`,
      item.type,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.tags.join(', ')}"`
    ].join(','))
  ].join('\n');
  
  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToMarkdown = (data, filename = 'catalog-export.md') => {
  if (!data || data.length === 0) return;
  
  let markdown = '# AI Components Catalog\n\n';
  
  // Group by type
  const grouped = data.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});
  
  // Generate markdown
  Object.entries(grouped).forEach(([type, items]) => {
    markdown += `## ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n`;
    
    items.forEach(item => {
      markdown += `### ${item.name}\n\n`;
      markdown += `**Type:** ${item.type}\n\n`;
      markdown += `**Description:** ${item.description}\n\n`;
      markdown += `**Tags:** ${item.tags.map(tag => `\`${tag}\``).join(', ')}\n\n`;
      if (item.usage) {
        markdown += '**Usage Example:**\n\n';
        markdown += '```javascript\n';
        markdown += item.usage;
        markdown += '\n```\n\n';
      }
      markdown += '---\n\n';
    });
  });
  
  // Download
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.click();
};