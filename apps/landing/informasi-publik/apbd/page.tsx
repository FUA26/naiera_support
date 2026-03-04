"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart,
  ChevronRight,
  Download,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
  Users,
  Landmark,
  DollarSign,
  Calendar,
} from "lucide-react";

interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
}

interface BudgetDocument {
  name: string;
  year: string;
  size: string;
  type: string;
}

const budgetSummary = {
  totalBudget: 2800000000000,
  totalRevenue: 2600000000000,
  totalExpenditure: 2750000000000,
  surplus: 50000000000,
  realization: 87.5,
  year: 2025,
};

const revenueCategories: BudgetCategory[] = [
  {
    name: "PAD",
    amount: 450000000000,
    percentage: 17.3,
    color: "bg-primary",
    icon: <Wallet size={18} />,
  },
  {
    name: "Dana Transfer",
    amount: 1800000000000,
    percentage: 69.2,
    color: "bg-blue-500",
    icon: <Building2 size={18} />,
  },
  {
    name: "Lain-lain Pendapatan",
    amount: 350000000000,
    percentage: 13.5,
    color: "bg-purple-500",
    icon: <DollarSign size={18} />,
  },
];

const expenditureCategories: BudgetCategory[] = [
  {
    name: "Belanja Pegawai",
    amount: 950000000000,
    percentage: 34.5,
    color: "bg-blue-500",
    icon: <Users size={18} />,
  },
  {
    name: "Belanja Barang/Jasa",
    amount: 680000000000,
    percentage: 24.7,
    color: "bg-primary",
    icon: <Building2 size={18} />,
  },
  {
    name: "Belanja Modal",
    amount: 520000000000,
    percentage: 18.9,
    color: "bg-purple-500",
    icon: <Landmark size={18} />,
  },
  {
    name: "Belanja Hibah",
    amount: 320000000000,
    percentage: 11.6,
    color: "bg-amber-500",
    icon: <Wallet size={18} />,
  },
  {
    name: "Belanja Lainnya",
    amount: 280000000000,
    percentage: 10.3,
    color: "bg-rose-500",
    icon: <DollarSign size={18} />,
  },
];

const quarterlyData = [
  {
    quarter: "Q1",
    budget: 687500000000,
    realization: 625000000000,
    percentage: 90.9,
  },
  {
    quarter: "Q2",
    budget: 687500000000,
    realization: 612500000000,
    percentage: 89.1,
  },
  {
    quarter: "Q3",
    budget: 687500000000,
    realization: 593750000000,
    percentage: 86.4,
  },
  {
    quarter: "Q4",
    budget: 687500000000,
    realization: 575000000000,
    percentage: 83.6,
  },
];

const budgetDocuments: BudgetDocument[] = [
  { name: "Perda APBD 2025", year: "2025", size: "5.8 MB", type: "PDF" },
  { name: "Ringkasan APBD 2025", year: "2025", size: "2.5 MB", type: "PDF" },
  { name: "Realisasi APBD Q4 2024", year: "2024", size: "3.2 MB", type: "PDF" },
  {
    name: "Perda Perubahan APBD 2024",
    year: "2024",
    size: "4.5 MB",
    type: "PDF",
  },
  { name: "Laporan Keuangan 2024", year: "2024", size: "8.1 MB", type: "PDF" },
  { name: "LKPD 2023", year: "2023", size: "12.3 MB", type: "PDF" },
];

