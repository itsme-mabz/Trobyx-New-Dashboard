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
    if (!confirm('Are you sure you want to stop this flow? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteFlow(flowId);
      toast.success('Flow stopped successfully');
      fetchUserFlows(); // Refresh the list
    } catch (error) {
      toast.error('Failed to stop flow');
    }
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
    <div className="space-y-6 pt-4 px-4">
      {/* Header */}
      <div className="border-b border-tea-black-200 pb-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-black">Flows</h1>
                <div className="relative" ref={infoBannerRef}>
                  <button
                    className="text-tea-black-400 hover:text-tea-black-600 focus:outline-none"
                    onClick={() => setShowInfoBanner(!showInfoBanner)}
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  {showInfoBanner && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-64 bg-white border border-tea-black-200 rounded-lg shadow-lg p-4 z-10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <h4 className="font-medium text-purple-900 text-sm">About Flows</h4>
                        </div>
                        <button
                          className="text-tea-black-400 hover:text-tea-black-600"
                          onClick={() => setShowInfoBanner(false)}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-tea-black-600">
                        Flows are continuous automation processes that run on schedules. Unlike Trobs (one-time data extraction),
                        Flows maintain state across multiple runs and can execute up to 4 times daily for ongoing engagement and outreach.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-tea-black-600 text-sm">
                Continuous automation workflows that run on schedules
              </p>
            </div>
          </div>


          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tea-black-400" />
              <input
                type="text"
                placeholder="Search flows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-tea-black-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-tea-black-200">
        <nav className="-mb-px flex gap-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'available'
                ? 'border-blue text-blue'
                : 'border-transparent text-tea-black-600 hover:text-tea-black-800 hover:border-tea-black-300'
              }`}
          >
            Available Flows
            {flowTemplates.length > 0 && (
              <span className="ml-2 bg-tea-black-300 text-tea-black-600 py-0.5 px-2 rounded-full text-xs">
                {flowTemplates.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'active'
                ? 'border-blue text-blue'
                : 'border-transparent text-tea-black-600 hover:text-tea-black-800 hover:border-tea-black-300'
              }`}
          >
            Running Flows
            {flows.length > 0 && (
              <span className="ml-2 bg-tea-black-300 text-tea-black-600 py-0.5 px-2 rounded-full text-xs">
                {flows.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'available' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-tea-black-400" />
              <span className="text-sm font-medium text-tea-black-700">Filter by:</span>
            </div>

            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as PlatformFilterType)}
              className="px-3 py-1.5 bg-white border border-tea-black-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
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
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Flowbtn>
        </div>
      )}

      <br />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue" />
        </div>
      )}

      {/* Available Flow Templates */}
      {activeTab === 'available' && !isLoading && (
        <div>
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Workflow className="w-12 h-12 text-tea-black-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-tea-black-900 mb-2">No flow templates found</h3>
              <p className="text-tea-black-600">
                {searchTerm || platformFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Flow templates are being added. Check back soon!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => {
                const PlatformIcon = getPlatformIcon(template.platform);
                return (
                  <div
                    key={template.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Workflow className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{template.displayName}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <PlatformIcon className="w-3 h-3" />
                            <span className="capitalize">{template.platform}</span>
                            <span>•</span>
                            <span className="capitalize">{template.category}</span>
                          </div>
                        </div>
                      </div>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        Flow
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {template.summary}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>{template.stages?.length || 0} stages</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{template.estimatedTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/flows/template/${template.id}`} className="flex-1">
                        <Flowbtn
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Learn More
                        </Flowbtn>
                      </Link>
                      <Link to={`/flows/setup/${template.id}`} className="flex-1">
                        <Flowbtn
                          size="sm"
                          className="w-full flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Start
                        </Flowbtn>
                      </Link>
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
        <div>
          {filteredFlows.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-tea-black-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-tea-black-900 mb-2">No flows found</h3>
              <p className="text-tea-black-600 mb-4">
                {flows.length === 0
                  ? "You haven't started any flows yet."
                  : 'No flows match your current filters.'}
              </p>
              {flows.length === 0 && (
                <Flowbtn
                  onClick={() => setActiveTab('available')}
                  className="flex items-center gap-2"
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