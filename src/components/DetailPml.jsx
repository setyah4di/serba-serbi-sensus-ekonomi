// src/components/DetailPml.jsx
// Modal detail untuk satu PML: menampilkan total agregat seluruh PCL
// di bawah naungannya + rincian per PCL (diakumulasi dari sheet "hasil gabungan")

import React from "react";

const DetailPml = ({ data, onClose }) => {
  if (!data) return null;

  const {
    pmlName,
    kecamatan,
    pclList,
    totalAssignment,
    approved,
    submitted,
    draft,
    rejected,
    open,
  } = data;

  // Progress PML = (Approved + Submitted) / Total Assignment
  const progress =
    totalAssignment > 0
      ? (((approved + submitted) / totalAssignment) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-xl leading-none"
            aria-label="Tutup"
          >
            ✕
          </button>

          <div className="text-xs font-semibold tracking-wide text-orange-100 mb-1">
            DETAIL PML
          </div>
          <div className="text-2xl font-bold mb-3 pr-8">{pmlName}</div>

          <div className="flex items-center gap-2 text-sm text-orange-100 mb-3">
            <span>Kecamatan:</span>
            <span className="font-semibold text-white">{kecamatan}</span>
            <span className="mx-1">•</span>
            <span>Jumlah PCL:</span>
            <span className="font-semibold text-white">{pclList.length}</span>
          </div>

          <div className="flex justify-between items-center text-sm mb-1">
            <span>Progress</span>
            <span className="font-bold text-lg">{progress}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${Math.min(parseFloat(progress) || 0, 100)}%` }}
            />
          </div>
        </div>

        {/* BODY (scrollable) */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STAT CARDS - total gabungan seluruh PCL di bawah PML ini */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gray-100 rounded-xl p-3">
              <div className="text-xs text-gray-600">📋 Total Assignment</div>
              <div className="text-xl font-bold text-gray-800">{totalAssignment}</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <div className="text-xs text-green-700">✅ Approved</div>
              <div className="text-xl font-bold text-green-700">{approved}</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <div className="text-xs text-blue-700">📤 Submitted</div>
              <div className="text-xl font-bold text-blue-700">{submitted}</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3">
              <div className="text-xs text-yellow-700">📝 Draft</div>
              <div className="text-xl font-bold text-yellow-700">{draft}</div>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <div className="text-xs text-red-700">❌ Rejected</div>
              <div className="text-xl font-bold text-red-700">{rejected}</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3">
              <div className="text-xs text-purple-700">🔓 Open</div>
              <div className="text-xl font-bold text-purple-700">{open}</div>
            </div>
          </div>

          {/* TABEL RINCIAN PER PCL - DESKTOP & TABLET */}
          <div className="text-xs font-semibold text-gray-500 mb-2">
            RINCIAN PER PCL ( TOTAL : {pclList.length} PCL )
          </div>
          <div className="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-left">
                    <th className="p-2">Nama PCL</th>
                    <th className="p-2 text-center">Total</th>
                    <th className="p-2 text-center">✅</th>
                    <th className="p-2 text-center">📤</th>
                    <th className="p-2 text-center">📝</th>
                    <th className="p-2 text-center">❌</th>
                    <th className="p-2 text-center">🔓</th>
                    <th className="p-2 text-center">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {pclList.map((pcl, idx) => {
                    const pclProgress =
                      pcl.totalAssignment > 0
                        ? (
                            ((pcl.approved + pcl.submitted) /
                              pcl.totalAssignment) *
                            100
                          ).toFixed(2)
                        : "0.00";
                    const progressColor =
                      pclProgress >= 75
                        ? "text-green-600"
                        : pclProgress >= 40
                        ? "text-orange-600"
                        : "text-red-600";

                    return (
                      <tr
                        key={idx}
                        className="border-t border-gray-100 hover:bg-orange-50"
                      >
                        <td className="p-2">{pcl.namaPpl}</td>
                        <td className="p-2 text-center font-semibold">
                          {pcl.totalAssignment}
                        </td>
                        <td className="p-2 text-center text-green-600">
                          {pcl.approved}
                        </td>
                        <td className="p-2 text-center text-blue-600">
                          {pcl.submitted}
                        </td>
                        <td className="p-2 text-center text-yellow-600">
                          {pcl.draft}
                        </td>
                        <td className="p-2 text-center text-red-600">
                          {pcl.rejected}
                        </td>
                        <td className="p-2 text-center text-purple-600">
                          {pcl.open}
                        </td>
                        <td
                          className={`p-2 text-center font-bold ${progressColor}`}
                        >
                          {pclProgress}%
                        </td>
                      </tr>
                    );
                  })}
                  {pclList.length === 0 && (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-gray-400">
                        Tidak ada data PCL untuk PML ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RINCIAN PER PCL - CARD, KHUSUS MOBILE */}
          <div className="md:hidden space-y-3">
            {pclList.map((pcl, idx) => {
              const pclProgress =
                pcl.totalAssignment > 0
                  ? (
                      ((pcl.approved + pcl.submitted) / pcl.totalAssignment) *
                      100
                    ).toFixed(2)
                  : "0.00";
              const progressColor =
                pclProgress >= 75
                  ? "text-green-600"
                  : pclProgress >= 40
                  ? "text-orange-600"
                  : "text-red-600";
              const barColor =
                pclProgress >= 75
                  ? "bg-green-500"
                  : pclProgress >= 40
                  ? "bg-orange-500"
                  : "bg-red-500";

              return (
                <div
                  key={idx}
                  className="border border-gray-100 rounded-xl p-3 bg-gray-50/60"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="font-semibold text-gray-800 text-sm truncate pr-2">
                      {pcl.namaPpl}
                    </p>
                    <span
                      className={`text-sm font-bold shrink-0 ${progressColor}`}
                    >
                      {pclProgress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all`}
                      style={{
                        width: `${Math.min(parseFloat(pclProgress) || 0, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center">
                    <div className="bg-white rounded-lg py-1.5">
                      <div className="text-[10px] text-gray-400">Total</div>
                      <div className="text-sm font-bold text-gray-700">
                        {pcl.totalAssignment}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg py-1.5">
                      <div className="text-[10px] text-green-600">
                        ✅ Approved
                      </div>
                      <div className="text-sm font-bold text-green-700">
                        {pcl.approved}
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg py-1.5">
                      <div className="text-[10px] text-blue-600">
                        📤 Submit
                      </div>
                      <div className="text-sm font-bold text-blue-700">
                        {pcl.submitted}
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg py-1.5">
                      <div className="text-[10px] text-yellow-600">
                        📝 Draft
                      </div>
                      <div className="text-sm font-bold text-yellow-700">
                        {pcl.draft}
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg py-1.5">
                      <div className="text-[10px] text-red-600">
                        ❌ Reject
                      </div>
                      <div className="text-sm font-bold text-red-700">
                        {pcl.rejected}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg py-1.5">
                      <div className="text-[10px] text-purple-600">
                        🔓 Open
                      </div>
                      <div className="text-sm font-bold text-purple-700">
                        {pcl.open}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {pclList.length === 0 && (
              <div className="text-center text-gray-400 text-sm py-6">
                Tidak ada data PCL untuk PML ini
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailPml;
