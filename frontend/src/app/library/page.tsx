'use client';

import React, { useState } from 'react';
import { Folder, FileText, Search, Plus, Download, Trash2, X, Upload, Eye } from 'lucide-react';
import Header from '@/components/Header';

interface LibraryFolder {
  id: string;
  name: string;
  count: number;
  size: string;
}

interface LibraryFile {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  folderId: string;
  fileObject?: File;
}

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const [folders, setFolders] = useState<LibraryFolder[]>([
    { id: '1', name: 'Math Worksheets', count: 2, size: '460 KB' },
    { id: '2', name: 'Physics Lab Guides', count: 1, size: '140 KB' },
    { id: '3', name: 'Chemistry Schemes', count: 1, size: '1.1 MB' },
    { id: '4', name: 'Grading Rubrics', count: 0, size: '0 KB' },
  ]);

  const [files, setFiles] = useState<LibraryFile[]>([
    { id: 'f1', name: 'Algebra_Practice_Set.pdf', type: 'PDF', size: '320 KB', date: 'Yesterday', folderId: '1' },
    { id: 'f2', name: 'Geometry_Review.pdf', type: 'PDF', size: '140 KB', date: 'Yesterday', folderId: '1' },
    { id: 'f3', name: 'Lab_Report_Template.docx', type: 'DOCX', size: '140 KB', date: '3 days ago', folderId: '2' },
    { id: 'f4', name: 'Periodic_Table_Guide.pdf', type: 'PDF', size: '1.1 MB', date: '1 week ago', folderId: '3' },
  ]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newFileFolder, setNewFileFolder] = useState('1');
  const [newFolderName, setNewFolderName] = useState('');

  const [viewingFile, setViewingFile] = useState<LibraryFile | null>(null);

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder: LibraryFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      count: 0,
      size: '0 KB'
    };

    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setIsFolderOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUploadFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE';
    const sizeText = formatBytes(selectedFile.size);

    const newFile: LibraryFile = {
      id: Date.now().toString(),
      name: selectedFile.name,
      type: ext,
      size: sizeText,
      date: 'Just now',
      folderId: newFileFolder,
      fileObject: selectedFile
    };

    setFiles([newFile, ...files]);
    setSelectedFolderId(newFileFolder);

    // Update folder count
    setFolders(folders.map(f => {
      if (f.id === newFileFolder) {
        return {
          ...f,
          count: f.count + 1,
          size: f.size === '0 KB' ? sizeText : 'Updated'
        };
      }
      return f;
    }));

    setSelectedFile(null);
    setIsUploadOpen(false);
  };

  const handleDeleteFile = (id: string, folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this file?')) {
      setFiles(files.filter(f => f.id !== id));
      setFolders(folders.map(f => {
        if (f.id === folderId) {
          return {
            ...f,
            count: Math.max(0, f.count - 1)
          };
        }
        return f;
      }));
    }
  };

  const handleOpenFile = (file: LibraryFile) => {
    if (file.fileObject) {
      const fileUrl = URL.createObjectURL(file.fileObject);
      window.open(fileUrl, '_blank');
    } else {
      setViewingFile(file);
    }
  };

  const handleDownloadFile = (file: LibraryFile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (file.fileObject) {
      const element = document.createElement("a");
      element.href = URL.createObjectURL(file.fileObject);
      element.download = file.name;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // Mock download for pre-populated files
      const element = document.createElement("a");
      const fileContent = `Mock Content of ${file.name}\nGenerated standard school syllabus outline guides.`;
      const fileBlob = new Blob([fileContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(fileBlob);
      element.download = file.name.endsWith('.pdf') ? file.name.replace('.pdf', '.txt') : file.name;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const getMockFileBody = (file: LibraryFile) => {
    if (file.name.includes('Algebra')) {
      return (
        <div className="space-y-4 font-serif">
          <h4 className="text-center font-bold text-lg mb-6 border-b pb-2">Algebra Practice Set - Chapter 3</h4>
          <p className="text-xs text-slate-500 font-sans italic mb-4">Grade 10 • Algebra Cohort</p>
          <p className="font-semibold">Solve the following equations for x:</p>
          <ol className="list-decimal pl-5 space-y-3">
            <li>3x + 12 = 48</li>
            <li>x² - 5x + 6 = 0</li>
            <li>2(x - 3) + 4x = 18</li>
            <li>Find the slope of the line passing through coordinates (2, 5) and (6, 13).</li>
          </ol>
        </div>
      );
    }
    if (file.name.includes('Geometry')) {
      return (
        <div className="space-y-4 font-serif">
          <h4 className="text-center font-bold text-lg mb-6 border-b pb-2">Geometry Exam Review Questions</h4>
          <p className="text-xs text-slate-500 font-sans italic mb-4">Grade 10 • Geometry Cohort</p>
          <ol className="list-decimal pl-5 space-y-3">
            <li>Find the area of a circle with a radius of 7 cm. (Use π = 3.14).</li>
            <li>Calculate the hypotenuse of a right-angled triangle with sides 6 cm and 8 cm.</li>
            <li>Explain the difference between complementary and supplementary angles.</li>
          </ol>
        </div>
      );
    }
    if (file.name.includes('Periodic')) {
      return (
        <div className="space-y-4 font-serif">
          <h4 className="text-center font-bold text-lg mb-6 border-b pb-2">Periodic Table reference Sheet</h4>
          <p className="text-xs text-slate-500 font-sans italic mb-4">Grade 9 • Chemistry Cohort</p>
          <p className="font-semibold">Atomic Number and Electronic Configuration Notes:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>**Hydrogen (H)**: Atomic Number 1, Configuration: 1s¹</li>
            <li>**Helium (He)**: Atomic Number 2, Configuration: 1s²</li>
            <li>**Lithium (Li)**: Atomic Number 3, Configuration: [He] 2s¹</li>
            <li>**Carbon (C)**: Atomic Number 6, Configuration: [He] 2s² 2p²</li>
          </ul>
        </div>
      );
    }
    return (
      <div className="space-y-4 font-serif">
        <h4 className="text-center font-bold text-lg mb-6 border-b pb-2">{file.name}</h4>
        <p className="text-xs text-slate-500 font-sans italic mb-4">Class Outline Template</p>
        <p>This is a standard template file preview.</p>
        <p className="leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam id finibus elit. Proin elementum erat vel tellus dapibus sollicitudin.</p>
      </div>
    );
  };

  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolderId ? f.folderId === selectedFolderId : true;
    return matchesSearch && matchesFolder;
  });

  return (
    <>
      <Header />
      <main className="flex-1 px-2.5 py-4 md:p-8 overflow-y-auto relative pb-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
            </div>
            <div>
              <h2 className="text-[22px] font-bold text-slate-800 leading-tight">My Library</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Organize your educational materials, syllabus guides, and reference documents.</p>
            </div>
          </div>

          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsFolderOpen(true)}
              className="flex items-center justify-center gap-2 h-10 px-4 border border-slate-200 bg-white text-slate-700 rounded-full text-xs font-bold hover:bg-slate-50 transition"
            >
              <Plus className="w-4 h-4" />
              New Folder
            </button>
            <button
              onClick={() => {
                setSelectedFile(null);
                setIsUploadOpen(true);
              }}
              className="flex items-center justify-center gap-2 h-10 px-5 bg-[#111] text-white rounded-full text-xs font-bold hover:bg-slate-900 transition"
            >
              <Plus className="w-4 h-4" />
              Upload File
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-3 flex justify-between items-center gap-3 shadow-sm mb-8">
          <div className="relative w-full sm:w-auto flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Library Assets"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-full text-xs font-semibold w-full sm:w-64 focus:outline-none focus:border-slate-300 text-slate-800"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider">Folders</h3>
          {selectedFolderId && (
            <button
              onClick={() => setSelectedFolderId(null)}
              className="text-xs font-bold text-[#ff4d00] hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {filteredFolders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => setSelectedFolderId(selectedFolderId === folder.id ? null : folder.id)}
              className={`border rounded-[24px] p-5 shadow-sm hover:shadow-md transition cursor-pointer ${
                selectedFolderId === folder.id ? 'border-[#ff4d00] bg-orange-50/10' : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 rounded-2xl">
                  <Folder className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">{folder.name}</h4>
              <p className="text-[10px] text-slate-400 font-semibold">{folder.count} Files • {folder.size}</p>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider mb-4">
          {selectedFolderId ? `Files in ${folders.find(f => f.id === selectedFolderId)?.name}` : 'Recent Files'}
        </h3>

        {filteredFiles.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[32px] p-12 text-center text-slate-400 font-medium">
            No files found in this category.
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">File Name</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Type</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Size</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Uploaded</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-extrabold text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.id}
                      onClick={() => handleOpenFile(file)}
                      className="hover:bg-slate-50/50 transition cursor-pointer group"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#ff4d00] transition" />
                        <span className="truncate max-w-[200px] sm:max-w-xs group-hover:text-[#ff4d00] transition">{file.name}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{file.type}</td>
                      <td className="px-6 py-4 text-slate-500">{file.size}</td>
                      <td className="px-6 py-4 text-slate-500">{file.date}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => handleDownloadFile(file, e)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteFile(file.id, file.folderId, e)}
                            className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-red-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isFolderOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleCreateFolder} className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setIsFolderOpen(false)}
                className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-slate-800 mb-4">Create New Folder</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Folder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Quizzes"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-300 text-slate-800"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-[#111] text-white rounded-full text-xs font-bold hover:bg-slate-900 transition mt-4">
                  Save Folder
                </button>
              </div>
            </form>
          </div>
        )}

        {isUploadOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleUploadFile} className="bg-white rounded-[32px] max-w-sm w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-slate-800 mb-4">Upload Asset File</h3>
              
              <div className="space-y-4">
                <input
                  type="file"
                  id="library-file-input"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {!selectedFile ? (
                  <div
                    onClick={() => document.getElementById('library-file-input')?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition cursor-pointer flex flex-col items-center justify-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-slate-400" />
                    <p className="text-xs font-bold text-slate-600">Click to choose or drag file</p>
                    <p className="text-[10px] text-slate-400">PDF, DOCX, TXT up to 50MB</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-5 h-5 text-slate-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400">{formatBytes(selectedFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {selectedFile && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Select Folder Destination</label>
                      <select
                        value={newFileFolder}
                        onChange={(e) => setNewFileFolder(e.target.value)}
                        className="w-full px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-slate-300 text-slate-800 bg-white"
                      >
                        {folders.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="w-full py-3 bg-[#111] text-white rounded-full text-xs font-bold hover:bg-slate-900 transition mt-4">
                      Add to Library
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        )}

        {viewingFile && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] max-w-2xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
              <button
                onClick={() => setViewingFile(null)}
                className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-slate-600 rounded-full bg-slate-50 hover:bg-slate-100 transition z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-4 shrink-0 pr-10">
                <FileText className="w-5 h-5 text-[#ff4d00]" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{viewingFile.name}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">{viewingFile.size} • Mock Preview</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-100/50 border border-slate-200/60 rounded-2xl p-6 mb-6">
                <div className="bg-white shadow-sm border border-slate-100 rounded-xl p-6 min-h-[350px]">
                  {getMockFileBody(viewingFile)}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 shrink-0">
                <button
                  onClick={() => setViewingFile(null)}
                  className="px-5 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-full text-xs font-bold transition"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadFile(viewingFile)}
                  className="flex items-center gap-2 h-10 px-6 bg-[#ff4d00] hover:bg-[#e04400] text-white rounded-full text-xs font-bold transition"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
