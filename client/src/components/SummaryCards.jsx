import React from 'react';
import { Users, Building, ShieldCheck, FileCheck, Layers } from 'lucide-react';

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: 'Working Staff Strength',
      value: summary.workingStrength?.toLocaleString() || '0',
      subtitle: `Across ${summary.totalOfficers || 0} active officer profiles`,
      icon: Users,
      color: '#38bdf8',
      bgGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(3, 105, 161, 0.05))'
    },
    {
      title: 'Permanent Sanctioned Posts',
      value: summary.sanctionedPermanent?.toLocaleString() || '0',
      subtitle: 'Regular cadre posts',
      icon: ShieldCheck,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(4, 120, 87, 0.05))'
    },
    {
      title: 'Temporary Sanctioned Posts',
      value: summary.sanctionedTemporary?.toLocaleString() || '0',
      subtitle: 'Special & scheme posts',
      icon: FileCheck,
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(180, 83, 9, 0.05))'
    },
    {
      title: 'Grand Total Sanctioned',
      value: summary.grandTotalSanctioned?.toLocaleString() || '0',
      subtitle: 'Permanent + Temporary',
      icon: Layers,
      color: '#a855f7',
      bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(126, 34, 206, 0.05))'
    },
    {
      title: 'Kottayam Revenue Offices',
      value: summary.totalOffices?.toString() || '0',
      subtitle: 'Collectorate, Taluk & RDOs',
      icon: Building,
      color: '#ec4899',
      bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(190, 24, 93, 0.05))'
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="glass-panel" style={{ padding: '20px', background: card.bgGradient, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{card.title}</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${card.color}20`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} />
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {card.subtitle}
            </div>
          </div>
        );
      })}
    </div>
  );
}
