import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { db } from '../db/database';
import type { QCSession } from '../db/database';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<QCSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<QCSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [searchTerm, sessions]);

  const loadSessions = async () => {
    const allSessions = await db.sessions.orderBy('createdAt').reverse().toArray();
    setSessions(allSessions);
  };

  const filterSessions = () => {
    if (!searchTerm) {
      setFilteredSessions(sessions);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = sessions.filter(
      (session) =>
        session.hospital.toLowerCase().includes(term) ||
        session.model.toLowerCase().includes(term) ||
        session.techName.toLowerCase().includes(term) ||
        session.date.includes(term)
    );
    setFilteredSessions(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this session?')) {
      await db.sessions.delete(id);
      loadSessions();
    }
  };

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Button onClick={() => navigate('/')} variant="secondary">
            ← Back to Dashboard
          </Button>
        </div>

        <Card>
          <h1 className="text-3xl font-bold mb-6">QC Session History</h1>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by hospital, model, technician, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {displayedSessions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No sessions found</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left">Date</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Hospital</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Model</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Technician</th>
                      <th className="border border-gray-300 px-4 py-3 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSessions.map((session) => {
                      const allPassed = session.kvTest.passed && session.repeatabilityTest.passed && session.linearityTest.passed;
                      return (
                        <tr key={session.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3">{session.date}</td>
                          <td className="border border-gray-300 px-4 py-3">{session.hospital}</td>
                          <td className="border border-gray-300 px-4 py-3">{session.model}</td>
                          <td className="border border-gray-300 px-4 py-3">{session.techName}</td>
                          <td className="border border-gray-300 px-4 py-3">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                allPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {allPassed ? 'PASS' : 'FAIL'}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => navigate(`/report/${session.id}`)}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(session.id!)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="secondary"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 flex items-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    variant="secondary"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
};
