import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
    primary: [0, 0, 0],
    text: [30, 41, 59],
    textLight: [100, 116, 139],
    border: [200, 200, 200],
    white: [255, 255, 255],
    background: [248, 250, 252]
};

const generateInvoice = (order) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const contentWidth = pageWidth - (margin * 2);

        doc.setFillColor(...COLORS.primary);
        doc.rect(0, 0, pageWidth, 45, 'F');

        doc.setTextColor(...COLORS.white);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('ECOMMERCE SHOP', margin, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('123 Tech Street, Digital City', margin, 28);
        doc.text('GSTIN: 29ABCDE1234F1Z5', margin, 34);
        doc.text('support@ecommerceshop.com | www.ecommerceshop.com', margin, 40);

        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', pageWidth - margin, 20, { align: 'right' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const invoiceNo = order.invoice_number || `INV-${order.order_number || order.order_id}`;
        doc.text(`Invoice No: ${invoiceNo}`, pageWidth - margin, 28, { align: 'right' });

        const orderDate = order.created_at
            ? new Date(order.created_at).toLocaleDateString('en-IN')
            : new Date().toLocaleDateString('en-IN');
        doc.text(`Order Date: ${orderDate}`, pageWidth - margin, 34, { align: 'right' });

        const orderNumber = order.order_number || order.order_id || 'N/A';
        doc.text(`Order No: ${orderNumber}`, pageWidth - margin, 40, { align: 'right' });

        let currentY = 55;

        doc.setFillColor(...COLORS.background);
        doc.setDrawColor(...COLORS.border);
        doc.roundedRect(margin, currentY, contentWidth, 35, 3, 3, 'FD');

        doc.setTextColor(...COLORS.text);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Customer Details', margin + 4, currentY + 8);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.textLight);

        const customerName = order.user?.name || order.customer_name || 'Customer';
        doc.text(customerName, margin + 4, currentY + 15);

        const customerEmail = order.user?.email || order.customer_email || '';
        if (customerEmail) {
            doc.text(customerEmail, margin + 4, currentY + 21);
        }

        const customerPhone = order.phone || order.customer_phone || '';
        if (customerPhone) {
            doc.text(`Phone: ${customerPhone}`, margin + 4, customerEmail ? currentY + 27 : currentY + 21);
        }

        if (order.shipping_address) {
            const addressText = order.shipping_address.replace(/,/g, ', ');
            const splitAddress = doc.splitTextToSize(addressText, 75);
            const addressY = customerEmail ? (customerPhone ? currentY + 33 : currentY + 33) : (customerPhone ? currentY + 27 : currentY + 27);
            doc.text(splitAddress, margin + 4, addressY);
        }

        currentY = 100;

        doc.setTextColor(...COLORS.text);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Order Items', margin, currentY);

        currentY += 5;

        let items = [];
        let subtotal = 0;

        if (order.items && Array.isArray(order.items)) {
            items = order.items.map((item, index) => {
                const name = item.product_name
                    || (item.product ? `${item.product.brand} ${item.product.model_name}` : null)
                    || item.model_name
                    || `Item #${index + 1}`;

                const qty = parseInt(item.quantity) || 0;
                const price = parseFloat(item.price_each || item.price || 0);
                const total = parseFloat(item.subtotal || (price * qty));
                subtotal += total;

                return [
                    index + 1,
                    name,
                    qty,
                    `Rs. ${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                    `Rs. ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                ];
            });
        }

        if (order.items && !Array.isArray(order.items) && typeof order.items === 'object') {
            const itemEntries = Object.values(order.items);
            itemEntries.forEach((item, index) => {
                const name = item.product_name || item.name || `Item #${index + 1}`;
                const qty = parseInt(item.quantity) || 0;
                const price = parseFloat(item.price_each || item.price || 0);
                const total = parseFloat(item.subtotal || (price * qty));
                subtotal += total;

                items.push([
                    index + 1,
                    name,
                    qty,
                    `Rs. ${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
                    `Rs. ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                ]);
            });
        }

        autoTable(doc, {
            startY: currentY,
            head: [['#', 'Product Name', 'Qty', 'Unit Price', 'Total']],
            body: items,
            theme: 'plain',
            headStyles: {
                fillColor: COLORS.primary,
                textColor: COLORS.white,
                fontStyle: 'bold',
                fontSize: 10,
                cellPadding: 5,
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: COLORS.text,
                cellPadding: 4
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 12 },
                1: { cellWidth: 'auto' },
                2: { halign: 'center', cellWidth: 20 },
                3: { halign: 'right', cellWidth: 35 },
                4: { halign: 'right', cellWidth: 40 }
            },
            alternateRowStyles: {
                fillColor: COLORS.background
            },
            margin: { left: margin, right: margin },
            tableWidth: contentWidth
        });

        currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 0) + 10;

        const summaryX = pageWidth - margin - 70;
        const summaryWidth = 70;

        doc.setFillColor(...COLORS.background);
        doc.roundedRect(summaryX - 5, currentY - 3, summaryWidth + 10, 28, 2, 2, 'F');

        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(0.3);
        doc.line(summaryX - 5, currentY + 5, summaryX + summaryWidth + 5, currentY + 5);
        doc.line(summaryX - 5, currentY + 14, summaryX + summaryWidth + 5, currentY + 14);

        doc.setTextColor(...COLORS.textLight);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', summaryX, currentY + 3);

        doc.setTextColor(...COLORS.text);
        doc.setFont('helvetica', 'bold');
        doc.text(`Rs. ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth, currentY + 3, { align: 'right' });

        doc.setTextColor(...COLORS.textLight);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Shipping:', summaryX, currentY + 12);

        const shippingCost = parseFloat(order.shipping_cost || order.shipping_charge || 0);
        doc.setTextColor(...COLORS.text);
        doc.setFont('helvetica', 'bold');
        doc.text(shippingCost > 0 ? `Rs. ${shippingCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'FREE', summaryX + summaryWidth, currentY + 12, { align: 'right' });

        doc.setTextColor(...COLORS.primary);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Grand Total:', summaryX, currentY + 23);

        const grandTotal = parseFloat(order.total_amount || subtotal + shippingCost);
        doc.text(`Rs. ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, summaryX + summaryWidth, currentY + 23, { align: 'right' });

        currentY += 50;

        if (order.payment_method) {
            doc.setTextColor(...COLORS.text);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Payment Method:', margin, currentY);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...COLORS.textLight);
            doc.text(order.payment_method, margin + 40, currentY);
            currentY += 8;
        }

        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 10;

        doc.setFillColor(...COLORS.primary);
        doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');

        doc.setTextColor(...COLORS.white);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Thank You for Your Business!', pageWidth / 2, pageHeight - 15, { align: 'center' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text('Ecommerce Shop | support@ecommerceshop.com | www.ecommerceshop.com', pageWidth / 2, pageHeight - 8, { align: 'center' });

        doc.save(`Invoice_${invoiceNo}.pdf`);
    } catch (error) {
        console.error('Error in generateInvoice:', error);
        alert('Error generating invoice: ' + error.message);
    }
};

export default generateInvoice;
