import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search,
    Workflow,
    Clock,
    TrendingUp,
    Filter,
    Plus,
    Activity,
    Linkedin,
    Twitter,
    Instagram,
    Globe,
    RefreshCw,
    AlertCircle,
    Info,
    X,
    Zap,
    LucideIcon
} from 'lucide-react';
import FlowCard from '../../components/ui/flowbtns/FlowCard';
import Flowbtn from '../../components/ui/flowbtns/Flowbtn';
import {
    getFlowTemplates,
    getUserFlows,
    pauseFlow,
    resumeFlow,
    deleteFlow,
    executeFlow
} from '../../api/flows';

import { toast } from 'react-hot-toast';

// Type definitions
type FlowStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'PENDING';
type Platform = 'linkedin' | 'twitter' | 'x' | 'instagram' | 'other';
type FlowCategory = 'engagement' | 'outreach' | 'analytics' | 'automation';

interface FlowStage {
    id: string;
    name: string;
    description: string;
    order: number;
    estimatedDuration: string;
}

interface FlowTemplate {
    id: string;
    displayName: string;
    description: string;
    summary: string;
    platform: Platform;
    category: FlowCategory;
    estimatedTime: string;
    stages: FlowStage[];
}

interface UserFlow {
    id: string;
    name: string;
    status: FlowStatus;
    template: FlowTemplate;
    createdAt: string;
    updatedAt: string;
    lastExecutedAt?: string;
    nextExecutionAt?: string;
    executionCount: number;
    successCount: number;
    failureCount: number;
    config: Record<string, any>;
}

interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message?: string;
}

interface FlowsResponse {
    flows: UserFlow[];
}

interface FlowTemplatesResponse {
    flows: FlowTemplate[];
}

type TabType = 'available' | 'active';
type StatusFilterType = 'all' | FlowStatus;
type PlatformFilterType = 'all' | Platform;

