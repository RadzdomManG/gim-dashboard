"use client";

import React, { useState } from "react";
import {
  FileText,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Plus,
  Building2,
  Filter,
  Search,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Send,
  X,
  FileCheck2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  clientName: string;
  scopeTitle: string;
  amountAud: number;
  issueDate: string;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  paymentMethod: string;
  notes?: string;
}

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: "inv-001",
    invoiceNumber: "GIM-2026-088",
    clientName: "Little Treasures Company",
    scopeTitle: "GoHighLevel Summit Build, Paediatric Funnel & $99 Course Shell (Nov 2026)",
    amountAud: 4500,
    issueDate: "2026-11-01",
    dueDate: "2026-11-15",
    status: "Paid",
    paymentMethod: "Stripe Direct (AUD)",
    notes: "Tax Invoice delivered to Zoe Horner. Includes GST compliance.",
  },
  {
    id: "inv-002",
    invoiceNumber: "GIM-2026-089",
    clientName: "We Rock the Spectrum (WRTS)",
    scopeTitle: "21 n8n Automation Nodes, ClassReach Webhooks & Database Maintenance",
    amountAud: 3800,
    issueDate: "2026-11-01",
    dueDate: "2026-11-15",
    status: "Paid",
    paymentMethod: "Bank Transfer AEST",
    notes: "Monthly enterprise automation retainer.",
  },
  {
    id: "inv-003",
    invoiceNumber: "GIM-2026-090",
    clientName: "Studio Nets",
    scopeTitle: "Design Ingestion Systems, Figma Sprint Delivery & Asset QA Retainer",
    amountAud: 2500,
    issueDate: "2026-11-01",
    dueDate: "2026-11-15",
    status: "Paid",
    paymentMethod: "Stripe Direct (AUD)",
    notes: "Sprint velocity management by Erwin Manaog.",
  },
  {
    id: "inv-004",
    invoiceNumber: "GIM-2026-091",
    clientName: "InVogue Cleans",
    scopeTitle: "30-60-90 Retention Engine & Twilio SMS Instant Quote Calculator",
    amountAud: 1800,
    issueDate: "2026-11-01",
    dueDate: "2026-11-15",
    status: "Paid",
    paymentMethod: "Direct Debit",
    notes: "Commercial agreement managed by RA Malinao.",
  },
  {
    id: "inv-005",
    invoiceNumber: "GIM-2026-092",
    clientName: "Aaron Ofosu Bootcamp",
    scopeTitle: "Fitness Pipeline Automation & Student Intake Lead Workflows",
    amountAud: 1500,
    issueDate: "2026-11-02",
    dueDate: "2026-11-16",
    status: "Pending",
    paymentMethod: "Invoice Due",
    notes: "Follow-up dispatched via RA Malinao.",
  },
  {
    id: "inv-006",
    invoiceNumber: "GIM-2026-093",
    clientName: "Tch2Thrive",
    scopeTitle: "Education Portal Hosting, Client Onboarding & Session Automation",
    amountAud: 1500,
    issueDate: "2026-11-01",
    dueDate: "2026-11-15",
    status: "Paid",
    paymentMethod: "Stripe Direct (AUD)",
    notes: "Retainer active.",
  },
];

interface ClientInvoicingViewProps {
  currentUserName: string;
  currentUserRole: string;
  isCoreAdmin: boolean;
  currentUserNickname: string;
}

