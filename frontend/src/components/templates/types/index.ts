export interface TemplateProps {
    type: 'ESTIMATE' | 'INVOICE';
    data: {
        shopInfo: {
            company_name: string;
            logo_url?: string;
            address: string;
            email?: string;
            phone?: string;
            gstin?: string; // Added GSTIN
            state?: string; // Added State
            declaration?: string;
            signature?: string;
            bank_details?: any;
        };
        customerInfo: {
            name: string;
            address?: string;
            state?: string;
            gstin?: string;
        };
        documentDetails: {
            documentNumber: string; // Estimate # or Invoice #
            date: string;
            validUntil?: string; // For Estimate
            dueDate?: string;    // For Invoice
            title: string;       // "ESTIMATE" or "INVOICE"
        };
        items: Array<{
            description: string;
            quantity: number;
            rate: number;
            amount: number;
            hsn_sac?: string; // Added for new template
            gst?: number;     // Added for new template
            unit?: string;    // Added for new template
        }>;
        totals: {
            subtotal: number;
            discountAmount?: number;
            cgstAmount?: number;
            sgstAmount?: number;
            cgstRate?: number;
            sgstRate?: number;
            total: number;
            amountInWords: string;
            totalQuantity?: number; // Added for new template
        };
        settings?: {
            colorTheme?: string;
        }
    };
}
