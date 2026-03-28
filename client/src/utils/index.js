import axios from "axios";

export const imageUpload = async (imageFile) => {
  if (!imageFile) return null;

  const formData = new FormData();
  formData.append("image", imageFile);

  const imageUploadURL = `https://api.imgbb.com/1/upload?key=${
    import.meta.env.VITE_imgbb_key
  }`;

  try {
    const res = await axios.post(imageUploadURL, formData);
    if (res.data.success) {
      return res.data.data.url;
    }
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Image upload failed. Please try again.");
  }
};

export const generateReceiptHTML = (pickup) => {
  const formattedDate = new Date(pickup.createdAt).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const statusColors = {
    'pending': '#FCD34D',
    'approved': '#86EFAC',
    'rejected': '#FCA5A5',
    'completed': '#60A5FA',
    'cancelled': '#D1D5DB'
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>RecycMate Receipt - ${pickup._id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; padding: 20px; }
        .receipt { background: white; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #16a34a; font-size: 28px; margin-bottom: 5px; }
        .header p { color: #6b7280; font-size: 14px; }
        .request-id { text-align: right; color: #6b7280; font-size: 12px; margin-bottom: 20px; font-family: monospace; }
        .section { margin-bottom: 25px; }
        .section-title { font-weight: bold; color: #374151; font-size: 14px; text-transform: uppercase; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .info-label { color: #6b7280; font-weight: 500; }
        .info-value { color: #1f2937; font-weight: 600; }
        .items-list { background: #f9fafb; padding: 12px; border-radius: 6px; }
        .item { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
        .item:last-child { border-bottom: none; }
        .item-qty { color: #16a34a; font-weight: bold; }
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          color: white;
        }
        .status-pending { background: ${statusColors.pending}; color: #92400e; }
        .status-approved { background: ${statusColors.approved}; color: #15803d; }
        .status-rejected { background: ${statusColors.rejected}; color: #991b1b; }
        .status-completed { background: ${statusColors.completed}; color: #0c4a6e; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        .print-button { text-align: center; margin-top: 20px; }
        .print-button button { padding: 10px 20px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
        @media print {
          body { background: white; padding: 0; }
          .print-button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>♻️ RecycMate</h1>
          <p>E-Waste Collection & Recycling Receipt</p>
        </div>

        <div class="request-id">Request ID: <span>${pickup._id}</span></div>

        <div class="section">
          <div class="section-title">📋 Request Details</div>
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${pickup.userName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value">${pickup.userEmail}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Request Date:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📍 Pickup Location</div>
          <div class="info-row">
            <span class="info-label">Address:</span>
            <span class="info-value">${pickup.address}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Preferred Date:</span>
            <span class="info-value">${pickup.preferredDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Preferred Time:</span>
            <span class="info-value">${pickup.preferredTime}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">♻️ Items for Pickup</div>
          <div class="items-list">
            ${pickup.items.map((item, idx) => `
              <div class="item">
                <span>${idx + 1}. ${item.category}</span>
                <span class="item-qty">Qty: ${item.quantity}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">📊 Request Status</div>
          <div style="padding: 12px;">
            <div class="status-badge status-${pickup.status}">${pickup.status.toUpperCase()}</div>
          </div>
        </div>

        ${pickup.statusHistory && pickup.statusHistory.length > 0 ? `
          <div class="section">
            <div class="section-title">⏱️ Status Timeline</div>
            <div class="items-list">
              ${pickup.statusHistory.map(history => `
                <div class="item" style="flex-direction: column; border-bottom: 1px solid #e5e7eb; padding: 12px 0;">
                  <div style="margin-bottom: 6px;">
                    <strong>${history.status.toUpperCase()}</strong> - ${new Date(history.timestamp).toLocaleString()}
                  </div>
                  ${history.note ? `<div style="font-size: 12px; color: #6b7280; margin-left: 12px;">${history.note}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for contributing to environmental sustainability!</p>
          <p style="margin-top: 10px; font-size: 11px;">RecycMate &copy; 2024 - All rights reserved</p>
          <p style="margin-top: 8px;">This is an automated receipt. No signature required.</p>
        </div>

        <div class="print-button">
          <button onclick="window.print()">🖨️ Print Receipt</button>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const downloadReceiptAsHTML = (pickup) => {
  const html = generateReceiptHTML(pickup);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `RecycMate-Receipt-${pickup._id}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const openReceiptInNewTab = (pickup) => {
  const html = generateReceiptHTML(pickup);
  const newWindow = window.open();
  newWindow.document.write(html);
  newWindow.document.close();
};