export function ClientInvoicingView({
  currentUserName,
  currentUserRole,
  isCoreAdmin,
  currentUserNickname,
}: ClientInvoicingViewProps) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Invoice Form State
  const [newClient, setNewClient] = useState("Little Treasures Company");
  const [newScope, setNewScope] = useState("");
  const [newAmount, setNewAmount] = useState("1500");
  const [newDueDate, setNewDueDate] = useState("2026-11-30");

  const canManageInvoices =
    isCoreAdmin ||
    currentUserRole === "Owner" ||
    currentUserNickname.toLowerCase() === "ra" ||
    currentUserNickname.toLowerCase() === "radz" ||
    currentUserNickname.toLowerCase() === "divine";

  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.amountAud, 0);
  const totalCollected = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((acc, curr) => acc + curr.amountAud, 0);
  const totalPending = invoices
    .filter((inv) => inv.status !== "Paid")
    .reduce((acc, curr) => acc + curr.amountAud, 0);

  const filteredInvoices = invoices.filter((inv) => {
    if (filterClient !== "all" && inv.clientName !== filterClient) return false;
    if (filterStatus !== "all" && inv.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.clientName.toLowerCase().includes(q) ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.scopeTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScope.trim()) return;

    const newRecord: InvoiceRecord = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `GIM-2026-0${invoices.length + 94}`,
      clientName: newClient,
      scopeTitle: newScope.trim(),
      amountAud: parseFloat(newAmount) || 0,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: newDueDate,
      status: "Pending",
      paymentMethod: "Stripe Direct (AUD)",
      notes: `Issued by ${currentUserName} (${currentUserRole})`,
    };

    setInvoices([newRecord, ...invoices]);
    setIsCreateModalOpen(false);
    setNewScope("");
  };

  const handleToggleStatus = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const nextStatus = inv.status === "Paid" ? "Pending" : "Paid";
        return { ...inv, status: nextStatus };
      })
    );
  };

  if (!canManageInvoices) {
    return (
      <Card className="p-8 text-center max-w-xl mx-auto my-12 bg-white">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-lg text-[#242E29]">Commercial Access Restricted</h3>
        <p className="text-xs text-[#65746C] mt-2 leading-relaxed">
          The GIM Invoicing & Retainers module is managed strictly by <strong>Ma. Rose Anne (RA) Malinao</strong>,
          <strong>Radzdom Gallego</strong>, and <strong>Divine Origines</strong>.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-[#242E29]">
              Commercial Operations & Invoicing
            </h2>
            <Badge variant="brand">RA Malinao Lead</Badge>
          </div>
          <p className="text-xs text-[#65746C] mt-1">
            Client retainers, Stripe AUD invoices, and commercial billing reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Client Invoice</span>
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border border-[#E8E2DD]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#65746C] uppercase tracking-wider">
              Total Invoiced (Nov)
            </span>
            <DollarSign className="w-4 h-4 text-[#518E6A]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-[#242E29]">
            ${totalInvoiced.toLocaleString()} AUD
          </div>
          <div className="mt-1 text-[11px] text-[#65746C]">6 Active Client Accounts</div>
        </Card>

        <Card className="p-4 bg-white border border-[#E8E2DD]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#65746C] uppercase tracking-wider">
              Collected / Paid
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-emerald-700">
            ${totalCollected.toLocaleString()} AUD
          </div>
          <div className="mt-1 text-[11px] text-emerald-700/80 font-medium">
            {Math.round((totalCollected / (totalInvoiced || 1)) * 100)}% settlement rate
          </div>
        </Card>

        <Card className="p-4 bg-white border border-[#E8E2DD]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#65746C] uppercase tracking-wider">
              Pending / Due
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-serif text-amber-700">
            ${totalPending.toLocaleString()} AUD
          </div>
          <div className="mt-1 text-[11px] text-amber-700/80 font-medium">1 invoice pending payment</div>
        </Card>

        <Card className="p-4 bg-white border border-[#E8E2DD]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#65746C] uppercase tracking-wider">
              Commercial Governance
            </span>
            <ShieldCheck className="w-4 h-4 text-[#3D5249]" />
          </div>
          <div className="mt-2 text-sm font-bold text-[#242E29]">RA Malinao (Admin)</div>
          <div className="mt-1 text-[11px] text-[#65746C]">Full Commercial Authority</div>
        </Card>
      </div>

      {/* 3. Filter Controls & Invoices Table */}
      <Card className="bg-white border border-[#E8E2DD] overflow-hidden">
        <div className="p-4 border-b border-[#E8E2DD] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FBF6F3]/50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#65746C]" />
              <input
                type="text"
                placeholder="Search invoice #, client, scope..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#E8E2DD] bg-white focus:outline-none focus:ring-1 focus:ring-[#518E6A]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-[#E8E2DD] bg-white text-[#242E29]"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <Badge variant="neutral">{filteredInvoices.length} Invoices Listed</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF6F3] text-[#65746C] font-semibold border-b border-[#E8E2DD]">
              <tr>
                <th className="py-3 px-4 uppercase text-[10px] tracking-wider">Invoice #</th>
                <th className="py-3 px-4 uppercase text-[10px] tracking-wider">Client Organization</th>
                <th className="py-3 px-4 uppercase text-[10px] tracking-wider">Scope Deliverable</th>
                <th className="py-3 px-4 uppercase text-[10px] tracking-wider">Amount (AUD)</th>
                <th className="py-3 px-4 uppercase text-[10px] tracking-wider">Due Date</th>
                <th className="py-3 px-4 uppercase text-[10px] tracking-wider">Status</th>
                <th className="py-3 px-4 uppercase text-[10px] tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2DD]/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#FBF6F3]/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#3D5249]">{inv.invoiceNumber}</td>
                  <td className="py-3 px-4 font-semibold text-[#242E29] whitespace-nowrap">
                    {inv.clientName}
                  </td>
                  <td className="py-3 px-4 text-[#65746C] max-w-xs truncate" title={inv.scopeTitle}>
                    {inv.scopeTitle}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#242E29] whitespace-nowrap">
                    ${inv.amountAud.toLocaleString()} AUD
                  </td>
                  <td className="py-3 px-4 text-[#65746C] whitespace-nowrap">{inv.dueDate}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(inv.id)}
                      title="Click to toggle Paid/Pending"
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 transition-colors ${
                        inv.status === "Paid"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      }`}
                    >
                      {inv.status === "Paid" ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-700" />
                      )}
                      <span>{inv.status}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => alert(`Downloading Tax Invoice ${inv.invoiceNumber} for ${inv.clientName}...`)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#518E6A] hover:text-[#3D5249] px-2 py-1 rounded bg-[#518E6A]/10 hover:bg-[#518E6A]/20 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#242E29]/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E8E2DD] shadow-2xl overflow-hidden">
            <div className="px-5 py-4 bg-[#3D5249] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-white">Issue Client Tax Invoice</h3>
                <p className="text-[11px] text-[#FBF6F3]/80">Commercial billing logged by RA Malinao</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                  Client Account
                </label>
                <select
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E2DD] bg-white text-[#242E29]"
                >
                  <option value="Little Treasures Company">Little Treasures Company</option>
                  <option value="We Rock the Spectrum (WRTS)">We Rock the Spectrum (WRTS)</option>
                  <option value="Studio Nets">Studio Nets</option>
                  <option value="InVogue Cleans">InVogue Cleans</option>
                  <option value="Aaron Ofosu Bootcamp">Aaron Ofosu Bootcamp</option>
                  <option value="Tch2Thrive">Tch2Thrive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                  Scope Title / Deliverable Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Automation Retainer (21 Workflows)"
                  value={newScope}
                  onChange={(e) => setNewScope(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E2DD] bg-white text-[#242E29]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                    Amount (AUD)
                  </label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E2DD] bg-white text-[#242E29]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D5249] mb-1">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E2DD] bg-white text-[#242E29]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E2DD] flex items-center justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  Generate Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
