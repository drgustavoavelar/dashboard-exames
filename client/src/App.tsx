import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Activity,
  Calendar,
  AlertCircle,
  CheckCircle,
  Save,
  BarChart2,
  Upload,
  ArrowUpRight,
  Download,
  Database,
  FileSpreadsheet,
  Printer,
  Search,
  X,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ExamId = string | number;
type ExamStatus = "normal" | "altered";

type Exam = {
  id: ExamId;
  date: string;
  name: string;
  result: string;
  unit?: string;
  reference?: string;
  status?: ExamStatus;
  notes?: string;
};

type FormData = {
  date: string;
  name: string;
  result: string;
  unit: string;
  reference: string;
  status: ExamStatus;
  notes: string;
};

// Função auxiliar para gerar IDs únicos robustos
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

const STORAGE_KEY = "medical_exams_data";

const App: React.FC = () => {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState<"list" | "charts" | "data">(
    "list",
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Exam[];

        // Correção Automática: Garante IDs únicos
        const seenIds = new Set<ExamId>();
        return (Array.isArray(parsed) ? parsed : []).map((exam) => {
          let id = exam?.id;
          if (!id || seenIds.has(id)) id = generateId();
          seenIds.add(id);
          return { ...exam, id };
        });
      } catch (e) {
        console.error("Erro ao carregar dados salvos", e);
      }
    }

    // Dados iniciais de exemplo (você pode apagar se quiser)
    return [
      {
        id: 1,
        date: "2023-01-15",
        name: "Colesterol Total",
        result: "...",
        unit: "mg/dL",
        reference: "< 190",
        status: "normal",
        notes: "Início do ano",
      },
      {
        id: 2,
        date: "2023-06-20",
        name: "Colesterol Total",
        result: "210",
        unit: "mg/dL",
        reference: "< 190",
        status: "altered",
        notes: "Ajustar dieta",
      },
      {
        id: 3,
        date: "2024-01-12",
        name: "Colesterol Total",
        result: "178",
        unit: "mg/dL",
        reference: "< 190",
        status: "normal",
        notes: "Melhora",
      },
      {
        id: 4,
        date: "2024-01-12",
        name: "Glicose",
        result: "92",
        unit: "mg/dL",
        reference: "70 - 99",
        status: "normal",
        notes: "",
      },
      {
        id: 5,
        date: "2024-07-10",
        name: "Glicose",
        result: "105",
        unit: "mg/dL",
        reference: "70 - 99",
        status: "altered",
        notes: "Rever hábitos",
      },
    ];
  });

  const [formData, setFormData] = useState<FormData>({
    date: "",
    name: "",
    result: "",
    unit: "",
    reference: "",
    status: "normal",
    notes: "",
  });

  const [importJson, setImportJson] = useState<string>("");
  const [selectedExamType, setSelectedExamType] = useState<string>("");

  // --- EFEITOS ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    if (!selectedExamType && exams.length > 0) {
      const types = [...new Set(exams.map((e) => e.name))];
      if (types.length > 0) setSelectedExamType(types[0]);
    }
  }, [exams, selectedExamType]);

  // --- HANDLERS ---
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }) as FormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) return;

    const newExam: Exam = { id: generateId(), ...formData };
    setExams((prev) => [newExam, ...prev]);
    setFormData({
      date: "",
      name: "",
      result: "",
      unit: "",
      reference: "",
      status: "normal",
      notes: "",
    });
  };

  const deleteExam = (id: ExamId) => {
    setExams((prev) => prev.filter((exam) => exam.id !== id));
  };

  const processImport = (parsed: unknown) => {
    const newData = Array.isArray(parsed) ? parsed : [parsed];
    const formattedData: Exam[] = newData.filter(Boolean).map((item: any) => ({
      ...item,
      id: generateId(),
      notes: item?.notes || "",
      status: item?.status === "altered" ? "altered" : "normal",
      unit: item?.unit || "",
      reference: item?.reference || "",
      result: String(item?.result ?? ""),
      date: String(item?.date ?? ""),
      name: String(item?.name ?? ""),
    }));

    setExams((prev) => [...formattedData, ...prev]);
    setImportJson("");
    setActiveTab("list");
    alert(`Sucesso! ${formattedData.length} exames importados.`);
  };

  const handleImport = () => {
    try {
      const jsonString = importJson.trim();
      if (!jsonString) throw new Error("Cole um JSON válido.");

      // Tentativa 1: JSON puro
      try {
        const parsed = JSON.parse(jsonString);
        processImport(parsed);
        return;
      } catch {
        // continua
      }

      // Tentativa 2: Busca Inteligente (recorta entre [ e ])
      const firstBracket = jsonString.indexOf("[");
      const lastBracket = jsonString.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1) {
        const cleaned = jsonString.substring(firstBracket, lastBracket + 1);
        const parsed = JSON.parse(cleaned);
        processImport(parsed);
        return;
      }

      throw new Error("Não encontrei dados válidos.");
    } catch (error: any) {
      alert(`Não foi possível ler os dados. ${error?.message || ""}`.trim());
    }
  };

  const exportJson = () => {
    const dataStr = JSON.stringify(exams, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "exames.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const header = [
      "date",
      "name",
      "result",
      "unit",
      "reference",
      "status",
      "notes",
    ];
    const rows = exams.map((e) => [
      e.date || "",
      e.name || "",
      e.result || "",
      e.unit || "",
      e.reference || "",
      e.status || "normal",
      e.notes || "",
    ]);

    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => escape(String(cell))).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "exames.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const printPage = () => window.print();

  // --- DADOS DERIVADOS ---
  const filteredExams = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return exams;

    return exams.filter((e) => {
      const haystack = [
        e.name,
        e.date,
        e.result,
        e.unit,
        e.reference,
        e.status,
        e.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [exams, searchTerm]);

  const chartData = useMemo(() => {
    if (!selectedExamType) return [];

    return exams
      .filter((e) => e.name === selectedExamType)
      .filter((e) => e.date && e.result)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((e) => ({
        date: new Date(e.date).toLocaleDateString("pt-BR"),
        valor: parseFloat(String(e.result).replace(",", ".")),
        original: e,
      }))
      .filter((e) => !Number.isNaN(e.valor));
  }, [exams, selectedExamType]);

  const uniqueExamTypes = useMemo(
    () => [...new Set(exams.map((e) => e.name))].sort(),
    [exams],
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800 print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white border border-slate-200">
              <Activity className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">
                Dashboard de Exames
              </h1>
              <p className="text-sm text-slate-500">
                Registre, filtre e visualize evolução.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportJson}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
              type="button"
            >
              <Download size={16} /> Exportar JSON
            </button>

            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
              type="button"
            >
              <FileSpreadsheet size={16} /> Exportar CSV
            </button>

            <button
              onClick={printPage}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
              type="button"
            >
              <Printer size={16} /> Imprimir
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
          <div className="flex flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className={`flex-1 px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 ${
                activeTab === "list"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              <FileText size={16} /> Lista
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("charts")}
              className={`flex-1 px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 ${
                activeTab === "charts"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              <BarChart2 size={16} /> Gráficos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("data")}
              className={`flex-1 px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 ${
                activeTab === "data"
                  ? "bg-blue-50 text-blue-700"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              <Database size={16} /> Importar/Backup
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        {activeTab === "list" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="text-blue-600" /> Novo exame
              </h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-500">Data</label>
                  <div className="mt-1 relative">
                    <Calendar
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Nome do exame
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex.: Glicose, TSH, Colesterol..."
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Resultado</label>
                    <input
                      type="text"
                      name="result"
                      value={formData.result}
                      onChange={handleInputChange}
                      placeholder="Ex.: 92"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Unidade</label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="mg/dL"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Referência</label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleInputChange}
                      placeholder="70 - 99"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="altered">Alterado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-500">Observações</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Anotações..."
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <Save size={16} /> Salvar exame
                </button>
              </form>
            </div>

            {/* Lista */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold flex-1">
                  Exames cadastrados
                </h2>

                <div className="relative flex-1 md:w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Buscar ou comparar exame..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Limpar busca"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {filteredExams.length === 0 ? (
                <div className="text-sm text-slate-500">
                  Nenhum exame encontrado.
                </div>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="text-left py-2 pr-2">Data</th>
                        <th className="text-left py-2 pr-2">Exame</th>
                        <th className="text-left py-2 pr-2">Resultado</th>
                        <th className="text-left py-2 pr-2">Ref.</th>
                        <th className="text-left py-2 pr-2">Status</th>
                        <th className="text-right py-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams.map((exam) => {
                        const isAltered = exam.status === "altered";
                        return (
                          <tr
                            key={String(exam.id)}
                            className="border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="py-2 pr-2 whitespace-nowrap">
                              {exam.date
                                ? new Date(exam.date).toLocaleDateString(
                                    "pt-BR",
                                  )
                                : ""}
                            </td>
                            <td className="py-2 pr-2">{exam.name}</td>
                            <td className="py-2 pr-2">
                              <span className="font-medium">
                                {exam.result || ""}
                              </span>{" "}
                              <span className="text-slate-500">
                                {exam.unit || ""}
                              </span>
                              {exam.notes ? (
                                <div className="text-xs text-slate-500 mt-1">
                                  {exam.notes}
                                </div>
                              ) : null}
                            </td>
                            <td className="py-2 pr-2 text-slate-500">
                              {exam.reference || ""}
                            </td>
                            <td className="py-2 pr-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                                  isAltered
                                    ? "bg-red-50 text-red-700"
                                    : "bg-green-50 text-green-700"
                                }`}
                              >
                                {isAltered ? (
                                  <AlertCircle size={14} />
                                ) : (
                                  <CheckCircle size={14} />
                                )}
                                {isAltered ? "Alterado" : "Normal"}
                              </span>
                            </td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => deleteExam(exam.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-800"
                              >
                                <Trash2 size={14} /> Excluir
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "charts" && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold flex-1 flex items-center gap-2">
                <BarChart2 className="text-blue-600" /> Evolução por exame
              </h2>

              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Selecione um exame...</option>
                {uniqueExamTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {selectedExamType && chartData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="valor" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                Selecione um exame e garanta que haja resultados numéricos para
                plotar.
              </div>
            )}
          </div>
        )}

        {activeTab === "data" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Import */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Upload className="text-blue-600" /> Importar JSON
              </h2>

              <p className="text-sm text-slate-500 mb-3">
                Cole aqui um JSON de exames (array ou objeto).
              </p>

              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Cole o código JSON aqui..."
                className="w-full h-44 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />

              <button
                type="button"
                onClick={handleImport}
                className="mt-3 inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                <ArrowUpRight size={16} /> Importar
              </button>
            </div>

            {/* Backup */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Database className="text-blue-600" /> Backup
              </h2>

              <p className="text-sm text-slate-500 mb-4">
                Seus dados ficam no navegador (localStorage). Exporte para não
                perder.
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={exportJson}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                  type="button"
                >
                  <Download size={16} /> Exportar JSON
                </button>
                <button
                  onClick={exportCsv}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                  type="button"
                >
                  <FileSpreadsheet size={16} /> Exportar CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
