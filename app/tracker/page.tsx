'use client'

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, TrendingUp, Award, User, Plus, X } from 'lucide-react';

const TaekwondoTracker = () => {
  const [view, setView] = useState('parent');
  const [sessions, setSessions] = useState<any[]>([]);
  const [showAddSession, setShowAddSession] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(getWeekNumber(new Date()));

  useEffect(() => {
    loadData();
  }, []);

    const loadData = async () => {
    try {
        const response = await fetch('/api/sessions');
        const data = await response.json();
        setSessions(data);
    } catch (error) {
        console.log('No hay datos previos');
    }
    };

    const saveData = async (newSessions: any[]) => {
    try {
        await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSessions),
        });
    } catch (error) {
        console.error('Error guardando datos:', error);
    }
    };

  function getWeekNumber(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  const addSession = (sessionData: any) => {
    const newSession = {
      id: Date.now(),
      date: new Date().toISOString(),
      week: currentWeek,
      ...sessionData
    };
    const newSessions = [newSession, ...sessions];
    setSessions(newSessions);
    saveData(newSessions);
    setShowAddSession(false);
  };

  const deleteSession = (id: number) => {
    const newSessions = sessions.filter(s => s.id !== id);
    setSessions(newSessions);
    saveData(newSessions);
  };

  const weekSessions = sessions.filter(s => s.week === currentWeek);
  const lastMonthSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return sessionDate >= monthAgo;
  });

  const calculateAverage = (sessionsArray: any[], category: string) => {
    if (sessionsArray.length === 0) return 0;
    const sum = sessionsArray.reduce((acc, s) => acc + (s[category] || 0), 0);
    return (sum / sessionsArray.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Progreso Taekwondo</h1>
                <p className="text-xs text-gray-500">Desarrollo y Disciplina</p>
              </div>
            </div>
            <button
              onClick={() => setView(view === 'parent' ? 'instructor' : 'parent')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-all"
            >
              {view === 'parent' ? 'Vista Instructor' : 'Vista Padre'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {view === 'parent' ? (
          <ParentView 
            weekSessions={weekSessions} 
            lastMonthSessions={lastMonthSessions}
            calculateAverage={calculateAverage}
          />
        ) : (
          <InstructorView 
            sessions={sessions}
            onAddSession={() => setShowAddSession(true)}
            onDeleteSession={deleteSession}
            weekSessions={weekSessions}
            calculateAverage={calculateAverage}
          />
        )}
      </div>

      {showAddSession && (
        <AddSessionModal 
          onClose={() => setShowAddSession(false)}
          onSave={addSession}
        />
      )}
    </div>
  );
};

const ParentView = ({ weekSessions, lastMonthSessions, calculateAverage }: any) => {
  const categories = [
    { key: 'technique', label: 'Técnica', icon: Award, color: 'blue' },
    { key: 'behavior', label: 'Comportamiento', icon: User, color: 'green' },
    { key: 'respect', label: 'Respeto', icon: CheckCircle2, color: 'purple' },
    { key: 'following', label: 'Sigue Instrucciones', icon: TrendingUp, color: 'orange' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Resumen Semanal</h2>
          <span className="text-sm text-gray-500">{weekSessions.length} sesiones</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {categories.map(cat => {
            const avg = calculateAverage(weekSessions, cat.key);
            const Icon = cat.icon;
            const percentage = (avg / 5) * 100;
            return (
              <div key={cat.key} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-600">{cat.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">{avg}</span>
                  <span className="text-sm text-gray-500">/5</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Progreso del Mes</h2>
        <div className="space-y-3">
          {categories.map(cat => {
            const avg = calculateAverage(lastMonthSessions, cat.key);
            const Icon = cat.icon;
            const percentage = (avg / 5) * 100;
            return (
              <div key={cat.key} className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{cat.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{avg}/5</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sesiones Recientes</h2>
        <div className="space-y-3">
          {weekSessions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay sesiones esta semana</p>
          ) : (
            weekSessions.slice(0, 5).map((session: any) => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const InstructorView = ({ sessions, onAddSession, onDeleteSession, weekSessions, calculateAverage }: any) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Esta Semana</p>
          <p className="text-2xl font-bold text-gray-900">{weekSessions.length}</p>
          <p className="text-xs text-gray-500">sesiones</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Promedio</p>
          <p className="text-2xl font-bold text-gray-900">
            {calculateAverage(weekSessions, 'behavior')}
          </p>
          <p className="text-xs text-gray-500">comportamiento</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
          <p className="text-xs text-gray-500">sesiones</p>
        </div>
      </div>

      <button
        onClick={onAddSession}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-4 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 font-medium transition-all"
      >
        <Plus className="w-5 h-5" />
        Registrar Nueva Sesión
      </button>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Todas las Sesiones</h2>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay sesiones registradas</p>
          ) : (
            sessions.map((session: any) => (
              <SessionCardInstructor 
                key={session.id} 
                session={session}
                onDelete={onDeleteSession}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const SessionCard = ({ session }: any) => {
  const date = new Date(session.date);
  const avg = ((session.technique + session.behavior + session.respect + session.following) / 4).toFixed(1);
  
  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg font-bold text-gray-900">{avg}</span>
          <span className="text-xs text-gray-500">/5</span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: 'Téc', value: session.technique },
          { label: 'Com', value: session.behavior },
          { label: 'Res', value: session.respect },
          { label: 'Ins', value: session.following }
        ].map((item, i) => (
          <div key={i} className="text-center">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className="text-sm font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
      
      {session.notes && (
        <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">{session.notes}</p>
      )}
    </div>
  );
};

const SessionCardInstructor = ({ session, onDelete }: any) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4 relative">
      <button
        onClick={() => onDelete(session.id)}
        className="absolute top-2 right-2 p-1 hover:bg-red-50 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-red-500" />
      </button>
      <SessionCard session={session} />
    </div>
  );
};

const AddSessionModal = ({ onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    technique: 3,
    behavior: 3,
    respect: 3,
    following: 3,
    notes: '',
    attended: true
  });

  const handleSubmit = () => {
    onSave(formData);
  };

  const categories = [
    { key: 'technique', label: 'Técnica' },
    { key: 'behavior', label: 'Comportamiento' },
    { key: 'respect', label: 'Respeto' },
    { key: 'following', label: 'Sigue Instrucciones' }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Nueva Sesión</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {categories.map(cat => (
            <div key={cat.key}>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {cat.label}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData({ ...formData, [cat.key]: val })}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                      formData[cat.key as keyof typeof formData] === val
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observaciones de la sesión..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 font-medium shadow-lg shadow-blue-500/30 transition-all"
          >
            Guardar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaekwondoTracker;