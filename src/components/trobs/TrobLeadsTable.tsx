import React from 'react';
import {
    Star,
    MapPin,
    Building,
    Award,
    ArrowUpRight,
    ExternalLink,
    Linkedin,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../ui/table';
import Badge from '../ui/badge/Badge';

export interface Lead {
    id: string;
    name: string;
    title: string;
    company: string;
    location: string;
    profileImage?: string;
    aiScore: number;
    status: 'Contacted' | 'Pending' | 'Connected' | 'Replied';
    matchQuality: 'Hot' | 'Warm' | 'Cold';
    profileUrl: string;
    foundAt: string;
}

interface TrobLeadsTableProps {
    leads: Lead[];
    isLoading?: boolean;
}

const TrobLeadsTable: React.FC<TrobLeadsTableProps> = ({ leads, isLoading = false }) => {
    const getStatusColor = (status: Lead['status']) => {
        switch (status) {
            case 'Contacted': return 'info';
            case 'Connected': return 'success';
            case 'Replied': return 'primary';
            case 'Pending': return 'warning';
            default: return 'light';
        }
    };

    const getMatchQualityColor = (quality: Lead['matchQuality']) => {
        switch (quality) {
            case 'Hot': return 'text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20';
            case 'Warm': return 'text-orange-600 bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20';
            case 'Cold': return 'text-blue-600 bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-500/10 dark:text-gray-400 border-gray-200 dark:border-gray-500/20';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-600 dark:text-green-400';
        if (score >= 70) return 'text-blue-600 dark:text-blue-400';
        if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    if (isLoading) {
        return (
            <div className="w-full space-y-4 animate-pulse">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                ))}
            </div>
        );
    }

    if (leads.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-brand-500 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Searching for leads...</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                    The automation is currently scanning for profiles that match your criteria. Results will appear here in real-time.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                        <TableRow>
                            <TableCell isHeader className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-start text-xs uppercase tracking-wider">
                                Lead Information
                            </TableCell>
                            <TableCell isHeader className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-start text-xs uppercase tracking-wider">
                                Company & Role
                            </TableCell>
                            <TableCell isHeader className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-start text-xs uppercase tracking-wider">
                                AI Fit Score
                            </TableCell>
                            <TableCell isHeader className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-start text-xs uppercase tracking-wider">
                                Status
                            </TableCell>
                            <TableCell isHeader className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300 text-end text-xs uppercase tracking-wider">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {leads.map((lead) => (
                            <TableRow key={lead.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                <TableCell className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {lead.profileImage ? (
                                                <img
                                                    src={lead.profileImage}
                                                    alt={lead.name}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                    {lead.name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm">
                                                <div className="w-4 h-4 bg-[#0077b5] rounded-full flex items-center justify-center">
                                                    <Linkedin size={10} className="text-white fill-current" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-gray-900 dark:text-white truncate">
                                                {lead.name}
                                            </span>
                                            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                                                <MapPin size={12} />
                                                <span className="truncate">{lead.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                                            <Award size={14} className="text-brand-500" />
                                            <span className="text-sm truncate">{lead.title}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-1">
                                            <Building size={14} />
                                            <span className="text-xs truncate">{lead.company}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-lg font-bold ${getScoreColor(lead.aiScore)}`}>
                                                {lead.aiScore}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getMatchQualityColor(lead.matchQuality)}`}>
                                                {lead.matchQuality}
                                            </span>
                                        </div>
                                        <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${lead.aiScore >= 90 ? 'bg-green-500' : lead.aiScore >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
                                                    }`}
                                                style={{ width: `${lead.aiScore}%` }}
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4">
                                    <Badge size="sm" color={getStatusColor(lead.status)}>
                                        {lead.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-end">
                                    <div className="flex items-center justify-end gap-2">
                                        <a
                                            href={lead.profileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-all"
                                            title="View Profile"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-lg transition-all shadow-sm shadow-brand-500/20">
                                            Message
                                            <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default TrobLeadsTable;
