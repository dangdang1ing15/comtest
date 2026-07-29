import { useState, type ReactNode } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Answer, Level } from '../testData';
import { mockBasicReport, type PartFeedback, type PartScore, type ReportData } from './mockData';
import { computeLiveReport, isLevelComplete, answeredCount } from './computeReport';

const TITLE_BY_LEVEL: Record<Level, string> = {
  basic: '💻 컴퓨터 기본 활용 능력 모의고사',
  advanced: '🚀 컴퓨터 심화 활용 능력 모의고사 (크리에이터 단계)',
};

const DOMAIN_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444'];

function getStatus(my: number, avg: number) {
  const diff = my - avg;
  if (diff >= 0) return { label: '우수', className: 'bg-emerald-100 text-emerald-700' };
  if (diff >= -1) return { label: '정상', className: 'bg-slate-100 text-slate-600' };
  if (diff >= -2) return { label: '⚠️ 취약', className: 'bg-amber-100 text-amber-700' };
  return { label: '🚨 위험', className: 'bg-red-100 text-red-700' };
}

function Panel({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`rounded-3xl border border-white/60 bg-white/60 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function Header({ level, onLevelChange, student }: { level: Level; onLevelChange: (l: Level) => void; student: ReportData['student'] }) {
  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 px-6 py-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
          {TITLE_BY_LEVEL[level]} 〈{student.round}회차 성적표〉
        </h1>
        <div className="flex gap-2">
          <span className="rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-bold text-indigo-700">
            {student.className}
          </span>
          <span className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-bold text-white">{student.name}</span>
        </div>
      </div>
      <div className="flex justify-center gap-1 rounded-full bg-slate-100 p-1 sm:justify-start sm:self-start">
        <button
          type="button"
          onClick={() => onLevelChange('basic')}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
            level === 'basic' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🐥 베이직 성적표
        </button>
        <button
          type="button"
          onClick={() => onLevelChange('advanced')}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
            level === 'advanced' ? 'bg-white text-purple-600 shadow' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🔥 어드밴스 성적표
        </button>
      </div>
    </header>
  );
}

function ScorePanel({ data }: { data: ReportData }) {
  const { summary } = data;
  return (
    <Panel className="flex flex-col justify-center gap-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">나의 총점</p>
        <p className="mt-2 text-6xl font-black text-slate-900">
          {summary.myTotal}
          <span className="ml-1 text-2xl font-bold text-slate-400">점</span>
        </p>
      </div>
      <div className="flex flex-col gap-2 border-t border-slate-200/70 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">전체 평균</span>
          <span className="font-bold text-slate-700">{summary.classAverage}점</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">표준 편차</span>
          <span className="font-bold text-slate-700">{summary.stdDeviation}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">만점</span>
          <span className="font-bold text-slate-700">{summary.maxScore}점</span>
        </div>
      </div>
    </Panel>
  );
}

function DomainRadarPanel({ data }: { data: ReportData }) {
  const { domains } = data;
  return (
    <Panel>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">영역 분석</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={domains} outerRadius="75%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} />
            <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Radar
              name="내 점수"
              dataKey="myScore"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.35}
              strokeWidth={2}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {domains.map((d, i) => (
          <li key={d.key} className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: DOMAIN_COLORS[i % DOMAIN_COLORS.length] }}
              />
              {d.label}
            </span>
            <span className="font-bold text-slate-800">
              {d.myScore}/{d.maxScore}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function DifficultyLinePanel({ data }: { data: ReportData }) {
  const { difficulty } = data;
  return (
    <Panel>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">난이도 분석</p>
        <p className="text-[11px] font-semibold text-slate-400">🔵 내 점수 · ⚪ 평균</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={difficulty} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis dataKey="level" tick={{ fontSize: 12, fill: '#475569' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="myScore" name="내 점수" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
            <Line
              type="monotone"
              dataKey="classAverage"
              name="평균"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function PartTable({ data }: { data: ReportData }) {
  const { parts } = data;
  return (
    <Panel>
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">세부 항목 분석 표</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-400">
              <th className="py-2 pr-3 font-semibold">No.</th>
              <th className="py-2 pr-3 font-semibold">세부 항목</th>
              <th className="py-2 pr-3 text-center font-semibold">문항 수</th>
              <th className="py-2 pr-3 text-center font-semibold">내 점수</th>
              <th className="py-2 pr-3 text-center font-semibold">전체 평균</th>
              <th className="py-2 pr-3 text-center font-semibold">상태</th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p) => {
              const below = p.myScore < p.classAverage;
              const status = getStatus(p.myScore, p.classAverage);
              return (
                <tr key={p.id} className={`border-b border-slate-100 last:border-0 ${below ? 'bg-red-50/70' : ''}`}>
                  <td className="py-2.5 pr-3 text-slate-400">{p.id}</td>
                  <td className={`py-2.5 pr-3 font-semibold ${below ? 'text-red-600' : 'text-slate-700'}`}>
                    {p.title}
                  </td>
                  <td className="py-2.5 pr-3 text-center text-slate-500">{p.questionCount}</td>
                  <td className={`py-2.5 pr-3 text-center font-bold ${below ? 'text-red-600' : 'text-slate-800'}`}>
                    {p.myScore}
                  </td>
                  <td className="py-2.5 pr-3 text-center text-slate-500">{p.classAverage}</td>
                  <td className="py-2.5 pr-3 text-center">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function AISolutionPanel({
  data,
  onSelect,
}: {
  data: ReportData;
  onSelect: (part: PartScore, feedback: PartFeedback) => void;
}) {
  const { parts, feedback } = data;
  const weakest = [...parts]
    .sort((a, b) => b.classAverage - b.myScore - (a.classAverage - a.myScore))
    .slice(0, 2);

  return (
    <Panel>
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">🤖 AI 맞춤형 솔루션 코멘트</p>
      <div className="flex flex-col gap-4">
        {weakest.map((p, i) => {
          const fb = feedback.find((f) => f.id === p.id);
          if (!fb) return null;
          const icon = i === 0 ? '🚨' : '⚠️';
          return (
            <div key={p.id} className="rounded-2xl bg-slate-50/80 p-4">
              <p className="text-sm text-slate-700">
                <span className="mr-1.5 font-bold text-slate-900">
                  {icon} [{p.title.replace(/^Part \d+\.\s*/, '')}]
                </span>
                {fb.comment}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-slate-500">👉 액션 플랜: {fb.actionPlan}</span>
                <button
                  type="button"
                  onClick={() => onSelect(p, fb)}
                  className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700"
                >
                  {i === 0 ? '가이드 보기' : '연습하기'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function ActionPlanModal({
  part,
  feedback,
  onClose,
}: {
  part: PartScore;
  feedback: PartFeedback;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">{part.title}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{feedback.comment}</p>
        <div className="mt-4 rounded-2xl bg-indigo-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">액션 플랜</p>
          <p className="mt-1.5 text-sm font-semibold text-indigo-900">{feedback.actionPlan}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-slate-900 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

function LockedPanel({
  level,
  answers,
  onStartTest,
}: {
  level: Level;
  answers: Map<number, Answer>;
  onStartTest: (level: Level) => void;
}) {
  const { answered, total } = answeredCount(level, answers);
  return (
    <Panel className="flex flex-col items-center gap-4 py-14 text-center">
      <span className="text-4xl">🔒</span>
      <p className="text-lg font-bold text-slate-800">아직 이 성적표를 만들 수 없어요</p>
      <p className="max-w-sm text-sm text-slate-500">
        자가진단 테스트의 {total}문항에 모두 답해야 실제 응답으로 채점된 성적표가 만들어져요. ({answered}/{total} 완료)
      </p>
      <button
        type="button"
        onClick={() => onStartTest(level)}
        className="mt-2 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
      >
        📝 지금 테스트 하러 가기
      </button>
    </Panel>
  );
}

export default function ReportCard({
  answersByLevel,
  onStartTest,
}: {
  answersByLevel: Record<Level, Map<number, Answer>>;
  onStartTest: (level: Level) => void;
}) {
  const [level, setLevel] = useState<Level>('basic');
  const [selected, setSelected] = useState<{ part: PartScore; feedback: PartFeedback } | null>(null);

  const answers = answersByLevel[level];
  const complete = isLevelComplete(level, answers);
  const data = complete ? computeLiveReport(level, answers) : null;

  const handleLevelChange = (l: Level) => {
    setLevel(l);
    setSelected(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Header level={level} onLevelChange={handleLevelChange} student={mockBasicReport.student} />

        {!data ? (
          <LockedPanel level={level} answers={answers} onStartTest={onStartTest} />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <ScorePanel data={data} />
              </div>
              <div className="lg:col-span-5">
                <DomainRadarPanel data={data} />
              </div>
              <div className="lg:col-span-4">
                <DifficultyLinePanel data={data} />
              </div>
            </div>

            <PartTable data={data} />
            <AISolutionPanel data={data} onSelect={(part, feedback) => setSelected({ part, feedback })} />
          </>
        )}
      </div>

      {selected && (
        <ActionPlanModal part={selected.part} feedback={selected.feedback} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
