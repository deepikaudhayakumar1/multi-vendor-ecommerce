import React, { useEffect, useState } from 'react';

import API from '../services/api';

import {
    Calculator,
    RefreshCw,
    CheckCircle,
    DollarSign,
    FileText,
    AlertCircle
} from 'lucide-react';

const FinancePanel = () => {

    const [report, setReport] = useState(null);
    const [payoutStatus, setPayoutStatus] = useState('');
    const [statusType, setStatusType] = useState('');
    const [loading, setLoading] = useState(false);
    const [reportLoading, setReportLoading] = useState(true);

    // --------------------------------------------------------
    // LOAD FINANCE REPORT
    // --------------------------------------------------------

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {

        setReportLoading(true);

        try {

            const res = await API.get('/commission/report');

            setReport(res.data);

        } catch (err) {

            console.error(
                'Failed to load finance report:',
                err
            );

            setPayoutStatus(
                'Failed to load finance report.'
            );

            setStatusType('error');

        } finally {

            setReportLoading(false);
        }
    };

    // --------------------------------------------------------
    // PROCESS ALL VENDOR PAYOUTS
    // --------------------------------------------------------

    const processAllVendorPayouts = async () => {

        setLoading(true);
        setPayoutStatus('');
        setStatusType('');

        try {

            const res =
                await API.post('/payouts/process-all');

            const payouts =
                Array.isArray(res.data)
                    ? res.data
                    : [];

            if (payouts.length === 0) {

                setPayoutStatus(
                    'No new weekly payouts were available for processing.'
                );

                setStatusType('success');

            } else {

                setPayoutStatus(
                    `${payouts.length} vendor payout(s) processed successfully.`
                );

                setStatusType('success');
            }

            // Reload finance report after processing
            await loadReport();

        } catch (err) {

            console.error(
                'Payout processing failed:',
                err
            );

            const message =
                err?.response?.data?.message ||
                'Payout processing failed. Please try again.';

            setPayoutStatus(message);
            setStatusType('error');

        } finally {

            setLoading(false);
        }
    };

    // --------------------------------------------------------
    // FORMAT MONEY
    // --------------------------------------------------------

    const formatMoney = (value) => {

        const amount =
            Number(value ?? 0);

        return amount.toFixed(2);
    };

    // --------------------------------------------------------
    // VALID PAYOUT RECORDS
    // --------------------------------------------------------
    /*
     * A payout should have actual sales.
     *
     * This also protects the UI from displaying old
     * zero-value test records that may still exist in DB.
     *
     * Backend is already fixed so new zero-value payouts
     * will not be created.
     */

    const payoutList =
        Array.isArray(report?.payoutsList)
            ? report.payoutsList
            : [];

    const validPayouts =
        payoutList.filter((p) => {

            const grossSales =
                Number(p?.grossSales ?? 0);

            const netPayout =
                Number(p?.netPayout ?? 0);

            return grossSales > 0 || netPayout > 0;
        });

    // --------------------------------------------------------
    // UI
    // --------------------------------------------------------

    return (
        <div>

            {/* ------------------------------------------------ */}
            {/* HEADER */}
            {/* ------------------------------------------------ */}

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}
            >

                <div>

                    <h1 style={{ fontSize: '2rem' }}>
                        Finance & Commission Reconciliation
                    </h1>

                    <p
                        style={{
                            color: 'var(--text-secondary)'
                        }}
                    >
                        Weekly vendor settlement, platform
                        commission and Section 194O TDS
                        reconciliation
                    </p>

                </div>

                <button
                    className="btn btn-primary"
                    onClick={processAllVendorPayouts}
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >

                    {loading ? (
                        <>
                            <RefreshCw
                                size={16}
                                className="spin"
                            />

                            Processing...
                        </>
                    ) : (
                        <>
                            <Calculator size={16} />

                            Execute Weekly Payout Run
                        </>
                    )}

                </button>

            </div>

            {/* ------------------------------------------------ */}
            {/* STATUS MESSAGE */}
            {/* ------------------------------------------------ */}

            {payoutStatus && (

                <div
                    className={
                        statusType === 'error'
                            ? 'alert alert-error'
                            : 'alert alert-success'
                    }
                    style={{
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >

                    {statusType === 'error' ? (
                        <AlertCircle size={18} />
                    ) : (
                        <CheckCircle size={18} />
                    )}

                    {payoutStatus}

                </div>
            )}

            {/* ------------------------------------------------ */}
            {/* LOADING */}
            {/* ------------------------------------------------ */}

            {reportLoading ? (

                <div
                    className="glass-card"
                    style={{
                        textAlign: 'center',
                        padding: '3rem'
                    }}
                >

                    <RefreshCw
                        size={24}
                        className="spin"
                    />

                    <p
                        style={{
                            marginTop: '1rem',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        Loading finance report...
                    </p>

                </div>

            ) : (

                <>
                    {/* ------------------------------------------------ */}
                    {/* KPI CARDS */}
                    {/* ------------------------------------------------ */}

                    <div
                        className="grid-3"
                        style={{
                            marginBottom: '2.5rem'
                        }}
                    >

                        {/* GROSS SALES */}

                        <div className="glass-card">

                            <span
                                style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                Gross Marketplace Sales
                            </span>

                            <h2
                                style={{
                                    fontSize: '1.75rem',
                                    marginTop: '0.25rem',
                                    color: 'var(--accent-light)'
                                }}
                            >
                                ₹
                                {formatMoney(
                                    report?.totalGrossSales
                                )}
                            </h2>

                        </div>

                        {/* COMMISSION */}

                        <div className="glass-card">

                            <span
                                style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                Platform Commission Retained
                            </span>

                            <h2
                                style={{
                                    fontSize: '1.75rem',
                                    marginTop: '0.25rem',
                                    color: 'var(--success)'
                                }}
                            >
                                ₹
                                {formatMoney(
                                    report?.totalCommissionDeducted
                                )}
                            </h2>

                        </div>

                        {/* TDS */}

                        <div className="glass-card">

                            <span
                                style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)'
                                }}
                            >
                                Section 194O TDS (1%)
                            </span>

                            <h2
                                style={{
                                    fontSize: '1.75rem',
                                    marginTop: '0.25rem',
                                    color: 'var(--warning)'
                                }}
                            >
                                ₹
                                {formatMoney(
                                    report?.totalTdsDeducted
                                )}
                            </h2>

                        </div>

                    </div>

                    {/* ------------------------------------------------ */}
                    {/* NET PAYOUT SUMMARY */}
                    {/* ------------------------------------------------ */}

                    <div
                        className="glass-card"
                        style={{
                            marginBottom: '2rem'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >

                            <DollarSign size={20} />

                            <h3>
                                Total Vendor Net Payout
                            </h3>

                        </div>

                        <h2
                            style={{
                                marginTop: '0.5rem'
                            }}
                        >
                            ₹
                            {formatMoney(
                                report?.totalNetPayout
                            )}
                        </h2>

                    </div>

                    {/* ------------------------------------------------ */}
                    {/* PAYOUT AUDIT TABLE */}
                    {/* ------------------------------------------------ */}

                    <div className="glass-card">

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '1rem'
                            }}
                        >

                            <FileText size={20} />

                            <h3>
                                Vendor Weekly Payout Audit Log
                            </h3>

                        </div>

                        <div className="table-container">

                            <table className="custom-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Payout ID
                                        </th>

                                        <th>
                                            Vendor ID
                                        </th>

                                        <th>
                                            Period
                                        </th>

                                        <th>
                                            Gross Sales
                                        </th>

                                        <th>
                                            Commission
                                        </th>

                                        <th>
                                            TDS (1%)
                                        </th>

                                        <th>
                                            Net Payout
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            UTR Reference
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {/* NO VALID PAYOUTS */}

                                    {validPayouts.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                style={{
                                                    textAlign: 'center',
                                                    padding: '2rem'
                                                }}
                                            >
                                                No payout records available.
                                            </td>

                                        </tr>

                                    ) : (

                                        validPayouts.map((p) => (

                                            <tr
                                                key={p.id}
                                            >

                                                {/* PAYOUT ID */}

                                                <td>
                                                    #{p.id}
                                                </td>

                                                {/* VENDOR */}

                                                <td>
                                                    Vendor #{p.vendorId}
                                                </td>

                                                {/* PERIOD */}

                                                <td>
                                                    {p.periodStart}
                                                    {' '}
                                                    to
                                                    {' '}
                                                    {p.periodEnd}
                                                </td>

                                                {/* GROSS SALES */}

                                                <td>
                                                    ₹
                                                    {formatMoney(
                                                        p.grossSales
                                                    )}
                                                </td>

                                                {/* COMMISSION */}

                                                <td>
                                                    -₹
                                                    {formatMoney(
                                                        p.commissionDeducted
                                                    )}
                                                </td>

                                                {/* TDS */}

                                                <td>
                                                    -₹
                                                    {formatMoney(
                                                        p.tdsDeducted
                                                    )}
                                                </td>

                                                {/* NET PAYOUT */}

                                                <td>

                                                    <strong>
                                                        ₹
                                                        {formatMoney(
                                                            p.netPayout
                                                        )}
                                                    </strong>

                                                </td>

                                                {/* STATUS */}

                                                <td>

                                                    <span
                                                        className={
                                                            String(
                                                                p.payoutStatus
                                                            ).toUpperCase() ===
                                                            'PAID'
                                                                ? 'badge badge-success'
                                                                : 'badge'
                                                        }
                                                    >
                                                        {p.payoutStatus}
                                                    </span>

                                                </td>

                                                {/* UTR */}

                                                <td>

                                                    <span
                                                        style={{
                                                            fontFamily:
                                                                'monospace',
                                                            color:
                                                                'var(--accent-light)'
                                                        }}
                                                    >
                                                        {p.utrNumber || '-'}
                                                    </span>

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </>
            )}

        </div>
    );
};

export default FinancePanel;












// import React, { useEffect, useState } from 'react';

// import API from '../services/api';

// import {
//     Calculator,
//     RefreshCw,
//     CheckCircle,
//     DollarSign,
//     FileText
// } from 'lucide-react';

// const FinancePanel = () => {

//     const [report, setReport] = useState(null);
//     const [payoutStatus, setPayoutStatus] = useState('');
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         loadReport();
//     }, []);

//     const loadReport = async () => {

//         try {

//             const res =
//                 await API.get('/commission/report');

//             setReport(res.data);

//         } catch (err) {

//             console.error(
//                 'Failed to load finance report:',
//                 err
//             );

//         }
//     };

//     const processAllVendorPayouts = async () => {

//         setLoading(true);
//         setPayoutStatus('');

//         try {

//             const res =
//                 await API.post('/payouts/process-all');

//             const payouts =
//                 res.data || [];

//             if (payouts.length === 0) {

//                 setPayoutStatus(
//                     'No new weekly payouts were available for processing.'
//                 );

//             } else {

//                 setPayoutStatus(
//                     `${payouts.length} vendor payout(s) processed successfully.`
//                 );
//             }

//             await loadReport();

//         } catch (err) {

//             console.error(
//                 'Payout processing failed:',
//                 err
//             );

//             setPayoutStatus(
//                 'Payout processing failed. Please try again.'
//             );

//         } finally {

//             setLoading(false);
//         }
//     };

//     return (

//         <div>

//             {/* ------------------------------------------------ */}
//             {/* HEADER */}
//             {/* ------------------------------------------------ */}

//             <div
//                 style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     marginBottom: '2rem'
//                 }}
//             >

//                 <div>

//                     <h1 style={{ fontSize: '2rem' }}>
//                         Finance & Commission Reconciliation
//                     </h1>

//                     <p
//                         style={{
//                             color: 'var(--text-secondary)'
//                         }}
//                     >
//                         Weekly vendor settlement, platform
//                         commission and Section 194O TDS
//                         reconciliation
//                     </p>

//                 </div>

//                 <button
//                     className="btn btn-primary"
//                     onClick={processAllVendorPayouts}
//                     disabled={loading}
//                     style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '8px'
//                     }}
//                 >

//                     {loading ? (
//                         <>
//                             <RefreshCw
//                                 size={16}
//                                 className="spin"
//                             />

//                             Processing...
//                         </>
//                     ) : (
//                         <>
//                             <Calculator size={16} />

//                             Execute Weekly Payout Run
//                         </>
//                     )}

//                 </button>

//             </div>

//             {/* ------------------------------------------------ */}
//             {/* STATUS */}
//             {/* ------------------------------------------------ */}

//             {payoutStatus && (

//                 <div
//                     className="alert alert-success"
//                     style={{
//                         marginBottom: '2rem',
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '8px'
//                     }}
//                 >

//                     <CheckCircle size={18} />

//                     {payoutStatus}

//                 </div>

//             )}

//             {/* ------------------------------------------------ */}
//             {/* KPI CARDS */}
//             {/* ------------------------------------------------ */}

//             <div
//                 className="grid-3"
//                 style={{
//                     marginBottom: '2.5rem'
//                 }}
//             >

//                 <div className="glass-card">

//                     <span
//                         style={{
//                             fontSize: '0.85rem',
//                             color: 'var(--text-secondary)'
//                         }}
//                     >
//                         Gross Marketplace Sales
//                     </span>

//                     <h2
//                         style={{
//                             fontSize: '1.75rem',
//                             marginTop: '0.25rem',
//                             color: 'var(--accent-light)'
//                         }}
//                     >
//                         ₹{report?.totalGrossSales ?? '0.00'}
//                     </h2>

//                 </div>

//                 <div className="glass-card">

//                     <span
//                         style={{
//                             fontSize: '0.85rem',
//                             color: 'var(--text-secondary)'
//                         }}
//                     >
//                         Platform Commission Retained
//                     </span>

//                     <h2
//                         style={{
//                             fontSize: '1.75rem',
//                             marginTop: '0.25rem',
//                             color: 'var(--success)'
//                         }}
//                     >
//                         ₹{report?.totalCommissionDeducted ?? '0.00'}
//                     </h2>

//                 </div>

//                 <div className="glass-card">

//                     <span
//                         style={{
//                             fontSize: '0.85rem',
//                             color: 'var(--text-secondary)'
//                         }}
//                     >
//                         Section 194O TDS (1%)
//                     </span>

//                     <h2
//                         style={{
//                             fontSize: '1.75rem',
//                             marginTop: '0.25rem',
//                             color: 'var(--warning)'
//                         }}
//                     >
//                         ₹{report?.totalTdsDeducted ?? '0.00'}
//                     </h2>

//                 </div>

//             </div>

//             {/* ------------------------------------------------ */}
//             {/* NET PAYOUT SUMMARY */}
//             {/* ------------------------------------------------ */}

//             <div
//                 className="glass-card"
//                 style={{
//                     marginBottom: '2rem'
//                 }}
//             >

//                 <div
//                     style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '10px'
//                     }}
//                 >

//                     <DollarSign size={20} />

//                     <h3>
//                         Total Vendor Net Payout
//                     </h3>

//                 </div>

//                 <h2
//                     style={{
//                         marginTop: '0.5rem'
//                     }}
//                 >
//                     ₹{report?.totalNetPayout ?? '0.00'}
//                 </h2>

//             </div>

//             {/* ------------------------------------------------ */}
//             {/* PAYOUT AUDIT TABLE */}
//             {/* ------------------------------------------------ */}

//             <div className="glass-card">

//                 <div
//                     style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '10px',
//                         marginBottom: '1rem'
//                     }}
//                 >

//                     <FileText size={20} />

//                     <h3>
//                         Vendor Weekly Payout Audit Log
//                     </h3>

//                 </div>

//                 <div className="table-container">

//                     <table className="custom-table">

//                         <thead>

//                             <tr>

//                                 <th>Payout ID</th>

//                                 <th>Vendor ID</th>

//                                 <th>Period</th>

//                                 <th>Gross Sales</th>

//                                 <th>Commission</th>

//                                 <th>TDS (1%)</th>

//                                 <th>Net Payout</th>

//                                 <th>Status</th>

//                                 <th>UTR Reference</th>

//                             </tr>

//                         </thead>

//                         <tbody>

//                             {(report?.payoutsList || []).length === 0 ? (

//                                 <tr>

//                                     <td
//                                         colSpan="9"
//                                         style={{
//                                             textAlign: 'center',
//                                             padding: '2rem'
//                                         }}
//                                     >
//                                         No payout records available.
//                                     </td>

//                                 </tr>

//                             ) : (

//                                 report.payoutsList.map((p) => (

//                                     <tr key={p.id}>

//                                         <td>
//                                             #{p.id}
//                                         </td>

//                                         <td>
//                                             Vendor #{p.vendorId}
//                                         </td>

//                                         <td>
//                                             {p.periodStart}
//                                             {' '}to{' '}
//                                             {p.periodEnd}
//                                         </td>

//                                         <td>
//                                             ₹{p.grossSales ?? '0.00'}
//                                         </td>

//                                         <td>
//                                             -₹{p.commissionDeducted ?? '0.00'}
//                                         </td>

//                                         <td>
//                                             -₹{p.tdsDeducted ?? '0.00'}
//                                         </td>

//                                         <td>
//                                             <strong>
//                                                 ₹{p.netPayout ?? '0.00'}
//                                             </strong>
//                                         </td>

//                                         <td>

//                                             <span
//                                                 className={
//                                                     p.payoutStatus === 'PAID'
//                                                         ? 'badge badge-success'
//                                                         : 'badge'
//                                                 }
//                                             >
//                                                 {p.payoutStatus}
//                                             </span>

//                                         </td>

//                                         <td>

//                                             <span
//                                                 style={{
//                                                     fontFamily: 'monospace',
//                                                     color: 'var(--accent-light)'
//                                                 }}
//                                             >
//                                                 {p.utrNumber || '-'}
//                                             </span>

//                                         </td>

//                                     </tr>

//                                 ))

//                             )}

//                         </tbody>

//                     </table>

//                 </div>

//             </div>

//         </div>
//     );
// };

// export default FinancePanel;

