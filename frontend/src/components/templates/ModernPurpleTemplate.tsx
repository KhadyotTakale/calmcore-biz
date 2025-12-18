import React from 'react';
import { TemplateProps } from './types';

const ModernPurpleTemplate: React.FC<TemplateProps> = ({ data, type }) => {
    const { shopInfo, customerInfo, documentDetails, items, totals } = data;

    // Formatting helpers
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-IN');

    const themeColor = 'bg-[#8B88F8]'; // The light purple color from the image
    const themeText = 'text-[#8B88F8]';
    const headerBg = 'bg-[#8B88F8]';
    const headerText = 'text-white';

    return (
        <div className="w-full bg-white p-8 max-w-[210mm] mx-auto min-h-[297mm] text-sm text-gray-800 font-serif leading-relaxed">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <div className="max-w-[60%]">
                    <h1 className="text-2xl font-bold uppercase mb-1 tracking-wide">{shopInfo.company_name}</h1>
                    <div className="text-gray-700 space-y-0.5 text-sm">
                        <p>{shopInfo.address}</p>
                        {shopInfo.phone && <p>Phone no.: {shopInfo.phone}</p>}
                        {shopInfo.email && <p>Email: {shopInfo.email}</p>}
                        {shopInfo.gstin && <p>GSTIN: {shopInfo.gstin}</p>}
                        {shopInfo.state && <p>State: {shopInfo.state}</p>}
                    </div>
                </div>
                {/* Optional Logo could go here if design requires, keeping it text focused as per image */}
                {shopInfo.logo_url && (
                    <img src={shopInfo.logo_url} alt="Logo" className="h-20 object-contain ml-4" />
                )}
            </div>

            <div className="w-full h-px bg-blue-300 mb-8"></div>

            {/* Document Title */}
            <div className="text-center mb-10">
                <h2 className={`text-3xl font-bold ${themeText} inline-block border-b-2 border-opacity-50 border-[#8B88F8] pb-1`}>
                    {type === 'ESTIMATE' ? 'Estimate' : 'Invoice'}
                </h2>
            </div>

            {/* Client & Document Info Row */}
            <div className="flex justify-between items-start mb-8">
                {/* Learn To / Bill To */}
                <div className="w-1/2">
                    <h3 className="font-bold text-base mb-2 text-black">
                        {type === 'ESTIMATE' ? 'Estimate For' : 'Bill To'}
                    </h3>
                    <p className="font-bold text-lg mb-1">{customerInfo.name}</p>
                    {customerInfo.address && <p>{customerInfo.address}</p>}
                    {customerInfo.state && <p>{customerInfo.state}</p>}
                    {customerInfo.gstin && <p>GSTIN: {customerInfo.gstin}</p>}
                </div>

                {/* Details */}
                <div className="w-1/2 text-right">
                    <h3 className="font-bold text-base mb-2 text-black">
                        {type === 'ESTIMATE' ? 'Estimate Details' : 'Invoice Details'}
                    </h3>
                    <div className="inline-block text-left min-w-[150px]">
                        <p className="flex justify-between mb-1">
                            <span className="font-semibold mr-4">{type === 'ESTIMATE' ? 'Estimate No.:' : 'Invoice No.:'}</span>
                            <span>{documentDetails.documentNumber}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-semibold mr-4">Date:</span>
                            <span>{formatDate(documentDetails.date)}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-4">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className={`${headerBg} ${headerText}`}>
                            <th className="p-2 text-left w-10">#</th>
                            <th className="p-2 text-left font-bold">Item Name</th>
                            <th className="p-2 text-center w-24">HSN/ SAC</th>
                            <th className="p-2 text-right w-20">Quantity</th>
                            <th className="p-2 text-right w-28">Price/ Unit</th>
                            <th className="p-2 text-right w-28">GST</th>
                            <th className="p-2 text-right w-32 font-bold">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100">
                                <td className="p-3 text-left">{index + 1}</td>
                                <td className="p-3 text-left font-semibold">{item.description}</td>
                                <td className="p-3 text-center text-xs">{item.hsn_sac || '-'}</td>
                                <td className="p-3 text-right">{item.quantity}</td>
                                <td className="p-3 text-right">{formatCurrency(item.rate)}</td>
                                <td className="p-3 text-right text-xs">
                                    {/* Simplified GST display for now - calculating implied amount */}
                                    {item.gst && item.gst > 0 ? (
                                        <div className="flex flex-col items-end">
                                            <span>{formatCurrency((item.amount * (item.gst / 100)))}</span>
                                            <span className="text-[10px]">({item.gst}%)</span>
                                        </div>
                                    ) : '0.00 (0.0%)'}
                                </td>
                                <td className="p-3 text-right font-bold">{formatCurrency(item.amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                    {/* Total Row */}
                    <tfoot>
                        <tr className="border-t-2 border-gray-300 font-bold">
                            <td className="p-3" colSpan={2}>Total</td>
                            <td className="p-3"></td>
                            <td className="p-3 text-right">{totals.totalQuantity || items.reduce((acc, i) => acc + i.quantity, 0)}</td>
                            <td className="p-3" colSpan={2}></td>
                            <td className="p-3 text-right">{formatCurrency(totals.subtotal)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer Section */}
            <div className="flex justify-between items-start mt-8 pt-4 border-t border-gray-900 border-opacity-10">

                {/* Left Column */}
                <div className="w-[55%] pr-8">
                    {/* Amount Words */}
                    <div className="mb-6">
                        <h4 className="font-bold text-sm mb-1">Estimate Amount In Words</h4>
                        <p className="text-gray-700 italic">{totals.amountInWords}</p>
                    </div>

                    {/* Terms */}
                    {shopInfo.declaration && (
                        <div className="mb-6">
                            <h4 className="font-bold text-sm mb-1">Terms And Conditions</h4>
                            <p className="text-xs text-gray-600 whitespace-pre-line leading-snug">{shopInfo.declaration}</p>
                        </div>
                    )}

                    {/* Bank Details */}
                    {shopInfo.bank_details && (
                        <div>
                            <h4 className="font-bold text-sm mb-2">Pay To:</h4>
                            <div className="text-sm text-gray-800 space-y-1">
                                <p>Bank Name: {shopInfo.bank_details.bank_name}</p>
                                <p>Bank Account No.: {shopInfo.bank_details.account_number}</p>
                                <p>Bank IFSC code: {shopInfo.bank_details.ifsc_code}</p>
                                <p>Account Holder's Name: {shopInfo.bank_details.beneficiary_name || shopInfo.company_name}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Totals */}
                <div className="w-[40%]">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span>Sub Total</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                        </div>
                        {totals.sgstAmount && totals.sgstAmount > 0 ? (
                            <div className="flex justify-between">
                                <span>SGST@{totals.sgstRate}%</span>
                                <span>{formatCurrency(totals.sgstAmount)}</span>
                            </div>
                        ) : null}
                        {totals.cgstAmount && totals.cgstAmount > 0 ? (
                            <div className="flex justify-between">
                                <span>CGST@{totals.cgstRate}%</span>
                                <span>{formatCurrency(totals.cgstAmount)}</span>
                            </div>
                        ) : null}

                        {/* Grand Total Bar */}
                        <div className={`${headerBg} ${headerText} p-2 flex justify-between items-center font-bold px-4 mt-4 rounded-sm`}>
                            <span>Total</span>
                            <span className="text-lg">{formatCurrency(totals.total)}</span>
                        </div>
                    </div>

                    {/* Signature */}
                    <div className="mt-16 text-right">
                        {shopInfo.signature && (
                            <img src={shopInfo.signature} alt="Signature" className="h-16 object-contain inline-block mb-2" />
                        )}
                        <p className="font-bold border-t border-gray-400 inline-block pt-1 min-w-[200px] text-center">
                            Authorised Signatory
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ModernPurpleTemplate;