const formatCurrency = (amount: number): string => {
  if (amount >= 1000000000000) {
    return `Rp ${(amount / 1000000000000).toFixed(2)} T`;
  }
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(0)} M`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

export default function APBDPage() {
  const [selectedYear, setSelectedYear] = useState("2025");

  return (
    <>
      <main className="bg-slate-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary to-teal-700 py-12 text-white">
          <div className="container mx-auto max-w-6xl px-4">
            <nav className="mb-4 flex items-center gap-2 text-sm text-primary-light">
              <Link href="/" className="hover:text-white">
                Beranda
              </Link>
              <ChevronRight size={14} />
              <Link href="/informasi-publik" className="hover:text-white">
                Informasi Publik
              </Link>
              <ChevronRight size={14} />
              <span className="text-white">APBD & Keuangan</span>
            </nav>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <BarChart3 size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Transparansi APBD</h1>
                <p className="text-primary-light">
                  Anggaran Pendapatan dan Belanja Daerah Kabupaten Naiera
                </p>
              </div>
            </div>

            {/* Year Selector */}
            <div className="mt-6 flex gap-2">
              {["2025", "2024", "2023"].map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    selectedYear === year
                      ? "bg-white text-primary-hover"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="py-8">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-lighter text-primary">
                    <Wallet size={20} />
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Total APBD
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {formatCurrency(budgetSummary.totalBudget)}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Tahun Anggaran {selectedYear}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <TrendingUp size={20} />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary">
                    <ArrowUpRight size={14} />
                    +5.2%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {formatCurrency(budgetSummary.totalRevenue)}
                </div>
                <p className="mt-1 text-sm text-slate-500">Total Pendapatan</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <TrendingDown size={20} />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
                    <ArrowDownRight size={14} />
                    98.2%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {formatCurrency(budgetSummary.totalExpenditure)}
                </div>
                <p className="mt-1 text-sm text-slate-500">Total Belanja</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <PieChart size={20} />
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    Realisasi
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {budgetSummary.realization}%
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-teal-500"
                    style={{ width: `${budgetSummary.realization}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="py-8">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Revenue Chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
                  <TrendingUp className="text-primary" size={20} />
                  Komposisi Pendapatan
                </h2>
                <div className="mb-6 flex h-8 overflow-hidden rounded-full">
                  {revenueCategories.map((cat, index) => (
                    <div
                      key={cat.name}
                      className={`${cat.color} transition-all hover:opacity-80`}
                      style={{ width: `${cat.percentage}%` }}
                      title={`${cat.name}: ${cat.percentage}%`}
                    />
                  ))}
                </div>
                <div className="space-y-4">
                  {revenueCategories.map((cat) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${cat.color} text-white`}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {cat.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {cat.percentage}%
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-800">
                        {formatCurrency(cat.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expenditure Chart */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
                  <TrendingDown className="text-rose-600" size={20} />
                  Komposisi Belanja
                </h2>
                <div className="mb-6 flex h-8 overflow-hidden rounded-full">
                  {expenditureCategories.map((cat) => (
                    <div
                      key={cat.name}
                      className={`${cat.color} transition-all hover:opacity-80`}
                      style={{ width: `${cat.percentage}%` }}
                      title={`${cat.name}: ${cat.percentage}%`}
                    />
                  ))}
                </div>
                <div className="space-y-4">
                  {expenditureCategories.map((cat) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${cat.color} text-white`}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {cat.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {cat.percentage}%
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-800">
                        {formatCurrency(cat.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quarterly Realization */}
        <section className="py-8">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
                <Calendar className="text-blue-600" size={20} />
                Realisasi per Triwulan
              </h2>
              <div className="grid gap-4 md:grid-cols-4">
                {quarterlyData.map((q) => (
                  <div
                    key={q.quarter}
                    className="rounded-xl border border-slate-200 p-4 transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-800">
                        {q.quarter}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          q.percentage >= 90
                            ? "bg-primary-light text-primary-hover"
                            : q.percentage >= 80
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {q.percentage}%
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-slate-500">Target</p>
                      <p className="font-semibold text-slate-700">
                        {formatCurrency(q.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Realisasi</p>
                      <p className="font-semibold text-primary">
                        {formatCurrency(q.realization)}
                      </p>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${
                          q.percentage >= 90
                            ? "bg-primary"
                            : q.percentage >= 80
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        }`}
                        style={{ width: `${q.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="py-8">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-800">
                <FileText className="text-purple-600" size={20} />
                Dokumen APBD
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {budgetDocuments.map((doc, index) => (
                  <a
                    key={index}
                    href="#"
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition-all hover:border-emerald-300 hover:bg-primary-lighter"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                        <FileText className="text-red-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{doc.name}</p>
                        <p className="text-xs text-slate-500">
                          {doc.type} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <Download className="text-slate-400" size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Info Banner */}
        <section className="py-8">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="rounded-2xl bg-gradient-to-r from-primary to-teal-600 p-8 text-white">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div>
                  <h3 className="mb-2 text-xl font-bold">
                    Butuh Data Lebih Detail?
                  </h3>
                  <p className="text-primary-light">
                    Ajukan permohonan informasi melalui PPID untuk mendapatkan
                    data APBD yang lebih lengkap
                  </p>
                </div>
                <Link
                  href="/informasi-publik/ppid"
                  className="shrink-0 rounded-xl bg-white px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary-lighter"
                >
                  Ajukan Permohonan PPID
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
