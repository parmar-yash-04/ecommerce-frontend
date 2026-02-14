import { jsPDF } from 'jspdf';

/**
 * Generate a professional invoice PDF for an order.
 *
 * @param {Object} params
 * @param {Object} params.order - Order data (order_id, order_number, total_amount, created_at, order_status, shipping_address)
 * @param {Array}  params.items - Order items (variant_id, quantity, price_each, subtotal) or cart items (price, quantity)
 * @param {string} [params.email] - Customer email
 */
export const generateInvoice = ({ order, items = [], email = '' }) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // ── Colors ──
    const primaryColor = [67, 56, 202];    // indigo-600
    const darkColor = [30, 30, 30];
    const grayColor = [100, 100, 100];
    const lightGray = [220, 220, 220];

    // ── Helper ──
    const drawLine = (yPos, color = lightGray) => {
        doc.setDrawColor(...color);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
    };

    // ════════════════════════════════════════
    //  HEADER
    // ════════════════════════════════════════
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', margin, 28);

    // Invoice number on the right
    const invoiceNumber = `INV-${order.order_number || order.order_id}`;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceNumber, pageWidth - margin, 20, { align: 'right' });

    // Date on the right
    const orderDate = order.created_at
        ? new Date(order.created_at).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        })
        : new Date().toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    doc.text(`Date: ${orderDate}`, pageWidth - margin, 30, { align: 'right' });

    y = 55;

    // ════════════════════════════════════════
    //  ORDER INFO
    // ════════════════════════════════════════
    doc.setTextColor(...darkColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details', margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);

    const infoLines = [
        `Order Number: ${order.order_number || 'N/A'}`,
        `Order ID: ${order.order_id || 'N/A'}`,
        `Status: ${order.order_status || 'Placed'}`,
    ];
    if (email) infoLines.push(`Email: ${email}`);
    if (order.shipping_address) infoLines.push(`Shipping: ${order.shipping_address}`);

    infoLines.forEach(line => {
        doc.text(line, margin, y);
        y += 6;
    });

    y += 6;
    drawLine(y);
    y += 10;

    // ════════════════════════════════════════
    //  ITEMS TABLE
    // ════════════════════════════════════════
    // Table header
    doc.setFillColor(245, 245, 250);
    doc.rect(margin, y - 5, pageWidth - margin * 2, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkColor);
    doc.setFontSize(9);

    const col1 = margin + 2;
    const col2 = margin + 70;
    const col3 = margin + 100;
    const col4 = pageWidth - margin - 2;

    doc.text('#', col1, y + 1);
    doc.text('Item', col1 + 10, y + 1);
    doc.text('Qty', col2, y + 1);
    doc.text('Price', col3, y + 1);
    doc.text('Subtotal', col4, y + 1, { align: 'right' });

    y += 10;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);

    if (items.length === 0) {
        doc.text('No items', col1, y + 2);
        y += 10;
    } else {
        items.forEach((item, index) => {
            // Check if we need a new page
            if (y > 260) {
                doc.addPage();
                y = 20;
            }

            const qty = item.quantity || 1;
            const price = item.price_each || item.price || 0;
            const subtotal = item.subtotal || (price * qty);
            const itemName = item.product_name
                || (item.brand && item.model_name ? `${item.brand} ${item.model_name}` : null)
                || `Product Variant #${item.variant_id || index + 1}`;

            // Alternating row background
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 255);
                doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');
            }

            doc.setTextColor(...grayColor);
            doc.text(`${index + 1}`, col1, y + 1);
            doc.text(itemName, col1 + 10, y + 1);
            doc.text(`${qty}`, col2, y + 1);
            doc.text(`₹${price.toFixed(2)}`, col3, y + 1);
            doc.text(`₹${subtotal.toFixed(2)}`, col4, y + 1, { align: 'right' });

            y += 8;
        });
    }

    y += 4;
    drawLine(y);
    y += 10;

    // ════════════════════════════════════════
    //  TOTAL
    // ════════════════════════════════════════
    doc.setFillColor(...primaryColor);
    doc.rect(pageWidth - margin - 70, y - 5, 70, 14, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(
        `Total: ₹${(order.total_amount || 0).toFixed(2)}`,
        pageWidth - margin - 5,
        y + 4,
        { align: 'right' }
    );

    y += 25;

    // ════════════════════════════════════════
    //  FOOTER
    // ════════════════════════════════════════
    doc.setTextColor(...grayColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for your purchase!', pageWidth / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(8);
    doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, y, { align: 'center' });

    // ── Save ──
    const filename = `Invoice-${order.order_number || order.order_id}.pdf`;
    doc.save(filename);

    return filename;
};

export default generateInvoice;
