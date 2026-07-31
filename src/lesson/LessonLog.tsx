import { useState, type ReactNode } from 'react';
import { useLessonLogs, emptyLessonInput, type LessonLogInput, type HomeworkCheck } from '../store/lessonLog';

function Panel({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-3xl border border-white/60 bg-white/60 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function HomeworkField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: HomeworkCheck;
  onChange: (next: HomeworkCheck) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-4">
      <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <input
          type="checkbox"
          checked={value.done}
          onChange={(e) => onChange({ ...value, done: e.target.checked })}
          className="h-4 w-4 rounded accent-indigo-600"
        />
        {label} 완료
      </label>
      <input
        type="text"
        value={value.note}
        onChange={(e) => onChange({ ...value, note: e.target.value })}
        placeholder="숙제 내용 메모 (선택)"
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
      />
    </div>
  );
}

function LessonForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  initial: LessonLogInput;
  onCancel?: () => void;
  onSubmit: (input: LessonLogInput) => Promise<void>;
  submitLabel: string;
}) {
  const [form, setForm] = useState<LessonLogInput>(initial);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <label className="text-sm font-bold text-slate-600">수업 날짜</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">숙제 체크 &amp; 타자 기록</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <HomeworkField
            label="숙제 1"
            value={form.homework1}
            onChange={(homework1) => setForm({ ...form, homework1 })}
          />
          <HomeworkField
            label="숙제 2"
            value={form.homework2}
            onChange={(homework2) => setForm({ ...form, homework2 })}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 p-4">
          <span className="text-sm font-bold text-slate-700">타자 기록</span>
          <input
            type="number"
            min={0}
            value={form.typingSpeed ?? ''}
            onChange={(e) => setForm({ ...form, typingSpeed: e.target.value === '' ? null : Number(e.target.value) })}
            placeholder="타수"
            className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
          />
          <span className="text-sm text-slate-500">타 /</span>
          <input
            type="number"
            min={0}
            value={form.typingMinutes ?? ''}
            onChange={(e) =>
              setForm({ ...form, typingMinutes: e.target.value === '' ? null : Number(e.target.value) })
            }
            placeholder="시간"
            className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-400"
          />
          <span className="text-sm text-slate-500">분</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">복습했던 내용</p>
        <textarea
          value={form.reviewContent}
          onChange={(e) => setForm({ ...form, reviewContent: e.target.value })}
          rows={3}
          placeholder="이번 수업에서 복습한 내용을 적어주세요"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">오늘 나갔던 내용</p>
        <textarea
          value={form.todayContent}
          onChange={(e) => setForm({ ...form, todayContent: e.target.value })}
          rows={3}
          placeholder="오늘 진행한 수업 내용을 적어주세요"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400"
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">숙제 / 다음 시간에 나갈 것</p>
        <textarea
          value={form.nextContent}
          onChange={(e) => setForm({ ...form, nextContent: e.target.value })}
          rows={3}
          placeholder="다음 수업 전까지 할 숙제나 다음 시간 진도를 적어주세요"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400"
        />
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-400"
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? '저장 중…' : submitLabel}
        </button>
      </div>
    </div>
  );
}

function LessonCard({
  log,
  onUpdate,
  onDelete,
}: {
  log: ReturnType<typeof useLessonLogs>['logs'][number];
  onUpdate: (id: string, input: LessonLogInput) => Promise<void>;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Panel>
        <LessonForm
          initial={log}
          submitLabel="수정 완료"
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            await onUpdate(log.id, input);
            setEditing(false);
          }}
        />
      </Panel>
    );
  }

  return (
    <Panel>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-800">{log.date}</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-slate-400"
          >
            수정
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('이 수업 기록을 삭제할까요?')) onDelete(log.id);
            }}
            className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-bold text-red-500 transition hover:border-red-400"
          >
            삭제
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            log.homework1.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          숙제 1 {log.homework1.done ? '완료' : '미완료'}
          {log.homework1.note ? ` · ${log.homework1.note}` : ''}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            log.homework2.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          숙제 2 {log.homework2.done ? '완료' : '미완료'}
          {log.homework2.note ? ` · ${log.homework2.note}` : ''}
        </span>
        {(log.typingSpeed !== null || log.typingMinutes !== null) && (
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
            타자 {log.typingSpeed ?? '?'}타 / {log.typingMinutes ?? '?'}분
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 text-sm">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">복습했던 내용</p>
          <p className="whitespace-pre-line text-slate-700">{log.reviewContent || '—'}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">오늘 나갔던 내용</p>
          <p className="whitespace-pre-line text-slate-700">{log.todayContent || '—'}</p>
        </div>
        <div className="rounded-2xl bg-indigo-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-indigo-400">숙제 / 다음 시간</p>
          <p className="whitespace-pre-line text-indigo-900">{log.nextContent || '—'}</p>
        </div>
      </div>
    </Panel>
  );
}

export default function LessonLog() {
  const { logs, loaded, addLog, updateLog, deleteLog } = useLessonLogs();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex flex-col items-center justify-between gap-3 rounded-3xl border border-white/60 bg-white/70 px-6 py-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:flex-row">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">📋 수업현황</h1>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
          >
            {showForm ? '닫기' : '+ 새 수업 기록'}
          </button>
        </header>

        {showForm && (
          <Panel>
            <LessonForm
              initial={emptyLessonInput()}
              submitLabel="저장"
              onSubmit={async (input) => {
                await addLog(input);
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          </Panel>
        )}

        {loaded && logs.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-white/60 py-14 text-center shadow-xl shadow-slate-900/5 backdrop-blur-xl">
            <span className="text-4xl">📋</span>
            <p className="text-lg font-bold text-slate-800">아직 기록된 수업이 없어요</p>
            <p className="max-w-sm text-sm text-slate-500">"+ 새 수업 기록" 버튼으로 오늘 수업을 기록해보세요.</p>
          </div>
        )}

        {logs.map((log) => (
          <LessonCard key={log.id} log={log} onUpdate={updateLog} onDelete={deleteLog} />
        ))}
      </div>
    </div>
  );
}
