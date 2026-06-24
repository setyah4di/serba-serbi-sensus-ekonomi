// src/pages/MonitoringPml.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const MonitoringPml = () => {
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const kecamatanMap = {
    "010": "TUNGKAL ULU",
    "011": "MERLUNG",
    "012": "BATANG ASAM",
    "013": "TEBING TINGGI",
    "014": "RENAH MENDALUH",
    "015": "MUARA PAPALIK",
    "020": "PENGABUAN",
    "021": "SENYERANG",
    "030": "TUNGKAL ILIR",
    "031": "BRAM ITAM",
    "032": "SEBERANG KOTA",
    "040": "BETARA",
    "041": "KUALA BETARA",
  };

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const sheetId = "15LFgyVGKJ4Dd5-HBFk6HPrMn5j4vE43k";
      const sheetName = "rekap progress pendataan";
      const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${encodeURIComponent(
        sheetName
      )}`;

      const res = await axios.get(url);
      let text = res.data;
      text = text.substring(47, text.length - 2);
      const json = JSON.parse(text);
      const rows = json.table.rows;

      let currentKecamatan = "";
      let currentPml = "";
      const parsed = [];

      rows.forEach((row) => {
        let kecamatan = row.c?.[0]?.v ?? "";
        let pml = row.c?.[1]?.v ?? "";
        let pcl = row.c?.[2]?.v ?? "";
        let progressRaw = row.c?.[3]?.v ?? 0;

        if (kecamatan !== "") {
          currentKecamatan = kecamatan.toString();
        }
        if (pml !== "") {
          currentPml = pml;
        }

        if (!pcl) return;

        let progressValue = 0;
        if (typeof progressRaw === "string") {
          const trimmed = progressRaw.trim();
          if (trimmed.includes("%")) {
            progressValue = parseFloat(trimmed.replace(/%/g, "")) || 0;
          } else {
            progressValue = (parseFloat(trimmed) || 0) * 100;
          }
        } else {
          progressValue = (Number(progressRaw) || 0) * 100;
        }

        parsed.push({
          kecamatan: currentKecamatan,
          namaKecamatan: kecamatanMap[currentKecamatan] || currentKecamatan,
          pml: currentPml,
          pcl,
          progress: progressValue,
        });
      });

      const kecamatanGroup = {};
      parsed.forEach((item) => {
        const kec = item.namaKecamatan;
        if (!kecamatanGroup[kec]) {
          kecamatanGroup[kec] = {};
        }
        if (!kecamatanGroup[kec][item.pml]) {
          kecamatanGroup[kec][item.pml] = {
            pml: item.pml,
            progressList: [],
          };
        }
        kecamatanGroup[kec][item.pml].progressList.push(item.progress);
      });

      const result = [];
      Object.keys(kecamatanGroup)
        .sort()
        .forEach((kecamatan) => {
          const pmlData = Object.values(kecamatanGroup[kecamatan]);
          const totalPcl = pmlData.reduce(
            (a, b) => a + b.progressList.length,
            0
          );

          pmlData.forEach((pml) => {
            const max = Math.max(...pml.progressList);
            const min = Math.min(...pml.progressList);
            const avg =
              pml.progressList.reduce((a, b) => a + b, 0) /
              pml.progressList.length;

            result.push({
              type: "pml",
              kecamatan: kecamatan,
              pml: pml.pml,
              jumlahPpl: pml.progressList.length,
              max: max.toFixed(2),
              min: min.toFixed(2),
              avg: avg.toFixed(2),
            });
          });

          result.push({
            type: "total",
            kecamatan: kecamatan,
            jumlahPpl: totalPcl,
          });
        });

      setMonitoring(result);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // FILTER
  const getFilteredData = () => {
    if (!searchTerm.trim()) return monitoring;

    const term = searchTerm.toLowerCase().trim();
    const filtered = [];
    let i = 0;
    while (i < monitoring.length) {
      const row = monitoring[i];
      if (row.type === "pml") {
        const kecMatch = row.kecamatan.toLowerCase().includes(term);
        const pmlMatch = row.pml.toLowerCase().includes(term);
        if (kecMatch || pmlMatch) {
          const kec = row.kecamatan;
          while (i < monitoring.length && monitoring[i].kecamatan === kec) {
            filtered.push(monitoring[i]);
            i++;
          }
        } else {
          i++;
        }
      } else {
        i++;
      }
    }
    return filtered;
  };

  const filteredData = getFilteredData();

  // EXPORT EXCEL
  const exportToExcel = () => {
    const excelRows = [];
    excelRows.push(["KECAMATAN", "PML", "JUMLAH PPL", "MAX %", "MIN %", "RATA-RATA %"]);

    filteredData.forEach((row) => {
      if (row.type === "pml") {
        excelRows.push([row.kecamatan, row.pml, row.jumlahPpl, row.max, row.min, row.avg]);
      } else {
        excelRows.push([row.kecamatan, "TOTAL", row.jumlahPpl, "", "", ""]);
      }
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelRows);
    XLSX.utils.book_append_sheet(wb, ws, "Monitoring");
    XLSX.writeFile(wb, `Monitoring_PML_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mb-4"></div>
          <p className="text-orange-700 font-semibold text-lg">Memuat data...</p>
          <p className="text-gray-500 text-sm">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // STATISTIK
  const pmlRows = filteredData.filter((row) => row.type === "pml");
  const totalPml = pmlRows.length;
  const totalPcl = pmlRows.reduce((sum, row) => sum + row.jumlahPpl, 0);

  let avgProgress = 0;
  if (totalPcl > 0) {
    const totalWeighted = pmlRows.reduce(
      (sum, row) => sum + parseFloat(row.avg) * row.jumlahPpl,
      0
    );
    avgProgress = totalWeighted / totalPcl;
  }

  // --- BANGUN STRUKTUR TABEL DENGAN MERGE KECAMATAN ---
  // Kelompokkan data per kecamatan
  const grouped = [];
  let currentGroup = null;
  filteredData.forEach((row) => {
    if (!currentGroup || currentGroup.kecamatan !== row.kecamatan) {
      currentGroup = { kecamatan: row.kecamatan, rows: [] };
      grouped.push(currentGroup);
    }
    currentGroup.rows.push(row);
  });

  return (
    <div className="min-h-screen bg-orange-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto animate-fadeIn">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-orange-700">
            Dashboard Monitoring PML
          </h1>
          <div className="text-xs sm:text-sm text-gray-600 text-right">
            Data diperbarui pada {currentDate} pukul 07.00 WIB
          </div>
        </div>

        {/* SEARCH & EXPORT */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Cari kecamatan atau PML..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-orange-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-sm sm:text-base"
            />
          </div>
          <button
            onClick={exportToExcel}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2 rounded-lg shadow transition text-sm sm:text-base"
          >
            Export ke Excel
          </button>
        </div>

        {/* KARTU */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 border-l-8 border-orange-500">
            <div className="text-xs sm:text-sm text-gray-600">Jumlah PML</div>
            <div className="text-xl sm:text-2xl font-bold text-orange-800">{totalPml}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-8 border-orange-400">
            <div className="text-xs sm:text-sm text-gray-600">Jumlah PCL</div>
            <div className="text-xl sm:text-2xl font-bold text-orange-800">{totalPcl}</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-l-8 border-orange-600">
            <div className="text-xs sm:text-sm text-gray-600">Rata-rata Progress (PML)</div>
            <div className="text-xl sm:text-2xl font-bold text-orange-800">{avgProgress.toFixed(2)}%</div>
          </div>
        </div>

        {/* TABEL */}
        <div className="bg-white rounded-xl shadow overflow-hidden border border-orange-200">
          <div className="overflow-x-auto">
<table className="w-full border-collapse table-auto">
               <thead>
  <tr className="bg-orange-700 text-white">
    <th
      rowSpan={2}
      className="w-[18%] border border-orange-500 p-3"
    >
      KECAMATAN
    </th>

    <th
      rowSpan={2}
      className="w-[28%] border border-orange-500 p-3"
    >
      PML
    </th>

    <th
      rowSpan={2}
      className="w-[12%] border border-orange-500 p-3"
    >
      JUMLAH PPL
    </th>

    <th
      colSpan={3}
      className="border border-orange-500 p-3"
    >
      PROGRESS
    </th>
  </tr>

  <tr className="bg-orange-700 text-white">
    <th className="w-[14%] border border-orange-500">
      MAX
    </th>

    <th className="w-[14%] border border-orange-500">
      MIN
    </th>

    <th className="w-[14%] border border-orange-500">
      RATA-RATA
    </th>
  </tr>
</thead>
            <tbody>
  {grouped.map((group, groupIndex) => {
    const pmlRows = group.rows.filter(
      (row) => row.type === "pml"
    );

    const totalRow = group.rows.find(
      (row) => row.type === "total"
    );

    const rowSpanCount = pmlRows.length + 1;

    return (
      <React.Fragment key={groupIndex}>
        {pmlRows.map((row, idx) => (
          <tr
            key={`${groupIndex}-${idx}`}
            className="hover:bg-orange-50"
          >
            {idx === 0 && (
              <td
                rowSpan={rowSpanCount}
                className="border border-orange-300 p-3 font-semibold bg-orange-100 align-middle"
              >
                {group.kecamatan}
              </td>
            )}

            <td className="border border-orange-300 px-4 py-2">
              {row.pml}
            </td>

            <td className="border border-orange-300 text-center">
              {row.jumlahPpl}
            </td>

            <td className="border border-orange-300 text-center">
              {row.max}%
            </td>

            <td className="border border-orange-300 text-center">
              {row.min}%
            </td>

            <td className="border border-orange-300 text-center font-semibold text-orange-700">
              {row.avg}%
            </td>
          </tr>
        ))}

    {totalRow && (
  <tr className="bg-orange-100 font-bold">
    <td
      className="border border-orange-300 text-center text-orange-800"
    >
      TOTAL
    </td>

    <td
      className="border border-orange-300 text-center text-orange-800"
    >
      {totalRow.jumlahPpl}
    </td>

    <td className="border border-orange-300"></td>

    <td className="border border-orange-300"></td>

    <td className="border border-orange-300"></td>
  </tr>
)}
      </React.Fragment>
    );
  })}

  {filteredData.length === 0 && (
    <tr>
      <td
        colSpan="6"
        className="p-4 text-center text-gray-500"
      >
        Tidak ada data yang sesuai
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS animasi fade-in
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default MonitoringPml;