const Flows: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('available');
    const [flows, setFlows] = useState<UserFlow[]>([]);
    const [flowTemplates, setFlowTemplates] = useState<FlowTemplate[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
    const [platformFilter, setPlatformFilter] = useState<PlatformFilterType>('all');
    const [showInfoBanner, setShowInfoBanner] = useState<boolean>(false);
    const infoBannerRef = useRef<HTMLDivElement>(null);

    // Close info banner when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (infoBannerRef.current && !infoBannerRef.current.contains(event.target as Node)) {
                setShowInfoBanner(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch both templates and user flows on initial load
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([fetchFlowTemplates(), fetchUserFlows()]);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Refresh data when tab changes (without loading spinner)
    useEffect(() => {
        if (activeTab === 'available') {
            fetchFlowTemplates();
        } else {
            fetchUserFlows();
        }
    }, [activeTab]);

    const fetchFlowTemplates = async (): Promise<void> => {
        try {
            const response = await getFlowTemplates() as ApiResponse<FlowTemplatesResponse>;
            if (response.status === 'success') {
                setFlowTemplates(response.data.flows || []);
            }
        } catch (error) {
            console.error('Failed to fetch flow templates:', error);
            toast.error('Failed to load flow templates');
            throw error;
        }
    };

    const fetchUserFlows = async (): Promise<void> => {
        try {
            const params: Record<string, string> = {};
            if (statusFilter !== 'all') {
                params.status = statusFilter.toUpperCase();
            }

            const response = await getUserFlows(params) as ApiResponse<FlowsResponse>;
            if (response.status === 'success') {
                setFlows(response.data.flows || []);
            }
        } catch (error) {
            console.error('Failed to fetch user flows:', error);
            toast.error('Failed to load your flows');
            throw error;
        }
    };

    const handlePauseFlow = async (flowId: string): Promise<void> => {
        try {
            await pauseFlow(flowId);
            toast.success('Flow paused successfully');
            fetchUserFlows(); // Refresh the list
        } catch (error) {
            toast.error('Failed to pause flow');
        }
    };

    const handleResumeFlow = async (flowId: string): Promise<void> => {
        try {
            await resumeFlow(flowId);
            toast.success('Flow resumed successfully');
            fetchUserFlows(); // Refresh the list
        } catch (error) {
            toast.error('Failed to resume flow');
        }
    };

    const handleStopFlow = async (flowId: string): Promise<void> => {
        toast((t) => (
            <div className="flex flex-col gap-3 min-w-[300px]">
                <div className="flex items-start gap-3">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Stop Flow?</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Are you sure you want to stop this flow? This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 justify-end mt-2">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteFlow(flowId);
                                toast.success('Flow stopped successfully');
                                fetchUserFlows(); // Refresh the list
                            } catch (error) {
                                toast.error('Failed to stop flow');
                            }
                        }}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                        Stop Flow
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            className: 'dark:bg-gray-800 dark:border dark:border-gray-700',
        });
    };

    const handleExecuteFlow = async (flowId: string): Promise<void> => {
        try {
            await executeFlow(flowId);
            toast.success('Flow execution started');
        } catch (error) {
            toast.error('Failed to execute flow');
        }
    };

    const handleRefreshTemplates = async (): Promise<void> => {
        try {
            await fetchFlowTemplates();
            toast.success('Templates refreshed');
        } catch (error) {
            // Error already handled in fetchFlowTemplates
        }
    };

    const handleRefreshFlows = async (): Promise<void> => {
        try {
            await fetchUserFlows();
            toast.success('Flows refreshed');
        } catch (error) {
            // Error already handled in fetchUserFlows
        }
    };

    // Filter templates based on search and platform
    const filteredTemplates = flowTemplates.filter(template => {
        const matchesSearch = template.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlatform = platformFilter === 'all' || template.platform === platformFilter;
        return matchesSearch && matchesPlatform;
    });

    // Filter user flows based on search and status
    const filteredFlows = flows.filter(flow => {
        const matchesSearch = flow.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            flow.template?.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // Get platform icon
    const getPlatformIcon = (platform: string | undefined): LucideIcon => {
        switch (platform?.toLowerCase()) {
            case 'linkedin': return Linkedin;
            case 'twitter': return Twitter;
            case 'x': return Twitter;
            case 'instagram': return Instagram;
            default: return Globe;
        }
    };

    // Get available platforms from templates
    const availablePlatforms = [...new Set(flowTemplates.map(t => t.platform))].filter(Boolean) as Platform[];

    return (
        <div className="space-y-4 pt-2 px-4 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl flex items-center justify-center border border-brand-500/20">
                            <Workflow className="w-6 h-6 text-brand-500 dark:text-brand-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Flows</h1>
                                <div className="relative" ref={infoBannerRef}>
                                    <button
                                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors"
                                        onClick={() => setShowInfoBanner(!showInfoBanner)}
                                    >
                                        <Info className="w-4 h-4" />
                                    </button>
                                    {showInfoBanner && (
                                        <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 z-20">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">About Flows</h4>
                                                </div>
                                                <button
                                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                    onClick={() => setShowInfoBanner(false)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                                                Flows are continuous automation processes that run on schedules. Unlike Trobs (one-time data extraction),
                                                Flows maintain state across multiple runs and can execute up to 4 times daily for ongoing engagement and outreach.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                Continuous automation workflows that run on schedules
                            </p>
                        </div>
                    </div>


                    {/* Search Bar */}
                    <div className="w-full sm:w-auto flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search flows..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex gap-8">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'available'
                            ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'
                            }`}
                    >
                        Available Flows
                        {flowTemplates.length > 0 && (
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'available' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                {flowTemplates.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${activeTab === 'active'
                            ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'
                            }`}
                    >
                        Running Flows
                        {flows.length > 0 && (
                            <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === 'active' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                {flows.length}
                            </span>
                        )}
                    </button>
                </nav>
            </div>

            {/* Filters */}
            {activeTab === 'available' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
                        </div>

                        <select
                            value={platformFilter}
                            onChange={(e) => setPlatformFilter(e.target.value as PlatformFilterType)}
                            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                        >
                            <option value="all">All Platforms</option>
                            {availablePlatforms.map(platform => (
                                <option key={platform} value={platform} className="capitalize">
                                    {platform}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Flowbtn
                        onClick={handleRefreshTemplates}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Flowbtn>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-700 border-t-brand-600 dark:border-t-brand-400" />
                </div>
            )}

            {/* Available Flow Templates */}
            {activeTab === 'available' && !isLoading && (
                <div className="animate-in fade-in duration-500">
                    {filteredTemplates.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
                            <Workflow className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No flow templates found</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                                {searchTerm || platformFilter !== 'all'
                                    ? 'Try adjusting your search or filters to see more results.'
                                    : 'Flow templates are being added. Check back soon!'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredTemplates.map(template => {
                                const PlatformIcon = getPlatformIcon(template.platform);
                                return (
                                    <div key={template.id} className="group block">
                                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-brand-500/30 flex flex-col h-full">
                                            <div className="flex items-start gap-5 flex-1">
                                                {/* Template Icon Box */}
                                                <div className="relative w-20 h-20 bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/10 dark:border-brand-500/20 rounded-xl flex items-center justify-center flex-shrink-0 p-3 transition-transform duration-300 group-hover:scale-105">
                                                    <Workflow className="w-10 h-10 text-brand-600 dark:text-brand-400" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center flex-wrap gap-2 mb-2">
                                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${template.platform === 'linkedin' ? 'bg-[#0077b5]/10 text-[#0077b5]' :
                                                            template.platform === 'twitter' || template.platform === 'x' ? 'bg-black/10 text-black dark:bg-white/10 dark:text-white' :
                                                                'bg-brand-500/10 text-brand-500'
                                                            }`}>
                                                            <span className="flex items-center gap-1">
                                                                <PlatformIcon size={12} />
                                                                {template.platform}
                                                            </span>
                                                        </div>
                                                        <div className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                                                            <span className="flex items-center gap-1">
                                                                <Zap size={10} />
                                                                Flow
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            <span>{template.category}</span>
                                                        </div>
                                                    </div>

                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors truncate">
                                                        {template.displayName}
                                                    </h3>

                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                                                        {template.summary}
                                                    </p>

                                                    <div className="flex items-center gap-6 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest">
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Activity size={14} className="text-gray-400" />
                                                            <span>{template.stages?.length || 0} STAGES</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} className="text-gray-400" />
                                                            <span>{template.estimatedTime || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons with increased height */}
                                            <div className="flex gap-3 mt-6">
                                                <Link to={`/flows/template/${template.id}`} className="flex-1">
                                                    <Flowbtn
                                                        variant="outline"
                                                        size="md"
                                                        className="w-full py-2"
                                                    >
                                                        Details
                                                    </Flowbtn>
                                                </Link>
                                                <Link to={`/flows/setup/${template.id}`} className="flex-1">
                                                    <Flowbtn
                                                        size="md"
                                                        className="w-full flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 py-2"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Start Flow
                                                    </Flowbtn>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}


            {/* User's Active Flows */}
            {activeTab === 'active' && !isLoading && (
                <div className="animate-in fade-in duration-500">
                    {filteredFlows.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
                            <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No flows found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                                {flows.length === 0
                                    ? "You haven't started any flows yet. Go to 'Available Flows' to get started."
                                    : 'No flows match your current filters.'}
                            </p>
                            {flows.length === 0 && (
                                <Flowbtn
                                    onClick={() => setActiveTab('available')}
                                    className="flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-4 h-4" />
                                    Browse Available Flows
                                </Flowbtn>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredFlows.map(flow => (
                                <FlowCard
                                    key={flow.id}
                                    flow={flow}
                                    onPause={handlePauseFlow}
                                    onResume={handleResumeFlow}
                                    onStop={handleStopFlow}
                                    onExecute={handleExecuteFlow}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Flows;