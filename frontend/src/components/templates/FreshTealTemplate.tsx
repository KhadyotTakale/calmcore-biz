import React from "react";
import { TemplateProps } from "./types";

const FreshTealTemplate: React.FC<TemplateProps> = ({
    type,
    data,
}) => {
    const { shopInfo, customerInfo, documentDetails, items, totals } = data;

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-IN");
    };

    return (
        <div className="w-full md:max-w-[210mm] min-h-[297mm] mx-auto bg-white mb-8 print:mb-0 print:max-w-[210mm] shadow-lg md:shadow-none font-sans text-gray-800">

            {/* Top Bar - Title */}
            <div className="bg-slate-200 text-center py-2 mb-6">
                <h1 className="text-2xl font-bold tracking-wider uppercase text-black">{type}</h1>
            </div>

            <div className="px-8 pb-8">

                {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                    {/* Left: Logo & Company Info */}
                    <div className="w-1/2">
                        {shopInfo?.logo_url ? (
                            <img
                                src={shopInfo.logo_url}
                                alt="Company Logo"
                                className="h-16 mb-4 object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-green-600 mb-2">{shopInfo.company_name}</h2>
                        )}

                        <div className="text-sm font-bold mb-1">{shopInfo.company_name}</div>
                        <div className="text-xs space-y-0.5 text-gray-700">
                            {shopInfo.address && <p className="whitespace-pre-line">{shopInfo.address}</p>}
                            {shopInfo.phone && <p>Phone: {shopInfo.phone}</p>}
                            {shopInfo.email && <p>Email: {shopInfo.email}</p>}
                            {shopInfo.gstin && <p>GSTIN: {shopInfo.gstin}</p>}
                        </div>
                    </div>

                    {/* Right: Document Details */}
                    <div className="w-auto">
                        <div className="flex border-b-2 border-slate-300 bg-slate-100 text-xs font-bold">
                            <div className="px-4 py-1 border-r border-slate-300">{type === 'INVOICE' ? 'Invoice No' : 'Quote No'}</div>
                            <div className="px-4 py-1">{type === 'INVOICE' ? 'Invoice Date' : 'Quote Date'}</div>
                        </div>
                        <div className="flex text-sm">
                            <div className="px-4 py-1 border-r border-slate-200 text-center w-1/2">{documentDetails.documentNumber}</div>
                            <div className="px-4 py-1 text-center w-1/2">{formatDate(documentDetails.date)}</div>
                        </div>
                        {documentDetails.dueDate && (
                            <div className="mt-2 text-xs text-right">
                                <span className="font-bold">Due Date:</span> {formatDate(documentDetails.dueDate)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 mb-6">
                    {/* Bill To */}
                    <div className="w-full">
                        <div className="bg-slate-200 px-2 py-1 text-xs font-bold mb-2">Bill To</div>
                        <div className="px-2 text-sm text-gray-800">
                            <p className="font-bold">{customerInfo.name}</p>
                            <p className="whitespace-pre-line text-xs">{customerInfo.address}</p>
                            {customerInfo.gstin && <p className="text-xs mt-1">GSTIN: {customerInfo.gstin}</p>}
                            {customerInfo.phone && <p className="text-xs">Phone: {customerInfo.phone}</p>}
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <div className="bg-slate-200 px-2 py-1 text-xs font-bold mb-0">Items</div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-100 border-b border-gray-300">
                                <th className="py-2 px-2 text-left font-bold w-1/2">Item</th>
                                <th className="py-2 px-2 text-center font-bold">Qty</th>
                                <th className="py-2 px-2 text-right font-bold">Unit price</th>
                                <th className="py-2 px-2 text-right font-bold">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className="border-b border-gray-100">
                                    <td className="py-2 px-2">
                                        <p className="font-semibold text-gray-900">{item.description}</p>
                                        {/* We could add description/notes here if available */}
                                    </td>
                                    <td className="py-2 px-2 text-center">{item.quantity}</td>
                                    <td className="py-2 px-2 text-right">₹{item.rate.toFixed(2)}</td>
                                    <td className="py-2 px-2 text-right font-bold">₹{item.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Section */}
                <div className="flex flex-col md:flex-row gap-8 mt-auto pt-8 border-t-4 border-slate-300">

                    {/* Left Footer: Terms & Bank */}
                    <div className="w-full md:w-1/2 text-xs">

                        {shopInfo?.bank_details && (
                            <div className="mb-4">
                                <p className="font-bold underline mb-1">Bank Details:</p>
                                <p>Bank: {shopInfo.bank_details.bank_name}</p>
                                <p>Acc No: {shopInfo.bank_details.account_number}</p>
                                <p>IFSC: {shopInfo.bank_details.ifsc_code}</p>
                            </div>
                        )}

                        {shopInfo?.declaration && (
                            <div className="italic text-gray-500 mb-4">
                                {shopInfo.declaration}
                            </div>
                        )}
                    </div>

                    {/* Right Footer: Totals */}
                    <div className="w-full md:w-1/2">
                        <div className="space-y-0">
                            <div className="flex justify-between bg-slate-200 px-4 py-2 font-bold mb-1">
                                <span>Subtotal</span>
                                <span>₹{totals.subtotal.toFixed(2)}</span>
                            </div>
                            {(totals.cgstAmount > 0 || totals.sgstAmount > 0) && (
                                <>
                                    <div className="flex justify-between px-4 py-1 text-sm bg-slate-50">
                                        <span>CGST ({totals.cgstRate}%)</span>
                                        <span>₹{totals.cgstAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between px-4 py-1 text-sm bg-slate-50 mb-1">
                                        <span>SGST ({totals.sgstRate}%)</span>
                                        <span>₹{totals.sgstAmount.toFixed(2)}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between bg-slate-200 px-4 py-2 font-bold text-lg">
                                <span>Total</span>
                                <span>₹{totals.total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="mt-8 text-right">
                            {shopInfo?.signature && (
                                <div className="flex flex-col items-end">
                                    <img
                                        src={shopInfo.signature}
                                        alt="Signature"
                                        className="h-12 object-contain mb-1"
                                    />
                                    <div className="border-t border-gray-400 w-32"></div>
                                    <span className="text-xs font-bold mt-1">Authorised Signatory</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FreshTealTemplate;
