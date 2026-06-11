'use client';

import { useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, Download, FileText, Table } from 'lucide-react';
import * as api from '../services/api';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export default function ContactImport({ onClose, onSuccess }) {
    const [dragging, setDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (file) => {
        if (!file) return;
        const validExtensions = ['.json', '.csv', '.xls', '.xlsx'];
        const fileName = file.name.toLowerCase();
        if (validExtensions.some(ext => fileName.endsWith(ext))) {
            setFile(file);
            setError(null);
        } else {
            setError('Por favor, envie um arquivo válido (JSON, CSV ou Excel).');
        }
    };

    const parseFile = (file) => {
        return new Promise((resolve, reject) => {
            const fileName = file.name.toLowerCase();
            const reader = new FileReader();

            if (fileName.endsWith('.json')) {
                reader.onload = (e) => {
                    try {
                        resolve(JSON.parse(e.target.result));
                    } catch (err) {
                        reject(new Error('Erro ao processar o arquivo JSON.'));
                    }
                };
                reader.readAsText(file);
            } else if (fileName.endsWith('.csv')) {
                Papa.parse(file, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        resolve(results.data);
                    },
                    error: (err) => {
                        reject(new Error('Erro ao processar o arquivo CSV.'));
                    }
                });
            } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);
                        resolve(jsonData);
                    } catch (err) {
                        reject(new Error('Erro ao processar o arquivo Excel.'));
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                reject(new Error('Formato de arquivo não suportado.'));
            }
        });
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);

        try {
            const rawData = await parseFile(file);
            
            if (!Array.isArray(rawData)) {
                throw new Error('O arquivo deve conter uma lista de contatos.');
            }
            
            // Map common column names to our schema
            const mappedContacts = rawData.map(row => {
                // Normalize keys (case insensitive, trimmed)
                const normalizedRow = {};
                Object.keys(row).forEach(key => {
                    normalizedRow[key.toLowerCase().trim()] = row[key];
                });

                return {
                    name: normalizedRow.name || normalizedRow.nome || normalizedRow['nome completo'] || '',
                    phone: String(normalizedRow.phone || normalizedRow.telefone || normalizedRow.celular || '').replace(/\D/g, ''),
                    interests: normalizedRow.interests || normalizedRow.interesses 
                        ? (typeof (normalizedRow.interests || normalizedRow.interesses) === 'string' 
                            ? (normalizedRow.interests || normalizedRow.interesses).split(',').map(i => i.trim())
                            : [normalizedRow.interests || normalizedRow.interesses])
                        : []
                };
            }).filter(c => c.name && c.phone);
            
            if (mappedContacts.length === 0) {
                throw new Error('Nenhum contato válido encontrado. Certifique-se de que as colunas Nome e Telefone existem.');
            }

            await api.importWhatsAppContacts(mappedContacts);
            onSuccess();
        } catch (err) {
            setError(err.message || 'Erro ao importar contatos.');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = () => {
        if (!file) return <Upload className="w-12 h-12 text-zinc-300 mb-4" />;
        const name = file.name.toLowerCase();
        if (name.endsWith('.json')) return <FileText className="w-12 h-12 text-orange-500 mb-4" />;
        if (name.endsWith('.csv')) return <FileText className="w-12 h-12 text-blue-500 mb-4" />;
        return <Table className="w-12 h-12 text-green-500 mb-4" />;
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in border border-zinc-200 dark:border-zinc-800">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">📥 Importar Contatos</h3>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                            <X className="w-5 h-5 text-zinc-500" />
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-6 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <div className="flex items-center gap-3">
                            <Download className="w-5 h-5 text-indigo-600" />
                            <div>
                                <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-tighter">Precisa de ajuda?</p>
                                <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">Baixe o modelo pronto para importar.</p>
                            </div>
                        </div>
                        <a 
                            href="/modelo_contatos.csv" 
                            download="modelo_contatos.csv"
                            className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-xl text-[10px] font-bold text-indigo-600 shadow-sm hover:scale-105 transition-all border border-indigo-100 dark:border-zinc-700"
                        >
                            DOWNLOAD
                        </a>
                    </div>

                    <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all ${
                            dragging ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-zinc-200 dark:border-zinc-800'
                        }`}
                    >
                        {file ? (
                            <div className="flex flex-col items-center text-center">
                                {getFileIcon()}
                                <p className="text-sm font-bold text-zinc-900 dark:text-white">{file.name}</p>
                                <p className="text-xs text-zinc-500 mt-1 font-medium">{(file.size / 1024).toFixed(2)} KB</p>
                                <button onClick={() => setFile(null)} className="mt-4 text-[10px] font-bold text-red-500 hover:underline">Remover arquivo</button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-zinc-300 mb-4" />
                                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 text-center tracking-tight">Arraste seu arquivo JSON, CSV ou Excel aqui</p>
                                <p className="text-xs text-zinc-400 mt-2 font-medium">ou</p>
                                <label className="mt-4 px-6 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-bold text-zinc-900 dark:text-white cursor-pointer hover:bg-zinc-200 transition-all border border-zinc-200 dark:border-zinc-700">
                                    Selecionar arquivo
                                    <input type="file" accept=".json,.csv,.xls,.xlsx" onChange={handleFileSelect} className="hidden" />
                                </label>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-medium border border-red-100 dark:border-red-900/20">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 mt-8">
                        <button 
                            disabled={!file || loading}
                            onClick={handleImport}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Começar Importação'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
