import { useNavigate } from 'react-router-dom';

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div className="terms-page">
            <div className="terms-container">
                <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

                <h1>Terms & Conditions</h1>
                <p className="terms-effective">Last updated: June 2026</p>

                <section>
                    <h2>1. Introduction</h2>
                    <p>Welcome to NexCart. By accessing or using our website and services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our platform.</p>
                </section>

                <section>
                    <h2>2. Definitions</h2>
                    <p><strong>"NexCart"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong> refers to the owner of this e-commerce platform.</p>
                    <p><strong>"Website"</strong> refers to the NexCart online store.</p>
                    <p><strong>"Buyer"</strong> or <strong>"User"</strong> refers to any person accessing or purchasing from the website.</p>
                    <p><strong>"Products"</strong> refers to items listed for sale on the website.</p>
                    <p><strong>"Order"</strong> refers to a purchase request placed by a Buyer.</p>
                </section>

                <section>
                    <h2>3. Account Registration & Security</h2>
                    <p>You must be at least 18 years old to create an account. You agree to provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your password and for all activities under your account. We reserve the right to suspend or terminate accounts for any violation of these terms.</p>
                </section>

                <section>
                    <h2>4. Products & Pricing</h2>
                    <p>All product descriptions, images, and pricing are subject to change without notice. We strive to ensure accuracy but do not warrant that product descriptions or prices are error-free. All prices are listed in Indian Rupees (INR) unless stated otherwise.</p>
                </section>

                <section>
                    <h2>5. Orders & Acceptance</h2>
                    <p>Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order for reasons including but not limited to stock unavailability, pricing errors, or suspected fraud. Order confirmation does not constitute acceptance; acceptance occurs when the order is shipped.</p>
                </section>

                <section>
                    <h2>6. Payment Terms</h2>
                    <p>Payment must be made in full at the time of purchase. We accept standard online payment methods as displayed at checkout. All transactions are processed securely through third-party payment gateways.</p>
                </section>

                <section>
                    <h2>7. Shipping & Delivery</h2>
                    <p>We aim to ship all orders within <strong>3–7 business days</strong>. Delivery timelines are estimates and not guaranteed. Risk of loss or damage to products passes to you upon delivery. We are not responsible for delays caused by courier partners or unforeseen circumstances.</p>
                </section>

                <section>
                    <h2>8. Returns, Refunds & Cancellations</h2>
                    <p><strong>Returns:</strong> You may return products within <strong>7 days</strong> of delivery, provided the item is unused and in original packaging.</p>
                    <p><strong>Refunds:</strong> Once we receive and inspect the returned item, refunds are processed within <strong>5–7 business days</strong> to the original payment method.</p>
                    <p><strong>Cancellations:</strong> Orders can be cancelled <strong>before shipment only</strong>. Once shipped, cancellations will not be accepted.</p>
                </section>

                <section>
                    <h2>9. Warranty & Disclaimers</h2>
                    <p>Products are sold "as is" unless a manufacturer warranty is explicitly stated. To the fullest extent permitted by applicable law, NexCart disclaims all warranties, express or implied, including merchantability and fitness for a particular purpose. Our liability is limited to the purchase price of the product.</p>
                </section>

                <section>
                    <h2>10. Intellectual Property</h2>
                    <p>All content on this website — including text, graphics, logos, images, and software — is the property of NexCart and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our written consent.</p>
                </section>

                <section>
                    <h2>11. User Conduct</h2>
                    <p>You agree not to use the website for any unlawful purpose, including fraud, abuse, harassment, or interfering with the website's security or functionality. Violation may result in account termination and legal action.</p>
                </section>

                <section>
                    <h2>12. Privacy Policy</h2>
                    <p>Your use of the website is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal data. By using NexCart, you consent to the practices described in the Privacy Policy.</p>
                </section>

                <section>
                    <h2>13. Third-Party Links</h2>
                    <p>Our website may contain links to third-party websites. We are not responsible for the content, privacy practices, or availability of those sites. Accessing third-party links is at your own risk.</p>
                </section>

                <section>
                    <h2>14. Termination</h2>
                    <p>We reserve the right to suspend or terminate your account at any time without notice if you breach these terms. Upon termination, your right to use the website ceases immediately.</p>
                </section>

                <section>
                    <h2>15. Governing Law & Disputes</h2>
                    <p>These Terms & Conditions are governed by the laws of <strong>India</strong>. Any disputes arising out of or relating to these terms shall be resolved through negotiation, followed by mediation, and if unresolved, through the courts of India.</p>
                </section>

                <section>
                    <h2>16. Contact Information</h2>
                    <p>If you have any questions about these Terms & Conditions, please contact us:</p>
                    <p>Email: <a href="mailto:py6632388@gmail.com">py6632388@gmail.com</a></p>
                    <p>Business Name: NexCart</p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
