'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Agent } from '@/lib/types';
import { Mail, Phone, Award, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AgentShowcase() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.agents
      .getAll()
      .then((data) => {
        if (data && data.length > 0) setAgents(data);
      })
      .catch(() => {
        // fallback handled gracefully
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="agents" className="py-24 bg-obsidian-charcoal px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-[0.25em] mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Private Client Practice</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Managing Advisors & Partners
          </h2>
          <p className="text-slate-muted text-sm font-light leading-relaxed">
            Our senior principals shepherd confidential off-market acquisitions and estate management with absolute discretion.
          </p>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-obsidian-card border border-white/5 rounded-2xl p-4 space-y-4">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Advisors Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {agents.map((agent) => (
              <div
                key={agent.agentId}
                className="bg-obsidian-card rounded-2xl overflow-hidden border border-white/10 hover:border-gold/50 transition-all duration-500 hover:-translate-y-1 group shadow-card-glass flex flex-col justify-between"
              >
                <div>
                  {/* Photo */}
                  <div className="relative h-72 w-full overflow-hidden bg-obsidian-black">
                    <Image
                      src={agent.profileImgUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'}
                      alt={agent.fullName}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-card via-black/20 to-transparent" />
                  </div>

                  {/* Bio & Details */}
                  <div className="p-5">
                    <span className="text-[10px] font-semibold text-gold uppercase tracking-widest block mb-1">
                      {agent.specialization}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white mb-2">
                      {agent.fullName}
                    </h3>
                    <p className="text-slate-muted text-xs leading-relaxed font-light line-clamp-3">
                      {agent.bio}
                    </p>
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="p-5 pt-0 border-t border-white/5 mt-2">
                  <div className="grid grid-cols-2 gap-2 pt-4">
                    <a
                      href={`mailto:${agent.email}`}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/5 hover:bg-gold/10 hover:text-gold text-slate-muted border border-white/10 hover:border-gold/40 rounded-xl text-xs font-medium transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </a>
                    <a
                      href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/5 hover:bg-emerald/15 hover:text-emerald text-slate-muted border border-white/10 hover:border-emerald/40 rounded-xl text-xs font-medium transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
