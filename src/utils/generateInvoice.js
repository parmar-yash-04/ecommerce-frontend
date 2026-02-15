import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const generateInvoice = (order) => {
    try {
        console.log('Generating invoice for:', order);
        const doc = new jsPDF();

        // -- HEADER --
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('ECOMMERCE SHOP', 14, 22);

        doc.setFontSize(10);
        doc.text('123 Tech Street, Digital City', 14, 30);
        doc.text('GSTIN: 29ABCDE1234F1Z5', 14, 35);
        doc.text('Email: support@ecommerceshop.com', 14, 40);

        // -- INVOICE DETAILS --
        doc.setFontSize(16);
        doc.text('INVOICE', 196, 22, { align: 'right' });

        doc.setFontSize(10);
        const invoiceNo = order.invoice_number || `INV-${order.order_number || order.order_id}`;
        doc.text(`Invoice No: ${invoiceNo}`, 196, 30, { align: 'right' });

        const orderDate = order.created_at
            ? new Date(order.created_at).toLocaleDateString()
            : new Date().toLocaleDateString();
        doc.text(`Date: ${orderDate}`, 196, 35, { align: 'right' });

        doc.text(`Status: ${order.payment_status || 'Paid'}`, 196, 40, { align: 'right' });

        // -- BILL TO --
        doc.line(14, 45, 196, 45); // Horizontal line

        doc.setFontSize(12);
        doc.text('Bill To:', 14, 55);

        doc.setFontSize(10);
        doc.text(`Customer ID: ${order.user_id || 'Guest'}`, 14, 62);

        // Splitting address for multi-line support
        if (order.shipping_address) {
            const splitAddress = doc.splitTextToSize(order.shipping_address, 80);
            doc.text(splitAddress, 14, 67);
        } else {
            doc.text('No Address Provided', 14, 67);
        }

        // -- ITEMS TABLE --
        // Prepare data for autotable
        // Supports both structure from 'place_order' (where items might be in a different format)
        // and 'my-orders' (where items are nested)

        let items = [];
        if (order.items && Array.isArray(order.items)) {
            items = order.items.map((item, index) => {
                // Handle various item structures (backend order vs frontend cart item)
                const name = item.product_name
                    || (item.product ? `${item.product.brand} ${item.product.model_name}` : null)
                    || item.model_name
                    || `Item #${index + 1}`;

                const qty = item.quantity;
                const price = item.price_each || item.price || 0;
                const total = item.subtotal || (price * qty);

                return [
                    name,
                    qty,
                    `Rs. ${price.toLocaleString()}`,
                    `Rs. ${total.toLocaleString()}`
                ];
            });
        }

        autoTable(doc, {
            startY: 90,
            head: [['Product', 'Quantity', 'Price', 'Total']],
            body: items,
            theme: 'grid',
            headStyles: { fillColor: [66, 66, 66] },
            styles: { fontSize: 10 },
        });

        // -- TOTAL --
        const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 150;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Grand Total: Rs. ${(order.total_amount || 0).toLocaleString()}`, 196, finalY, { align: 'right' });

        // -- FOOTER --
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Thank you for your business!', 105, 280, { align: 'center' });

        // -- SAVE --
        doc.save(`Invoice_${invoiceNo}.pdf`);
    } catch (error) {
        console.error('Error in generateInvoice:', error);
        alert('Error generating invoice: ' + error.message);
    }
};

export default generateInvoice;
