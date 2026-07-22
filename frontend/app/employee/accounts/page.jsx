"use client";

import { useEffect, useState } from "react";
import accountService from "../../../services/accountService";
import reportService from "../../../services/reportService";
import { extractList, extractData, formatMoney } from "../../../lib/normalize";

const DEPOSIT_STEP = 500;

export default function EmployeeAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newUserId, setNewUserId] = useState("");
  const [initialDeposit, setInitialDeposit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Popup toast configuration state
  const [toast, setToast] = useState({ show: false, type: "", text: "" });

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await reportService.getSystemReports();
      const data = extractData(res) ?? res;
      setAccounts(extractList(data, ["accountSummaryReport", "accounts"]));
    } catch (error) {
      // non-fatal for this page; the form still works
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Handles automatic timeout handling for the floating notification toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show, toast.text, toast.type]);

  const triggerToast = (type, text) => {
    setToast({ show: true, type, text });
  };

  const adjustDeposit = (delta) => {
    setInitialDeposit((prev) => {
      const current = parseFloat(prev) || 0;
      const next = Math.max(0, current + delta);
      return Math.round(next * 100) / 100 + "";
    });
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    if (!newUserId.trim()) {
      triggerToast("error", "Enter the customer\u2019s user ID.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await accountService.createAccount(
        newUserId.trim(),
        initialDeposit || 0,
      );
      const data = extractData(res) ?? res;
      triggerToast(
        "success", 
        `Account opened successfully${data?.account_number ? `: ${data.account_number}` : "."}`
      );
      setNewUserId("");
      setInitialDeposit("");
      loadAccounts();
    } catch (error) {
      triggerToast(
        "error",
        error.response?.data?.message || "Failed to open new account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
      
      {/* Floating Right-Side Popup Notification */}
      {toast.show && (
        <div 
          className={`fixed top-6 right-6 z-50 flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-4 transition-all duration-300 transform translate-x-0 ${
            toast.type === "success"
              ? "border-green-100 !shadow-[0_10px_30px_rgba(6,78,59,0.12)]"
              : "border-red-100 !shadow-[0_10px_30px_rgba(220,38,38,0.12)]"
          }`}
        >
          {/* Dynamic Action Icon Status indicator */}
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            toast.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          }`}>
            {toast.type === "success" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          {/* Core Text Configuration Content */}
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-bold text-gray-900">
              {toast.type === "success" ? "Account Created" : "Registration Failed"}
            </p>
            <p className="mt-0.5 text-xs font-medium text-gray-500 leading-relaxed">
              {toast.text}
            </p>
          </div>

          {/* Manual dismiss control option toggler */}
          <button
            onClick={() => setToast((prev) => ({ ...prev, show: false }))}
            className="text-gray-400 hover:text-gray-600 transition p-0.5 rounded-lg hover:bg-gray-50"
            aria-label="Dismiss notification"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <h1 className="text-2xl font-bold text-[var(--color-text)]">
        Customer Accounts
      </h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Open new accounts and browse the account registry.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Open account form card box container framework */}
        <div className="card h-fit p-6 lg:col-span-1 !shadow-[0_4px_20px_rgba(6,78,59,0.07)] hover:!shadow-[0_12px_32px_rgba(16,185,129,0.18)] hover:!border-emerald-600/30">
          <h3 className="mb-4 text-lg font-bold text-[var(--color-text)]">
            Open New Account
          </h3>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Customer User ID
              </label>
              <input
                type="text"
                required
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="e.g. 5"
                className="input w-full"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Initial Deposit (৳)
              </label>
              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => adjustDeposit(-DEPOSIT_STEP)}
                  disabled={!initialDeposit || parseFloat(initialDeposit) <= 0}
                  aria-label="Decrease by ৳500"
                  className="flex w-11 shrink-0 items-center justify-center rounded-lg border border-green-900/30 text-green-900 text-lg font-bold transition-all duration-200 hover:bg-green-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
                >
                  −
                </button>
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-[var(--color-text-muted)]">
                    ৳
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={initialDeposit}
                    onChange={(e) => setInitialDeposit(e.target.value)}
                    placeholder="0.00"
                    className="input w-full pl-7 text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => adjustDeposit(DEPOSIT_STEP)}
                  aria-label="Increase by ৳500"
                  className="flex w-11 shrink-0 items-center justify-center rounded-lg border border-green-900/30 text-green-900 text-lg font-bold transition-all duration-200 hover:bg-green-900 hover:text-white active:scale-95"
                >
                  +
                </button>
              </div>
              <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
                Adjusts in steps of ৳{DEPOSIT_STEP.toLocaleString("en-BD")}
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gradient-to-r from-green-950 via-green-900 to-emerald-900 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-green-900 hover:via-green-850 hover:to-emerald-800 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
            >
              {submitting ? "Opening..." : "Open Account"}
            </button>
          </form>
        </div>

        {/* Registry table registry log dynamic card layout structure context */}
        <div className="card p-6 lg:col-span-2 !shadow-[0_4px_20px_rgba(6,78,59,0.07)] hover:!shadow-[0_12px_32px_rgba(16,185,129,0.18)] hover:!border-emerald-600/30">
          <h3 className="mb-4 text-lg font-bold text-[var(--color-text)]">
            Account Registry
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[var(--color-text-muted)]">
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Account No.</th>
                  <th className="pb-3 font-medium">Balance</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-6 text-center text-[var(--color-text-muted)]"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-6 text-center text-[var(--color-text-muted)]"
                    >
                      No accounts found.
                    </td>
                  </tr>
                ) : (
                  accounts.map((acc, i) => (
                    <tr
                      key={acc.account_number || i}
                      className="text-[var(--color-text)] transition hover:bg-[var(--color-bg)]"
                    >
                      <td className="py-3 font-medium">
                        {acc.username || "—"}
                      </td>
                      <td className="py-3 font-mono text-xs">
                        {acc.account_number}
                      </td>
                      <td className="py-3 font-semibold">
                        ৳{formatMoney(acc.balance)}
                      </td>
                      <td className="py-3">
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-bold"
                          style={
                            acc.status === "Active"
                              ? {
                                  background: "rgba(16, 185, 129, 0.12)",
                                  color: "var(--color-accent)",
                                }
                              : {
                                  background: "var(--color-border)",
                                  color: "var(--color-text-muted)",
                                }
                          }
                        >
                          {acc.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}